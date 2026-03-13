# @z-api/n8n-nodes-zapi

n8n community node for Z-API (WhatsApp messaging).

Repository: https://github.com/irrahgroup/nebraska-kearney

## Features

- Z-API credential support (Instance ID, Instance Token, Client Token)
- Resource and operation structure compatible with n8n community nodes
- Generic API Call resource for custom endpoints
- WhatsApp message, group, chat, contact, queue, status, and product operations

## Installation

```bash
npm install @z-api/n8n-nodes-zapi
```

Restart n8n after installation.

## Credentials

Use the `Z-API` credential and provide:

- Instance ID
- Instance Token
- Client Token

## Resources

- API (generic endpoint calls)
- Messages
- Groups
- Chats
- Contacts
- Products
- Queue
- Status
- Instance

## Development

```bash
npm run lint
npm run build
```

## License

MIT
