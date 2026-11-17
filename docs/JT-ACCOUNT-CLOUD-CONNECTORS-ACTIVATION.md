# JT Account, JT Cloud and Connectors — activation guide

This guide describes the current Cloudflare Pages implementation. It separates code that already exists from the Cloudflare/provider setup and production features that are not implemented yet.

## 1. Use one Cloudflare D1 database for JT accounts

The Pages Functions expect a D1 binding named exactly `JT_AUTH_DB`.

1. In Cloudflare Dashboard, open **Workers & Pages → D1 SQL Database** and create a database, e.g. `jt-auth-db`.
2. Open its SQL console and apply these migrations in this order:
   - `db/auth-schema.sql`
   - `db/cloud-schema.sql`
   - `db/connectors-schema.sql`
3. Open **Workers & Pages → your Pages project → Settings → Bindings**.
4. Add a D1 database binding named `JT_AUTH_DB`, selecting that database. Configure Preview and Production deliberately; do not point Preview at the Production database.
5. Save and redeploy the Pages project.

CLI alternative (run from the repository root; replace the database name if needed):

```sh
npx wrangler d1 create jt-auth-db
npx wrangler d1 execute jt-auth-db --remote --file=db/auth-schema.sql
npx wrangler d1 execute jt-auth-db --remote --file=db/cloud-schema.sql
npx wrangler d1 execute jt-auth-db --remote --file=db/connectors-schema.sql
```

Use the database ID returned by Wrangler when configuring a Wrangler D1 binding. Do not create a second database for Cloud or connectors: the migrations reference the same `users` table.

### Verify sign-in

After redeploying:

- Open `/api/config`; expect `{"authConfigured":true}`.
- Open `/api/auth/session`; signed-out users should receive `authenticated:false`.
- Open `/signin.html`, create a test account, refresh, and confirm the HttpOnly session remains.
- Sign out and confirm the session is invalidated.
- Test an incorrect password and duplicate email.

The current account API uses PBKDF2-SHA-256 password hashing (310,000 iterations) and a Secure, HttpOnly, SameSite=Lax session cookie. Passwords must be 10–128 characters. Use HTTPS.

**Important account launch gaps:** the current email field is not verified. Password reset/recovery, email verification, sign-in/sign-up rate limiting, abuse monitoring, account deletion/self-service export, and production security review still need implementation before public registration. Do not advertise this as a fully production-hardened identity service yet. The website cookie session is not automatically a desktop-app session; desktop SSO/device authorization still needs a dedicated flow.

## 2. Activate JT Cloud remote file storage

JT Cloud's remote API is already implemented, but it requires both the D1 migrations above and a private R2 bucket.

1. In Cloudflare, create a private R2 bucket named `jt-cloud-private` (or choose another private name).
2. In the Pages project, add an R2 bucket binding named exactly `JT_CLOUD_BUCKET` and select that bucket. Configure Preview and Production separately.
3. Keep public access disabled; do not enable public `r2.dev` access.
4. Redeploy.
5. Sign in to the same site origin, open JT Cloud, and test upload, list, download, delete, quota display, and access isolation with two separate test accounts.

Current remote upload limit: 25 MiB per file. Default quota: 1 GiB per account; optionally configure `JT_CLOUD_DEFAULT_QUOTA_BYTES` as a non-secret Pages environment variable. The database usage table tracks account quotas.

Local IndexedDB files are a separate browser-local vault. They are not silently copied to R2. The current remote API does not implement folder creation, sharing, version history, local-to-cloud migration, or cross-device desktop sync. Do not treat a successful local save as a cloud backup.

## 3. Configure supported OAuth connectors

Only GitHub and Google Drive OAuth start/callback flows are implemented in this deployment. The other cards in the Connectors Hub are catalogue entries, not working connectors. Gmail, Calendar, Microsoft, Slack, Notion, Dropbox and the other listed services need their own provider adapters and scopes before they can be connected or used.

### Create provider OAuth applications

