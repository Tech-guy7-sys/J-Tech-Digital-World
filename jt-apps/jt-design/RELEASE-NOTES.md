# JT Design — Release Notes

## 0.2.0 — Free-tier AI Image Lab (draft, 15 November 2026)

**Status:** Pull request / release candidate. Not published or deployed.

### Added
- Prompt-to-image generation panel inside JT Design.
- Cloudflare Workers AI adapter using FLUX.1 schnell.
- Preview and user-initiated download of generated images.
- Prompt validation, accessible status messages, and clear error handling.

### Free-only controls
- The endpoint requires the Cloudflare Workers Free plan attestation and an AI binding named AI.
- The free Workers AI allocation is 10,000 Neurons per day. On the Free plan, requests fail when the daily allocation is exhausted; no paid fallback is configured.
- Only the allowlisted FLUX.1 schnell model is called by this endpoint. No paid image provider or OpenArt private API is used.

### Setup and verification
- In Cloudflare Pages, configure a Workers AI binding named AI for the project, then redeploy.
- Set CLOUDFLARE_WORKERS_PLAN=free and CLOUDFLARE_AI_FREE_TIER_CONFIRMED=true as Pages environment variables only after verifying the account remains on the Free plan.
- Automated tests mock the AI binding. They do not prove live Cloudflare binding access or actual image generation.
- Do not publish this release until GitHub Actions passes and a live generation is tested within the free allowance.
