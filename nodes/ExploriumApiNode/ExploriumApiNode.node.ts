import {
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeProperties,
	type INodeType,
	type INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

import { enrichmentEndpoints, OperationKey, operations } from './operations';
import {
	BusinessesToMatch,
	ProspectsToMatch,
	BusinessIds_Collection,
	ProspectIds_Collection,
	BusinessIds_Body,
	ProspectIds_Body,
} from './types';
import { excludeEmptyValues } from './utils';

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
			// Dynamic properties based on operation
			...Object.entries(operations).flatMap(([operationKey, operationConfig]) =>
				operationConfig.properties.map((property) => {
					const prop = property as any;
					const displayOptions: any = {
						show: {
							operation: [operationKey],
						},
					};

					// Merge existing displayOptions.show
					if (prop.displayOptions?.show) {
						Object.assign(displayOptions.show, prop.displayOptions.show);
					}

					// Add hide options if they exist
					if (prop.displayOptions?.hide) {
						displayOptions.hide = prop.displayOptions.hide;
					}

					return {
						...property,
						displayOptions,
					} as INodeProperties;
				}),
			),
			// Simple advanced JSON input option
			{
				displayName: 'Advanced JSON Input',
				name: 'useJsonInput',
				type: 'boolean',
				default: false,
				description: 'Whether to use direct JSON input instead of form fields',
			},
			// Dynamic JSON input fields for each operation
			...Object.keys(operations).reduce((acc, operationKey) => {
				const examples = operations[operationKey as OperationKey].examples;
				for (const example of examples) {
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
			// Handle streamlined operations
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

// async function executeJsonInput(
// 	executeFunctions: IExecuteFunctions,
// 	operation: OperationKey,
// ): Promise<INodeExecutionData[][]> {
// 	const returnData: INodeExecutionData[] = [];
// 	const jsonInput = executeFunctions.getNodeParameter('jsonInput', 0) as string;

// 	let body: Record<string, any>;
// 	try {
// 		body = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
// 	} catch (error) {
// 		throw new NodeOperationError(
// 			executeFunctions.getNode(),
// 			'Invalid JSON format in JSON Input field',
// 		);
// 	}

// 	// Determine endpoint and method based on operation
// 	let endpoint: string;
// 	let method: 'GET' | 'POST' = 'POST';
// 	let qs: Record<string, any> | undefined;

// 	switch (operation) {
// 		case 'match':
// 			// Auto-detect if it's business or prospect match based on the input
// 			if (body.businesses_to_match) {
// 				endpoint = '/v1/businesses/match';
// 			} else if (body.prospects_to_match) {
// 				endpoint = '/v1/prospects/match';
// 			} else {
// 				throw new NodeOperationError(
// 					executeFunctions.getNode(),
// 					'JSON input must contain either "businesses_to_match" or "prospects_to_match"',
// 				);
// 			}
// 			break;
// 		case 'fetch':
// 			// Auto-detect if it's businesses or prospects based on filters or explicit mode
// 			if (body.mode && body.mode.includes('prospect')) {
// 				endpoint = '/v1/prospects';
// 			} else {
// 				endpoint = '/v1/businesses';
// 			}
// 			break;
// 		case 'events':
// 			// Auto-detect based on the ID field used
// 			if (body.business_ids) {
// 				endpoint = '/v1/businesses/events';
// 			} else if (body.prospect_ids) {
// 				endpoint = '/v1/prospects/events';
// 			} else {
// 				throw new NodeOperationError(
// 					executeFunctions.getNode(),
// 					'JSON input must contain either "business_ids" or "prospect_ids"',
// 				);
// 			}
// 			break;
// 		case 'enrich':
// 			// For enrichment, we need to determine the specific endpoint from the enrichment type
// 			// Since we can't determine this from JSON alone, use the most common one
// 			if (body.business_ids) {
// 				endpoint = '/v1/businesses/firmographics/bulk_enrich';
// 			} else if (body.prospect_ids) {
// 				endpoint = '/v1/prospects/contacts_information/bulk_enrich';
// 			} else {
// 				throw new NodeOperationError(
// 					executeFunctions.getNode(),
// 					'JSON input must contain either "business_ids" or "prospect_ids"',
// 				);
// 			}
// 			break;
// 		case 'autocomplete':
// 			endpoint = '/v1/businesses/autocomplete';
// 			method = 'GET';
// 			qs = body;
// 			body = undefined as any;
// 			break;
// 		default:
// 			throw new NodeOperationError(executeFunctions.getNode(), `Unknown operation: ${operation}`);
// 	}

// 	const response = await executeFunctions.helpers.httpRequestWithAuthentication.call(
// 		executeFunctions,
// 		'exploriumApi',
// 		{
// 			method,
// 			url: `https://api.explorium.ai${endpoint}`,
// 			body,
// 			qs,
// 			json: true,
// 		},
// 	);

// 	returnData.push({ json: response });
// 	return [returnData];
// }

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
			businessesToMatch = await extractJsonInput<BusinessesToMatch>(executeFunctions);
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
			prospectsToMatch = await extractJsonInput<ProspectsToMatch>(executeFunctions);
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
	const shouldMatch = executeFunctions.getNodeParameter('match', 0, false) as boolean;
	const useJsonInput = executeFunctions.getNodeParameter('useJsonInput', 0, false) as boolean;

	let keywordsBody: { parameters?: { keywords: string[] } } | undefined;
	let body: (BusinessIds_Body & { parameters?: { keywords: string[] } }) | ProspectIds_Body;

	// Get entity IDs (either by matching or from provided IDs)
	if (shouldMatch) {
		const matchResult = await executeMatch(executeFunctions);
		const matchData = matchResult[0][0].json as any;

		if (type === 'businesses') {
			body = {
				business_ids: matchData.matched_businesses?.map((match: any) => match.business_id) || [],
			};
		} else {
			body = {
				prospect_ids: matchData.matched_prospects?.map((match: any) => match.prospect_id) || [],
			};
		}
	} else if (useJsonInput) {
		const jsonInput = executeFunctions.getNodeParameter('jsonInput', 0) as string;
		const jsonInputObject = JSON.parse(jsonInput);
		body = jsonInputObject;
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
	const filtersString = executeFunctions.getNodeParameter('filters', 0, '{}') as string;
	const pageSize = executeFunctions.getNodeParameter('page_size', 0, 10) as number;
	const nextCursor = executeFunctions.getNodeParameter('next_cursor', 0, '') as string;

	let filters: any;
	try {
		filters = typeof filtersString === 'string' ? JSON.parse(filtersString) : filtersString;
	} catch {
		throw new NodeOperationError(executeFunctions.getNode(), 'Invalid JSON format for filters');
	}

	const endpoint = type === 'businesses' ? '/v1/businesses' : '/v1/prospects';

	const requestBody: any = {
		mode: 'preview',
		filters,
		page_size: pageSize,
	};

	if (nextCursor) {
		requestBody.next_cursor = nextCursor;
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

async function executeEvents(executeFunctions: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const returnData: INodeExecutionData[] = [];
	const type = executeFunctions.getNodeParameter('type', 0) as 'businesses' | 'prospects';
	const shouldMatch = executeFunctions.getNodeParameter('match', 0, false) as boolean;
	const eventTypes = executeFunctions.getNodeParameter('event_types', 0) as string[];

	const timestampFrom = executeFunctions.getNodeParameter('timestamp_from', 0, '') as string;
	const timestampTo = executeFunctions.getNodeParameter('timestamp_to', 0, '') as string;

	let entityIds: string[] = [];

	// Get entity IDs (either by matching or from provided IDs)
	if (shouldMatch) {
		const matchResult = await executeMatch(executeFunctions);
		const matchData = matchResult[0][0].json as any;

		if (type === 'businesses') {
			entityIds = matchData.matched_businesses?.map((match: any) => match.business_id) || [];
		} else {
			entityIds = matchData.matched_prospects?.map((match: any) => match.prospect_id) || [];
		}
	} else {
		if (type === 'businesses') {
			const businessIdsCollection = executeFunctions.getNodeParameter('business_ids', 0, {
				business_ids: [],
			}) as BusinessIds_Collection;

			const businessIdsList = businessIdsCollection.business_ids || [];
			entityIds = businessIdsList.map((x) => x.id);

			if (entityIds.length === 0) {
				throw new NodeOperationError(
					executeFunctions.getNode(),
					'At least one business ID is required when not matching first',
				);
			}
		} else {
			const prospectIdsCollection = executeFunctions.getNodeParameter(
				'prospect_ids_collection',
				0,
				{ prospect_ids: [] },
			) as ProspectIds_Collection;

			const prospectIdsList = prospectIdsCollection.prospect_ids || [];
			entityIds = prospectIdsList.map((x) => x.id);

			if (entityIds.length === 0) {
				throw new NodeOperationError(
					executeFunctions.getNode(),
					'At least one prospect ID is required when not matching first',
				);
			}
		}
	}

	if (entityIds.length === 0) {
		throw new NodeOperationError(executeFunctions.getNode(), 'No entity IDs found for events');
	}

	const endpoint = type === 'businesses' ? '/v1/businesses/events' : '/v1/prospects/events';

	const requestBody: any = {
		event_types: eventTypes,
	};

	requestBody[type === 'businesses' ? 'business_ids' : 'prospect_ids'] = entityIds;

	if (timestampFrom) {
		requestBody.timestamp_from = timestampFrom;
	}

	if (timestampTo) {
		requestBody.timestamp_to = timestampTo;
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

async function extractJsonInput<T>(executeFunctions: IExecuteFunctions): Promise<T> {
	const jsonInput = executeFunctions.getNodeParameter('jsonInput', 0) as string;
	try {
		return typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
	} catch (error) {
		throw new NodeOperationError(
			executeFunctions.getNode(),
			'Invalid JSON format in JSON Input field',
		);
	}
}