**GitHub**
1. In GitHub Developer Settings, create an OAuth App.
2. Set the homepage URL to your deployed JT website.
3. Set the Authorization callback URL to `https://YOUR-DOMAIN/api/connectors/callback`.
4. Add Pages secrets `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.

The current GitHub OAuth request asks for `read:user user:email`; it does not request repository access. Repository automation should use a separately installed GitHub App with narrowly scoped repository permissions, not expand this identity OAuth scope by default.

**Google Drive**
1. Create a Google Cloud project and configure the OAuth consent screen.
2. Enable Google Drive API and Google identity endpoints required by the integration.
3. Create a Web application OAuth client.
4. Add the exact authorized redirect URI `https://YOUR-DOMAIN/api/connectors/callback`.
5. Add Pages secrets `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

The current request asks for `openid email profile https://www.googleapis.com/auth/drive.readonly`. This is read-only Drive scope; it does not enable Gmail or Calendar. Google may require OAuth consent-screen configuration, test users, verification, or additional review depending on publishing status and scopes.

### Encrypt connector tokens

Generate a random 32-byte key locally and encode it as base64. For example, with Node.js:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Save the output as a Cloudflare Pages secret named `JT_CONNECTOR_ENCRYPTION_KEY` in each environment where connectors are enabled. Do not put it in source control, website JavaScript, chat, or build logs. Back it up in an approved secrets manager: losing it makes previously stored OAuth tokens unreadable. Use different keys for Preview and Production.

Then redeploy and test:

1. Sign in to JT Account.
2. Open `/integrations.html`.
3. Connect GitHub or Google Drive.
4. Confirm the provider consent screen shows the requested scopes.
5. Confirm the connection appears under the signed-in account only.
6. Disconnect it and confirm the stored encrypted tokens are cleared.
7. Repeat with a second test account and verify account isolation.

The OAuth callback stores access and refresh tokens encrypted with AES-GCM and records an audit event. The current implementation does not yet include provider token refresh, provider-side token revocation, a complete connector tool execution layer, or per-tool approval UI. A connected identity is not proof that Jeff AI can search or modify that provider. Do not enable actions until a provider adapter checks the user's scopes and account ownership on every request. Ask for confirmation before sending, editing, deleting, publishing, or other consequential changes.

## 4. Make JT Code projects persistent and executable

The current JT Code IDE is a browser workspace: editor drafts and imported files remain in browser-local storage, preview runs in an isolated iframe, and the command console is a small allow-listed workspace helper. It does not have a host filesystem, real terminal, Git repository write access, remote project persistence, or a connected coding-agent executor.

The safe next architecture is:

- Store project/file metadata in D1, scoped to `user_id`.
- Store source files in private R2 using owner-scoped object keys.
- Use optimistic version numbers for edits and conflict detection.
- Keep code preview in a sandboxed origin/iframe.
- If real code execution is added, run it in disposable, resource-limited containers with no ambient secrets, no host mounts, restricted network egress, execution timeouts, and explicit user approval. Never run arbitrary user code inside the Pages Function runtime.
- Add repository integration through a narrowly scoped GitHub App installation, with explicit repository selection and reviewable diffs before commits or pushes.

## 5. Production checklist

- [ ] D1 `JT_AUTH_DB` binding configured in Preview and Production as intended.
- [ ] All three SQL migrations applied to the matching D1 database.
- [ ] R2 private bucket bound as `JT_CLOUD_BUCKET` in each environment.
- [ ] GitHub and/or Google OAuth clients configured with the exact callback URL.
- [ ] `JT_CONNECTOR_ENCRYPTION_KEY` stored as a Pages secret, separately per environment.
- [ ] Deployment completed after bindings and secrets were saved.
- [ ] Signup, sign-in, refresh, sign-out and account preferences tested.
- [ ] Remote Cloud upload/list/download/delete and two-account isolation tested.
- [ ] OAuth connect/disconnect and two-account isolation tested.
- [ ] Rate limiting, email verification, password recovery, monitoring, backups and security review completed before public launch.

Never send provider client secrets, access tokens, database credentials, or the encryption key to ChatGPT or commit them to Git.
