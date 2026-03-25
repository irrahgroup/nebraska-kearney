import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class ZapiApi implements ICredentialType {
	name = 'zapiApi';

	displayName = 'Z-API API';

	documentationUrl = 'https://developer.z-api.io/';

	icon: Icon = 'file:../icons/zapi.svg';

	properties: INodeProperties[] = [
		{
			displayName: 'Instance ID',
			name: 'instanceId',
			type: 'string',
			default: '',
			required: true,
			description: 'The Z-API instance ID.',
		},
		{
			displayName: 'Instance Token',
			name: 'instanceToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The Z-API instance token.',
		},
		{
			displayName: 'Client Token',
			name: 'clientToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The Z-API account security token. Sent in the "Client-Token" header.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Client-Token': '={{$credentials.clientToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.z-api.io',
			url: '=/instances/{{$credentials.instanceId}}/token/{{$credentials.instanceToken}}/status',
			method: 'GET',
		},
	};
}
