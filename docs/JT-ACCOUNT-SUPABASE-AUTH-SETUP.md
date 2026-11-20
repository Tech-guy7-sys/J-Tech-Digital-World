# JT Account — Supabase Auth setup and provider configuration

This guide configures the new JT Account sign-in experience. Supabase Auth handles identity and authentication; Cloudflare D1 remains the JT profile/preferences database. Do not remove or recreate the existing D1 database.

## 1. Create or select the Supabase project

1. Open the Supabase dashboard and create a project for JT Digital World (or select the existing JT project).
2. Wait for the project to finish provisioning.
3. Open **Project Settings → API** (or **API Keys**, depending on the dashboard version).
4. Copy the project URL and the publishable/anon client key. These are the two values used by the website:
   - `SUPABASE_URL` — for example, `https://YOUR_PROJECT_REF.supabase.co`
   - `SUPABASE_ANON_KEY` — the publishable/anon key (not a secret/service-role key).
5. Never put a service-role key, secret key, OAuth client secret, Apple private key, or provider credential in browser JavaScript or Git.

## 2. Configure the application redirect URLs

In Supabase, open **Authentication → URL Configuration**:

- Site URL: `https://jt-digital-world-new.pages.dev`
- Add Redirect URL: `https://jt-digital-world-new.pages.dev/auth-callback.html`
- Add Redirect URL: `https://jt-digital-world-new.pages.dev/reset-password.html`

If the site is also served from a verified custom domain, add the exact callback and reset URLs for that domain too. For local development, add only the local callback URLs you actually use (for example, `http://localhost:8788/auth-callback.html` and `http://localhost:8788/reset-password.html`). Avoid broad wildcard redirects.

The OAuth provider callback URI is different from the app redirect above. Each provider must send the user back to Supabase first:

`https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

Use the exact callback URI shown in your Supabase provider settings.

## 3. Add the Cloudflare Pages environment variables

In Cloudflare:

1. Open **Workers & Pages → jt-digital-world-new → Settings → Variables and Secrets**.
2. Add these values to the **Production** environment (and Preview only if you intend to test there):
   - `SUPABASE_URL` = your Supabase project URL.
   - `SUPABASE_ANON_KEY` = your Supabase publishable/anon key.
3. Save and redeploy the Pages project.

The publishable/anon key is designed for browser use and is returned by the small public config endpoint. Database access still uses D1 through Cloudflare Functions. No Supabase service-role key is needed by this implementation.

Keep the existing D1 binding `JT_AUTH_DB` intact.

## 4. Apply the D1 identity-link migration

Open Cloudflare **Storage & databases → D1 → jt-digital-world → Console** and run the contents of:

`db/supabase-auth-schema.sql`

Run it against the same production database already bound as `JT_AUTH_DB`. It creates only the `jt_auth_identities` mapping table and index; it does not delete or rewrite existing users, sessions, or account preferences.

After deployment, check:
- `/api/auth/config` returns `configured: true`.
- `/api/health` still reports the existing D1 schema is ready.
- Test sign-in with a non-production test account first.

## 5. Configure Google

1. Open Google Cloud Console and create/select a project.
2. Configure the OAuth consent screen and add the required app name, support email, and developer contact information.
3. Create an OAuth client ID of type **Web application**.
4. Add this to **Authorized redirect URIs**:
   `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
5. In Supabase, open **Authentication → Sign In / Providers → Google** (menu labels can vary).
6. Enable Google and paste the Google client ID and client secret. Save.
7. Test with an allowed test account if the Google consent screen is still in testing mode.

Use the exact redirect URL shown in your Supabase dashboard, not the Cloudflare callback page.

## 6. Configure Discord

