# JT Free-Only AI Provider Policy

**Policy:** JT-hosted products must use providers/models that can be called at $0 inference cost within a clearly defined free allowance. No paid fallback, no auto-upgrade, no hidden credit purchase and no paid provider route. If a free allowance is exhausted, explain the limit and pause or route to another approved free endpoint.

Free-tier terms, model availability, age eligibility, data-use terms and limits can change. This list is a candidate allowlist, not a guarantee that every account can access every model or that a model is production-grade.

## Approved candidates to evaluate

| Provider | Free offering | Good JT uses | Important limits / cautions | Official reference |
|---|---|---|---|---|
| Google Gemini Developer API | Selected models have free input/output token tiers | JT AI Core chat, multimodal understanding, selected transcription/embeddings | Per-model quotas; free-tier prompts/responses may be used to improve Google products. Do not send confidential customer data on this tier. Confirm account and region eligibility. | https://ai.google.dev/gemini-api/docs/pricing |
| Groq | Free API tier for selected hosted models and speech models | Fast chat/coding, transcription | Organization-level rate limits; exact limits depend on model/account and can change. | https://console.groq.com/docs/rate-limits |
| OpenRouter | 25+ free models currently listed; free model IDs generally end in :free | Fallback chat and model discovery | Free tier currently states 50 requests/day and 20 RPM for free variants. Free model availability changes; model/provider data terms differ. Do not enable paid models or paid fallback. | https://openrouter.ai/pricing · https://openrouter.ai/collections/free-models/ |
| Cloudflare Workers AI | 10,000 Neurons/day free allocation | Chat, embeddings, reranking, selected image and speech models | Some models require paid billing. On Free plan, requests fail after daily allocation. Enforce hard daily budget and allowlist only models explicitly free without paid billing. | https://developers.cloudflare.com/workers-ai/platform/pricing/ |
| NVIDIA Build / NIM API Catalog | Some hosted model endpoints are marked Free Endpoint | Chat/reasoning, vision, embeddings, reranking, selected media | Availability and rate limits vary per endpoint; evaluation/prototyping terms may apply. Confirm production rights before serving end users. | https://build.nvidia.com/models |
| Mistral Labs | Experimental Labs models are free | Non-production experiments and evaluation only | Labs are experimental, can change silently, and do not support data-collection opt-out. Do not use for production customer data. | https://docs.mistral.ai/inference/model-lifecycle |
| Hugging Face | Free hosted inference availability varies by provider/model and may be trial-based | Model discovery and selected experiments | Do not assume free inference credits. Only list an endpoint if its current page explicitly shows $0 cost and the account has an available quota. | https://huggingface.co/docs/inference-providers |

## OpenArt decision

OpenArt is a hosted creative application, not an approved free API provider:
- Its FAQ advertises 40 trial credits for a seven-day trial.
- OpenArt states it has no public API or API keys.
- Its CLI uses the same account credit balance; it is not a separate free API.
- Do not scrape or automate its website, reverse engineer private endpoints, or represent the CLI as an API integration.
- JT Design/JT Motion may link to OpenArt as an optional external destination, with a clear notice that it is a third-party service and may require credits or a paid plan.

Official references:
- https://openart.ai/faq/
- https://openart.ai/help/
- https://openart.ai/blog/openart-cli-generate-images-and-video-from-terminal/
- https://openart.ai/pricing

## JT routing rules — mandatory

1. Free-only means zero-billed inference. A trial credit, limited-time promotion, free signup bonus, or free CLI download is not a permanent free API tier.
2. Store costClass = free-tier and a verified date for every approved model. Keep paid-only, trial-only and unknown-cost models out of the default catalogue.
3. Do not attach a payment method or silently upgrade a provider account. The application must not initiate purchases.
4. Enforce provider/model daily request and token limits, concurrency caps and per-user fairness. Read rate-limit headers where provided.
5. Never route to a paid model after a free model returns 429, 5xx, timeout or quota exhaustion. Retry only other explicitly approved free endpoints, then stop with a useful message.
6. Make no promise of unlimited free service. Show provider status, remaining allowance when available, and last verification date.
7. Separate free experimental endpoints from free endpoints approved for customer production. NVIDIA evaluation-only and Mistral Labs must not silently become production defaults.
8. Do not use free-tier endpoints for secrets, credentials, private source code, health/financial data or other sensitive customer content when provider terms allow review/training. Provide a clear upstream-provider disclosure.
9. Keep provider API keys server-side in Cloudflare secrets. Never expose them in browser code, localStorage, repository commits, telemetry or release notes.
10. Require a live credential check before a provider is marked Connected. Mock tests must be labelled Mock.
11. If all free routes are unavailable, stop. Never fall back to a paid route.
12. Re-check official pricing, terms, age eligibility, region access and commercial-use rights before each release.

## Product mapping

- JT AI Core / JT AI Agent / Jeff AI: Gemini free tier, Groq free tier, OpenRouter free-only model IDs, and selected Cloudflare/NVIDIA free endpoints after eligibility review.
- JT Design: only image-generation endpoints explicitly marked free and allowed for the intended use. OpenArt is not an API option.
- JT Motion: only explicitly free video/image endpoints; do not promise a free video generator if the model requires paid credits.
- JT Studio: selected free transcription/speech endpoints, with quotas and explicit microphone consent.
- JT Cloud: storage is not an AI provider; do not treat model free tiers as free storage.
- JT Desktop Agent: free chat/speech providers may assist, but all local desktop actions remain permission-gated and require confirmation for consequential actions.

## Release gate

Every provider or model addition must include:
- Official pricing/terms URL and verification date.
- Exact provider and model IDs, modalities and free-tier status.
- Limits, data-use disclosure and region/account eligibility.
- Adapter tests for success, authentication failure, quota exhaustion, timeout and provider outage.
- A test proving no paid route is selected after free quota exhaustion.
- App-specific release notes and an honest statement of what was actually tested.