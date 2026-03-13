import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const groupsProperties: INodeProperties[] = [

	{
		displayName: 'Nome Do Grupo',
		name: 'groupName',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'Nome do grupo no WhatsApp',
		description: 'Nome do grupo que será criado na Z-API',
		displayOptions: {
			show: {
				resource: ['groups'],
				operation: ['createGroup', 'updateGroupName'],
			},
		},
	},

	{
		displayName: 'Descrição Do Grupo',
		name: 'groupDescription',
		type: 'string',
		default: '',
//Pode ser alterado posteriormente
		placeholder: 'Digite a descrição do grupo',
		description: 'Descrição do grupo que será atualizada',
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
		placeholder: 'URL ou base64 da foto do grupo',
		description: 'Nova foto do grupo',
		displayOptions: {
			show: {
				resource: ['groups'],
				operation: ['updateGroupPhoto'],
			},
		},
	},

	{
		displayName: 'ID Do Grupo (groupId)',
		name: 'groupId',
		type: 'string',
		default: '',
		required: true,
		placeholder: '120363019502650977-group',
		description:
			'ID do grupo (Group ID/phone). Exemplo: 120363019502650977-group. Consulte a API de metadados/listagem de grupos para obter este valor.',
		displayOptions: {

			show: {
				resource: ['groups'],
				operation: ['addParticipant', 'addAdmin', 'leave-group', 'removeParticipant',
					'updateGroupDescription', 'updateGroupPhoto', 'removeAdmin', 'updateGroupName', 'updateGroupSettings', 'groupMetadata', 'sendGroupInvite'],
			},
		},
	},

	{
		displayName: 'Link De Convite Do Grupo',
		name: 'groupInviteLink',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'https://chat.whatsapp.com/AbCdEfGhIjKlMnOpQrStUv',
		description: 'Link de convite do grupo do WhatsApp',
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
		description: 'Whether true, a Z-API enviará convite privado para participantes que não puderem ser adicionados diretamente ao grupo',
		displayOptions: {
			show: {
				resource: ['groups'],
				operation: ['createGroup', 'addParticipant'],
			},
		},
	},

	{
		displayName: 'Participantes',
		name: 'participants',
		type: 'fixedCollection',
		placeholder: 'Adicionar participante',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		options: [
			{
				displayName: 'Telefones',
				name: 'phones',
				values: [
					{
						displayName: 'Telefone',
						name: 'phone',
						type: 'string',
						default: '',
						placeholder: '5544999999999',
						description:
							'Número do participante em formato internacional, apenas dígitos. Exemplo: 5544999999999.',
						required: true,
					},
				],
			},
		],
		description:
			'Lista de números dos participantes. Cada telefone deve estar em formato internacional, apenas dígitos.',
		displayOptions: {
			show: {
				resource: ['groups'],
				operation: ['createGroup', 'addParticipant', 'addAdmin', 'removeParticipant', 'removeAdmin', 'sendGroupInvite'],
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

	// Operações que exigem pelo menos um telefone
	const operationsRequirePhones = ['createGroup', 'addParticipant', 'addAdmin', 'removeParticipant'];
	if (!phones.length && operationsRequirePhones.includes(operation)) {
		throw new NodeOperationError(
			this.getNode(),
			'É necessário informar pelo menos um telefone em "Participantes".',
			{ itemIndex },
		);
	}

	// Operação: adicionar participante
	if (operation === 'addParticipant') {
		const groupId = this.getNodeParameter('groupId', itemIndex) as string;
		if (!groupId) {
			throw new NodeOperationError(this.getNode(), 'É necessário informar o ID do grupo.', { itemIndex });
		}

		const autoInvite = this.getNodeParameter('autoInvite', itemIndex, true) as boolean;

		const body: IDataObject = { groupId, phones, autoInvite, };

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'zapiApi', {
			method: 'POST',
			url: `${baseUrl}/add-participant`,
			headers: { 'Content-Type': 'application/json' },
			body,
			json: true,
		});

		return response as IDataObject;
	}

	// Operação: criar grupo
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

	// Operação: adicionar admin
	if (operation === 'addAdmin') {

		const groupId = this.getNodeParameter('groupId', itemIndex) as string;

		if (!groupId) {
			throw new NodeOperationError(this.getNode(), 'É necessário informar o ID do grupo.', { itemIndex });
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

	// Operação: sair do grupo
	if (operation === 'leave-group') {
		const groupId = this.getNodeParameter('groupId', itemIndex) as string;

		if (!groupId) {
			throw new NodeOperationError(this.getNode(), 'É necessário informar o ID do grupo.', { itemIndex });
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

	// Operação: remover participante
	if (operation === 'removeParticipant') {
		const groupId = this.getNodeParameter('groupId', itemIndex) as string;

		if (!groupId) {
			throw new NodeOperationError(this.getNode(), 'É necessário informar o ID do grupo.', { itemIndex });
		}

		if (!phones.length) {
			throw new NodeOperationError(
				this.getNode(),
				'É necessário informar pelo menos um telefone em "Participantes".',
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
			throw new NodeOperationError(this.getNode(), 'É necessário informar o ID do grupo.', { itemIndex });
		}

		if (!phones.length) {
			throw new NodeOperationError(
				this.getNode(),
				'É necessário informar pelo menos um telefone em "Participantes".',
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
			throw new NodeOperationError(this.getNode(), 'É necessário informar o ID do grupo.', { itemIndex });
		}

		if (!groupDescription) {
			throw new NodeOperationError(this.getNode(), 'É necessário informar a descrição do grupo.', { itemIndex });
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
			throw new NodeOperationError(this.getNode(), 'É necessário informar o ID do grupo.', { itemIndex });
		}

		if (!groupPhoto) {
			throw new NodeOperationError(this.getNode(), 'É necessário informar a foto do grupo.', { itemIndex });
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
			throw new NodeOperationError(this.getNode(), 'É necessário informar o ID do grupo.', { itemIndex });
		}
		if (!groupName) {
			throw new NodeOperationError(this.getNode(), 'É necessário informar o nome do grupo.', { itemIndex });
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
			throw new NodeOperationError(this.getNode(), 'É necessário informar o ID do grupo (phone).', { itemIndex });
		}

		const adminOnlyMessage = this.getNodeParameter('adminOnlyMessage', itemIndex, true) as boolean;
		const adminOnlySettings = this.getNodeParameter('adminOnlySettings', itemIndex, true) as boolean;
		const requireAdminApproval = this.getNodeParameter('requireAdminApproval', itemIndex, true) as boolean;
		const adminOnlyAddMember = this.getNodeParameter('adminOnlyAddMember', itemIndex, true) as boolean;

		// Corpo da requisição com `phone` ao invés de `groupId`
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
		} catch (error) {
			throw new NodeOperationError(this.getNode(), `Erro ao atualizar as configurações do grupo: ${error.message}`, { itemIndex });
		}
	}

	if (operation === 'groupInvitationMetadata') {
		const groupInviteLink = this.getNodeParameter('groupInviteLink', itemIndex) as string;

		if (!groupInviteLink) {
			throw new NodeOperationError(
				this.getNode(),
				'É necessário informar o link de convite do grupo.',
				{ itemIndex },
			);
		}

		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'zapiApi',
			{
				method: 'GET',
				url: `${baseUrl}/group-invitation-metadata`,
				qs: {
					url: groupInviteLink,
				},
				json: true,
			},
		);

		return response as IDataObject;
	}

	if (operation === 'groupMetadata') {
		const groupId = this.getNodeParameter('groupId', itemIndex) as string;

		if (!groupId) {
			throw new NodeOperationError(
				this.getNode(),
				'É necessário informar o ID do grupo.',
				{ itemIndex },
			);
		}

		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'zapiApi',
			{
				method: 'GET',
				url: `${baseUrl}/group-metadata/${groupId}`,
				json: true,
			},
		);

		return response as IDataObject;
	}

	// Operação: enviar convite manual
	if (operation === 'sendGroupInvite') {
		const groupId = this.getNodeParameter('groupId', itemIndex) as string;
		const participants = this.getNodeParameter('participants', itemIndex, {}) as {
			phones?: Array<{ phone?: string }>;
		};

		const phones: string[] =
			participants.phones?.map((entry) => (entry.phone || '').trim()).filter(Boolean) || [];

		if (!groupId) {
			throw new NodeOperationError(this.getNode(), 'É necessário informar o ID do grupo.', {
				itemIndex,
			});
		}

		if (!phones.length) {
			throw new NodeOperationError(this.getNode(), 'É necessário informar pelo menos um telefone.', {
				itemIndex,
			});
		}

		// gerar o link de convite do grupo
		const invitationResponse = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'zapiApi',
			{
				method: 'POST',
				url: `${baseUrl}/redefine-invitation-link/${groupId}`,
				headers: {
					'Content-Type': 'application/json',
				},
				json: true,
			}
		);

		// Extrair o link de forma segura (variações de resposta)
		const invitationResponseData = invitationResponse as IDataObject;
		const nestedResponse =
			typeof invitationResponseData.response === 'object' && invitationResponseData.response !== null
				? (invitationResponseData.response as IDataObject)
				: undefined;

		const invitationLink =
			(invitationResponseData.invitationLink as string | undefined) ||
			(invitationResponseData.inviteLink as string | undefined) ||
			(invitationResponseData.link as string | undefined) ||
			(nestedResponse?.invite_link as string | undefined) ||
			(nestedResponse?.inviteLink as string | undefined);

		if (!invitationLink) {
			throw new NodeOperationError(
				this.getNode(),
				`Não foi possível gerar o link de convite (resposta: ${JSON.stringify(invitationResponse)})`,
				{ itemIndex }
			);
		}

		// Enviar mensagem com o convite para cada telefone
		const sendResponses: IDataObject[] = [];

		for (const phone of phones) {
			const sendResponse = await this.helpers.httpRequestWithAuthentication.call(
				this,
				'zapiApi',
				{
					method: 'POST',
					url: `${baseUrl}/send-text`,
					headers: { 'Content-Type': 'application/json' },
					body: {
						phone,
						message: `Você foi convidado para o grupo! Link: ${invitationLink}`,
					},
					json: true,
				}
			);

			sendResponses.push(sendResponse);
		}

		return sendResponses;
	}

	throw new NodeOperationError(
		this.getNode(),
		`Operação não suportada para o recurso "groups": ${operation}`,
		{ itemIndex },
	);
}
