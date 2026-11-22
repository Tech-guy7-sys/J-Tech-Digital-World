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

The current connector implementation supports GitHub public-repository listing, Google Drive search, and Gmail message search through the Jeff AI Agent's Connected services panel. Google access tokens are refreshed server-side when a refresh token is available. The system does not yet include provider token refresh for GitHub; reconnect if a GitHub token is revoked. Private GitHub repository access requires a separately configured GitHub App with read-only repository permissions. Gmail uses the Gmail API read-only scope; Google may require OAuth consent-screen test-user setup or app verification before general use. Draft creation and sending are not exposed by the current tool endpoint.

## 4. Account security and launch limitations

- The current account flow does not yet provide complete email verification.
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

## 6. Gmail, Google Drive and GitHub connector setup

The OAuth callback for the JT website connectors is:

`https://jt-digital-world-new.pages.dev/api/connectors/callback`

This is separate from the Supabase Auth callback. Do not reuse the Supabase callback URL for these connector OAuth applications.

### Google Cloud OAuth client

1. In Google Cloud Console, select the project that will own the Gmail and Drive OAuth app.
2. Configure the OAuth consent screen. While the app is in Testing, add the Google account used for testing as a test user.
3. Create an OAuth client ID of type **Web application**.
4. Add the callback above under **Authorized redirect URIs**.
5. Add the client ID and client secret to Cloudflare Pages **Production** secrets named `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
6. Enable the Google Drive API and Gmail API in that Google Cloud project.

Google Drive asks for `drive.readonly`. Gmail asks only for `gmail.readonly`; Gmail scopes can trigger additional Google verification requirements. The current Gmail tool only searches and reads message metadata/snippets. It does not send messages or create drafts.

### GitHub connector OAuth app

1. Create a separate GitHub OAuth App for JT Connectors. Do not reuse the OAuth App whose callback is configured for Supabase sign-in, because a GitHub OAuth App has one callback URL.
2. Set the authorization callback URL to the callback above.
3. Add the app's client ID and client secret to Cloudflare Pages **Production** secrets named `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.
4. The connector requests only `read:user` and `user:email`. It lists public repositories through the public user-repositories endpoint; it does not request repository scopes and cannot access private repositories. It does not perform repository writes.

### Encryption key

Keep the existing `JT_CONNECTOR_ENCRYPTION_KEY` as a Cloudflare Pages secret. It must be a base64-encoded 32-byte key. Never paste it into chat, source code, or browser JavaScript.

### Jeff AI usage

Sign in to JT Account, open the Connectors Hub, and connect each provider. In JT AI Agent, use **Connected services** to run a read-only search or list operation. The returned data is attached only to the next Jeff AI message as untrusted reference context. Review the results before asking Jeff AI to analyse them.
