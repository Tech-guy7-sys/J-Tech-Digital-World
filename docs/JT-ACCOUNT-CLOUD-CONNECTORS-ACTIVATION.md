# JT Account, Cloud and Connector Activation Guide

This guide describes the production configuration required by the current code. A configured binding is not proof that every feature is production-ready; verify each endpoint and platform independently.

## 1. JT Account (Cloudflare Pages + D1)

1. In the Cloudflare dashboard, open the Pages project used by the JT website.
2. Open **Settings → Functions → D1 database bindings** (the exact menu label may vary).
3. Add a D1 binding named `JT_AUTH_DB` and select the production JT account database.
4. Apply `db/auth-schema.sql` to that database using the D1 console or Wrangler.
5. Deploy the Pages project again after changing bindings.
6. Verify `/api/health`, `/api/config`, and `/api/auth/session` before attempting signup.

Do not paste database credentials, API tokens, passwords, session cookies, or private account data into support messages. If signup returns a diagnostic reference, share only that reference with the maintainer. Inspect the corresponding Cloudflare Pages Function log entry to find the underlying exception.

## 2. JT Cloud object storage

JT Cloud remote object storage requires an R2 bucket binding named `JT_CLOUD_BUCKET` and the server-side storage configuration documented in the deployment guide. Keep the bucket private; object access must be authorized by the JT Account session and per-user ownership checks.

Apply `db/cloud-schema.sql` to the same D1 database bound as `JT_AUTH_DB`. The current application enforces a 25 MiB per-file request limit. Do not claim remote sync is active until the R2 binding, credentials/configuration, migrations, upload, download, delete, and ownership tests have all passed in production.

## 3. Connector storage

Apply `db/connectors-schema.sql` to the same D1 database. Configure `JT_CONNECTOR_ENCRYPTION_KEY` as a server-side secret using the deployment guide's supported format. Never put the key in website JavaScript, Git, issue comments, or chat.

The current connector implementation supports the providers and scopes actually listed in the app's connector UI and OAuth routes. It does not yet include provider token refresh. Do not describe a connector as fully maintained if its provider token can expire without a refresh flow.

## 4. Account security and launch limitations

- Email verification is not implemented as a complete production flow.
- Password reset and account recovery must be tested before public launch.
- Add and verify rate limiting, abuse monitoring, session revocation, and account deletion workflows.
- Use HTTPS and secure HttpOnly cookies; never expose password hashes, salts, session tokens, or connector tokens to the browser.
- Run the repository's account and connector tests after any auth change.
- Keep internal exception details in server logs only. Public responses should contain a generic message and a diagnostic reference, not SQL, stack traces, or secrets.

## 5. Production verification checklist

- [ ] Confirm the production D1 binding is named exactly `JT_AUTH_DB`.
- [ ] Confirm all three schema files have been applied successfully.
- [ ] Confirm the R2 bucket binding is named exactly `JT_CLOUD_BUCKET` before enabling remote object storage.
- [ ] Confirm `JT_CONNECTOR_ENCRYPTION_KEY` exists as a server-side secret before enabling encrypted connector storage.
- [ ] Verify signup, signin, session lookup, signout, and account settings with test accounts.
- [ ] Verify cloud upload/download/delete and per-user isolation before claiming remote storage is live.
- [ ] Verify OAuth state validation, encrypted token persistence, disconnect, and expiry behavior before claiming connectors are production-ready.
- [ ] Review Cloudflare logs for server-side failures using request references; redact email addresses and all secrets from shared screenshots.

A successful website deployment does not prove that D1, R2, OAuth providers, or account workflows are correctly configured.
