# Hawes Website Assistant — Backend

A tiny [Cloudflare Worker](https://workers.cloudflare.com/) that powers the chat widget on
the site. It keeps the Claude API key server-side (the static site never sees it) and
answers visitor questions using a system prompt grounded in Hawes' services.

Until this is deployed, the widget runs on a **built-in canned responder**, so the mockup
still answers common questions. Deploying this Worker and pasting its URL into
`/assets/assistant.js` upgrades it to real AI — no other changes needed.

## What you need
- A free [Cloudflare account](https://dash.cloudflare.com/sign-up)
- An [Anthropic API key](https://console.anthropic.com/) (`sk-ant-...`)
- Node.js (you already have it)

## Deploy (about 5 minutes)

```bash
cd assistant-backend

# 1. Install the Cloudflare CLI (once)
npm install -g wrangler

# 2. Log in to Cloudflare (opens a browser)
wrangler login

# 3. Store your Claude API key as an encrypted secret (paste it when prompted)
wrangler secret put ANTHROPIC_API_KEY

# 4. Deploy
wrangler deploy
```

`wrangler deploy` prints a URL like:

```
https://hawes-assistant.<your-subdomain>.workers.dev
```

## Final step — connect the site
Open `assets/assistant.js` and set:

```js
var API_ENDPOINT = "https://hawes-assistant.<your-subdomain>.workers.dev";
```

Commit and push. The widget now uses live Claude responses.

## Notes
- **Model:** `claude-haiku-4-5-20251001` — fast and inexpensive (fractions of a cent per
  message). Change `MODEL` in `worker.js` to upgrade.
- **Security:** CORS is locked to the origins in `ALLOWED_ORIGINS` (the GitHub Pages site).
  Add a custom domain there if/when the site moves.
- **Cost control:** the Worker trims to the last 12 messages and caps replies at 500 tokens.
- **Editing the assistant's knowledge:** update `SYSTEM_PROMPT` in `worker.js` and re-run
  `wrangler deploy`.