1. Open the Discord Developer Portal and create an application for JT Digital World.
2. Open **OAuth2** and add the Supabase callback URI to the application's Redirects:
   `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
3. Copy the Discord Application ID and Client Secret.
4. In Supabase, open **Authentication → Providers → Discord**, enable it, enter the Discord Client ID and Client Secret, and save.
5. Keep the requested identity scopes minimal. JT sign-in only needs the user's identity and email.

## 7. Configure GitHub

1. Open GitHub **Settings → Developer settings → OAuth Apps** and create a new OAuth App.
2. Set the application homepage to `https://jt-digital-world-new.pages.dev`.
3. Set **Authorization callback URL** to:
   `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
4. Create the app and copy its Client ID and Client Secret.
5. In Supabase, open **Authentication → Providers → GitHub**, enable it, enter both values, and save.
6. Do not request repository scopes for sign-in. JT Account only needs identity and email access.

## 8. Configure Apple

Apple web sign-in has more setup requirements and needs an Apple Developer account.

1. In Apple Developer, create or select an App ID and enable **Sign in with Apple**.
2. Create a **Services ID** for the JT website and associate it with the App ID.
3. Configure the Services ID's web authentication:
   - Domain: `YOUR_PROJECT_REF.supabase.co`
   - Return URL: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
4. Create a Sign in with Apple key and note the Key ID and Team ID.
5. Generate the Apple client secret (JWT) using Apple's key and required identifiers.
6. In Supabase, open **Authentication → Providers → Apple**, enable it, and enter the Services ID/client ID and generated secret.
7. Save and test on the deployed HTTPS website.

Apple OAuth client secrets expire and must be rotated on Apple's required schedule (currently every six months for this web OAuth setup). Keep the .p8 private key secure; never upload it to Git or send it in chat. Apple may provide a relay email when a user hides their address; ensure your email communication configuration supports that use.

## 9. Configure enterprise SSO

SSO is for an organisation whose administrator has configured a SAML 2.0 identity provider. It is not a general-purpose alternative provider for every personal email account.

1. In Supabase, open **Authentication → Providers** and enable SAML 2.0 / Enterprise SSO if available for your project.
2. Ask the organisation's IT administrator for its SAML 2.0 metadata URL or metadata XML, entity ID, SSO URL, signing certificate, and the email domain used by its members.
3. SAML SSO requires a Supabase Pro plan or above and Supabase CLI v1.46.4 or newer. Install the CLI, authenticate, and link the correct project.
4. Retrieve the Supabase service-provider metadata with `supabase sso info --project-ref YOUR_PROJECT_REF`. Give the organisation administrator the Entity ID / Metadata URL and ACS URL shown by that command so they can configure their IdP.
5. Once the organisation administrator provides the SAML metadata URL and confirms the email domain, run:
   ```sh
   supabase sso add --type saml --project-ref YOUR_PROJECT_REF --metadata-url 'https://idp.company.com/saml/metadata' --domains company.com
   ```
   For a metadata XML file, replace `--metadata-url ...` with `--metadata-file ./metadata.xml`.
6. **Important JT account protection:** Supabase SAML identities are not automatically linked to existing email/password or social identities. The JT bridge deliberately refuses first-time SSO account linking by email alone. A JT administrator must verify the organisation's membership and manually provision the Supabase Auth user UUID to the correct D1 JT user in `jt_auth_identities`. For an existing JT user, use the D1 console only after verifying the user and their Supabase Auth UUID:
   ```sql
   INSERT INTO jt_auth_identities (auth_user_id, user_id, email, created_at)
   SELECT 'SUPABASE_AUTH_USER_UUID', id, email, unixepoch()
   FROM users
   WHERE lower(email) = lower('verified-user@company.com');
   ```
   Confirm exactly one row was inserted. Never use an email address alone as proof of organisation membership. Do not provision an SSO identity to a different person's JT profile.
7. Confirm the connection appears in Supabase and test with an organisation-managed account. The user enters their organisation email domain (for example, `company.com`) and chooses **Continue with SSO**.

Do not invent a SAML metadata URL or use an organisation's SSO without its administrator's approval.

## 10. Email/password, verification and recovery

In Supabase **Authentication → Providers → Email**:

1. Enable email/password sign-in.
2. Keep email confirmation enabled for production.
3. Configure a real SMTP sender under the project's email/SMTP settings before public launch. Test confirmation and password recovery messages.
4. Review the confirmation and recovery email templates. Their links must return to the exact JT callback/reset URLs configured in section 2.
5. Configure reasonable Auth rate limits and abuse protection.

New sign-ups receive a confirmation email. After confirmation, the user returns to JT and the site links the verified Supabase identity to the JT profile. Forgot password sends a recovery email; the reset page lets the user set a new password.

## 11. How the JT sign-in process works

1. The user opens `/signin.html`.
2. They choose Google, Discord, GitHub, Apple, enterprise SSO, or email/password.
3. Supabase Auth verifies the user. Social sign-in redirects through the provider and then through the Supabase callback.
4. JT receives a Supabase session and sends its access token to the Cloudflare Pages Function `/api/auth/supabase-session`.
5. The Function verifies the token directly with Supabase Auth, requires a confirmed email, and links the Supabase user ID to the existing JT D1 account with the same verified email. If there is no existing JT profile, it creates one.
6. JT issues its own secure HttpOnly session cookie. Account settings and supported JT website APIs continue using the D1-backed JT session.
7. Sign-out removes the JT session. The browser's Supabase session should also be signed out by the client.

## 12. Existing JT accounts and migration

Existing D1 users, profile names, and account preferences are retained. They are not bulk-deleted or overwritten.

- If an existing user signs in with a provider that returns the same verified email address, JT links that Supabase identity to the existing D1 profile.
- If an existing user still uses the old JT email/password, the sign-in page first verifies that password against the existing D1 authentication endpoint. It then creates the matching Supabase email identity with that same password. If email confirmation is enabled, the user must confirm the email before the new Supabase session can be linked.
- The old PBKDF2 password hashes are not copied into Supabase. The migration is an authenticated re-enrolment into Supabase, not a hash-format conversion.
- Do not remove the old D1 authentication routes or columns until existing users have had a migration window and the owner has verified account access, recovery, and all JT app dependencies.

## 13. Verification checklist

- [ ] Supabase URL and publishable/anon key configured in Cloudflare Pages.
- [ ] Exact JT callback and reset URLs added to Supabase redirect allow list.
- [ ] D1 identity-link migration applied to the production `JT_AUTH_DB`.
- [ ] Google provider enabled and tested.
- [ ] Discord provider enabled and tested.
- [ ] GitHub provider enabled and tested.
- [ ] Apple provider enabled and tested.
- [ ] SAML SSO enabled and tested with an organisation administrator.
- [ ] Email confirmation and SMTP delivery tested.
- [ ] Password recovery tested.
- [ ] Existing D1 test account successfully linked without losing its profile/preferences.
- [ ] Sign-out, session expiry, and account settings tested.

A button appearing on the sign-in page does not mean its provider is configured. Each provider is active only after its credentials and callback settings have been saved in Supabase and verified with a real test login.
