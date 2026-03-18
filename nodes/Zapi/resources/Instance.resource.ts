import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const instanceProperties: INodeProperties[] = [
	{
		displayName: 'Confirmation',
		name: 'confirmDisconnect',
		type: 'boolean',
		default: false,
		required: true,
		description:
			'Whether to confirm that you want to disconnect the phone from this Z-API instance',
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
				operation: ['getQRCodeBytes', 'getQRCodeImage', 'getPhoneCode'],
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
				operation: ['getQRCodeBytes', 'getQRCodeImage', 'getPhoneCode'],
			},
		},
	},
	{
		displayName: 'Phone Number',
		name: 'phoneNumber',
		type: 'string',
		default: '',
		required: true,
		description: 'Phone number with country code (example: 5511999999999)',
		displayOptions: {
			show: {
				resource: ['instance'],
				operation: ['getQRCodeBytes', 'getQRCodeImage', 'getPhoneCode'],
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
		const confirmDisconnect = this.getNodeParameter(
			'confirmDisconnect',
			itemIndex,
		) as boolean;

		if (!confirmDisconnect) {
			throw new NodeOperationError(
				this.getNode(),
				'You must confirm disconnection before disconnecting the instance phone.',
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
			throw new NodeOperationError(
				this.getNode(),
				'Instance ID and instance token are required.',
				{ itemIndex },
			);
		}
		const qrResponse = (await this.helpers.httpRequestWithAuthentication.call(
			this,
			'zapiApi',
			{
				method: 'GET',
				url: `${baseUrl}/qr-code`,
				json: true,
			},
		)) as IDataObject;
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
		const qrCode = qrResponse.qrCode as string | undefined;

		if (!qrCode) {
			throw new NodeOperationError(
				this.getNode(),
				`Could not fetch QR code (response: ${JSON.stringify(qrResponse)})`,
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
		const qrResponse = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'zapiApi',
			{
				method: 'GET',
				url: `${baseUrl}/qr-code/image`,
				encoding: 'arraybuffer',
			},
		);
		let qrCodeBuffer: Buffer;
		if (typeof qrResponse === 'string') {
			qrCodeBuffer = Buffer.from(qrResponse);
		} else if (qrResponse instanceof Uint8Array) {
			qrCodeBuffer = Buffer.from(qrResponse);
		} else {
			qrCodeBuffer = Buffer.from(qrResponse as ArrayBufferLike);
		}
		const qrCodeBase64 = qrCodeBuffer.toString('base64');

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
			throw new NodeOperationError(
				this.getNode(),
				'Phone number is required.',
				{ itemIndex },
			);
		}
		const phoneCodeResponse = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'zapiApi',
			{
				method: 'GET',
				url: `${baseUrl}/phone-code/${phoneNumber}`,
				json: true,
			},
		);

		return [
			{
				json: phoneCodeResponse,
			},
		];
	}
	throw new NodeOperationError(
		this.getNode(),
		`Operation not supported for the "instance" resource: ${operation}`,
		{ itemIndex },
	);
}
