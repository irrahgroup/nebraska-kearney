import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const productsProperties: INodeProperties[] = [

	{
		displayName: 'Product Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'RGB Gaming Mouse',
		description: 'Product name that will be shown in the catalog',
		displayOptions: {
			show: {
				resource: ['products'],
				operation: ['upsertProduct'],
			},
		},
	},
	{
		displayName: 'External Product ID (retailerId)',
		name: 'retailerId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'SKU-002',
		description:
			'External product identifier (retailerId). Usually your internal code/SKU used in your system.',
		displayOptions: {
			show: {
				resource: ['products'],
				operation: ['upsertProduct'],
			},
		},
	},
	{
		displayName: 'Product Description',
		name: 'description',
		type: 'string',
		typeOptions: {
			rows: 3,
		},
		default: '',
		required: true,
		description: 'Product description that will appear in the catalog',
		displayOptions: {
			show: {
				resource: ['products'],
				operation: ['upsertProduct'],
			},
		},
	},
	{
		displayName: 'Currency',
		name: 'currency',
		type: 'options',
		options: [
			{
				name: 'BRL (Brazilian Real)',
				value: 'BRL',
			},
			{
				name: 'USD (US Dollar)',
				value: 'USD',
			},
			{
				name: 'EUR (Euro)',
				value: 'EUR',
			},
		],
		default: 'BRL',
		required: true,
		description:
			'Product currency code, according to Z-API documentation (e.g., BRL, USD, EUR)',
		displayOptions: {
			show: {
				resource: ['products'],
				operation: ['upsertProduct'],
			},
		},
	},
	{
		displayName: 'Price',
		name: 'price',
		type: 'number',
		default: 0,
		required: true,
		description:
			'Product price (numeric value). Example: 20 = BRL 20.00, per Z-API documentation examples.',
		displayOptions: {
			show: {
				resource: ['products'],
				operation: ['upsertProduct'],
			},
		},
	},
	{
		displayName: 'Sale Price (salePrice)',
		name: 'salePrice',
		type: 'number',
		default: 0,
		description:
			'Promotional price. If greater than zero, it will be sent in salePrice.',
		displayOptions: {
			show: {
				resource: ['products'],
				operation: ['upsertProduct'],
			},
		},
	},
	{
		displayName: 'Hide Product in Catalog?',
		name: 'isHidden',
		type: 'boolean',
		default: false,
		description:
			'Whether the product should be hidden in the catalog (isHidden). true = hidden, false = visible.',
		displayOptions: {
			show: {
				resource: ['products'],
				operation: ['upsertProduct'],
			},
		},
	},
	{
		displayName: 'Product URL',
		name: 'url',
		type: 'string',
		default: '',
		description:
			'URL associated with the product (for example, the product page in your e-commerce)',
		displayOptions: {
			show: {
				resource: ['products'],
				operation: ['upsertProduct'],
			},
		},
	},
	{
		displayName: 'Images',
		name: 'images',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add image URL',
		typeOptions: {
			multipleValues: true,
		},
		options: [
			{
				displayName: 'Image',
				name: 'urls',
				values: [
					{
						displayName: 'Image URL',
						name: 'url',
						type: 'string',
						default: '',
						placeholder: 'https://example.com/image.jpg',
						description:
							'Public URL for the product image. Z-API expects an array of strings in "images".',
					},
				],
			},
		],
		description:
			'List of product image URLs. Z-API expects an array of strings in "images".',
		displayOptions: {
			show: {
				resource: ['products'],
				operation: ['upsertProduct'],
			},
		},
	},
	{
		displayName: 'Product ID (productId)',
		name: 'productId',
		type: 'string',
		default: '',
		required: true,
		placeholder: '4741575945866725',
		description:
			'Product ID in the WhatsApp Business catalog. You receive this ID on create/update or when listing products.',
		displayOptions: {
			show: {
				resource: ['products'],
				operation: ['deleteProduct', 'getProduct'],
			},
		},
	},
	{
		displayName: 'Catalog Phone (Phone-Number)',
		name: 'catalogPhone',
		type: 'string',
		default: '',
		required: true,
		placeholder: '5511999999999',
		description:
			'Phone number that owns the WhatsApp Business catalog (country code + area code + number, digits only). Can be your number or another catalog number.',
		displayOptions: {
			show: {
				resource: ['products'],
				operation: ['getProductByPhone'],
			},
		},
	},
	{
		displayName: 'Next Page (nextCursor)',
		name: 'nextCursor',
		type: 'string',
		default: '',
		description:
			'Pagination token returned in the previous call. Leave empty to fetch the first page.',
		displayOptions: {
			show: {
				resource: ['products'],
				operation: ['getProductByPhone'],
			},
		},
	},
];

