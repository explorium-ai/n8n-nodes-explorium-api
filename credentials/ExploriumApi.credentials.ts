import { ICredentialType, INodeProperties } from 'n8n-workflow';

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
}
