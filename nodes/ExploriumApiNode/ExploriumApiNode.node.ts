import {
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeProperties,
	type INodeType,
	type INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

import { OperationKey, operations } from './operations';
import {
	BusinessesToMatch,
	ProspectsToMatch,
	BusinessIds_Collection,
	ProspectIds_Collection,
	BusinessIds_Body,
	ProspectIds_Body,
} from './types';
import { excludeEmptyValues } from './utils';
import { enrichmentEndpoints } from './constants';

export class ExploriumApiNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Explorium API',
		name: 'exploriumApiNode',
		icon: 'file:explorium.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Streamlined interface for Explorium API operations',
		defaults: { name: 'Explorium API' },
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [{ name: 'exploriumApi', required: true }],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: Object.entries(operations).map(([key, value]) => ({
					name: value.displayName,
					value: key,
					description: value.description,
				})),
				default: '',
			},
			// Handle basic input fields for each operation
			...Object.entries(operations).flatMap(([operationKey, operationConfig]) =>
				operationConfig.properties.map((property) => {
					return {
						...property,
						displayOptions: {
							show: {
								operation: [operationKey],
								...('displayOptions' in property && property.displayOptions?.show),
							},
						},
					} as INodeProperties;
				}),
			),
			// Toggle between form fields and Advanced JSON
			{
				displayName: 'Advanced JSON Input',
				name: 'useJsonInput',
				type: 'boolean',
				default: false,
				description: 'Whether to use direct JSON input instead of form fields',
			},
			// Handle JSON examples for each operation
			...Object.keys(operations).reduce((acc, operationKey) => {
				const jsonExamples = operations[operationKey as OperationKey].jsonExamples;
				for (const example of jsonExamples) {
					const { default: exampleDefault, description } = example;

					acc.push({
						displayName: 'JSON Input',
						name: 'jsonInput',
						type: 'json',
						default: exampleDefault,
						description,
						displayOptions: {
							show: {
								...example.displayOptions.show,
								useJsonInput: [true],
								operation: [operationKey],
							},
							hide: 'hide' in example.displayOptions ? example.displayOptions.hide : {},
						},
						typeOptions: { rows: 12 },
					});
				}
				return acc;
			}, [] as INodeProperties[]),
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as OperationKey;

		try {
			switch (operation) {
				case 'match':
					return await executeMatch(this);
				case 'enrich':
					return await executeEnrich(this);
				case 'fetch':
					return await executeFetch(this);
				case 'events':
					return await executeEvents(this);
				case 'autocomplete':
					return await executeAutocomplete(this);
				default:
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
			}
		} catch (error) {
			if (this.continueOnFail()) {
				returnData.push({
					json: {
						error: error.message,
					},
				});
				return [returnData];
			}
			throw error;
		}
	}
}