export async function executeProducts(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	itemIndex: number,
	operation: string,
	baseUrl: string,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'upsertProduct') {
		const name = this.getNodeParameter('name', itemIndex) as string;
		const retailerId = this.getNodeParameter('retailerId', itemIndex) as string;
		const description = this.getNodeParameter('description', itemIndex) as string;
		const currency = this.getNodeParameter('currency', itemIndex) as string;
		const price = this.getNodeParameter('price', itemIndex) as number;
		const salePrice = this.getNodeParameter('salePrice', itemIndex) as number;
		const isHidden = this.getNodeParameter('isHidden', itemIndex) as boolean;
		const url = this.getNodeParameter('url', itemIndex) as string;

		const imagesCollection = this.getNodeParameter('images', itemIndex, {}) as {
			urls?: Array<{ url?: string }>;
		};

		const images: string[] =
			imagesCollection.urls
				?.map((entry) => (entry.url || '').trim())
				.filter((imageUrl) => imageUrl.length > 0) || [];

		if (!name) {
			throw new NodeOperationError(this.getNode(), 'Product name is required.', {
				itemIndex,
			});
		}

		if (!retailerId) {
			throw new NodeOperationError(
				this.getNode(),
				'External product ID (retailerId) is required.',
				{ itemIndex },
			);
		}

		if (!description) {
			throw new NodeOperationError(
				this.getNode(),
				'Product description is required.',
				{ itemIndex },
			);
		}

		if (!currency) {
			throw new NodeOperationError(
				this.getNode(),
				'Product currency (currency) is required.',
				{ itemIndex },
			);
		}

		if (price <= 0) {
			throw new NodeOperationError(
				this.getNode(),
				'Price must be greater than zero.',
				{ itemIndex },
			);
		}

		const body: IDataObject = {
			currency,
			description,
			images,
			isHidden,
			name,
			price,
			retailerId,
			url,
		};

		if (salePrice && salePrice > 0) {
			body.salePrice = salePrice;
		}

		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'zapiApi',
			{
				method: 'POST',
				url: `${baseUrl}/products`,
				headers: {
					'Content-Type': 'application/json',
				},
				body,
				json: true,
			},
		);

		return response as IDataObject;
	}

	if (operation === 'deleteProduct') {
		const productId = this.getNodeParameter('productId', itemIndex) as string;

		if (!productId) {
			throw new NodeOperationError(
				this.getNode(),
				'Product ID is required to delete the product.',
				{ itemIndex },
			);
		}

		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'zapiApi',
			{
				method: 'DELETE',
				url: `${baseUrl}/products/${productId}`,
				headers: {
					'Content-Type': 'application/json',
				},
				json: true,
			},
		);

		return response as IDataObject;
	}

	if (operation === 'getProduct') {
		const productId = this.getNodeParameter('productId', itemIndex) as string;

		if (!productId) {
			throw new NodeOperationError(
				this.getNode(),
				'Product ID (productId) is required for lookup.',
				{ itemIndex },
			);
		}

		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'zapiApi',
			{
				method: 'GET',
				url: `${baseUrl}/products/${productId}`,
				json: true,
			},
		);

		return response as IDataObject;
	}

	if (operation === 'listProducts') {
		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'zapiApi',
			{
				method: 'GET',
				url: `${baseUrl}/catalogs`,
				json: true,
			},
		);

		return response as IDataObject;
	}

	if (operation === 'getProductByPhone') {
		const catalogPhone = this.getNodeParameter('catalogPhone', itemIndex) as string;
		const nextCursor = this.getNodeParameter('nextCursor', itemIndex, '') as string;

		if (!catalogPhone) {
			throw new NodeOperationError(
				this.getNode(),
				'Catalog owner phone (Phone-Number) is required.',
				{ itemIndex },
			);
		}

		const qs: IDataObject = {};

		if (nextCursor && nextCursor.trim().length > 0) {
			qs.nextCursor = nextCursor;
		}

		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'zapiApi',
			{
				method: 'GET',
				url: `${baseUrl}/catalogs/${catalogPhone}`,
				qs,
				json: true,
			},
		);

		return response as IDataObject;
	}

	throw new NodeOperationError(
		this.getNode(),
		`Unsupported operation for "products" resource: ${operation}`,
		{ itemIndex },
	);
}
