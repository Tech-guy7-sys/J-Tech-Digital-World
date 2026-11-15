# JT AI Agent — Release Notes

## 0.2.1 — OpenRouter and Gemini model selection (draft, 15 November 2026)

**Status:** Merged to the main branch. Automated website build and gateway checks passed. Live provider smoke tests and deployed-endpoint verification are still pending. No public product release has been published.

### Added
- JT AI Core defaults to OpenRouter's dedicated `openrouter/free` router, which selects from zero-priced free models.
- Users can explicitly select Gemini 2.5 Flash or Gemini 2.5 Flash-Lite when the Google project remains on its free tier.
- The browser model selector sends only approved model identifiers to the server-side Pages Function; provider credentials remain in Cloudflare secrets.
- Optional Gemini 2.5 Flash and Groq routes are available only when their API key and free-tier confirmation setting are both present.
- Provider health metadata reports a free-only cost policy and confirms that paid fallback is disabled.
- Groq free-tier chat routing is available through its OpenAI-compatible endpoint.

### Changed
- Removed Claude/Anthropic from the JT AI Agent provider selector and gateway.
- Removed paid OpenAI and Anthropic AI provider entries from the integrations provider registry.
- Legacy saved Claude selections are reset to the JT AI Core automatic free route.
- Free quota exhaustion produces a clear error; the gateway does not silently switch to a paid model.

### Privacy and limits
- Gemini and other free-tier providers may process prompts under their own data-use terms. Do not submit confidential information unless the provider's current terms and settings are appropriate.
- Gemini requires GEMINI_FREE_TIER_CONFIRMED=true, and Groq requires GROQ_FREE_TIER_CONFIRMED=true, in addition to their server-side API keys. These are operator attestations, not independent proof of the provider account's billing status.
- Free tiers have quotas and availability limits. No unlimited usage is promised.

### Verification
- Automated gateway tests mock provider HTTP responses. They verify routing and paid-fallback prevention, not live provider availability.
- GitHub Actions website build, JavaScript syntax, gateway validation tests, and static build checks passed for the merged change.
- Live OpenRouter and Gemini smoke tests have not yet been performed because Cloudflare secret values and the deployed runtime cannot be inspected from the repository.
- The release must not be published until GitHub Actions passes and the deployed gateway is smoke-tested with eligible free-tier credentials.


## 0.3.0 — JT ecosystem visual refresh (in development)

### Changed
- Introduced a shared JT visual layer for app landing pages, product catalogue cards, the JT AI Agent conversation workspace, and the JT Stream Studio shell.
- Added richer layered surfaces, clearer hierarchy, refined responsive spacing, keyboard focus states, and coordinated dark/light theme treatments.
- Preserved each product's existing accent palette and underlying tools; this is a presentation refresh, not a claim that planned capabilities are implemented.

### Verification
- Visual and responsive browser checks are pending on the Cloudflare preview. This draft is not a public release.