async function executeMatch(executeFunctions: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const returnData: INodeExecutionData[] = [];
	const type = executeFunctions.getNodeParameter('type', 0) as 'businesses' | 'prospects';
	const useJsonInput = executeFunctions.getNodeParameter('useJsonInput', 0, false) as boolean;

	let endpoint: string;
	let requestBody: any;

	if (type === 'businesses') {
		endpoint = '/v1/businesses/match';
		let businessesToMatch: BusinessesToMatch;

		if (useJsonInput) {
			businessesToMatch = extractJsonInput<BusinessesToMatch>(executeFunctions);
		} else {
			businessesToMatch = executeFunctions.getNodeParameter('businesses_to_match', 0, {
				businesses: [],
			}) as BusinessesToMatch;
		}

		const businessList = businessesToMatch.businesses_to_match || [];

		// Validate that at least one company has name or domain
		const validCompanies = businessList
			.map(excludeEmptyValues)
			.filter((company) => Object.keys(company).length > 0);

		if (validCompanies.length === 0) {
			throw new NodeOperationError(
				executeFunctions.getNode(),
				'At least one company must have an identifier (name or domain)',
			);
		}

		requestBody = {
			businesses_to_match: validCompanies,
		};
	} else {
		endpoint = '/v1/prospects/match';
		let prospectsToMatch: ProspectsToMatch;
		if (useJsonInput) {
			prospectsToMatch = extractJsonInput<ProspectsToMatch>(executeFunctions);
		} else {
			prospectsToMatch = executeFunctions.getNodeParameter('prospects_to_match', 0, {
				prospects_to_match: [],
			}) as ProspectsToMatch;
		}

		const prospectList = prospectsToMatch.prospects_to_match || [];

		// Filter out prospects that have at least one identifier
		const validProspects = prospectList
			.map(excludeEmptyValues)
			.filter((prospect) => Object.keys(prospect).length > 0);

		if (validProspects.length === 0) {
			throw new NodeOperationError(
				executeFunctions.getNode(),
				'At least one prospect must have an identifier (email, phone_number, full_name, company_name, linkedin, or business_id)',
			);
		}

		requestBody = {
			prospects_to_match: validProspects,
		};
	}

	const response = await executeFunctions.helpers.httpRequestWithAuthentication.call(
		executeFunctions,
		'exploriumApi',
		{
			method: 'POST',
			url: `https://api.explorium.ai${endpoint}`,
			body: requestBody,
			json: true,
		},
	);

	returnData.push({ json: response });
	return [returnData];
}

async function executeEnrich(executeFunctions: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const returnData: INodeExecutionData[] = [];
	const type = executeFunctions.getNodeParameter('type', 0) as 'businesses' | 'prospects';
	const enrichments = executeFunctions.getNodeParameter('enrichment', 0) as string[];
	const useJsonInput = executeFunctions.getNodeParameter('useJsonInput', 0, false) as boolean;

	let keywordsBody: { parameters?: { keywords: string[] } } | undefined;
	let body: (BusinessIds_Body & { parameters?: { keywords: string[] } }) | ProspectIds_Body;

	if (useJsonInput) {
		const jsonInput = extractJsonInput(executeFunctions);
		body = jsonInput;
	} else {
		if (type === 'businesses') {
			const collection = executeFunctions.getNodeParameter('business_ids', 0, {
				business_ids: [],
			}) as BusinessIds_Collection;

			body = {
				business_ids: collection.business_ids.map((x) => x.id),
			};
		} else {
			const collection = executeFunctions.getNodeParameter('prospect_ids', 0, {
				prospect_ids: [],
			}) as ProspectIds_Collection;

			body = {
				prospect_ids: collection.prospect_ids.map((x) => x.id),
			};
		}
	}

	if ('business_ids' in body && body.business_ids.filter(Boolean).length === 0) {
		throw new NodeOperationError(
			executeFunctions.getNode(),
			'At least one business ID is required',
		);
	}

	if ('prospect_ids' in body && body.prospect_ids.filter(Boolean).length === 0) {
		throw new NodeOperationError(
			executeFunctions.getNode(),
			'At least one prospect ID is required',
		);
	}

	if (type === 'businesses' && enrichments.includes('website_keywords')) {
		if (useJsonInput) {
			const jsonInput = executeFunctions.getNodeParameter('jsonInput', 0) as string;
			const jsonInputObject = JSON.parse(jsonInput);
			keywordsBody = { parameters: jsonInputObject.parameters };
		} else {
			const keywordsCollection = executeFunctions.getNodeParameter('keywords', 0, {
				keywords: [],
			}) as { keywords: Array<{ keyword: string }> };

			const keywords =
				keywordsCollection.keywords?.map((item) => item.keyword).filter(Boolean) || [];

			if (keywords.length > 0) {
				keywordsBody = { parameters: { keywords } };
			}
		}
	}

	// Process each enrichment type
	for (const enrichment of enrichments) {
		const endpoint =
			enrichmentEndpoints[type][enrichment as keyof (typeof enrichmentEndpoints)[typeof type]];

		if (!endpoint) {
			throw new NodeOperationError(
				executeFunctions.getNode(),
				`Unknown enrichment type: ${enrichment} for ${type}`,
			);
		}

		if (type === 'businesses' && enrichment === 'website_keywords' && keywordsBody) {
			body = { ...body, ...keywordsBody };
		}

		const response = await executeFunctions.helpers.httpRequestWithAuthentication.call(
			executeFunctions,
			'exploriumApi',
			{
				method: 'POST',
				url: `https://api.explorium.ai${endpoint}`,
				body,
				json: true,
			},
		);

		returnData.push({
			json: {
				enrichment_type: enrichment,
				...response,
			},
		});
	}

	return [returnData];
}

