import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { messagesProperties, executeMessages } from './resources/Messages.resource';
import { groupsProperties, executeGroups } from './resources/Groups.resource';
import { chatsProperties, executeChats } from './resources/Chats.resource';
import { contactsProperties, executeContacts } from './resources/Contacts.resource';
import { productsProperties, executeProducts } from './resources/Products.resource';
import { queueProperties, executeQueue } from './resources/Queue.resource';
import { instanceProperties, executeInstance } from './resources/Instance.resource';
import { statusProperties, executeStatus } from './resources/Status.resource';
import { apiProperties, executeApi } from './resources/Api.resource';

type ZapiResource =
	| 'messages'
	| 'groups'
	| 'chats'
	| 'contacts'
	| 'products'
	| 'queue'
	| 'instance'
	| 'status'
	| 'api';

export class Zapi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Z-API WhatsApp',
		name: 'zapi',
		icon: 'file:../../icons/zapi.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		description:
			'Integration with Z-API (WhatsApp) organized by resources (messages, groups, chats, contacts, products, queue, instance, status, etc.).',
		defaults: {
			name: 'Z-API WhatsApp',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'zapiApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
					name: 'API',
					value: 'api',
					description: 'Generic API call to any Z-API endpoint using this instance credentials',
					},
					{
						name: 'Chat',
						value: 'chats',
						description: 'Manage chat actions (archive, delete, list, pin, etc.) via Z-API',
					},
					{
						name: 'Contact',
						value: 'contacts',
						description: 'Look up contact information via Z-API',
					},
					{
						name: 'Group',
						value: 'groups',
						description: 'Manage groups and participants via Z-API',
					},
					{
						name: 'Instance',
						value: 'instance',
						description: 'Manage instance actions (status, disconnect, device, etc.) via Z-API',
					},
					{
						name: 'Message',
						value: 'messages',
						description: 'Send and manage messages via Z-API',
					},
					{
						name: 'Message Queue',
						value: 'queue',
						description: 'Manage messages in the Z-API send queue',
					},
					{
						name: 'Product',
						value: 'products',
						description: 'Manage WhatsApp Business catalog products via Z-API',
					},
					{
						name: 'Status',
						value: 'status',
						description: 'Post text and images to WhatsApp Status via Z-API',
					},
				],
				default: 'messages',
				description: 'Choose which Z-API resource you want to use',
			},
			{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: { resource: ['api'] },
			},
			options: [
				{
				name: 'Make API Call',
				value: 'makeApiCall',
				action: 'Make an API call',
				description: 'Generic request to any Z-API endpoint (escape hatch)',
				},
			],
			default: 'makeApiCall',
			description: 'Generic API operation',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['messages'],
					},
				},
				options: [
					{ name: 'Delete Message', value: 'deleteMessage', action: 'Delete message' },
					{ name: 'Read a Message', value: 'readMessage', action: 'Read a message' },
					{ name: 'Reply a Message', value: 'replyMessage', action: 'Reply to a message' },
					{ name: 'Send a Button List', value: 'sendButtonList', action: 'Send a button list' },
					{ name: 'Send a Contact', value: 'sendContact', action: 'Send a contact' },
					{ name: 'Send a Document', value: 'sendDocument', action: 'Send a document' },
					{ name: 'Send a Link', value: 'sendLink', action: 'Send a link' },
					{ name: 'Send a Location', value: 'sendLocation', action: 'Send a location' },
					{ name: 'Send an Image', value: 'sendImage', action: 'Send an image' },
					{ name: 'Send Audio', value: 'sendAudio', action: 'Send an audio' },
					{ name: 'Send Option List', value: 'sendOptionList', action: 'Send an option list' },
					{ name: 'Send PIX Button', value: 'sendPixButton', action: 'Send a PIX button' },
					{ name: 'Send Sticker', value: 'sendSticker', action: 'Send a sticker' },
					{ name: 'Send Text Message', value: 'sendText', action: 'Send text message' },
					{ name: 'Send Video', value: 'sendVideo', action: 'Send a video' },
				],
				default: 'sendText',
				description: 'Specific action for the Messages resource',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['groups'] },
				},
				options: [
					{ name: 'Add Admin', value: 'addAdmin', action: 'Promote to admin' },
					{ name: 'Add Participant', value: 'addParticipant', action: 'Add participant' },
					{ name: 'Create Group', value: 'createGroup', action: 'Create group' },
					{ name: 'Group Invitation Metadata', value: 'groupInvitationMetadata', action: 'Get invitation metadata' },
					{ name: 'Group Metadata', value: 'groupMetadata', action: 'Get group metadata' },
					{ name: 'Leave Group', value: 'leave-group', action: 'Leave group' },
					{ name: 'Remove Admin', value: 'removeAdmin', action: 'Demote admin' },
					{ name: 'Remove Participant', value: 'removeParticipant', action: 'Remove participant' },
					{ name: 'Send Group Invite Link', value: 'sendGroupInvite', action: 'Send invite link' },
					{ name: 'Update Group Description', value: 'updateGroupDescription', action: 'Update description' },
					{ name: 'Update Group Name', value: 'updateGroupName', action: 'Update name' },
					{ name: 'Update Group Photo', value: 'updateGroupPhoto', action: 'Update photo' },
					{ name: 'Update Group Settings', value: 'updateGroupSettings', action: 'Update settings' },
				],
				default: 'createGroup',
				description: 'Specific action for the Groups resource',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['chats'] },
				},
				options: [
					{ name: 'Archive Chat', value: 'archiveChat', action: 'Archive chat' },
					{ name: 'Delete Chat', value: 'deleteChat', action: 'Delete chat' },
					{ name: 'List Chats', value: 'listChats', action: 'List chats' },
					{ name: 'Pin Chat', value: 'pinChat', action: 'Pin chat' },
				],
				default: 'archiveChat',
				description: 'Specific action for the Chats resource',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['contacts'] },
				},
				options: [
					{ name: 'Check if Number Has WhatsApp', value: 'phoneExists', action: 'Check phone exists' },
					{ name: 'Get Contact Metadata', value: 'getContactMetadata', action: 'Get contact metadata' },
					{ name: 'Get Contact Profile Picture', value: 'getContactProfilePicture', action: 'Get profile picture' },
					{ name: 'List Contacts', value: 'listContacts', action: 'List contacts' },
				],
				default: 'phoneExists',
				description: 'Specific action for the Contacts resource',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['products'] },
				},
				options: [
					{ name: 'Create/Update Product', value: 'upsertProduct', action: 'Upsert product' },
					{ name: 'Delete Product', value: 'deleteProduct', action: 'Delete product' },
					{ name: 'Get a Product', value: 'getProduct', action: 'Get product' },
					{ name: 'Get Products by Phone', value: 'getProductByPhone', action: 'Get products by phone' },
					{ name: 'List Products', value: 'listProducts', action: 'List products' },
				],
				default: 'upsertProduct',
				description: 'Specific action for the Products resource',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['queue'] },
				},
				options: [
					{ name: 'Delete Queue Message', value: 'deleteQueueMessage', action: 'Delete queue message' },
					{ name: 'Get Queue Messages', value: 'getQueueMessages', action: 'Get queue messages' },
				],
				default: 'deleteQueueMessage',
				description: 'Specific action for the Message Queue resource',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['status'] },
				},
				options: [
					{ name: 'Post a Status Image', value: 'postStatusImage', action: 'Post image to status' },
					{ name: 'Post a Status Text', value: 'postStatusText', action: 'Post text to status' },
				],
				default: 'postStatusImage',
				description: 'Specific action for the Status resource',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: { resource: ['instance'] },
				},
				options: [
					{ name: 'Disconnect Phone', value: 'disconnectInstance', action: 'Disconnect phone' },
					{ name: 'Get Device Data', value: 'getDeviceData', action: 'Get device data' },
					{ name: 'Get QRCode (Bytes)', value: 'getQRCodeBytes', action: 'Get qr code bytes' },
					{ name: 'Get QRCode Image', value: 'getQRCodeImage', action: 'Get qr code image' },
					{ name: 'Get QRCode Phone', value: 'getPhoneCode', action: 'Get phone code' },
				],
				default: 'getDeviceData',
				description: 'Specific action for the Instance resource',
			},
			...messagesProperties,
			...groupsProperties,
			...chatsProperties,
			...contactsProperties,
			...productsProperties,
			...queueProperties,
			...instanceProperties,
			...statusProperties,
			...apiProperties,
		],
		usableAsTool: true,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('zapiApi');

		const instanceId = credentials.instanceId as string;
		const instanceToken = credentials.instanceToken as string;

		if (!instanceId || !instanceToken) {
			throw new NodeOperationError(
				this.getNode(),
				'Invalid Z-API credentials: instanceId or instanceToken not set.',
			);
		}

		const baseUrl = `https://api.z-api.io/instances/${instanceId}/token/${instanceToken}`;
		const toExecutionData = (
			entry: IDataObject | INodeExecutionData,
			itemIndex: number,
		): INodeExecutionData => {
			if ('json' in entry) {
				const executionItem = entry as INodeExecutionData;
				return {
					...executionItem,
					pairedItem: executionItem.pairedItem ?? { item: itemIndex },
				};
			}

			return {
				json: entry,
				pairedItem: { item: itemIndex },
			};
		};

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as ZapiResource;
				const operation = this.getNodeParameter('operation', i) as string;

				let result: IDataObject | IDataObject[] | INodeExecutionData | INodeExecutionData[] | undefined;

				if (resource === 'messages') {
					result = await executeMessages.call(this, items, i, operation, baseUrl);
				} else if (resource === 'groups') {
					result = await executeGroups.call(this, items, i, operation, baseUrl);
				} else if (resource === 'chats') {
					result = await executeChats.call(this, items, i, operation, baseUrl);
				} else if (resource === 'contacts') {
					result = await executeContacts.call(this, items, i, operation, baseUrl);
				} else if (resource === 'products') {
					result = await executeProducts.call(this, items, i, operation, baseUrl);
				} else if (resource === 'queue') {
					result = await executeQueue.call(this, items, i, operation, baseUrl);
				} else if (resource === 'instance') {
					result = await executeInstance.call(this, items, i, operation, baseUrl);
				} else if (resource === 'status') {
					result = await executeStatus.call(this, items, i, operation, baseUrl);
				} else if (resource === 'api') {
					result = await executeApi.call(this, items, i, operation, baseUrl);
				} else {
					throw new NodeOperationError(this.getNode(), `Unsupported resource: ${resource}`, {
						itemIndex: i,
					});
				}

				if (Array.isArray(result)) {
					for (const entry of result) returnData.push(toExecutionData(entry, i));
				} else if (result) {
					returnData.push(toExecutionData(result, i));
				}
			} catch (error) {
				const executionError =
					error instanceof NodeOperationError
						? error
						: new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });

				if (this.continueOnFail()) {
					returnData.push({
						json: { error: executionError.message, itemIndex: i },
						pairedItem: { item: i },
					});
					continue;
				}
				throw executionError;
			}
		}

		return [returnData];
	}
}
