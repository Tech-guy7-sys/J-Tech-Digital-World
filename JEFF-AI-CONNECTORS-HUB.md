# Jeff AI Connectors Hub — implementation plan

## Current delivery
- Unified connector catalogue and status endpoint at `/api/integrations`.
- Connectors Hub UI at `/integrations.html`, with separate AI-provider and external-service sections.
- Explicit status semantics: a catalogue entry is not a live connection; credentials detected is not equivalent to an active adapter.
- Planned D1 schema migration at `db/connectors-schema.sql` for per-user connector accounts, OAuth state and audit events.

## Security architecture
1. Require an authenticated JT session for all connect, callback, disconnect and tool routes.
2. OAuth authorization-code flow with PKCE where supported, exact redirect URI validation, one-time state bound to user/provider, short expiry, and replay protection.
3. Encrypt provider access and refresh tokens at rest with AES-GCM using a Cloudflare Pages secret named `JT_CONNECTOR_ENCRYPTION_KEY`; never return tokens to the browser.
4. Request minimal scopes. Store granted scopes and show them to the user.
5. Tool registry declares provider, scope, read/write class, input schema and whether confirmation is required.
6. Jeff AI receives only tool descriptions and short-lived server-side execution results, never raw credentials.
7. Require explicit confirmation for sending messages, writing/deleting files, changing infrastructure, publishing, CRM mutations or financial operations.
8. Audit every tool invocation with user, connector, action, outcome and timestamp. Support disconnect and token revocation.

## Activation sequence
1. Run `db/connectors-schema.sql` in the existing D1 database bound as `JT_AUTH_DB`.
2. Implement and test OAuth start/callback/disconnect routes for one provider at a time.
3. Add provider client IDs/secrets as Cloudflare Pages secrets. Configure each provider's exact callback URL.
4. Implement provider API adapters and permission-checked tools.
5. Add tool selection/execution to `functions/api/jeff.js` only after authentication, consent and confirmation flows are tested.
6. Add automated tests for state replay, expired state, missing scopes, revoked tokens, cross-user isolation, prompt injection in connector content and denied writes.

## Not yet active
OAuth flows, token encryption, provider API calls, tool execution from Jeff AI and connector-specific account linking are not claimed as complete by this initial hub release.
