import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ExploriumOpenAiApi implements ICredentialType {
	name = 'exploriumOpenAiApi';
	displayName = 'Explorium Open AI API';
	documentationUrl = 'https://platform.openai.com/docs/api-reference';
	properties: INodeProperties[] = [
		{
			displayName: 'Explorium OpenAI API Key',
			name: 'exploriumOpenAiApiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your OpenAI API key',
		},
		{
			displayName: 'Explorium API Key',
			name: 'exploriumApiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your Explorium API key',
		},
	];

	// This allows the credential to be used by other parts of n8n
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.exploriumOpenAiApiKey}}',
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
