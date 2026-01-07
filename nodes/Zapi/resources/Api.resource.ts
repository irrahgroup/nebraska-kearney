import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	IHttpRequestOptions,
	IHttpRequestMethods,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const apiProperties: INodeProperties[] = [
	{
		displayName: 'HTTP Method',
		name: 'apiCallMethod',
		type: 'options',
		default: 'GET',
		options: [
			{ name: 'DELETE', value: 'DELETE' },
			{ name: 'GET', value: 'GET' },
			{ name: 'PATCH', value: 'PATCH' },
			{ name: 'POST', value: 'POST' },
			{ name: 'PUT', value: 'PUT' },
		],
		displayOptions: {
			show: {
				resource: ['api'],
				operation: ['makeApiCall'],
			},
		},
	},

	{
		displayName: 'Endpoint',
		name: 'apiCallEndpoint',
		type: 'string',
		default: '',
		required: true,
		placeholder: '/send-text',
		description:
			'Endpoint relative to this instance base URL (e.g. /send-text). You may also paste a full https:// URL.',
		displayOptions: {
			show: {
				resource: ['api'],
				operation: ['makeApiCall'],
			},
		},
	},

	{
		displayName: 'Query Parameters',
		name: 'apiCallQuery',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add query parameter',
		typeOptions: {
			multipleValues: true,
		},
		options: [
			{
				displayName: 'Parameter',
				name: 'parameters',
				values: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
					},
				],
			},
		],
		displayOptions: {
			show: {
				resource: ['api'],
				operation: ['makeApiCall'],
			},
		},
	},

	{
		displayName: 'Headers',
		name: 'apiCallHeaders',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add header',
		typeOptions: {
			multipleValues: true,
		},
		options: [
			{
				displayName: 'Header',
				name: 'headers',
				values: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
					},
				],
			},
		],
		displayOptions: {
			show: {
				resource: ['api'],
				operation: ['makeApiCall'],
			},
		},
	},

	{
		displayName: 'Body (JSON)',
		name: 'apiCallBody',
		type: 'json',
		default: {},
		description: 'Request body as JSON (ignored for GET/HEAD)',
		displayOptions: {
			show: {
				resource: ['api'],
				operation: ['makeApiCall'],
			},
		},
	},

	{
		displayName: 'Return Full Response',
		name: 'apiCallFullResponse',
		type: 'boolean',
		default: false,
		description: 'Whether to return the full API response (statusCode, headers, and body)',
		displayOptions: {
			show: {
				resource: ['api'],
				operation: ['makeApiCall'],
			},
		},
	},
];

function toKeyValueObject(items?: IDataObject[]): IDataObject {
	const out: IDataObject = {};
	for (const it of items ?? []) {
		const key = String(it.name ?? '').trim();
		if (!key) continue;
		out[key] = it.value ?? '';
	}
	return out;
}

function parseJsonParameter(value: unknown, nodeError: () => NodeOperationError): IDataObject {
	if (!value) return {};
	if (typeof value === 'object') return value as IDataObject;

	if (typeof value === 'string') {
		const raw = value.trim();
		if (!raw) return {};
		try {
			return JSON.parse(raw) as IDataObject;
		} catch {
			throw nodeError();
		}
	}

	return {};
}

function asHttpMethod(value: string): IHttpRequestMethods {
	
	const v = value.toUpperCase().trim();
	const allowed: IHttpRequestMethods[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
	if (allowed.includes(v as IHttpRequestMethods)) return v as IHttpRequestMethods;
	throw new Error(`Unsupported HTTP method: ${value}`);
}

export async function executeApi(
	this: IExecuteFunctions,
	_items: INodeExecutionData[],
	itemIndex: number,
	operation: string,
	baseUrl: string,
): Promise<IDataObject | IDataObject[]> {
	if (operation !== 'makeApiCall') {
		throw new NodeOperationError(this.getNode(), `Unsupported operation: ${operation}`, {
			itemIndex,
		});
	}

	const methodRaw = String(this.getNodeParameter('apiCallMethod', itemIndex));
	let method: IHttpRequestMethods;
	try {
		method = asHttpMethod(methodRaw);
	} catch (e) {
		throw new NodeOperationError(this.getNode(), (e as Error).message, { itemIndex });
	}

	const endpointInput = String(this.getNodeParameter('apiCallEndpoint', itemIndex)).trim();
	const fullResponse = this.getNodeParameter('apiCallFullResponse', itemIndex, false) as boolean;

	if (!endpointInput) {
		throw new NodeOperationError(this.getNode(), 'Endpoint is required.', { itemIndex });
	}
	const queryFc = this.getNodeParameter('apiCallQuery', itemIndex, {}) as IDataObject;
	const headersFc = this.getNodeParameter('apiCallHeaders', itemIndex, {}) as IDataObject;
	const qs = toKeyValueObject((queryFc.parameters as IDataObject[]) ?? []);
	const headers = toKeyValueObject((headersFc.headers as IDataObject[]) ?? []);
	const bodyParam = this.getNodeParameter('apiCallBody', itemIndex, {}) as unknown;
	const body = parseJsonParameter(bodyParam, () => {
		return new NodeOperationError(this.getNode(), 'Invalid JSON body.', { itemIndex });
	});
	const isFullUrl = /^https?:\/\//i.test(endpointInput);
	const endpoint = endpointInput.startsWith('/') ? endpointInput : `/${endpointInput}`;
	const url = isFullUrl ? endpointInput : `${baseUrl}${endpoint}`;
	const requestOptions: IHttpRequestOptions = {
		method,
		url,
		headers: headers as Record<string, string>,
		json: true,
	};
	if (Object.keys(qs).length) {
		requestOptions.qs = qs as Record<string, string>;
	}
	if (method !== 'GET') {
		if (body && Object.keys(body).length) {
			if (!requestOptions.headers) requestOptions.headers = {};
			if (!requestOptions.headers['Content-Type']) {
				requestOptions.headers['Content-Type'] = 'application/json';
			}
			requestOptions.body = body;
		}
	}
	if (fullResponse) {
		requestOptions.returnFullResponse = true;
	}
	const response = await this.helpers.httpRequestWithAuthentication.call(
		this,
		'zapiApi',
		requestOptions,
	);
	return response as IDataObject;
}
