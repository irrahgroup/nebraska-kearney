import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const messagesProperties: INodeProperties[] = [
	{
		displayName: 'Phone Number',
		name: 'phone',
		type: 'string',
		default: '',
		required: true,
		placeholder: '5511999999999',
		description:
			'Contact number (or group ID) in international format, digits only. Example: 5511999999999.',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: [
					'sendText',
					'deleteMessage',
					'readMessage',
					'replyMessage',
					'sendPixButton',
					'sendButtonList',
					'sendContact',
					'sendDocument',
					'sendLink',
					'sendLocation',
					'sendImage',	
					'sendOptionList',
					'sendVideo',
					'sendSticker',
					'sendAudio',
				],
			},
		},
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: '',
		required: true,
		description: 'Message text to be sent',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendText', 'sendLink', 'replyMessage', 'sendButtonList','sendOptionList'],
			},
		},
	},
	{
		displayName: 'Link Image (linkImage)',
		name: 'linkImage',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'https://www.example.com/image.jpg',
		description: 'Image URL that will be displayed in the shared link',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendLink'],
			},
		},
	},
	{
		displayName: 'Image URL (imageUrl)',
		name: 'imageUrl',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'https://www.example.com/image.jpg',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendImage'],
			},
		},
	},
	{
		displayName: 'Website Link (linkUrl)',
		name: 'linkUrl',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'https://www.example.com',
		description: 'Website URL to be shared',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendLink'],
			},
		},
	},
	{
		displayName: 'Link Title (linkTitle)',
		name: 'linkTitle',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'Link title',
		description: 'Title that will be displayed in the shared link',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendLink'],
			},
		},
	},
	{
		displayName: 'Link Description (linkDescription)',
		name: 'linkDescription',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'Link description',
		description: 'Description that will be displayed in the shared link',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendLink'],
			},
		},
	},
	{
		displayName: 'Delay (delayMessage) in Seconds',
		name: 'delayMessage',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 15,
		},
		default: 0,
		description:
			'Delay in seconds before sending the message. Z-API recommends between 1 and 15 seconds. If 0, uses the API default behavior.',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: [
					'sendText',
					'sendLink',
					'replyMessage',
					'sendButtonList',
					'sendContact',
					'sendDocument',
					'sendImage',
					'sendLocation',
					'sendOptionList',
					'sendVideo',
					'sendSticker',
					'sendAudio',
				],
			},
		},
	},
	{
		displayName: 'File Name (fileName)',
		name: 'fileName',
		type: 'string',
		default: 'document',
		description: 'File name to be sent (with or without extension)',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendDocument'],
			},
		},
	},
	{
		displayName: 'Caption (Caption)',
		name: 'caption',
		type: 'string',
		default: '',
		description: 'Caption that will be displayed along with the sent document',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendDocument','sendVideo'],
			},
		},
	},
	{
		displayName: 'Message ID (messageId)',
		name: 'messageId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'D241XXXX732339502B68',
		description:
			'WhatsApp message ID. For messages you sent, this is the code returned in the send response; for received messages, you get this ID via webhook.',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['deleteMessage', 'readMessage', 'replyMessage'],
			},
		},
	},
	{
		displayName: 'Am I the Sender of This Message? (Owner)',
		name: 'owner',
		type: 'boolean',
		default: true,
		description:
			'Whether the message was sent by you (Z-API instance). Use false for messages received from contacts.',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['deleteMessage'],
			},
		},
	},
	{
		displayName: 'Reply Privately? (privateAnswer)',
		name: 'privateAnswer',
		type: 'boolean',
		default: false,
		description: 'Whether to send group replies privately to the original sender instead of to the group',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['replyMessage'],
			},
		},
	},
	{
		displayName: 'PIX Key (pixKey)',
		name: 'pixKey',
		type: 'string',
		default: '',
		required: true,
		description:
			'PIX key that will be sent in the button (CPF, CNPJ, phone, email, or random key)',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendPixButton'],
			},
		},
	},
	{
		displayName: 'PIX Key Type (Type)',
		name: 'pixType',
		type: 'options',
		options: [
			{
				name: 'CNPJ',
				value: 'CNPJ',
			},
			{
				name: 'CPF',
				value: 'CPF',
			},
			{
				name: 'E-Mail',
				value: 'EMAIL',
			},
			{
				name: 'Phone',
				value: 'PHONE',
			},
			{
				name: 'Random Key (EVP)',
				value: 'EVP',
			},
		],
		default: 'EVP',
		required: true,
		description:
			'PIX key type (CPF, CNPJ, PHONE, EMAIL, or EVP), exactly as required by the API',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendPixButton'],
			},
		},
	},
	{
		displayName: 'Merchant Name (merchantName)',
		name: 'merchantName',
		type: 'string',
		default: '',
		description:
			"Title that will be shown on the button. If empty, the default shown is 'Pix'.",
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendPixButton'],
			},
		},
	},
	{
		displayName: 'Buttons',
		name: 'buttons',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add button',
		default: {},
		options: [
			{
				displayName: 'Button',
				name: 'button',
				values: [
					{
						displayName: 'Label',
						name: 'label',
						type: 'string',
						default: '',
						required: true,
						description: 'Text that will be shown on the button',
					},
					{
						displayName: 'ID (Optional)',
						name: 'id',
						type: 'string',
						default: '',
						description:
							'Button identifier, useful to track which option was chosen',
					},
				],
			},
		],
		description:
			'List of buttons that will be displayed to the user as reply options',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendButtonList'],
			},
		},
	},
	{
		displayName: 'Contact Name (contactName)',
		name: 'contactName',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the contact to be shared',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendContact'],
			},
		},
	},
	{
		displayName: 'Contact Phone (contactPhone)',
		name: 'contactPhone',
		type: 'string',
		default: '',
		required: true,
		placeholder: '5511999999999',
		description:
			'Phone of the contact to be shared, in format country code + area code + number, digits only',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendContact'],
			},
		},
	},
	{
		displayName: 'Business Description (contactBusinessDescription)',
		name: 'contactBusinessDescription',
		type: 'string',
		default: '',
		description:
			'Short description about the contact (not shown on WhatsApp Web)',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendContact'],
			},
		},
	},
	{
		displayName: 'Document',
		name: 'document',
		type: 'string',
		default: '',
		required: true,
		description: 'Document to be sent (PDF, DOCX, etc.)',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendDocument'],
			},
		},
	},
	{
		displayName: 'Location',
		name: 'location',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add location data',
		typeOptions: {
			multipleValues: false,
		},
		options: [
			{
				displayName: 'Location',
				name: 'value',
				values: [
					{
						displayName: 'Latitude',
						name: 'latitude',
						type: 'number',
						default: 0,
						description: 'Latitude of the location',
					},
					{
						displayName: 'Longitude',
						name: 'longitude',
						type: 'number',
						default: 0,
						description: 'Longitude of the location',
					},
					{
						displayName: 'Title (Optional)',
						name: 'title',
						type: 'string',
						default: '',
						description:
							'Title of the location (optional)',
					},
					{
						displayName: 'Address (Optional)',
						name: 'address',
						type: 'string',
						default: '',
						description:
							'Address of the location (optional)',
					},
				],
			},
		],
		description: 'Location details to be sent as a message',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendLocation'],
			},
		},
	},
	{
		displayName: 'Option List Title (optionListTitle)',
		name: 'optionListTitle',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'Available options',
		description: 'Listing title (optionList.title)',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendOptionList'],
			},
		},
	},
	{
		displayName: 'Option List Button Label (optionListButtonLabel)',
		name: 'optionListButtonLabel',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'Open options list',
		description: 'Button text that opens the list (optionList.buttonLabel)',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendOptionList'],
			},
		},
	},
	{
		displayName: 'Option List Options (optionListOptions)',
		name: 'optionListOptions',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add option',
		default: {},
		options: [
			{
				displayName: 'Option',
				name: 'options',
				values: [
					{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						default: '',
						required: true,
						description: 'Option title (option.title)',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						required: true,
						description: 'Option description (option.description)',
					},
					{
						displayName: 'ID (Optional)',
						name: 'id',
						type: 'string',
						default: '',
						description: 'Option identifier (option.ID)',
					},
				],
			},
		],
		description: 'Options list (optionList.options)',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendOptionList'],
			},
		},
	},
	{
		displayName: 'Video (URL or Base64)',
		name: 'video',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'https://...mp4  OR  data:video/mp4;base64,...',
		description: 'Video link or Base64 (Z-API: attribute "video")',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendVideo'],
			},
		},
	},
	{
		displayName: 'View Once',
		name: 'viewOnce',
		type: 'boolean',
		default: false,
		description: 'Whether the video should be viewable only once',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendVideo'],
			},
		},
	},
	{
		displayName: 'Send Asynchronously',
		name: 'async',
		type: 'boolean',
		default: false,
		description: 'Whether Z-API should process the video send request asynchronously',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendVideo'],
			},
		},
	},
	{
		displayName: 'Reply Message ID (messageId)',
		name: 'videoMessageId',
		type: 'string',
		default: '',
		placeholder: 'D241XXXX732339502B68',
		description:
			'Optional WhatsApp message ID to reply to. Sent to Z-API as "messageId".',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendVideo'],
			},
		},
	},
	{
		displayName: 'Sticker (URL or Base64)',
		name: 'sticker',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'https://...webp  OR  data:image/png;base64,...',
		description: 'Sticker link or Base64 (Z-API: attribute "sticker")',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendSticker'],
			},
		},
	},
	{
		displayName: 'Audio (URL or Base64)',
		name: 'audio',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'https://...mp3  OR  data:audio/mp3;base64,...',
		description: 'Audio link or Base64 (Z-API: attribute "audio")',
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['sendAudio'],
			},
		},
	},
];