async function executeFetch(executeFunctions: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const returnData: INodeExecutionData[] = [];
	const type = executeFunctions.getNodeParameter('type', 0) as string;
	const useJsonInput = executeFunctions.getNodeParameter('useJsonInput', 0, false) as boolean;

	let requestBody: any;

	if (useJsonInput) {
		// Use JSON input directly
		const jsonInput = executeFunctions.getNodeParameter('jsonInput', 0) as string;
		requestBody = JSON.parse(jsonInput);
	} else {
		// Get pagination and mode parameters
		const mode = executeFunctions.getNodeParameter('mode', 0, 'preview') as string;
		const size = executeFunctions.getNodeParameter('size', 0, 20) as number;
		const pageSize = executeFunctions.getNodeParameter('page_size', 0, 100) as number;
		const page = executeFunctions.getNodeParameter('page', 0, 1) as number;

		// Build filters object from individual parameters
		const filters: any = {};

		// Helper function to get collection values
		const getCollectionValues = (paramName: string, valueKey: string) => {
			const collection = executeFunctions.getNodeParameter(paramName, 0, {}) as any;
			const collectionArray = collection[paramName] || [];
			return collectionArray.map((item: any) => item[valueKey]).filter(Boolean);
		};

		if (type === 'businesses') {
			// Country codes
			const countryCodes = getCollectionValues('country_code', 'code');
			if (countryCodes.length > 0) {
				filters.country_code = { values: countryCodes };
			}

			// Region country codes
			const regionCodes = getCollectionValues('region_country_code', 'code');
			if (regionCodes.length > 0) {
				filters.region_country_code = { values: regionCodes };
			}

			// Cities
			const cities = getCollectionValues('city_region_country', 'location');
			if (cities.length > 0) {
				filters.city_region_country = { values: cities };
			}

			// Company sizes
			const companySizes = getCollectionValues('company_size', 'size');
			if (companySizes.length > 0) {
				filters.company_size = { values: companySizes };
			}

			// Company revenue
			const companyRevenue = getCollectionValues('company_revenue', 'range');
			if (companyRevenue.length > 0) {
				filters.company_revenue = { values: companyRevenue };
			}

			// Company age
			const companyAge = getCollectionValues('company_age', 'range');
			if (companyAge.length > 0) {
				filters.company_age = { values: companyAge };
			}

			// Google categories
			const googleCategories = getCollectionValues('google_category', 'category');
			if (googleCategories.length > 0) {
				filters.google_category = { values: googleCategories };
			}

			// NAICS categories
			const naicsCategories = getCollectionValues('naics_category', 'code');
			if (naicsCategories.length > 0) {
				filters.naics_category = { values: naicsCategories };
			}

			// LinkedIn categories
			const linkedinCategories = getCollectionValues('linkedin_category', 'category');
			if (linkedinCategories.length > 0) {
				filters.linkedin_category = { values: linkedinCategories };
			}

			// Tech stack categories
			const techStackCategories = getCollectionValues('company_tech_stack_category', 'category');
			if (techStackCategories.length > 0) {
				filters.company_tech_stack_category = { values: techStackCategories };
			}

			// Technologies
			const technologies = getCollectionValues('company_tech_stack_tech', 'tech');
			if (technologies.length > 0) {
				filters.company_tech_stack_tech = { values: technologies };
			}

			// Company names
			const companyNames = getCollectionValues('company_name', 'name');
			if (companyNames.length > 0) {
				filters.company_name = { values: companyNames };
			}

			// Number of locations
			const locationCounts = getCollectionValues('number_of_locations', 'range');
			if (locationCounts.length > 0) {
				filters.number_of_locations = { values: locationCounts };
			}

			// Website keywords
			const websiteKeywords = getCollectionValues('website_keywords', 'keyword');
			if (websiteKeywords.length > 0) {
				filters.website_keywords = { values: websiteKeywords };
			}
		}

		if (type === 'prospects') {
			// Business IDs
			const businessIds = getCollectionValues('business_id', 'id');
			if (businessIds.length > 0) {
				filters.business_id = { values: businessIds };
			}

			// Job levels
			const jobLevels = getCollectionValues('job_level', 'level');
			if (jobLevels.length > 0) {
				filters.job_level = { values: jobLevels };
			}

			// Job departments
			const jobDepartments = getCollectionValues('job_department', 'department');
			if (jobDepartments.length > 0) {
				filters.job_department = { values: jobDepartments };
			}

			// Has email - boolean field
			const hasEmail = executeFunctions.getNodeParameter('has_email', 0, true) as boolean;
			if (hasEmail !== undefined) {
				filters.has_email = { value: hasEmail };
			}

			// Has phone - boolean field
			const hasPhone = executeFunctions.getNodeParameter('has_phone_number', 0, false) as boolean;
			if (hasPhone !== undefined) {
				filters.has_phone_number = { value: hasPhone };
			}

			// Prospect country codes
			const prospectCountryCodes = getCollectionValues('country_code_prospect', 'code');
			if (prospectCountryCodes.length > 0) {
				filters.country_code = { values: prospectCountryCodes };
			}

			// Company country codes
			const companyCountryCodes = getCollectionValues('company_country_code', 'code');
			if (companyCountryCodes.length > 0) {
				filters.company_country_code = { values: companyCountryCodes };
			}

			// Company sizes for prospects
			const companySizesProspects = getCollectionValues('company_size_prospects', 'size');
			if (companySizesProspects.length > 0) {
				filters.company_size = { values: companySizesProspects };
			}

			// Company revenue for prospects
			const companyRevenueProspects = getCollectionValues('company_revenue_prospects', 'range');
			if (companyRevenueProspects.length > 0) {
				filters.company_revenue = { values: companyRevenueProspects };
			}
		}

		// Additional filters from JSON
		const additionalFiltersString = executeFunctions.getNodeParameter(
			'additional_filters',
			0,
			'{}',
		) as string;
		let additionalFilters: any = {};
		try {
			additionalFilters =
				typeof additionalFiltersString === 'string'
					? JSON.parse(additionalFiltersString)
					: additionalFiltersString;
		} catch {
			throw new NodeOperationError(
				executeFunctions.getNode(),
				'Invalid JSON format for additional filters',
			);
		}

		// Merge additional filters
		Object.assign(filters, additionalFilters);

		requestBody = {
			mode,
			size,
			page_size: pageSize,
			page,
			filters,
		};

		// Get exclude collection for businesses
		if (type === 'businesses') {
			const excludeCollection = executeFunctions.getNodeParameter('exclude', 0, {}) as any;
			const excludeArray = excludeCollection.exclude || [];
			const excludeIds = excludeArray.map((item: any) => item.id).filter(Boolean);

			if (excludeIds.length > 0) {
				requestBody.exclude = excludeIds;
			}
		}
	}

	const endpoint = type === 'businesses' ? '/v1/businesses' : '/v1/prospects';

	const response = await executeFunctions.helpers.httpRequestWithAuthentication.call(
		executeFunctions,
		'exploriumApi',
		{
			method: 'POST',
			url: `https://api.explorium.ai${endpoint}`,
			body: requestBody,
			json: true,
		},
	);

	returnData.push({ json: response });
	return [returnData];
}

