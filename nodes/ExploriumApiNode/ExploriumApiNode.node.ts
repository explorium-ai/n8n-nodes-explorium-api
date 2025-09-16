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

export class ExploriumApiNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Explorium API',
		name: 'exploriumApiNode',
		icon: 'file:explorium.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Make requests to Explorium API',
		defaults: { name: 'Explorium API' },
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [{ name: 'exploriumApi', required: true }],
		hints: Object.entries(operations).map(([key, value]) => {
			return {
				type: 'info',
				message: `
					<a href="${value.docs}" target="_blank">
						View documentation for ${key}
					</a>
				`,
				displayCondition: `={{$parameter["operation"] === "${key}" }}`,
			};
		}),
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: Object.entries(operations).map(([key, value]) => ({
					name: key
						.split('-')
						.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
						.join(' '),
					value: key,
					description: value.description,
				})),
				default: '',
			},
			...Object.entries(operations).map(([key, value]) => {
				const options: INodeProperties[] = [];

				if ('body' in value.input) {
					// eslint-disable-next-line
					options.push({
						displayName: `Body`,
						typeOptions: { rows: 4 },
						name: 'body',
						type: 'json',
						default: value.input.body.example ?? '',
						description: 'The body of the request',
					});
				}

				if ('search' in value.input) {
					// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
					options.push({
						displayName: 'Query parameters',
						typeOptions: { rows: 4 },
						name: 'search',
						type: 'json',
						default: value.input.search.example,
						description: 'The query parameters of the request',
					});
				}

				const properties: INodeProperties = {
					displayName: 'Parameters',
					name: `parameters_${key}`,
					type: 'collection',
					placeholder: 'Add Parameter',
					default: {},
					displayOptions: { show: { '/operation': [key] } },
					options: options,
				};

				return properties;
			}),
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as OperationKey;
		const parameters = this.getNodeParameter(`parameters_${operation}`, 0) as {
			body?: string | Record<string, any>;
			search?: Record<string, any>;
		};

		try {
			if (!parameters || Object.keys(parameters).length === 0) {
				throw new NodeOperationError(
					this.getNode(),
					`Operation ${operation} cannot be executed without setting parameters`,
				);
			}

			const operationConfig = operations[operation];
			if (!operationConfig) {
				throw new NodeOperationError(this.getNode(), `Operation ${operation} not found`);
			}

			let body: Record<string, any> | undefined;
			if (parameters.body) {
				if (typeof parameters.body === 'string') {
					body = JSON.parse(parameters.body);
				} else {
					body = parameters.body;
				}
			}

			let search: Record<string, any> | undefined;
			if (parameters.search) {
				if (typeof parameters.search === 'string') {
					search = JSON.parse(parameters.search);
				} else {
					search = parameters.search;
				}
			}

			// Make API request
			const response = await this.helpers.httpRequestWithAuthentication.call(this, 'exploriumApi', {
				method: 'method' in operationConfig ? operationConfig.method : 'POST',
				url: `https://api.explorium.ai${operationConfig.endpoint}`,
				body,
				qs: search,
				json: true,
			});

			returnData.push({
				json: response,
			});
		} catch (_error) {
			let error;
			const isAxiosError = Boolean(_error.response);
			if (isAxiosError) {
				error = new Error(
					`Request failed with status: ${_error.response.status}.${
						_error.response.data ? `\ndata: ${JSON.stringify(_error.response.data, null, 2)}` : ''
					}`,
				);
			} else {
				error = _error;
			}

			if (this.continueOnFail()) {
				returnData.push({
					json: {
						error: error.message,
					},
				});
			}
			throw error;
		}

		return [returnData];
	}
}