export async function executeMessages(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	itemIndex: number,
	operation: string,
	baseUrl: string,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'sendText') {
		const phone = this.getNodeParameter('phone', itemIndex) as string;
		const message = this.getNodeParameter('message', itemIndex) as string;
		const delayMessage = this.getNodeParameter('delayMessage', itemIndex, 0) as number;

		if (!phone) {
			throw new NodeOperationError(
				this.getNode(),
				'Phone number is required.',
				{ itemIndex },
			);
		}

		if (!message) {
			throw new NodeOperationError(this.getNode(), 'Message cannot be empty.', {
				itemIndex,
			});
		}

		const body: IDataObject = {
			phone,
			message,
		};

		if (delayMessage && delayMessage > 0) {
			body.delayMessage = delayMessage;
		}

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'POST',
			url: `${baseUrl}/send-text`,
			headers: {
				'Content-Type': 'application/json',
			},
			body,
			json: true,
		});

		return response as IDataObject;
	}

	if (operation === 'deleteMessage') {
		const phone = this.getNodeParameter('phone', itemIndex) as string;
		const messageId = this.getNodeParameter('messageId', itemIndex) as string;
		const owner = this.getNodeParameter('owner', itemIndex) as boolean;

		if (!phone) {
			throw new NodeOperationError(
				this.getNode(),
				'Phone number is required.',
				{ itemIndex },
			);
		}

		if (!messageId) {
			throw new NodeOperationError(
				this.getNode(),
				'Message ID (messageId) is required.',
				{ itemIndex },
			);
		}

		const qs: IDataObject = {
			phone,
			messageId,
			owner,
		};

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'DELETE',
			url: `${baseUrl}/messages`,
			qs,
			headers: {
				'Content-Type': 'application/json',
			},
			json: true,
		});

		if (!response || (typeof response === 'object' && Object.keys(response as object).length === 0)) {
			return {
				success: true,
				message: 'Message deleted successfully (HTTP 204 / no content).',
			};
		}

		return response as IDataObject;
	}

	if (operation === 'readMessage') {
		const phone = this.getNodeParameter('phone', itemIndex) as string;
		const messageId = this.getNodeParameter('messageId', itemIndex) as string;

		if (!phone) {
			throw new NodeOperationError(
				this.getNode(),
				'Phone number is required.',
				{ itemIndex },
			);
		}

		if (!messageId) {
			throw new NodeOperationError(
				this.getNode(),
				'Message ID (messageId) is required.',
				{ itemIndex },
			);
		}

		const body: IDataObject = {
			phone,
			messageId,
		};

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'POST',
			url: `${baseUrl}/read-message`,
			headers: {
				'Content-Type': 'application/json',
			},
			body,
			json: true,
		});

		if (!response || (typeof response === 'object' && Object.keys(response as object).length === 0)) {
			return {
				success: true,
				message: 'Message marked as read successfully (HTTP 204 / no content).',
			};
		}

		return response as IDataObject;
	}

	if (operation === 'replyMessage') {
		const phone = this.getNodeParameter('phone', itemIndex) as string;
		const message = this.getNodeParameter('message', itemIndex) as string;
		const messageId = this.getNodeParameter('messageId', itemIndex) as string;
		const delayMessage = this.getNodeParameter('delayMessage', itemIndex, 0) as number;
		const privateAnswer = this.getNodeParameter('privateAnswer', itemIndex, false) as boolean;

		if (!phone) {
			throw new NodeOperationError(
				this.getNode(),
				'Phone number is required.',
				{ itemIndex },
			);
		}

		if (!message) {
			throw new NodeOperationError(this.getNode(), 'Message cannot be empty.', {
				itemIndex,
			});
		}
		if (!messageId) {
			throw new NodeOperationError(
				this.getNode(),
				'Original message ID (messageId) is required.',
				{ itemIndex },
			);
		}

		const body: IDataObject = {
			phone,
			message,
			messageId,
		};

		if (delayMessage && delayMessage > 0) {
			body.delayMessage = delayMessage;
		}

		if (privateAnswer) {
			body.privateAnswer = privateAnswer;
		}

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'POST',
			url: `${baseUrl}/send-text`,
			headers: {
				'Content-Type': 'application/json',
			},
			body,
			json: true,
		});

		return response as IDataObject;
	}

	if (operation === 'sendPixButton') {
		const phone = this.getNodeParameter('phone', itemIndex) as string;
		const pixKey = this.getNodeParameter('pixKey', itemIndex) as string;
		const pixType = this.getNodeParameter('pixType', itemIndex) as string;
		const merchantName = this.getNodeParameter('merchantName', itemIndex, '') as string;

		if (!phone) {
			throw new NodeOperationError(
				this.getNode(),
				'Phone number is required.',
				{ itemIndex },
			);
		}

		if (!pixKey) {
			throw new NodeOperationError(
				this.getNode(),
				'PIX key (pixKey) is required.',
				{ itemIndex },
			);
		}

		if (!pixType) {
			throw new NodeOperationError(
				this.getNode(),
				'PIX key type (type) is required.',
				{ itemIndex },
			);
		}

		const body: IDataObject = {
			phone,
			pixKey,
			type: pixType,
		};

		if (merchantName && merchantName.trim().length > 0) {
			body.merchantName = merchantName;
		}

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'POST',
			url: `${baseUrl}/send-button-pix`,
			headers: {
				'Content-Type': 'application/json',
			},
			body,
			json: true,
		});

		return response as IDataObject;
	}

	if (operation === 'sendButtonList') {
		const phone = this.getNodeParameter('phone', itemIndex) as string;
		const message = this.getNodeParameter('message', itemIndex) as string;
		const delayMessage = this.getNodeParameter('delayMessage', itemIndex, 0) as number;

		if (!phone) {
			throw new NodeOperationError(
				this.getNode(),
				'Phone number is required.',
				{ itemIndex },
			);
		}

		if (!message) {
			throw new NodeOperationError(this.getNode(), 'Message cannot be empty.', {
				itemIndex,
			});
		}

		const buttonsCollection = this.getNodeParameter('buttons', itemIndex, {}) as IDataObject;
		const rawButtons = (buttonsCollection.button as IDataObject[]) || [];

		if (!rawButtons.length) {
			throw new NodeOperationError(
				this.getNode(),
				'At least one button must be provided in the list (buttons).',
				{ itemIndex },
			);
		}

		const buttons = rawButtons.map((btn) => {
			const label = btn.label as string;
			const id = (btn.id as string) || '';

			if (!label) {
				throw new NodeOperationError(
					this.getNode(),
					'Each button must have a label (button text).',
					{ itemIndex },
				);
			}

			const button: IDataObject = { label };

			if (id && id.trim().length > 0) {
				button.id = id;
			}

			return button;
		});

		const body: IDataObject = {
			phone,
			message,
			buttonList: {
				buttons,
			},
		};

		if (delayMessage && delayMessage > 0) {
			body.delayMessage = delayMessage;
		}

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'POST',
			url: `${baseUrl}/send-button-list`,
			headers: {
				'Content-Type': 'application/json',
			},
			body,
			json: true,
		});

		return response as IDataObject;
	}

	if (operation === 'sendContact') {
		const phone = this.getNodeParameter('phone', itemIndex) as string;
		const contactName = this.getNodeParameter('contactName', itemIndex) as string;
		const contactPhone = this.getNodeParameter('contactPhone', itemIndex) as string;
		const delayMessage = this.getNodeParameter('delayMessage', itemIndex, 0) as number;
		const contactBusinessDescription = this.getNodeParameter(
			'contactBusinessDescription',
			itemIndex,
			'',
		) as string;

		if (!phone) {
			throw new NodeOperationError(
				this.getNode(),
				'Recipient phone number is required.',
				{ itemIndex },
			);
		}

		if (!contactName) {
			throw new NodeOperationError(
				this.getNode(),
				'Contact name (contactName) is required.',
				{ itemIndex },
			);
		}

		if (!contactPhone) {
			throw new NodeOperationError(
				this.getNode(),
				'Contact phone (contactPhone) is required.',
				{ itemIndex },
			);
		}

		const body: IDataObject = {
			phone,
			contactName,
			contactPhone,
		};

		if (contactBusinessDescription && contactBusinessDescription.trim().length > 0) {
			body.contactBusinessDescription = contactBusinessDescription;
		}

		if (delayMessage && delayMessage > 0) {
			body.delayMessage = delayMessage;
		}

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'POST',
			url: `${baseUrl}/send-contact`,
			headers: {
				'Content-Type': 'application/json',
			},
			body,
			json: true,
		});

		return response as IDataObject;
	}

	if (operation === 'sendLink') {
		const phone = this.getNodeParameter('phone', itemIndex) as string;
		const message = this.getNodeParameter('message', itemIndex) as string;
		const linkImage = this.getNodeParameter('linkImage', itemIndex) as string;
		const linkUrl = this.getNodeParameter('linkUrl', itemIndex) as string;
		const linkTitle = this.getNodeParameter('linkTitle', itemIndex) as string;
		const linkDescription = this.getNodeParameter('linkDescription', itemIndex) as string;
		const delayMessage = this.getNodeParameter('delayMessage', itemIndex, 0) as number;

		if (!phone) {
			throw new NodeOperationError(
				this.getNode(),
				'Phone number is required.',
				{ itemIndex },
			);
		}

		if (!message) {
			throw new NodeOperationError(this.getNode(), 'Message cannot be empty.', {
				itemIndex,
			});
		}

		const body: IDataObject = {
			phone,
			message,
			linkImage,
			linkUrl,
			linkTitle,
			linkDescription,
		};

		if (delayMessage && delayMessage > 0) {
			body.delayMessage = delayMessage;
		}

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'POST',
			url: `${baseUrl}/send-link`,
			headers: {
				'Content-Type': 'application/json',
			},
			body,
			json: true,
		});

		return response as IDataObject;
	}

	if (operation === 'sendDocument') {
		const phone = this.getNodeParameter('phone', itemIndex) as string;
		const document = this.getNodeParameter('document', itemIndex) as string;
		const fileName = this.getNodeParameter('fileName', itemIndex, '') as string;
		const caption = this.getNodeParameter('caption', itemIndex, '') as string;
		const delayMessage = this.getNodeParameter('delayMessage', itemIndex, 0) as number;

		if (!phone) {
			throw new NodeOperationError(
				this.getNode(),
				'Phone number is required.',
				{ itemIndex },
			);
		}

		if (!document) {
			throw new NodeOperationError(
				this.getNode(),
				'The document to be sent is required.',
				{ itemIndex },
			);
		}

		let extension = '';

		if (fileName && fileName !== 'document' && fileName.includes('.')) {
			extension = fileName.split('.').pop()!.toLowerCase();
		}

		if (!extension && document.startsWith('http')) {
			const cleanUrl = document.split('?')[0].split('#')[0];
			const lastSegment = cleanUrl.split('/').pop() || '';

			if (lastSegment.includes('.')) {
				extension = lastSegment.split('.').pop()!.toLowerCase();
			}
		}

		if (!extension && document.startsWith('data:')) {
			const mimeMatch = document.match(/^data:([^;]+);/);
			if (mimeMatch) {
				const mime = mimeMatch[1];
				const mimeToExt: Record<string, string> = {
					'application/pdf': 'pdf',
					'application/msword': 'doc',
					'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
					'image/png': 'png',
					'image/jpeg': 'jpg',
					'image/jpg': 'jpg',
				};
				if (mimeToExt[mime]) {
					extension = mimeToExt[mime];
				}
			}
		}

		if (!extension) {
			throw new NodeOperationError(
				this.getNode(),
				'Could not determine the file extension. Provide a "fileName" with an extension (e.g., "invoice.pdf") or use a URL that ends with the extension.',
				{ itemIndex },
			);
		}

		const body: IDataObject = {
			phone,
			document,
		};

		if (fileName && fileName.trim().length > 0) {
			body.fileName = fileName;
		}

		if (caption && caption.trim().length > 0) {
			body.caption = caption;
		}

		if (delayMessage && delayMessage > 0) {
			body.delayMessage = delayMessage;
		}

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'POST',
			url: `${baseUrl}/send-document/${extension}`,
			headers: {
				'Content-Type': 'application/json',
			},
			body,
			json: true,
		});

		return response as IDataObject;
	}

	if (operation === 'sendLocation') {
		const phone = this.getNodeParameter('phone', itemIndex) as string;
		const delayMessage = this.getNodeParameter('delayMessage', itemIndex, 0) as number;

		if (!phone) {
			throw new NodeOperationError(
				this.getNode(),
				'Phone number is required.',
				{ itemIndex },
			);
		}

		const locationCollection = this.getNodeParameter('location', itemIndex, {}) as IDataObject;
		const locationValues = (locationCollection.value as IDataObject) || {};

		const latitude = locationValues.latitude as number;
		const longitude = locationValues.longitude as number;
		const title = (locationValues.title as string) || '';
		const address = (locationValues.address as string) || '';

		if (
			latitude === undefined ||
			longitude === undefined ||
			Number.isNaN(latitude) ||
			Number.isNaN(longitude)
		) {
			throw new NodeOperationError(
				this.getNode(),
				'Latitude and longitude are required and must be valid numbers.',
				{ itemIndex },
			);
		}

		const body: IDataObject = {
			phone,
			latitude: String(latitude),
			longitude: String(longitude),
		};

		if (title && title.trim().length > 0) {
			body.title = title;
		}

		if (address && address.trim().length > 0) {
			body.address = address;
		}

		if (delayMessage && delayMessage > 0) {
			body.delayMessage = delayMessage;
		}

		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'zapiApi',
			{
				method: 'POST',
				url: `${baseUrl}/send-location`,
				headers: {
					'Content-Type': 'application/json',
				},
				body,
				json: true,
			},
		);

		return response as IDataObject;
	}

	if (operation === 'sendImage') {
		const phone = this.getNodeParameter('phone', itemIndex) as string;
		const imageUrl = this.getNodeParameter('imageUrl', itemIndex) as string;
		const delayMessage = this.getNodeParameter('delayMessage', itemIndex, 0) as number;
		if (!phone) {
			throw new NodeOperationError(
				this.getNode(),
				'Phone number is required.',
				{ itemIndex },
			);
		}
		if (!imageUrl) {
			throw new NodeOperationError(
				this.getNode(),
				'Image URL is required.',
				{ itemIndex },
			);
		}
		const body: IDataObject = {
			phone,
			image: imageUrl,
		};
		if (delayMessage && delayMessage > 0) {
			body.delayMessage = delayMessage;
		}
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'POST',
			url: `${baseUrl}/send-image`,
			headers: {
				'Content-Type': 'application/json',
			},
			body,
			json: true,
		});
		return response as IDataObject;
	}

	if (operation === 'sendOptionList') {
	const phone = this.getNodeParameter('phone', itemIndex) as string;
	const message = this.getNodeParameter('message', itemIndex) as string;
	const delayMessage = this.getNodeParameter('delayMessage', itemIndex, 0) as number;

	const optionListTitle = this.getNodeParameter('optionListTitle', itemIndex) as string;
	const optionListButtonLabel = this.getNodeParameter('optionListButtonLabel', itemIndex) as string;

	if (!phone) {
		throw new NodeOperationError(this.getNode(), 'Phone number is required.', { itemIndex });
	}

	if (!message) {
		throw new NodeOperationError(this.getNode(), 'Message cannot be empty.', { itemIndex });
	}

	if (!optionListTitle) {
		throw new NodeOperationError(this.getNode(), 'Option list title (optionListTitle) is required.', {
			itemIndex,
		});
	}

	if (!optionListButtonLabel) {
		throw new NodeOperationError(
			this.getNode(),
			'Option list button label (optionListButtonLabel) is required.',
			{ itemIndex },
		);
	}

	const optionListCollection = this.getNodeParameter('optionListOptions', itemIndex, {}) as IDataObject;
	const rawOptions = (optionListCollection.options as IDataObject[]) || [];

	if (!rawOptions.length) {
		throw new NodeOperationError(
			this.getNode(),
			'At least one option must be provided in the list (optionListOptions).',
			{ itemIndex },
		);
	}

	const options = rawOptions.map((opt) => {
		const title = opt.title as string;
		const description = opt.description as string;
		const id = (opt.id as string) || '';

		if (!title) {
			throw new NodeOperationError(this.getNode(), 'Each option must have a title.', { itemIndex });
		}

		if (!description) {
			throw new NodeOperationError(this.getNode(), 'Each option must have a description.', {
				itemIndex,
			});
		}

		const option: IDataObject = { title, description };

		if (id && id.trim().length > 0) {
			option.id = id;
		}

		return option;
	});

	const body: IDataObject = {
		phone,
		message,
		optionList: {
			title: optionListTitle,
			buttonLabel: optionListButtonLabel,
			options,
		},
	};

	if (delayMessage && delayMessage > 0) {
		body.delayMessage = delayMessage;
	}

	const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
		method: 'POST',
		url: `${baseUrl}/send-option-list`,
		headers: {
			'Content-Type': 'application/json',
		},
		body,
		json: true,
	});

	return response as IDataObject;
}

