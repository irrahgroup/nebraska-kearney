import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

interface InvitationResponse {
	invitationLink?: string;
	inviteLink?: string;
	link?: string;
	response?: {
		invite_link?: string;
		inviteLink?: string;
	};
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

export const groupsProperties: INodeProperties[] = [
	{
		displayName: 'Group Name',
		name: 'groupName',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'WhatsApp group name',
		description: 'Name of the group that will be created in Z-API',
		displayOptions: {
			show: {
				resource: ['groups'],
				operation: ['createGroup', 'updateGroupName'],
			},
		},
	},

	{
		displayName: 'Group Description',
		name: 'groupDescription',
		type: 'string',
		default: '',
		placeholder: 'Enter the group description',
		description: 'Group description to be updated',
		displayOptions: {
			show: {
				resource: ['groups'],
				operation: ['createGroup', 'updateGroupDescription'],
			},
		},
	},

	{
		displayName: 'Group Photo',
		name: 'groupPhoto',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'Group photo URL or base64',
		description: 'New group photo',
		displayOptions: {
			show: {
				resource: ['groups'],
				operation: ['updateGroupPhoto'],
			},
		},
	},

	{
		displayName: 'Group ID (groupId)',
		name: 'groupId',
		type: 'string',
		default: '',
		required: true,
		placeholder: '120363019502650977-group',
		description:
			'Group ID (Group ID/phone). Example: 120363019502650977-group. Use the group metadata/list groups API to get this value.',
		displayOptions: {
			show: {
				resource: ['groups'],
				operation: [
					'addParticipant',
					'addAdmin',
					'leave-group',
					'removeParticipant',
					'updateGroupDescription',
					'updateGroupPhoto',
					'removeAdmin',
					'updateGroupName',
					'updateGroupSettings',
					'groupMetadata',
					'sendGroupInvite',
				],
			},
		},
	},

	{
		displayName: 'Group Invite Link',
		name: 'groupInviteLink',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'https://chat.whatsapp.com/AbCdEfGhIjKlMnOpQrStUv',
		description: 'WhatsApp group invite link',
		displayOptions: {
			show: {
				resource: ['groups'],
				operation: ['groupInvitationMetadata'],
			},
		},
	},

	{
		displayName: 'Auto Invite',
		name: 'autoInvite',
		type: 'boolean',
		default: true,
		description:
			'Whether to send a private invite to participants who cannot be added directly to the group',
		displayOptions: {
			show: {
				resource: ['groups'],
				operation: ['createGroup', 'addParticipant'],
			},
		},
	},

	{
		displayName: 'Participants',
		name: 'participants',
		type: 'fixedCollection',
		placeholder: 'Add participant',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		options: [
			{
				displayName: 'Phone Numbers',
				name: 'phones',
				values: [
					{
						displayName: 'Phone',
						name: 'phone',
						type: 'string',
						default: '',
						placeholder: '5544999999999',
						description:
							'Participant phone number in international format (digits only). Example: 5544999999999.',
						required: true,
					},
				],
			},
		],
		description:
			'List of participant numbers. Each phone must be in international format (digits only).',
		displayOptions: {
			show: {
				resource: ['groups'],
				operation: [
					'createGroup',
					'addParticipant',
					'addAdmin',
					'removeParticipant',
					'removeAdmin',
					'sendGroupInvite',
				],
			},
		},
	},

	{
		displayName: 'Admin Only Message',
		name: 'adminOnlyMessage',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['groups'],
				operation: ['updateGroupSettings'],
			},
		},
	},
	{
		displayName: 'Admin Only Settings',
		name: 'adminOnlySettings',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['groups'],
				operation: ['updateGroupSettings'],
			},
		},
	},
	{
		displayName: 'Require Admin Approval',
		name: 'requireAdminApproval',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['groups'],
				operation: ['updateGroupSettings'],
			},
		},
	},
	{
		displayName: 'Admin Only Add Member',
		name: 'adminOnlyAddMember',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['groups'],
				operation: ['updateGroupSettings'],
			},
		},
	},
];

