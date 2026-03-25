This is a [Next.js](https://nextjs.org) project for PDF Budget Extraction, integrated with n8n.

## Local Setup

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# The n8n webhook URL to trigger the extraction
N8N_WEBHOOK_URL=your_n8n_webhook_url

# The public URL of your app (used by n8n for callbacks)
# During local development, use an ngrok URL
NEXT_PUBLIC_APP_URL=https://your-ngrok-subdomain.ngrok-free.dev
```

### 3. Run ngrok (For Local Callbacks)
Since the extraction process happens on an external n8n server, it needs to call back to your local machine to update the status.

**Installation options:**
- **Homebrew**: `brew install ngrok`
- **NPM**: `npm install -g ngrok`
- **Direct Download**: Download the binary from [ngrok.com](https://ngrok.com/download)

**Steps:**
1. Start ngrok on port 3000:
   ```bash
   ngrok http 3000
   ```
2. Copy the `Forwarding` URL (looks like `https://...ngrok-free.dev`) and paste it as `NEXT_PUBLIC_APP_URL` in your `.env.local`.

### 4. Start Development Server
```bash
pnpm dev
```

## Architecture
- **Frontend**: Next.js (App Router) with Tailwind CSS.
- **Backend**: Next.js API Routes for triggering n8n and receiving callbacks.
- **Orchestration**: n8n handles the heavy lifting of PDF parsing and sheet synchronization.
- **Database**: `jobs.json` acts as a simplified local database for tracking job states.

## Important Note on jobs.json
Avoid manual editing of `jobs.json` while the server is running, as it may cause file corruption or data loss during concurrent writes.
