# Jeff AI website connection (Cloudflare Pages)

The JT homepage includes a **Chat with Jeff AI** widget. It calls the same-origin Pages Function at `/api/jeff`; the browser never receives the OpenRouter API key.

## Cloudflare Pages configuration

Set these values for the Pages project `jt-digital-world-new`:

- **Secret:** `OPENROUTER_API_KEY` — the existing OpenRouter key. Keep this as a Cloudflare secret; do not add it to GitHub, HTML, JavaScript, or a public environment variable.
- **Variable:** `JEFF_API_ENABLED` = `true` — enables the chat endpoint.

Configure both Production and Preview environments if you intend to test preview deployments. Save the settings and redeploy the Pages project so the Function receives the bindings.

## Build and deployment

- Build command: `npm run build:website`
- Build output directory: `dist`
- Pages Functions directory: repository-root `functions/` (do not move it into `dist/`).
- Wrangler project name is configured in `wrangler.toml`.

The deployment includes `functions/api/jeff.js`, which is available at `/api/jeff`.

## Test

1. Open the deployed homepage.
2. Select **Chat with Jeff AI**. The status line checks `GET /api/jeff`.
3. Send a short prompt such as `Reply with: JT website test successful.`
4. A successful response identifies the J Tech AI Core v1 profile and the model used.
5. If the status says the service is not configured, verify the secret and variable above, then redeploy.

The endpoint uses the J Tech AI Core v1 fallback order:
1. `nvidia/nemotron-3-ultra-550b-a55b:free`
2. `google/gemma-4-26b-a4b-it:free`

## Security and operational notes

- The OpenRouter key is read only by the Pages Function and is never returned by the health endpoint.
- Requests are same-origin JSON, messages are limited to 4,000 characters, and chat history is bounded.
- Configure a Cloudflare rate-limiting rule for `/api/jeff` before promoting the public chat broadly. A public chat endpoint can consume the account's OpenRouter quota.
- The health endpoint reports whether the secret binding exists; it does not make a paid or free-model completion. A real chat message verifies model access and completion.
- Do not send API keys, passwords, or private account information through the chat.
