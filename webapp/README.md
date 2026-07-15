# Wisconsin Mutual × Insura — Voice Agent Demo Webpage

A locally-hosted, Wisconsin Mutual–branded webpage that acts as the front end
for the **Insura** voice agent running on **Retell AI**. Built by **Nalashaa**
as a proof of concept.

The webpage handles the look and feel; Retell handles the actual voice
conversation. A tiny local server sits in between only to keep your Retell
**secret API key** off the webpage.

---

## Prerequisites

- **Node.js 18 or newer** (needed for built-in `fetch`). Check with `node -v`.
- Your Retell **API key** and **Agent ID** (see below).
- A microphone + internet connection (the call runs through Retell's cloud).

## One-time setup

1. Open a terminal in this `webapp/` folder.

2. Install dependencies:
   ```
   npm install
   ```

3. Create your credentials file — copy `.env.example` to `.env`:
   ```
   copy .env.example .env      (Windows)
   ```
   Then open `.env` and paste in your two values:
   ```
   RETELL_API_KEY=key_your_secret_key_here
   AGENT_ID=agent_your_agent_id_here
   ```

   **Where to find them (dashboard.retellai.com):**
   - `RETELL_API_KEY` → left sidebar **API Keys**. Secret — never share it.
   - `AGENT_ID` → left sidebar **Agents** → open **"WMIC - Voice Agent Pro"**;
     the Agent ID is shown near the top (and in the URL).

## Run the demo

```
npm start
```

Then open **http://localhost:3000** in your browser, click **Talk to Insura**,
allow microphone access, and start speaking.

---

## How it works

```
Browser (branded page)                 This local server            Retell cloud
────────────────────────               ──────────────────           ─────────────
 click "Talk to Insura"
   │  POST /api/create-web-call ─────▶  add secret API key
   │                                    POST create-web-call ──────▶  mint token
   │  ◀───────── access_token ────────  return access_token  ◀──────
   │
   └─ Retell browser SDK starts the voice call directly with Retell (WebRTC)
```

- **`server.js`** — the only place the secret API key lives. Exposes one
  endpoint that returns a short-lived access token.
- **`public/`** — the webpage (HTML/CSS/JS). Uses Retell's browser SDK loaded
  from a CDN, so the page needs internet access.

## Security notes

- `.env` and `node_modules/` are git-ignored. Never commit your API key.
- The API key never reaches the browser — only the short-lived access token does.

## Troubleshooting

| Symptom | Fix |
|---|---|
| "Missing credentials" | You haven't created `.env`, or a value is blank. |
| "Retell API rejected the request" | Wrong API key or Agent ID; check for stray spaces. |
| Button stuck on "Connecting…" | No internet, or the CDN/Retell is blocked by a firewall. |
| No microphone prompt | Browser blocked mic access — check the site permissions. |
| `fetch is not defined` on start | Node is older than v18 — upgrade Node. |