if (operation === 'sendVideo') {
	const phone = this.getNodeParameter('phone', itemIndex) as string;
	const videoParam = this.getNodeParameter('video', itemIndex) as string;

	const caption = this.getNodeParameter('caption', itemIndex, '') as string;
	const viewOnce = this.getNodeParameter('viewOnce', itemIndex, false) as boolean;
	const async = this.getNodeParameter('async', itemIndex, false) as boolean;
	const videoMessageId = this.getNodeParameter('videoMessageId', itemIndex, '') as string;
	const delayMessage = this.getNodeParameter('delayMessage', itemIndex, 0) as number;

	if (!phone) {
		throw new NodeOperationError(this.getNode(), 'Phone number is required.', { itemIndex });
	}

	if (!videoParam) {
		throw new NodeOperationError(this.getNode(), 'Video is required (URL or Base64).', { itemIndex });
	}

	let video = videoParam.trim();

	video = video.replace(/\s+/g, '');

	const isUrl = /^https?:\/\//i.test(video);
	const isDataUri = /^data:video\/[a-zA-Z0-9.+-]+;base64,/i.test(video);

	if (!isUrl && !isDataUri) {
		video = `data:video/mp4;base64,${video}`;
	}

	const body: IDataObject = {
		phone,
		video,
	};

	if (caption && caption.length > 0) body.caption = caption;
	if (typeof viewOnce === 'boolean') body.viewOnce = viewOnce;
	if (typeof async === 'boolean') body.async = async;
	if (videoMessageId && videoMessageId.length > 0) body.messageId = videoMessageId;

	if (delayMessage && delayMessage > 0) {
		body.delayMessage = delayMessage;
	}

	const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
		method: 'POST',
		url: `${baseUrl}/send-video`,
		headers: {
			'Content-Type': 'application/json',
		},
		body,
		json: true,
	});

	return response as IDataObject;
}

