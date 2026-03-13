import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const instanceProperties: INodeProperties[] = [
	{
		displayName: 'Confirmação',
		name: 'confirmDisconnect',
		type: 'boolean',
		default: false,
		required: true,
		description: 'Whether Marque esta opção para confirmar que deseja desconectar o telefone desta instância Z-API',
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
		description: 'ID da instância Z-API',
		displayOptions: {
			show: {
				resource: ['instance'],
				operation: ['getQRCodeBytes', 'getQRCodeImage','getPhoneCode'],
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
		description: 'Token da instância Z-API',
		displayOptions: {
			show: {
				resource: ['instance'],
				operation: ['getQRCodeBytes', 'getQRCodeImage','getPhoneCode'],
			},
		},
	},
	{
	displayName: 'Phone Number',
	name: 'phoneNumber',
	type: 'string',
	default: '',
	required: true,
	description: 'Número de telefone com DDI e DDD (ex: 5511999999999)',
	displayOptions: {
			show: {
				resource: ['instance'],
				operation: ['getQRCodeBytes', 'getQRCodeImage','getPhoneCode'],
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
				'É necessário marcar a confirmação para desconectar o telefone da instância.',
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

	// Operação: obter QR Code da instância
	if (operation === 'getQRCodeBytes') {
		const instanceId = this.getNodeParameter('instanceId', itemIndex) as string;
		const instanceToken = this.getNodeParameter('instanceToken', itemIndex) as string;

		if (!instanceId || !instanceToken) {
			throw new NodeOperationError(
				this.getNode(),
				'Instance ID e Token são obrigatórios.',
				{ itemIndex }
			);
		}

		// Buscar QR Code
		const qrResponse = (await this.helpers.httpRequestWithAuthentication.call(
			this,
			'zapiApi',
			{
				method: 'GET',
				url: `${baseUrl}/qr-code`,
				json: true,
			}
		)) as IDataObject;

		// CASO A INSTÂNCIA JÁ ESTEJA CONECTADA
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

		// CASO O QR ESTEJA DISPONÍVEL
		const qrCode = qrResponse.qrCode as string | undefined;

		if (!qrCode) {
			throw new NodeOperationError(
				this.getNode(),
				`Não foi possível obter o QR Code (resposta: ${JSON.stringify(qrResponse)})`,
				{ itemIndex }
			);
		}

		return [
			{
				json: {
					qrCode, // base64
					status: 'QRCODE',
				},
			},
		];
	}

	// Operação: obter QR Code da instância (imagem)
	if (operation === 'getQRCodeImage') {

		// Buscar QR Code como imagem
		const qrResponse = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'zapiApi',
			{
				method: 'GET',
				url: `${baseUrl}/qr-code/image`,
				encoding: 'arraybuffer',
			}
		);

		// Converter imagem para base64
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

	// Operação: obter phone code / validar número
	if (operation === 'getPhoneCode') {
		const phoneNumber = this.getNodeParameter('phoneNumber', itemIndex) as string;

		if (!phoneNumber) {
			throw new NodeOperationError(
				this.getNode(),
				'É necessário informar o número de telefone.',
				{ itemIndex }
			);
		}

		// Buscar phone code
		const phoneCodeResponse = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'zapiApi',
			{
				method: 'GET',
				url: `${baseUrl}/phone-code/${phoneNumber}`,
				json: true,
			}
		);

		return [
			{
				json: phoneCodeResponse,
			},
		];
	}


	throw new NodeOperationError(
		this.getNode(),
		`Operação não suportada para o recurso "instance": ${operation}`,
		{ itemIndex },
	);
}
