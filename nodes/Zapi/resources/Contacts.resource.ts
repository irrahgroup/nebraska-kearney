import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const contactsProperties: INodeProperties[] = [
	{
		displayName: 'Phone',
		name: 'phone',
		type: 'string',
		default: '',
		required: true,
		placeholder: '5511999999999',
		description:
			'Contact phone number in international format (digits only). Example: 5511999999999.',
		displayOptions: {
			show: {
				resource: ['contacts'],
				operation: ['phoneExists', 'getContactMetadata', 'getContactProfilePicture'],
			},
		},
	},
];

export async function executeContacts(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	itemIndex: number,
	operation: string,
	baseUrl: string,
): Promise<IDataObject | IDataObject[]> {
	if (['phoneExists', 'getContactMetadata', 'getContactProfilePicture'].includes(operation)) {
		const phone = this.getNodeParameter('phone', itemIndex) as string;

		if (!phone) {
			throw new NodeOperationError(this.getNode(), 'A phone number is required for this operation.', {
				itemIndex,
			});
		}

		if (operation === 'phoneExists') {
			const url = `${baseUrl}/phone-exists/${phone}`;
			const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
				method: 'GET',
				url,
				json: true,
			});
			return response as IDataObject;
		}

		if (operation === 'getContactMetadata') {
			const url = `${baseUrl}/contacts/${phone}`;
			const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
				method: 'GET',
				url,
				json: true,
			});
			return response as IDataObject;
		}

		if (operation === 'getContactProfilePicture') {
			const url = `${baseUrl}/profile-picture?phone=${phone}`;
			const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
				method: 'GET',
				url,
				json: true,
			});
			return response as IDataObject;
		}
	}

	if (operation === 'listContacts') {
		const url = `${baseUrl}/contacts`;
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'GET',
			url,
			qs: { page: 1, pageSize: 50 },
			json: true,
		});
		return [{ json: response }];
	}

	throw new NodeOperationError(
		this.getNode(),
		`Operation not supported for the "contacts" resource: ${operation}`,
		{ itemIndex },
	);
}
