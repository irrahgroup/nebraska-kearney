import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const queueProperties: INodeProperties[] = [
	{
		displayName: 'Queue Message ID (ZaapId)',
		name: 'zaapId',
		type: 'string',
		default: '',
		required: true,
		placeholder: '39BB1684570F00E91090F6BBC7EE7646',
		description:
			'ZaapId of the queued message you want to delete. This ID is returned by the queue listing endpoint (GET /queue).',
		displayOptions: {
			show: {
				resource: ['queue'],
				operation: ['deleteQueueMessage'],
			},
		},
	},
	{
		displayName: 'Page (Page)',
		name: 'page',
		type: 'number',
		default: 1,
		description: 'Page number for paginating results',
		displayOptions: {
			show: {
				resource: ['queue'],
				operation: ['getQueueMessages'],
			},
		},
	},
	{
		displayName: 'Page Size (Size)',
		name: 'pageSize',
		type: 'number',
		default: 100,
		description:
			'Number of messages per page for pagination. Maximum value is 1000.',
		displayOptions: {
			show: {
				resource: ['queue'],
				operation: ['getQueueMessages'],
			},
		},
	},
];

export async function executeQueue(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	itemIndex: number,
	operation: string,
	baseUrl: string,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'deleteQueueMessage') {
		const zaapId = this.getNodeParameter('zaapId', itemIndex) as string;

		if (!zaapId) {
			throw new NodeOperationError(
				this.getNode(),
				'Queue message ZaapId is required.',
				{ itemIndex },
			);
		}

		const url = `${baseUrl}/queue/${zaapId}`;

		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'zapiApi',
			{
				method: 'DELETE',
				url,
				headers: {
					'Content-Type': 'application/json',
				},
				json: true,
			},
		);

		return response as IDataObject;
	}

	if (operation === 'getQueueMessages') {
		const page = this.getNodeParameter('page', itemIndex, 1) as number;
		const pageSize = this.getNodeParameter('pageSize', itemIndex, 100) as number;

		if (!page || page < 1) {
			throw new NodeOperationError(
				this.getNode(),
				'Page must be a positive integer greater than zero.',
				{ itemIndex },
			);
		}

		if (!pageSize || pageSize < 1) {
			throw new NodeOperationError(
				this.getNode(),
				'Page size must be a positive integer greater than zero.',
				{ itemIndex },
			);
		}

		const qs: IDataObject = {
			page,
			pageSize,
		};

		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'zapiApi',
			{
				method: 'GET',
				url: `${baseUrl}/queue`,
				qs,
				json: true,
			},
		);

		return response as IDataObject;
	}

	throw new NodeOperationError(
		this.getNode(),
		`Unsupported operation for "queue" resource: ${operation}`,
		{ itemIndex },
	);
}