if (operation === 'sendSticker') {
	const phone = this.getNodeParameter('phone', itemIndex) as string;
	const stickerParam = this.getNodeParameter('sticker', itemIndex) as string;
	const delayMessage = this.getNodeParameter('delayMessage', itemIndex, 0) as number;

	if (!phone) {
		throw new NodeOperationError(this.getNode(), 'Phone number is required.', { itemIndex });
	}
	if (!stickerParam) {
		throw new NodeOperationError(this.getNode(), 'Sticker is required (URL or Base64).', {
			itemIndex,
		});
	}

	let sticker = stickerParam.trim();

	sticker = sticker.replace(/\s+/g, '');

	const isUrl = /^https?:\/\//i.test(sticker);
	const isDataUri = /^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(sticker);

	if (!isUrl && !isDataUri) {
		sticker = `data:image/webp;base64,${sticker}`;
	}

	const body: IDataObject = {
		phone,
		sticker,
	};

	if (delayMessage && delayMessage > 0) {
		body.delayMessage = delayMessage;
	}

	const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
		method: 'POST',
		url: `${baseUrl}/send-sticker`,
		headers: {
			'Content-Type': 'application/json',
		},
		body,
		json: true,
	});

	return response as IDataObject;
}

if (operation === 'sendAudio') {
	const phone = this.getNodeParameter('phone', itemIndex) as string;
	const audioParam = this.getNodeParameter('audio', itemIndex) as string;
	const delayMessage = this.getNodeParameter('delayMessage', itemIndex, 0) as number;
	if (!phone) {
		throw new NodeOperationError(this.getNode(), 'Phone number is required.', { itemIndex });
	}
	if (!audioParam) {
		throw new NodeOperationError(this.getNode(), 'Audio is required (URL or Base64).', {
			itemIndex,
		});
	}
	let audio = audioParam.trim();

	audio = audio.replace(/\s+/g, '');
	const isUrl = /^https?:\/\//i.test(audio);
	const isDataUri = /^data:audio\/[a-zA-Z0-9.+-]+;base64,/i.test(audio);
	if (!isUrl && !isDataUri) {
		audio = `data:audio/mp3;base64,${audio}`;
	}
	const body: IDataObject = {
		phone,
		audio,
	};
	if (delayMessage && delayMessage > 0) {
		body.delayMessage = delayMessage;
	}
	const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
		method: 'POST',
		url: `${baseUrl}/send-audio`,
		headers: {
			'Content-Type': 'application/json',
		},
		body,
		json: true,
	});
	return response as IDataObject;
}

	throw new NodeOperationError(
		this.getNode(),
		`Unsupported operation for "messages" resource: ${operation}`,
		{ itemIndex },
	);
}
