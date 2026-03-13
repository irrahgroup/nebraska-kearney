import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const chatsProperties: INodeProperties[] = [
	{
		displayName: 'Telefone Do Chat',
		name: 'phone',
		type: 'string',
		default: '',
		required: true,
		placeholder: '5544999999999',
		description:
			'Número do contato cujo chat será modificado, em formato internacional, apenas dígitos. Exemplo: 5544999999999.',
		displayOptions: {
			show: {
				resource: ['chats'],
				operation: ['archiveChat', 'deleteChat', 'pinChat'],
			},
		},
	},
];

export async function executeChats(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	itemIndex: number,
	operation: string,
	baseUrl: string,
): Promise<IDataObject | IDataObject[]> {

	if (operation === 'listChats') {
		const qs: IDataObject = {
			page: 1,
			pageSize: 15,
		};

		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'zapiApi',
			{
				method: 'GET',
				url: `${baseUrl}/chats`,
				qs,
				headers: { Accept: 'application/json' },
				json: true,
			}
		);
		

		const chats = Array.isArray(response) ? response : response?.data;

		if (!Array.isArray(chats)) {
			throw new NodeOperationError(this.getNode(), 'Resposta inesperada da API');
		}

		return chats.map((chat: IDataObject) => ({ json: chat }));
	}


	// Para operações que precisam de telefone
	const phone = this.getNodeParameter('phone', itemIndex) as string;

	if (!phone) {
		throw new NodeOperationError(
			this.getNode(),
			'É necessário informar o telefone do chat.',
			{ itemIndex },
		);
	}

	let action: string;

	if (operation === 'archiveChat') {
		action = 'archive';
	} else if (operation === 'deleteChat') {
		action = 'delete';
	} else if (operation === 'pinChat') {
		action = 'pin';
	} else {
		throw new NodeOperationError(
			this.getNode(),
			`Operação não suportada para o recurso "chats": ${operation}`,
			{ itemIndex },
		);
	}

	const body: IDataObject = {
		phone,
		action,
	};

	const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
		method: 'POST',
		url: `${baseUrl}/modify-chat`,
		headers: {
			'Content-Type': 'application/json',
		},
		body,
		json: true,
	});

	// Retorna no formato do n8n
	return [{ json: response }];
}
