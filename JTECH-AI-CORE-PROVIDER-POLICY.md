# JT AI Core Free-Only Provider Policy

JT-hosted products use **free-tier inference only**. The provider identity is abstracted behind Jeff AI / JT AI Core, but the privacy/settings surface must accurately disclose the upstream provider and data-use terms.

## Allowed provider routes

| Provider | JT use | Conditions |
|---|---|---|
| OpenRouter free models | JT AI Core v1 default routing | Use OpenRouter's dedicated `openrouter/free` router, which selects zero-priced free models. Do not pass user-supplied model IDs through to the provider. Free model catalogue and limits change. Never route to paid models. |
| Google Gemini Developer API | Optional Gemini 2.5 Flash and Gemini 2.5 Flash-Lite routes | Must use a project that remains on Google's free tier. Free-tier prompts/responses may be used to improve Google products; do not send confidential data. |
| Groq | Optional chat and transcription route | Use only its free tier and currently free model IDs. Respect organization-level quotas. |

Cloudflare Workers AI is enabled for JT Design image generation through @cf/black-forest-labs/flux-1-schnell only when the Cloudflare Workers Free plan is explicitly confirmed and the Pages AI binding is configured. Its free allocation is 10,000 Neurons/day; on the Free plan requests fail after the allocation. Some models require paid billing, so JT must keep an explicit model allowlist. NVIDIA API Catalog endpoints are trial/evaluation only under the trial terms and are not approved for JT production.

## Prohibited

- No paid OpenAI API, Anthropic API, paid OpenRouter model, paid Gemini tier, or any other billable provider route.
- No automatic upgrade, credit purchase, paid fallback, or hidden billing.
- No local inference provider in the hosted provider selector.
- OpenArt is not an API provider: it offers a limited trial-credit account, has no public API/API keys, and its CLI uses account credits. Do not build a fake API integration.

## Routing rules

1. Default JT AI Core v1 route remains sequential OpenRouter free model fallback.
2. Optional Gemini and Groq routes are explicitly selected; no hidden provider switching.
3. Automatic mode may fall back only to a verified free-tier route.
4. A 429/quota error never triggers a paid route. Return a clear free-quota message.
5. Provider credentials remain server-side Cloudflare secrets. Never expose them in browser code, localStorage, repository commits, logs, or release notes.
6. A configured key is not proof of free billing. Gemini must use a free-tier project; Groq and OpenRouter accounts must remain on their free tiers.
7. Free-tier provider data may be retained or reviewed. Disclose the actual upstream provider and data terms before users submit sensitive content.
8. Mock tests do not prove a live provider is connected. Mark a provider connected only after a successful live smoke test.
9. Verify model IDs, account/region eligibility, quota, commercial terms, and data policy before every release.

## Provider setup

- OPENROUTER_API_KEY — OpenRouter account restricted to free model IDs.
- GEMINI_API_KEY — Google AI Studio key from a project that remains on the free tier (Gemini 2.5 Flash or Flash-Lite).
- GEMINI_FREE_TIER_CONFIRMED=true — operator attestation that the Google project is still on the free tier. This is not independent billing verification.
- GROQ_API_KEY — Groq free-tier API key.
- GROQ_FREE_TIER_CONFIRMED=true — operator attestation that the Groq account remains on its free tier. This is not independent billing verification.
- Cloudflare Pages Workers AI binding named AI, plus CLOUDFLARE_WORKERS_PLAN=free and CLOUDFLARE_AI_FREE_TIER_CONFIRMED=true. These are operator attestations, not independent billing verification.

The gateway rejects legacy Claude/Anthropic routes and does not expose paid OpenAI/Anthropic connectors as JT AI Core providers.
