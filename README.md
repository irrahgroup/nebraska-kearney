# n8n-nodes-zapi

Community node for **n8n** that integrates with **Z-API** (WhatsApp messaging).

This package adds Z-API nodes to n8n, enabling WhatsApp messaging automation and related features.

---

## n8n Cloud note (Verified Community Node)

To be installable in **n8n Cloud**, this package must be approved as a **Verified Community Node**.  
Non-verified community nodes can only be installed in **self-hosted** n8n.

---

## What this node does

With this node you can:

- Send WhatsApp messages (text, media, lists/buttons, location, PIX button)
- Manage chats (pin, archive, delete, list)
- Manage contacts (metadata, profile picture, list, phone existence check)
- Manage groups (members/admins, settings, metadata, invite links)
- Manage instance utilities (disconnect, QR code, device data, phone code)
- Manage message queue (list and delete)
- Manage products linked to a phone (upsert, delete, get, list)
- Post status updates (text/image)
- Make direct API calls (advanced)

---

## Requirements

- n8n (self-hosted) or n8n Cloud (Verified required to install)
- A Z-API account with an active instance
- Z-API credentials:
  - **Instance ID**
  - **Instance Token**
  - **Client Token** (Account Security Token)

---

## Installation

### Self-hosted n8n
Install as a community node and restart n8n.

### n8n Cloud
Only **Verified Community Nodes** are installable in n8n Cloud.  
After approval, the package appears in the Cloud UI under Community Nodes.

---

## Credentials (Z-API API)

This package provides the credential type:

**Z-API API** (`zapiApi`)

### Credential fields

#### Instance ID
Your Z-API instance identifier.

#### Instance Token
Token for the selected instance.

#### Client Token
Z-API **Account Security Token**. This is sent as an HTTP header:

- `Client-Token: <clientToken>`

### Credential test
The credential test checks the instance status endpoint:

- `GET https://api.z-api.io/instances/{instanceId}/token/{instanceToken}/status`

(plus the `Client-Token` header)

---

## Resources & Operations

Below is the full list of operations in this package (grouped by resource).

### 🧩 Resource: api
- Make an API call

### 💬 Resource: chat
- Archive chat
- Delete chat
- List chats
- Pin chat

### 📇 Resource: contacts
- Check phone exists
- Get contact metadata
- Get profile picture
- List contacts

### 👥 Resource: groups
- Create group
- Add participant
- Remove participant
- Promote to admin
- Demote admin
- Leave group
- Update description
- Update photo
- Update name
- Update settings
- Get invitation metadata
- Get group metadata
- Send invite link

### 📱 Resource: instance
- Disconnect phone
- Get device data
- Get QRCode bytes
- Get QRCode image
- Get phone code

### ✉️ Resource: messages
- Send text message
- Delete message
- Read a message
- Reply to a message
- Send an audio
- Send a button list
- Send a contact
- Send a document
- Send a link
- Send a location
- Send an image
- Send an option list
- Send a PIX button
- Send a sticker
- Send a video

### ⏳ Resource: messageQueue
- Delete queue message
- Get queue messages

### 🛒 Resource: products
- Upsert product
- Delete product
- Get product
- Get products by phone
- List products

### 🟢 Resource: status
- Post image to status
- Post text to status

---

## Data formats & validation rules

### Phone numbers
- Must be **digits only** and include **country code + area code + number**
- Example (Brazil): `5511999999999`

### Delay (delayMessage)
- Z-API recommends values between **1 and 15 seconds**
- If set to `0`, API default behavior is used (depending on operation)

### Group IDs
Some operations require a **groupId** (example: `120363019502650977-group`).  
You can usually obtain it via group metadata endpoints or webhook payloads.

### Media inputs (URL or Base64)
Many operations accept media as:

- **URL**: `https://...`
- **Data URI**: `data:<mime>;base64,<data>`
- **Raw Base64** (no prefix): the node may normalize it into a Data URI automatically

Examples:
- URL: `https://example.com/image.png`
- Data URI: `data:image/png;base64,iVBORw0K...`
- Raw Base64: `iVBORw0KGgoAAAANSUhEUg...`

For documents, providing a filename with extension (example: `invoice.pdf`) is recommended.

---

## Quick usage examples

### 1) Send a text message
Resource: Messages → Send text message

- Phone Number: `5511999999999`
- Message: `Hello from n8n!`
- Delay (seconds): `2`

### 2) Send an image (URL or Base64)
Resource: Messages → Send an image

- Phone Number: `5511999999999`
- Image (URL or Base64):
  - `https://example.com/image.png`
  - or `data:image/png;base64,iVBORw0K...`

### 3) Send a document
Resource: Messages → Send a document

- Phone Number: `5511999999999`
- Document: `https://example.com/invoice.pdf` (or Base64/Data URI)
- File Name: `invoice.pdf` (recommended)
- Caption: `Invoice attached`

### 4) Reply to a message
Resource: Messages → Reply to a message

- Phone Number: `5511999999999` (or group ID)
- Message ID: `<messageId from webhook or previous send response>`
- Message: `Got it!`

### 5) Create a group
Resource: Groups → Create group

- Group Name: `My Group`
- Participants: add at least one phone
- Auto invite: enable if you want to invite participants who cannot be added directly

### 6) Get QR code image
Resource: Instance → Get QRCode image

Use this to display a scannable QR when connecting an instance.

---

## Troubleshooting

### ESLint errors (Unexpected any)
For Verified Community Nodes, avoid `any`:
- use `unknown` and type guards
- define small interfaces for API responses you depend on
- avoid `(value as any)` whenever possible

### 401/403 errors
- Confirm **Client Token** is the Z-API **Account Security Token**
- Confirm Instance ID and Instance Token belong to the same instance
- Confirm the instance is active and allowed to call the endpoint

### “200 OK but no message delivered”
- Verify the instance is connected/online
- Verify phone format (digits only)
- For media: ensure URL is public/reachable or Base64 is valid
- Try a delay of 1–3 seconds

### Node updated but UI doesn’t show new operations
- Run `npm run build`
- Restart n8n
- Clear browser cache / hard refresh

---

## Development

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Publishing notes (n8n Cloud / Verified)

To be installable in **n8n Cloud**, this package must be approved as a **Verified Community Node**. In practice, that means it must:

- Follow the package naming convention: `n8n-nodes-*` or `@scope/n8n-nodes-*`
- Include the keyword: `n8n-community-node-package`
- Define the `n8n` section in `package.json`, listing the built node and credential entrypoints
- Avoid unsafe runtime behavior (for example: filesystem access, environment secrets, etc.)
- Pass the community package scanner before submission

## License

MIT
