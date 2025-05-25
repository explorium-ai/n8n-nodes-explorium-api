import type { INodeType, INodeTypeDescription, IN8nHttpFullResponse, IExecuteSingleFunctions, IDataObject } from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
export class ExploriumOpenAiNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Explorium MCP',
		name: 'exploriumOpenAiNode',
		icon: 'file:explorium.svg',
		group: ['output'],
		version: 1,
		description: 'Make requests to OpenAI with Explorium MCP integration',
		defaults: {
			name: 'Explorium MCP',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [{ name: 'exploriumOpenAiApi', required: true }],
		requestDefaults: {
			baseURL: 'https://api.openai.com/v1',
			headers: {
				'Content-Type': 'application/json',
				Authorization: '={{ "Bearer " + $credentials.exploriumOpenAiApiKey }}',
			},
		},
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
			{
				displayName: 'Send Request',
				name: 'sendRequest',
				type: 'hidden',
				default: true,
				routing: {
					request: {
						method: 'POST',
						url: '/responses',
						body: {
							model: '={{ $parameter.model }}',
							tools: [
								{
									type: 'mcp',
									require_approval: '={{ $parameter.requireApproval }}',
									server_label: 'explorium',
									server_url: 'https://mcp.explorium.ai/sse',
									headers: {
										api_key: '={{ $credentials.exploriumApiKey }}',
									},
								},
							],
							input: '={{ $parameter.prompt }}',
						},
						json: true,
					},
					output: {
						postReceive: [
							async function(this: IExecuteSingleFunctions, _, response: IN8nHttpFullResponse) {
								const responseData = response.body as IDataObject;
								const finalMessage = extractFinalAssistantMessage(responseData);

								return [{
									json: {
										response: finalMessage,
									}
								}];
							}
						]
					},
				},
			},
		],
	};
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

				if (item.type === 'message' &&
					item.role === 'assistant' &&
					item.content &&
					item.content.length > 0 &&
					item.content[0].text) {

					return item.content[0].text;
				}
			}
		}

		return 'No assistant message found';
	} catch (error) {
		return null;
	}
}
