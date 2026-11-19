# JT Account and Cloud Connectors — activation and current limits

This guide records the production configuration expected by the JT website. It is an operator checklist, not a claim that every service is currently active.

## Required Cloudflare bindings

Configure these bindings on the Cloudflare Pages project used for the production website:

- `JT_AUTH_DB`: Cloudflare D1 database used by JT Account.
- `JT_CLOUD_BUCKET`: R2 bucket binding used by JT Cloud when remote storage is enabled.
- `JT_CONNECTOR_ENCRYPTION_KEY`: secret used to encrypt connector tokens at rest. Configure it through Cloudflare secret settings; never commit its value to the repository or paste it into support chats.

Apply the schemas to the intended production D1 database:

1. `db/auth-schema.sql`
2. `db/cloud-schema.sql`
3. `db/connectors-schema.sql`

Run migrations against the actual production database bound as `JT_AUTH_DB`, not a local or preview database. Verify the resulting tables before enabling the related feature.

## Upload and storage limits

The current JT Cloud upload/API contract caps an individual upload at **25 MiB**. A configured bucket alone does not establish that the public website can write to it: the Pages binding, server-side API, provider configuration, and storage tests must all pass.

Never expose storage credentials in browser code. Keep provider secrets in server-side environment variables.

## Connector scope and lifecycle

The current GitHub OAuth request asks for `read:user user:email`. It does not request repository access. The website must not describe this connection as repository read/write access.

The current connector implementation does not yet include provider token refresh. Expired or revoked provider credentials therefore require a reconnect flow until refresh support is implemented. Connector disconnect/revocation and token lifecycle behaviour must be tested before describing the integration as production-complete.

## JT Account security and current limitations

- Passwords are processed server-side; never log or display passwords, password hashes, session tokens, cookies, or encryption keys.
- Session cookies are HttpOnly, Secure, and SameSite=Lax.
- Signup and sign-in availability depends on the production `JT_AUTH_DB` binding and the auth schema in `db/auth-schema.sql`.
- Email verification is **not implemented yet**. Do not claim that email addresses are verified.
- Password-reset, abuse/rate limiting, and account-recovery workflows must be reviewed and tested before public launch.
- Keep internal exception details in protected server logs. Public responses should use a generic error and a request reference that can be correlated with the server log.

## Verification before enabling features

1. Confirm each binding exists in the production Pages environment.
2. Confirm the expected D1 schema has been applied to the database actually bound as `JT_AUTH_DB`.
3. Test the account session endpoint without submitting a real user's credentials.
4. Test signup and sign-in only with a dedicated test account in a controlled test environment.
5. Verify cloud upload, download, delete, and permission behaviour against a non-sensitive test object.
6. Verify connector connect, reconnect, disconnect, and least-privilege scope behaviour.
7. Inspect server logs for failures, but never copy secrets or personal account data into issue reports.

A feature is not production-ready merely because a binding or bucket exists. Mark it available only after its end-to-end tests pass in the target environment.
