# JT Free AI Provider and Creative-Model Research

**Checked:** 15 November 2026  
**Rule:** Only $0 inference within an explicitly free allocation is allowed. Trial credits and time-limited evaluation access do not count as a permanent free provider. No paid fallback, auto-upgrade, or hidden credit purchase.

## Best candidates by capability

| Capability | Provider / model | Free access found | JT suitability | Caveat |
|---|---|---|---|---|
| Chat and reasoning | OpenRouter free models | Free model IDs ending in :free; current free plan lists 25+ free models and 50 requests/day | JT AI Core v1 automatic route | Model availability changes; 20 RPM / 50 RPD limits for free variants. Only send requests to explicit free IDs. |
| Chat and multimodal | Google Gemini Developer API — Gemini 2.5 Flash | Free input/output tier is available for selected models | Optional JT AI Core route | Per-model quotas. Google says free-tier content may be used to improve products. Do not send confidential data. Use only a project that remains on the free tier. |
| Fast chat and transcription | Groq free tier | Selected chat models and Whisper transcription are available on a free tier | JT AI Agent / JT Studio | Organization-level limits; check current account limits. Never upgrade to a billable tier. |
| Image generation | Cloudflare Workers AI — @cf/black-forest-labs/flux-1-schnell | Workers Free plan has 10,000 Neurons/day; the model is in the Workers AI text-to-image catalogue | JT Design image generation | Requires a Pages Workers AI binding named AI. Keep the Workers account on the Free plan: on Free, over-quota requests fail; on Paid, usage above the allowance is billed. Some models require paid billing, so allowlist only verified free models. |
| Embeddings and retrieval | Cloudflare Workers AI — BGE family and supported embedding models | Included in the Workers AI daily free allocation, subject to model eligibility | JT AI Core knowledge retrieval | Per-model costs and access differ. Check the exact model page and do not assume every catalog entry is free. |
| Speech-to-text | Groq Whisper; Cloudflare Workers AI Whisper models | Selected transcription models have free-tier access or draw from Cloudflare's daily free allocation | JT Studio and Agent Jeff dictation | Quotas, language quality and account limits vary. Microphone capture must remain user-started. |
| Text-to-speech | Cloudflare Workers AI TTS catalog (for example, supported Aura/MeloTTS models) | Selected models can use the Workers AI daily free allocation | JT Studio and Agent Jeff read-aloud | Verify the exact model's Free-plan eligibility and per-request cost before enabling it. |
| Video generation | No verified permanent free production API in this review | Not approved | JT Motion should ship storyboards, shot lists and local editing/planning features first | Hosted trial endpoints are not permanent free production APIs. Do not promise free video generation when the endpoint is trial-only or paid. |

## OpenArt finding

OpenArt is not an API provider for JT:
- New accounts receive 40 trial credits for a seven-day trial.
- OpenArt's help material says there is no public API or API keys.
- Its CLI uses the account's existing credit balance; installing the CLI is free but generation is charged against credits.
- Do not scrape its site, reverse engineer private endpoints, or claim that a CLI is a public API.
- It can be mentioned as an optional third-party creative website, but it must not be required for JT Design or JT Motion.

Official pages:
- https://openart.ai/faq/
- https://openart.ai/help/
- https://openart.ai/blog/openart-cli-generate-images-and-video-from-terminal/
- https://openart.ai/pricing

## Other candidates and exclusions

- **NVIDIA API Catalog:** Some hosted endpoints are marked Free Endpoint, but the hosted trial terms say access is for limited trial purposes, not production, and the agreement must be accepted by an adult of legal age. It is not approved for JT production or for a minor to register for independently. Do not use it as a production free-tier dependency.
- **Mistral Labs:** experimental models may be free, but they can change silently and do not support data-collection opt-out. Keep out of production customer workflows.
- **Hugging Face Inference, Replicate, fal.ai, Runway, Luma and other model marketplaces:** do not treat these as permanently free. Only approve a specific model endpoint when its current official pricing page explicitly confirms a $0 allocation and the intended use is allowed.
- **OpenAI API and Anthropic API:** not included in the free-only JT provider allowlist.

## Official sources

- OpenRouter free models and limits: https://openrouter.ai/collections/free-models/ and https://openrouter.ai/pricing
- Gemini pricing and free tier: https://ai.google.dev/gemini-api/docs/pricing
- Groq model limits: https://console.groq.com/docs/rate-limits
- Cloudflare Workers AI free allocation: https://developers.cloudflare.com/workers-ai/platform/pricing/
- Cloudflare Pages AI binding setup: https://developers.cloudflare.com/pages/functions/bindings/
- Cloudflare FLUX.1 schnell model: https://developers.cloudflare.com/workers-ai/models/flux-1-schnell/
- NVIDIA trial terms: https://assets.ngc.nvidia.com/products/api-catalog/legal/NVIDIA%20API%20Trial%20Terms%20of%20Service.pdf

## JT implementation policy

1. Only explicitly free model IDs and free-plan allocations may be called.
2. The system must not purchase credits, add payment methods, upgrade a plan, or use paid fallback.
3. When a free quota is exhausted, stop and show a clear message.
4. Use server-side secrets and Cloudflare bindings; never expose keys in frontend code, localStorage, logs or releases.
5. Show the upstream provider and data-use policy in privacy settings. Do not pretend that an external cloud API is local or private.
6. Keep the Cloudflare Workers account on the Free plan for the free image feature. The app's confirmation variables are operator attestations, not independent billing verification.
7. Verify account eligibility, age requirements, region access, data handling, commercial rights, per-model costs and quota before every release.
8. Mock tests prove adapter behavior only. A provider is connected only after a successful live smoke test.
