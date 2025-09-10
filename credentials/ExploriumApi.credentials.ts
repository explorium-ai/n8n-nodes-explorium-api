import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ExploriumApi implements ICredentialType {
	name = 'exploriumApi';
	displayName = 'Explorium API';
	documentationUrl = 'https://docs.explorium.ai';
	properties: INodeProperties[] = [
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

	// // This allows the credential to be used by other parts of n8n
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Content-Type': 'application/json',
				api_key: '={{$credentials.exploriumApiKey}}',
			},
		},
	};

	// Test the credentials by making a simple request to OpenAI
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'http://app.explorium.ai/api',
			url: '/credit-service/credits/all_credits',
			method: 'GET',
		},
	};
}
