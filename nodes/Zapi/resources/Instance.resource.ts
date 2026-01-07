import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

interface QrCodeResponse {
	connected?: boolean;
	qrCode?: string;
	[key: string]: unknown;
}

function getErrorMessage(error: unknown): string {
	if (error instanceof Error) return error.message;
	if (typeof error === 'string') return error;
	try {
		return JSON.stringify(error);
	} catch {
		return String(error);
	}
}

function toBuffer(data: unknown): Buffer {
	if (Buffer.isBuffer(data)) return data;

	if (data instanceof ArrayBuffer) return Buffer.from(data);

	if (ArrayBuffer.isView(data)) {
		return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
	}

	throw new Error('Unexpected binary response format.');
}

export const instanceProperties: INodeProperties[] = [
	{
		displayName: 'Confirmation',
		name: 'confirmDisconnect',
		type: 'boolean',
		default: false,
		required: true,
		description: 'Whether to confirm you want to disconnect the phone from this Z-API instance',
		displayOptions: {
			show: {
				resource: ['instance'],
				operation: ['disconnectInstance'],
			},
		},
	},
	{
		displayName: 'Instance ID',
		name: 'instanceId',
		type: 'string',
		default: '',
		required: true,
		description: 'Z-API instance ID',
		displayOptions: {
			show: {
				resource: ['instance'],
				operation: ['getQRCodeBytes', 'getQRCodeImage'],
			},
		},
	},
	{
		displayName: 'Instance Token',
		name: 'instanceToken',
		type: 'string',
		typeOptions: { password: true },
		default: '',
		required: true,
		description: 'Z-API instance token',
		displayOptions: {
			show: {
				resource: ['instance'],
				operation: ['getQRCodeBytes', 'getQRCodeImage'],
			},
		},
	},
	{
		displayName: 'Phone Number',
		name: 'phoneNumber',
		type: 'string',
		default: '',
		required: true,
		description: 'Phone number with country and area code (e.g. 5511999999999)',
		displayOptions: {
			show: {
				resource: ['instance'],
				operation: ['getPhoneCode'],
			},
		},
	},
];

export async function executeInstance(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	itemIndex: number,
	operation: string,
	baseUrl: string,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'disconnectInstance') {
		const confirmDisconnect = this.getNodeParameter('confirmDisconnect', itemIndex) as boolean;

		if (!confirmDisconnect) {
			throw new NodeOperationError(
				this.getNode(),
				'You must confirm to disconnect the phone from the instance.',
				{ itemIndex },
			);
		}

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'GET',
			url: `${baseUrl}/disconnect`,
			json: true,
		});

		return response as IDataObject;
	}

	if (operation === 'getDeviceData') {
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'GET',
			url: `${baseUrl}/device`,
			json: true,
		});

		return response as IDataObject;
	}

	if (operation === 'getQRCodeBytes') {
		const instanceId = this.getNodeParameter('instanceId', itemIndex) as string;
		const instanceToken = this.getNodeParameter('instanceToken', itemIndex) as string;

		if (!instanceId || !instanceToken) {
			throw new NodeOperationError(this.getNode(), 'Instance ID and Token are required.', {
				itemIndex,
			});
		}

		const qrResponse = (await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'GET',
			url: `${baseUrl}/qr-code`,
			json: true,
		})) as QrCodeResponse;

		if (qrResponse.connected === true) {
			return [
				{
					json: {
						qrCode: null,
						status: 'CONNECTED',
					},
				},
			];
		}

		const qrCode = qrResponse.qrCode;

		if (!qrCode) {
			throw new NodeOperationError(
				this.getNode(),
				`Could not retrieve the QR Code (response: ${JSON.stringify(qrResponse)})`,
				{ itemIndex },
			);
		}

		return [
			{
				json: {
					qrCode,
					status: 'QRCODE',
				},
			},
		];
	}

	if (operation === 'getQRCodeImage') {
		const instanceId = this.getNodeParameter('instanceId', itemIndex) as string;
		const instanceToken = this.getNodeParameter('instanceToken', itemIndex) as string;

		if (!instanceId || !instanceToken) {
			throw new NodeOperationError(this.getNode(), 'Instance ID and Token are required.', {
				itemIndex,
			});
		}

		const qrBinary = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'GET',
			url: `${baseUrl}/qr-code/image`,
			encoding: 'arraybuffer',
		});

		let qrCodeBase64: string;

		try {
			qrCodeBase64 = toBuffer(qrBinary).toString('base64');
		} catch (error: unknown) {
			throw new NodeOperationError(
				this.getNode(),
				`Could not convert QR Code image to base64: ${getErrorMessage(error)}`,
				{ itemIndex },
			);
		}

		return [
			{
				json: {
					qrCodeImage: `data:image/png;base64,${qrCodeBase64}`,
				},
			},
		];
	}

	if (operation === 'getPhoneCode') {
		const phoneNumber = this.getNodeParameter('phoneNumber', itemIndex) as string;

		if (!phoneNumber) {
			throw new NodeOperationError(this.getNode(), 'Phone number is required.', { itemIndex });
		}

		const phoneCodeResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'GET',
			url: `${baseUrl}/phone-code/${phoneNumber}`,
			json: true,
		});

		return [
			{
				json: phoneCodeResponse as IDataObject,
			},
		];
	}

	throw new NodeOperationError(
		this.getNode(),
		`Unsupported operation for the "instance" resource: ${operation}`,
		{ itemIndex },
	);
}
