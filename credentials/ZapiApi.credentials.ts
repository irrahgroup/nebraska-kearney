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
			description: 'ID da instância na Z-API.',
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
			description: 'Token da instância na Z-API.',
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
			description:
				'Account Security Token da Z-API. Será enviado no header "Client-Token".',
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