async function executeEvents(executeFunctions: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const returnData: INodeExecutionData[] = [];
	const type = executeFunctions.getNodeParameter('type', 0) as 'businesses' | 'prospects';
	const useJsonInput = executeFunctions.getNodeParameter('useJsonInput', 0, false) as boolean;

	const body: any = {};

	if (useJsonInput) {
		const jsonInput = extractJsonInput(executeFunctions);
		Object.assign(body, jsonInput);
	} else {
		// Assign business_ids or prospect_ids from form fields
		if (type === 'businesses') {
			const collection = executeFunctions.getNodeParameter('business_ids', 0, {
				business_ids: [],
			}) as BusinessIds_Collection;
			body.business_ids = collection.business_ids.map((x) => x.id);
		} else {
			const collection = executeFunctions.getNodeParameter('prospect_ids_collection', 0, {
				prospect_ids: [],
			}) as ProspectIds_Collection;
			body.prospect_ids = collection.prospect_ids.map((x) => x.id);
		}

		// Assign other(non entity related) fields from form fields
		const eventTypes = executeFunctions.getNodeParameter('event_types', 0) as string[];
		body.event_types = eventTypes;

		const timestampFrom = executeFunctions.getNodeParameter('timestamp_from', 0, '') as string;
		const timestampTo = executeFunctions.getNodeParameter('timestamp_to', 0, '') as string;

		if (timestampFrom) {
			body.timestamp_from = timestampFrom;
		}

		if (timestampTo) {
			body.timestamp_to = timestampTo;
		}
	}

	// Validate required fields
	if ('business_ids' in body && body.business_ids.filter(Boolean).length === 0) {
		throw new NodeOperationError(
			executeFunctions.getNode(),
			'At least one business ID is required',
		);
	}

	if ('prospect_ids' in body && body.prospect_ids.filter(Boolean).length === 0) {
		throw new NodeOperationError(
			executeFunctions.getNode(),
			'At least one prospect ID is required',
		);
	}

	if (!body.event_types || body.event_types.length === 0) {
		throw new NodeOperationError(executeFunctions.getNode(), 'At least one event type is required');
	}

	const endpoint = type === 'businesses' ? '/v1/businesses/events' : '/v1/prospects/events';

	const response = await executeFunctions.helpers.httpRequestWithAuthentication.call(
		executeFunctions,
		'exploriumApi',
		{
			method: 'POST',
			url: `https://api.explorium.ai${endpoint}`,
			body,
			json: true,
		},
	);

	returnData.push({ json: response });
	return [returnData];
}

async function executeAutocomplete(
	executeFunctions: IExecuteFunctions,
): Promise<INodeExecutionData[][]> {
	const returnData: INodeExecutionData[] = [];
	const field = executeFunctions.getNodeParameter('field', 0) as string;
	const query = executeFunctions.getNodeParameter('query', 0) as string;

	const response = await executeFunctions.helpers.httpRequestWithAuthentication.call(
		executeFunctions,
		'exploriumApi',
		{
			method: 'GET',
			url: 'https://api.explorium.ai/v1/businesses/autocomplete',
			qs: { field, query },
			json: true,
		},
	);

	returnData.push({ json: response });
	return [returnData];
}

function extractJsonInput<T = any>(executeFunctions: IExecuteFunctions): T {
	const jsonInput = executeFunctions.getNodeParameter('jsonInput', 0) as string;
	if (!jsonInput) {
		throw new NodeOperationError(executeFunctions.getNode(), 'JSON Input is empty');
	}

	try {
		return typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
	} catch (error) {
		throw new NodeOperationError(
			executeFunctions.getNode(),
			'Invalid JSON format in JSON Input field',
		);
	}
}
