# JT AI Core — Proposed Pricing (Nigeria)

Status: internal pricing proposal only. These prices are not published checkout prices and no billing or subscription entitlement system is currently connected.

| Plan | Monthly | Yearly | Proposed model profile |
|---|---:|---:|---|
| Free | ₦0 | ₦0 | JT AI Core v1 |
| Student | ₦2,500 | ₦25,000 | JT AI Core v2 |
| Pro | ₦6,500 | ₦65,000 | Core v2 + OpenRouter Free Router |
| Enterprise | ₦120,000 | ₦1,200,000 | Core v1 + v2 + Free Router + Cohere North Mini Code; target capacity up to 200 workers |

Yearly pricing is ten monthly payments (two months' equivalent discount).

## Commercial assumptions

- These are suggested introductory retail prices in Nigerian naira, not a cost-based forecast.
- Free OpenRouter model endpoints are rate-limited and provider availability can change. A shared key cannot be advertised as unlimited or guaranteed for 200 simultaneous workers.
- Before selling Enterprise, implement signed account entitlements, team membership and roles, usage metering, per-user quotas, queueing, audit records, and a capacity plan. If free model quotas are insufficient, the product must either impose clear usage limits or add a separately funded fallback; do not silently switch users to paid models.
- Pro is an additional proposed tier because the requested model lineup defined Free, Student and Enterprise but did not specify Pro. Its profile is Core v2 plus OpenRouter Free Router.
- Student verification, payment processing, refunds, taxes, seat provisioning and yearly renewals are not implemented.
- The 200-worker ceiling is a product target only; it is not enforced in the current code.

## Release gate

Do not advertise these as available subscriptions until billing, entitlement checks, usage limits, privacy disclosures, and operational capacity are implemented and tested.
