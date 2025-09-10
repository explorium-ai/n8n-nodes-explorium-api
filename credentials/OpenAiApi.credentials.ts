import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class OpenAiApi implements ICredentialType {
	name = 'openAiApi';
	displayName = 'Open AI API';
	documentationUrl = 'https://platform.openai.com/docs/api-reference';
	properties: INodeProperties[] = [
		{
			displayName: 'OpenAI API Key',
			name: 'openAiApiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your OpenAI API key',
		},
	];

	// This allows the credential to be used by other parts of n8n
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.openAiApiKey}}',
				'Content-Type': 'application/json',
			},
		},
	};

	// Test the credentials by making a simple request to OpenAI
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.openai.com',
			url: '/v1/models',
			method: 'GET',
		},
	};
}