export async function executeGroups(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	itemIndex: number,
	operation: string,
	baseUrl: string,
): Promise<IDataObject | IDataObject[]> {
	const participants = this.getNodeParameter('participants', itemIndex, {}) as {
		phones?: Array<{ phone?: string }>;
	};

	const phones: string[] =
		participants.phones?.map((entry) => (entry.phone || '').trim()).filter(Boolean) || [];

	const operationsRequirePhones = ['createGroup', 'addParticipant', 'addAdmin', 'removeParticipant'];
	if (!phones.length && operationsRequirePhones.includes(operation)) {
		throw new NodeOperationError(
			this.getNode(),
			'You must provide at least one phone number in "Participants".',
			{ itemIndex },
		);
	}

	if (operation === 'addParticipant') {
		const groupId = this.getNodeParameter('groupId', itemIndex) as string;
		if (!groupId) {
			throw new NodeOperationError(this.getNode(), 'Group ID is required.', { itemIndex });
		}

		const autoInvite = this.getNodeParameter('autoInvite', itemIndex, true) as boolean;

		const body: IDataObject = { groupId, phones, autoInvite };

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'POST',
			url: `${baseUrl}/add-participant`,
			headers: { 'Content-Type': 'application/json' },
			body,
			json: true,
		});

		return response as IDataObject;
	}

	if (operation === 'createGroup') {
		const groupDescription = this.getNodeParameter('groupDescription', itemIndex) as string;
		const groupName = this.getNodeParameter('groupName', itemIndex) as string;
		const autoInvite = this.getNodeParameter('autoInvite', itemIndex, true) as boolean;

		const body: IDataObject = { groupName, phones, autoInvite, description: groupDescription };

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'POST',
			url: `${baseUrl}/create-group`,
			headers: { 'Content-Type': 'application/json' },
			body,
			json: true,
		});

		return response as IDataObject;
	}

	if (operation === 'addAdmin') {
		const groupId = this.getNodeParameter('groupId', itemIndex) as string;

		if (!groupId) {
			throw new NodeOperationError(this.getNode(), 'Group ID is required.', { itemIndex });
		}

		const body: IDataObject = { groupId, phones };

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'POST',
			url: `${baseUrl}/add-admin`,
			headers: { 'Content-Type': 'application/json' },
			body,
			json: true,
		});

		return response as IDataObject;
	}

	if (operation === 'leave-group') {
		const groupId = this.getNodeParameter('groupId', itemIndex) as string;

		if (!groupId) {
			throw new NodeOperationError(this.getNode(), 'Group ID is required.', { itemIndex });
		}

		const body: IDataObject = { groupId };

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'POST',
			url: `${baseUrl}/leave-group`,
			headers: { 'Content-Type': 'application/json' },
			body,
			json: true,
		});

		return response as IDataObject;
	}

	if (operation === 'removeParticipant') {
		const groupId = this.getNodeParameter('groupId', itemIndex) as string;

		if (!groupId) {
			throw new NodeOperationError(this.getNode(), 'Group ID is required.', { itemIndex });
		}

		if (!phones.length) {
			throw new NodeOperationError(
				this.getNode(),
				'You must provide at least one phone number in "Participants".',
				{ itemIndex },
			);
		}

		const body: IDataObject = { groupId, phones };

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'POST',
			url: `${baseUrl}/remove-participant`,
			headers: { 'Content-Type': 'application/json' },
			body,
			json: true,
		});

		return response as IDataObject;
	}

	if (operation === 'removeAdmin') {
		const groupId = this.getNodeParameter('groupId', itemIndex) as string;

		if (!groupId) {
			throw new NodeOperationError(this.getNode(), 'Group ID is required.', { itemIndex });
		}

		if (!phones.length) {
			throw new NodeOperationError(
				this.getNode(),
				'You must provide at least one phone number in "Participants".',
				{ itemIndex },
			);
		}

		const body: IDataObject = { groupId, phones };

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'POST',
			url: `${baseUrl}/remove-admin`,
			headers: { 'Content-Type': 'application/json' },
			body,
			json: true,
		});

		return response as IDataObject;
	}

	if (operation === 'updateGroupDescription') {
		const groupId = this.getNodeParameter('groupId', itemIndex) as string;
		const groupDescription = this.getNodeParameter('groupDescription', itemIndex) as string;

		if (!groupId) {
			throw new NodeOperationError(this.getNode(), 'Group ID is required.', { itemIndex });
		}

		if (!groupDescription) {
			throw new NodeOperationError(this.getNode(), 'Group description is required.', {
				itemIndex,
			});
		}

		const body: IDataObject = {
			groupId,
			groupDescription,
		};

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'POST',
			url: `${baseUrl}/update-group-description`,
			headers: { 'Content-Type': 'application/json' },
			body,
			json: true,
		});

		return response as IDataObject;
	}

	if (operation === 'updateGroupPhoto') {
		const groupId = this.getNodeParameter('groupId', itemIndex) as string;
		const groupPhoto = this.getNodeParameter('groupPhoto', itemIndex) as string;

		if (!groupId) {
			throw new NodeOperationError(this.getNode(), 'Group ID is required.', { itemIndex });
		}

		if (!groupPhoto) {
			throw new NodeOperationError(this.getNode(), 'Group photo is required.', { itemIndex });
		}

		const body: IDataObject = {
			groupId,
			groupPhoto,
		};

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'POST',
			url: `${baseUrl}/update-group-photo`,
			headers: { 'Content-Type': 'application/json' },
			body,
			json: true,
		});

		return response as IDataObject;
	}

	if (operation === 'updateGroupName') {
		const groupId = this.getNodeParameter('groupId', itemIndex) as string;
		const groupName = this.getNodeParameter('groupName', itemIndex) as string;

		if (!groupId) {
			throw new NodeOperationError(this.getNode(), 'Group ID is required.', { itemIndex });
		}
		if (!groupName) {
			throw new NodeOperationError(this.getNode(), 'Group name is required.', { itemIndex });
		}
		const body: IDataObject = {
			groupId,
			groupName,
		};
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'POST',
			url: `${baseUrl}/update-group-name`,
			headers: { 'Content-Type': 'application/json' },
			body,
			json: true,
		});
		return response as IDataObject;
	}

	if (operation === 'updateGroupSettings') {
		const groupId = this.getNodeParameter('groupId', itemIndex) as string;

		if (!groupId) {
			throw new NodeOperationError(this.getNode(), 'Group ID (phone) is required.', {
				itemIndex,
			});
		}

		const adminOnlyMessage = this.getNodeParameter(
			'adminOnlyMessage',
			itemIndex,
			true,
		) as boolean;
		const adminOnlySettings = this.getNodeParameter(
			'adminOnlySettings',
			itemIndex,
			true,
		) as boolean;
		const requireAdminApproval = this.getNodeParameter(
			'requireAdminApproval',
			itemIndex,
			true,
		) as boolean;
		const adminOnlyAddMember = this.getNodeParameter(
			'adminOnlyAddMember',
			itemIndex,
			true,
		) as boolean;

		const body: IDataObject = {
			phone: groupId,
			adminOnlyMessage,
			adminOnlySettings,
			requireAdminApproval,
			adminOnlyAddMember,
		};

		try {
			const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
				method: 'POST',
				url: `${baseUrl}/update-group-settings`,
				headers: { 'Content-Type': 'application/json' },
				body,
				json: true,
			});

			return response as IDataObject;
		} catch (error: unknown) {
			throw new NodeOperationError(
				this.getNode(),
				`Error updating group settings: ${getErrorMessage(error)}`,
				{ itemIndex },
			);
		}
	}

	if (operation === 'groupInvitationMetadata') {
		const groupInviteLink = this.getNodeParameter('groupInviteLink', itemIndex) as string;

		if (!groupInviteLink) {
			throw new NodeOperationError(this.getNode(), 'Group invite link is required.', { itemIndex });
		}

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'GET',
			url: `${baseUrl}/group-invitation-metadata`,
			qs: {
				url: groupInviteLink,
			},
			json: true,
		});

		return response as IDataObject;
	}

	if (operation === 'groupMetadata') {
		const groupId = this.getNodeParameter('groupId', itemIndex) as string;

		if (!groupId) {
			throw new NodeOperationError(this.getNode(), 'Group ID is required.', { itemIndex });
		}

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'GET',
			url: `${baseUrl}/group-metadata/${groupId}`,
			json: true,
		});

		return response as IDataObject;
	}

	if (operation === 'sendGroupInvite') {
		const groupId = this.getNodeParameter('groupId', itemIndex) as string;
		const participants = this.getNodeParameter('participants', itemIndex, {}) as {
			phones?: Array<{ phone?: string }>;
		};

		const phones: string[] =
			participants.phones?.map((entry) => (entry.phone || '').trim()).filter(Boolean) || [];

		if (!groupId) {
			throw new NodeOperationError(this.getNode(), 'Group ID is required.', { itemIndex });
		}

		if (!phones.length) {
			throw new NodeOperationError(this.getNode(), 'You must provide at least one phone number.', {
				itemIndex,
			});
		}

		const invitationResponse = (await this.helpers.httpRequestWithAuthentication.call(
			this,
			'zapiApi',
			{
				method: 'POST',
				url: `${baseUrl}/redefine-invitation-link/${groupId}`,
				headers: {
					'Content-Type': 'application/json',
				},
				json: true,
			},
		)) as InvitationResponse;

		const invitationLink =
			invitationResponse.invitationLink ||
			invitationResponse.inviteLink ||
			invitationResponse.link ||
			invitationResponse.response?.invite_link ||
			invitationResponse.response?.inviteLink;

		if (!invitationLink) {
			throw new NodeOperationError(
				this.getNode(),
				`Could not generate the invite link (response: ${JSON.stringify(invitationResponse)})`,
				{ itemIndex },
			);
		}

		const sendResponses: IDataObject[] = [];

		for (const phone of phones) {
			const sendResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
				method: 'POST',
				url: `${baseUrl}/send-text`,
				headers: { 'Content-Type': 'application/json' },
				body: {
					phone,
					message: `You have been invited to the group! Link: ${invitationLink}`,
				},
				json: true,
			});

			sendResponses.push(sendResponse);
		}

		return sendResponses;
	}

	throw new NodeOperationError(
		this.getNode(),
		`Operation not supported for the "groups" resource: ${operation}`,
		{ itemIndex },
	);
}
