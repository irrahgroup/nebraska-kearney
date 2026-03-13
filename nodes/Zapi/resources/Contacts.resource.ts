import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const contactsProperties: INodeProperties[] = [
	{
		displayName: 'Telefone',
		name: 'phone',
		type: 'string',
		default: '',
		required: true,
		placeholder: '5511999999999',
		description:
			'Número do contato, em formato internacional, apenas dígitos. Exemplo: 5511999999999.',
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

	// ---- OPERAÇÕES QUE USAM "phone" ----
	if (['phoneExists', 'getContactMetadata', 'getContactProfilePicture'].includes(operation)) {

		const phone = this.getNodeParameter('phone', itemIndex) as string;

		if (!phone) {
			throw new NodeOperationError(
				this.getNode(),
				'É necessário informar o telefone para esta operação.',
				{ itemIndex },
			);
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

	// ---- OPERAÇÃO LISTAR CONTATOS ----
	if (operation === 'listContacts') {
		const url = `${baseUrl}/contacts`;
		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'zapiApi',
			{
				method: 'GET',
				url,
				qs: { page: 1, pageSize: 50 },
				json: true,
			},
		);
		return [{ json: response }];
	}

	// ---- OPERAÇÃO DESCONHECIDA ----
	throw new NodeOperationError(
		this.getNode(),
		`Operação não suportada para o recurso "contacts": ${operation}`,
		{ itemIndex },
	);
}
