import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

export class ExploriumMcpNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Explorium MCP',
		name: 'exploriumMcpNode',
		icon: 'file:explorium.svg',
		group: ['output'],
		version: 1,
		description: 'Make requests to OpenAI with Explorium MCP integration',
		defaults: {
			name: 'Explorium MCP',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{ name: 'openAiApi', required: true },
			{ name: 'exploriumApi', required: true },
		],
		properties: [
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				default: 'gpt-4.1',
				required: true,
				description: 'The OpenAI model to use',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				required: true,
				placeholder: 'Enter your prompt here...',
				description: 'The prompt to send to the AI model',
			},
			{
				displayName: 'Require Approval',
				name: 'requireApproval',
				type: 'options',
				options: [
					{ name: 'Never', value: 'never' },
					{ name: 'Always', value: 'always' },
					{ name: 'Auto', value: 'auto' },
				],
				default: 'never',
				description: 'Whether to require approval for MCP tool usage',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get credentials
		const openAiCredentials = await this.getCredentials('openAiApi');
		const exploriumCredentials = await this.getCredentials('exploriumApi');

		for (let i = 0; i < items.length; i++) {
			const model = this.getNodeParameter('model', i) as string;
			const prompt = this.getNodeParameter('prompt', i) as string;
			const requireApproval = this.getNodeParameter('requireApproval', i) as string;

			const requestBody = {
				model,
				tools: [
					{
						type: 'mcp',
						require_approval: requireApproval,
						server_label: 'explorium',
						server_url: 'https://mcp.explorium.ai/sse',
						headers: {
							api_key: exploriumCredentials.exploriumApiKey,
						},
					},
				],
				input: prompt,
			};

			try {
				const response = await this.helpers.httpRequest({
					method: 'POST',
					url: 'https://api.openai.com/v1/responses',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${openAiCredentials.openAiApiKey}`,
					},
					body: requestBody,
					json: true,
				});

				const finalMessage = extractFinalAssistantMessage(response);

				returnData.push({
					json: {
						response: finalMessage,
					},
					pairedItem: {
						item: i,
					},
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: {
							item: i,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

// Extracts the final assistant message from the response data.
function extractFinalAssistantMessage(response: any) {
	try {
		const responseData = response;

		if (responseData?.error) {
			return `Error: ${responseData.error}`;
		}

		if (responseData?.output) {
			const output = responseData.output;

			for (let i = output.length - 1; i >= 0; i--) {
				const item = output[i];

				if (
					item.type === 'message' &&
					item.role === 'assistant' &&
					item.content &&
					item.content.length > 0 &&
					item.content[0].text
				) {
					return item.content[0].text;
				}
			}
		}

		return 'No assistant message found';
	} catch (error) {
		return null;
	}
}
