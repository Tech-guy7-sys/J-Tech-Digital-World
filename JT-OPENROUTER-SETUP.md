# Enable OpenRouter for the hosted JT AI Agent

The hosted JT AI Agent now uses the jt-core provider and the JT AI Core v1 fallback route. The OpenRouter key must be stored as a Cloudflare Pages secret; do not put it in browser code, GitHub commits, or the public repository.

## Add the Cloudflare secret

1. Sign in to Cloudflare and open **Workers & Pages**.
2. Select the Pages project **jt-digital-world-new**.
3. Open **Settings → Variables and Secrets** (the exact tab wording can vary).
4. Under the **Production** environment, add an encrypted/secret variable:
   - Name: OPENROUTER_API_KEY
   - Value: your OpenRouter API key
5. Save the setting.
6. Redeploy the latest main branch deployment so the Pages Function receives the new secret.

The existing CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID GitHub Actions secrets are only for deployment automation. They are not OpenRouter credentials.

## What the hosted route does

- Calls OpenRouter from the Cloudflare Pages Function, never from browser JavaScript.
- Uses NVIDIA Nemotron 3 Ultra (free) first, then Google Gemma 4 26B A4B (free) as fallback.
- Returns a clear rate-limit/unavailable response if both free model routes fail.
- Does not silently switch to a paid model.

## Privacy and operating limits

Prompts and text attachments sent to the hosted assistant are transmitted to OpenRouter for inference. Do not send passwords, API keys, or other sensitive information. OpenRouter free models have rate limits and changing availability; this route is not an unlimited or guaranteed-uptime service.
