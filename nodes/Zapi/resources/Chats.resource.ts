import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const chatsProperties: INodeProperties[] = [
	{
		displayName: 'Chat Phone',
		name: 'phone',
		type: 'string',
		default: '',
		required: true,
		placeholder: '5544999999999',
		description:
			'Phone number of the contact whose chat will be modified, in international format (digits only). Example: 5544999999999.',
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
			},
		);

		const chats = Array.isArray(response) ? response : response?.data;

		if (!Array.isArray(chats)) {
			throw new NodeOperationError(this.getNode(), 'Unexpected API response');
		}

		return chats.map((chat: IDataObject) => ({ json: chat }));
	}
	const phone = this.getNodeParameter('phone', itemIndex) as string;

	if (!phone) {
		throw new NodeOperationError(this.getNode(), 'Chat phone number is required.', { itemIndex });
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
			`Operation not supported for the "chats" resource: ${operation}`,
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
	return [{ json: response }];
}
