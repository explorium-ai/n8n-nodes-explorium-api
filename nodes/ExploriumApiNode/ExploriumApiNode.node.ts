import {
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeProperties,
	type INodeType,
	type INodeTypeDescription,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';

import { enrichmentEndpoints } from './constants';
import { OperationKey, operations } from './operations';
import {
	BusinessesToMatch,
	BusinessIds_Body,
	BusinessIds_Collection,
	ProspectIds_Body,
	ProspectIds_Collection,
	ProspectsToMatch,
} from './types';
import { excludeEmptyValues } from './utils';

declare const structuredClone: <T>(value: T) => T;

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
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'exploriumApi', required: true }],
		hints: Object.entries(operations).flatMap(([key, value]) => {
			return value.docsHref.map((doc) => ({
				type: 'info',
				message: `
					<a href="${doc.href}" target="_blank">
						View documentation for ${doc.title}
					</a>
				`,
				whenToDisplay: 'always',
				displayCondition: doc.displayCondition,
			}));
		}),
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
			const returnData: INodeExecutionData[] = [];
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
	const length = executeFunctions.getInputData().length;
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < length; i++) {
		const type = executeFunctions.getNodeParameter('type', i) as 'businesses' | 'prospects';
		const useJsonInput = executeFunctions.getNodeParameter('useJsonInput', i, false) as boolean;

		let endpoint: string;
		let requestBody: any;

		if (type === 'businesses') {
			endpoint = '/v1/businesses/match';
			let businessesToMatch: BusinessesToMatch;

			if (useJsonInput) {
				businessesToMatch = extractJsonInput<BusinessesToMatch>(executeFunctions, i);
			} else {
				businessesToMatch = executeFunctions.getNodeParameter('businesses_to_match', i, {
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
				prospectsToMatch = extractJsonInput<ProspectsToMatch>(executeFunctions, i);
			} else {
				prospectsToMatch = executeFunctions.getNodeParameter('prospects_to_match', i, {
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
	}
	return [returnData];
}

async function executeEnrich(executeFunctions: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const length = executeFunctions.getInputData().length;
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < length; i++) {
		const type = executeFunctions.getNodeParameter('type', i) as 'businesses' | 'prospects';
		const enrichments = executeFunctions.getNodeParameter('enrichment', i) as string[];
		const useJsonInput = executeFunctions.getNodeParameter('useJsonInput', i, false) as boolean;

		let body: BusinessIds_Body | ProspectIds_Body;
		let jsonInputParameters: any = undefined;

		if (useJsonInput) {
			const jsonInput = extractJsonInput(executeFunctions, i);
			if (enrichments.some((e) => ['website_keywords', 'website_traffic', 'business_intent_topics'].includes(e))) {
				const { parameters, ...bodyWithoutParams } = jsonInput;
				jsonInputParameters = parameters;
				body = bodyWithoutParams;
			} else {
				body = jsonInput;
			}
		} else {
			if (type === 'businesses') {
				const collection = executeFunctions.getNodeParameter('business_ids', i, {
					business_ids: [],
				}) as BusinessIds_Collection;

				body = {
					business_ids: collection.business_ids?.map((x) => x.id) || [],
				};
			} else {
				const collection = executeFunctions.getNodeParameter('prospect_ids', i, {
					prospect_ids: [],
				}) as ProspectIds_Collection;

				body = {
					prospect_ids: collection.prospect_ids.map((x) => x.id),
				};
			}
		}

		if ('business_ids' in body) {
			if (body.business_ids.filter(Boolean).length === 0) {
				throw new NodeOperationError(
					executeFunctions.getNode(),
					'At least one business ID is required',
				);
			}
		}

		if ('prospect_ids' in body && body.prospect_ids.filter(Boolean).length === 0) {
			throw new NodeOperationError(
				executeFunctions.getNode(),
				'At least one prospect ID is required',
			);
		}

		const enrichment_responses = [];
		const enriched_data: any[] = [];
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

			let requestBody: any = { ...body };

			// Build parameters specific to this enrichment
			if (useJsonInput && jsonInputParameters) {
				// Use parameters from JSON input
				requestBody.parameters = jsonInputParameters;
			} else if (!useJsonInput && type === 'businesses') {
				const parameters: any = {};

				switch (enrichment) {
					case 'website_keywords': {
						const keywordsCollection = executeFunctions.getNodeParameter('keywords', i, {
							keywords: [],
						}) as { keywords: Array<{ keyword: string }> };

						parameters.keywords = keywordsCollection.keywords?.map((item) => item.keyword).filter(Boolean) || [];;
						break;
					}

					case 'website_traffic': {
						const monthPeriod = executeFunctions.getNodeParameter('month_period', i, '') as string;
						if (monthPeriod) {
							parameters.month_period = monthPeriod;
						}
						break;
					}

					case 'business_intent_topics': {
						const topicsCollection = executeFunctions.getNodeParameter('intent_topics', i, {
							intent_topics: [],
						}) as { intent_topics: Array<{ topic: string }> };

						const topics =
							topicsCollection.intent_topics?.map((item) => item.topic).filter(Boolean) || [];

						const minScore = executeFunctions.getNodeParameter('min_score', i) as number | undefined;

						if (topics.length > 0) {
							parameters.topics = topics;
						}
						if (minScore !== undefined && minScore > 60) {
							parameters.min_score = minScore;
						}
						break;
					}
				}

				// Add parameters to request body if any were set
				if (Object.keys(parameters).length > 0) {
					requestBody.parameters = parameters;
				}
			}

			try {
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

				// Clone the response to prevent mutation of historical data
				const clonedResponse = structuredClone(response);

				enrichment_responses.push({
					enrichment_type: enrichment,
					response: clonedResponse,
					hasData: Boolean(response.data && response.data.length > 0),
				});

				for (const entity of response.data || []) {
					const matchedEntity = enriched_data.find((x) => {
						if (type === 'businesses') {
							return x.business_id === entity.business_id;
						} else {
							return x.prospect_id === entity.prospect_id;
						}
					});

					if (matchedEntity) {
						Object.assign(matchedEntity.data, entity.data);
					} else {
						enriched_data.push(entity);
					}
				}
			} catch (error) {
				enrichment_responses.push({
					enrichment_type: enrichment,
					response: null,
					hasData: false,
					error: error.message || `Could not enrich ${type} with ${enrichment} enrichment`,
				});
			}
		}

		returnData.push({
			json: {
				enrichmentsResponse: enrichment_responses,
				enriched_data,
			},
		});
	}

	return [returnData];
}

async function executeFetch(executeFunctions: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const length = executeFunctions.getInputData().length;
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < length; i++) {
		const type = executeFunctions.getNodeParameter('type', i) as string;
		const useJsonInput = executeFunctions.getNodeParameter('useJsonInput', i, false) as boolean;
		const extractData = executeFunctions.getNodeParameter('extractData', i, false) as boolean;

		let requestBody: any;
		let autoPaginate = false;
		let size = 0;

		if (useJsonInput) {
			// Use JSON input directly
			const jsonInput = extractJsonInput(executeFunctions, i);
			requestBody = jsonInput;
		} else {
			// Get pagination and mode parameters
			const mode = executeFunctions.getNodeParameter('mode', i, 'preview') as string;
			size = executeFunctions.getNodeParameter('size', i, 20) as number;
			autoPaginate = executeFunctions.getNodeParameter('auto_paginate', i, false) as boolean;
			const page = autoPaginate ? undefined : executeFunctions.getNodeParameter('page', i, 1) as number;
			const pageSize = autoPaginate ? Math.min(100, size) : (executeFunctions.getNodeParameter('page_size', i, 100) as number);
			

			// Build filters object from individual parameters
			const filters: any = {};

			// Helper function to get collection values
			const getCollectionValues = (paramName: string, valueKey: string) => {
				const collection = executeFunctions.getNodeParameter(paramName, i, {}) as any;
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

				// Business intent topics
				const businessIntentTopics = getCollectionValues('business_intent_topics', 'topic');
				if (businessIntentTopics.length > 0) {
					const businessIntentTopicsFilter: any = {
						topics: businessIntentTopics,
					};
					const topicIntentLevel = executeFunctions.getNodeParameter(
						'business_intent_topics_level',
						i,
						'',
					) as string;
					if (topicIntentLevel) {
						businessIntentTopicsFilter.topic_intent_level = topicIntentLevel;
					}
					filters.business_intent_topics = businessIntentTopicsFilter;
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

				// Job titles
				const jobTitles = getCollectionValues('job_title', 'title');
				if (jobTitles.length > 0) {
					const jobTitleFilter: any = {
						values: jobTitles,
					};
					const includeRelated = executeFunctions.getNodeParameter(
						'include_related_job_titles',
						i,
						false,
					) as boolean;
					if (includeRelated) {
						jobTitleFilter.include_related_job_titles = includeRelated;
					}
					filters.job_title = jobTitleFilter;
				}

				// Has email - boolean field
				const hasEmail = executeFunctions.getNodeParameter('has_email', i, true) as boolean;
				if (hasEmail !== undefined) {
					filters.has_email = { value: hasEmail };
				}

				// Has phone - boolean field
				const hasPhone = executeFunctions.getNodeParameter('has_phone_number', i, false) as boolean;
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
				i,
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
				const excludeIds = getCollectionValues('exclude', 'id');
				if (excludeIds.length > 0) {
					requestBody.exclude = excludeIds;
				}
			}
		}

		const endpoint = type === 'businesses' ? '/v1/businesses' : '/v1/prospects';

		const fetchPage = async (pageOverride?: number) => {
			const body = pageOverride !== undefined ? { ...requestBody, page: pageOverride } : requestBody;
			return executeFunctions.helpers.httpRequestWithAuthentication.call(
				executeFunctions,
				'exploriumApi',
				{
					method: 'POST',
					url: `https://api.explorium.ai${endpoint}`,
					body,
					json: true,
				},
			);
		};

		if (autoPaginate && !useJsonInput) {
			let currentPage = 1;
			let fetchedCount = 0;
			let targetCount = size;

			while (fetchedCount < targetCount) {
				const response = await fetchPage(currentPage);
				const data = Array.isArray(response.data) ? response.data : [];

				if (data.length === 0) {
					break;
				}

				fetchedCount += data.length;
				targetCount = Math.min(size, response.total_results); // in case there are less results than requested size

				// This is a patch because currently the endpoint returns all of the entities on the last page (not only the remaining ones).
				// This is a temporary fix to ensure that the correct number of entities are returned.
				if (fetchedCount > targetCount) {
					data.splice(targetCount - fetchedCount);
				}

				handleResponseData(returnData, response, extractData, data);

				currentPage += 1;
			}
		} else {
			const response = await fetchPage();
			handleResponseData(returnData, response, extractData, response.data);
		}
	}
	return [returnData];
}

async function executeEvents(executeFunctions: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const length = executeFunctions.getInputData().length;
	const returnData: INodeExecutionData[] = [];
	for (let i = 0; i < length; i++) {
		const type = executeFunctions.getNodeParameter('type', i) as 'businesses' | 'prospects';
		const useJsonInput = executeFunctions.getNodeParameter('useJsonInput', i, false) as boolean;
		const extractData = executeFunctions.getNodeParameter('extractData', i, false) as boolean;

		const body: any = {};

		if (useJsonInput) {
			const jsonInput = extractJsonInput(executeFunctions, i);
			Object.assign(body, jsonInput);
		} else {
			// Assign business_ids or prospect_ids from form fields
			if (type === 'businesses') {
				const collection = executeFunctions.getNodeParameter('business_ids', i, {
					business_ids: [],
				}) as BusinessIds_Collection;
				body.business_ids = collection.business_ids?.map((x) => x.id) || [];
			} else {
				const collection = executeFunctions.getNodeParameter('prospect_ids', i, {
					prospect_ids: [],
				}) as ProspectIds_Collection;
				body.prospect_ids = collection.prospect_ids?.map((x) => x.id) || [];
			}

			// Assign other(non entity related) fields from form fields
			const eventTypes = executeFunctions.getNodeParameter('event_types', i) as string[];
			body.event_types = eventTypes;

			const timestampFrom = executeFunctions.getNodeParameter('timestamp_from', i, '') as string;
			const timestampTo = executeFunctions.getNodeParameter('timestamp_to', i, '') as string;

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
			throw new NodeOperationError(
				executeFunctions.getNode(),
				'At least one event type is required',
			);
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

		handleResponseData(returnData, response, extractData, response.output_events);
	}

	return [returnData];
}

async function executeAutocomplete(
	executeFunctions: IExecuteFunctions,
): Promise<INodeExecutionData[][]> {
	const length = executeFunctions.getInputData().length;
	const returnData: INodeExecutionData[] = [];
	for (let i = 0; i < length; i++) {
		const useJsonInput = executeFunctions.getNodeParameter('useJsonInput', i, false) as boolean;

		let autocompleteRequests: Array<{ field: string; query: string }> = [];

		if (useJsonInput) {
			const jsonInput = extractJsonInput<{
				autocomplete_requests: Array<{ field: string; query: string }>;
			}>(executeFunctions, i);
			autocompleteRequests = jsonInput.autocomplete_requests || [];
		} else {
			const collection = executeFunctions.getNodeParameter('autocomplete_fields', i, {
				autocomplete_fields: [],
			}) as { autocomplete_fields: Array<{ field: string; query: string }> };

			autocompleteRequests = collection.autocomplete_fields || [];
		}

		if (autocompleteRequests.length === 0) {
			throw new NodeOperationError(
				executeFunctions.getNode(),
				'At least one autocomplete request is required',
			);
		}

		const results = [];

		// Process each autocomplete request
		for (const request of autocompleteRequests) {
			const { field, query } = request;

			if (!field) {
				throw new NodeOperationError(
					executeFunctions.getNode(),
					'Field is required for each autocomplete request',
				);
			}

			try {
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

				results.push({
					field,
					query,
					data: response,
				});
			} catch (error) {
				error.description = `${error.description}. Error fetching autocomplete data for ${field} with query ${query}.`;
				throw error;
			}
		}

		returnData.push({ json: { results } });
	}

	return [returnData];
}

function handleResponseData(
	returnData: INodeExecutionData[],
	response: any,
	extractData: boolean,
	responseData?: any[],
) {
	if (extractData && responseData && Array.isArray(responseData)) {
		for (const item of responseData) {
			returnData.push({ json: item });
		}
	} else {
		returnData.push({ json: response });
	}
}

function extractJsonInput<T = any>(executeFunctions: IExecuteFunctions, index: number): T {
	const jsonInput = executeFunctions.getNodeParameter('jsonInput', index) as string;
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
