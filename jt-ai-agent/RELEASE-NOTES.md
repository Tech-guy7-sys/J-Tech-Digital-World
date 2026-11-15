# JT AI Agent — Release Notes

## 0.2.0 — Free-only AI routing (draft, 15 November 2026)

**Status:** Pull request / release candidate. Not published or deployed.

### Added
- JT AI Core automatic routing is restricted to explicitly free OpenRouter model IDs.
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
- Live Gemini and Groq smoke tests have not been performed.
- The release must not be published until GitHub Actions passes and the deployed gateway is smoke-tested with eligible free-tier credentials.
