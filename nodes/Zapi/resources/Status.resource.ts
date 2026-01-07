import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const statusProperties: INodeProperties[] = [
	{
		displayName: 'Image',
		name: 'image',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'https://example.com/image.jpg or data:image/png;base64,...',
		description:
			'Image URL or Base64, according to Z-API documentation. This field is required.',
		displayOptions: {
			show: {
				resource: ['status'],
				operation: ['postStatusImage'],
			},
		},
	},
	{
		displayName: 'Caption',
		name: 'caption',
		type: 'string',
		typeOptions: {
			rows: 3,
		},
		default: '',
		description: 'Optional caption to be sent along with the status image',
		displayOptions: {
			show: {
				resource: ['status'],
				operation: ['postStatusImage'],
			},
		},
	},
	{
		displayName: 'Status Message',
		name: 'statusMessage',
		type: 'string',
		typeOptions: {
			rows: 3,
		},
		default: '',
		required: true,
		placeholder: 'Your status message',
		description: 'Text that will be posted to WhatsApp Status (sent as "message" to the API)',
		displayOptions: {
			show: {
				resource: ['status'],
				operation: ['postStatusText'],
			},
		},
	},
];

export async function executeStatus(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	itemIndex: number,
	operation: string,
	baseUrl: string,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'postStatusImage') {
		const image = this.getNodeParameter('image', itemIndex) as string;
		const caption = this.getNodeParameter('caption', itemIndex, '') as string;

		if (!image) {
			throw new NodeOperationError(
				this.getNode(),
				'Image (image) is required to post to status.',
				{ itemIndex },
			);
		}

		const body: IDataObject = { image };

		if (caption && caption.trim().length > 0) {
			body.caption = caption;
		}

		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'zapiApi',
			{
				method: 'POST',
				url: `${baseUrl}/send-image-status`,
				headers: {
					'Content-Type': 'application/json',
				},
				body,
				json: true,
			},
		);

		return response as IDataObject;
	}

	if (operation === 'postStatusText') {
		const statusMessage = this.getNodeParameter('statusMessage', itemIndex) as string;

		if (!statusMessage) {
			throw new NodeOperationError(
				this.getNode(),
				'Status message (statusMessage) is required to post to status.',
				{ itemIndex },
			);
		}

		const body: IDataObject = {
			message: statusMessage,
		};

		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'zapiApi',
			{
				method: 'POST',
				url: `${baseUrl}/send-text-status`,
				headers: {
					'Content-Type': 'application/json',
				},
				body,
				json: true,
			},
		);

		return response as IDataObject;
	}

	throw new NodeOperationError(
		this.getNode(),
		`Unsupported operation for "status" resource: ${operation}`,
		{ itemIndex },
	);
}
