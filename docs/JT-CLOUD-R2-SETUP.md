# JT Cloud private R2 setup

This guide applies to branch `feat/jt-cloud-r2-jeff-ai-workspace`. The code deliberately returns a clear setup-required response until the account resources exist.

## 1. Create the private bucket

1. Open Cloudflare Dashboard → R2 Object Storage.
2. Create a bucket named `jt-cloud-private` (or choose another name and update the binding to match).
3. Keep the bucket private. Do not enable public bucket access or an `r2.dev` public URL.
4. Do not create or paste S3 credentials into browser code. The Pages R2 binding is sufficient for this implementation.

## 2. Configure the Pages binding

For the Pages project `jt-digital-world-new`:

1. Open Settings → Bindings → Add → R2 bucket.
2. Set the variable name to `JT_CLOUD_BUCKET`.
3. Select the private bucket.
4. Configure the binding in the **Preview environment only** for this branch, using the private test bucket.
5. Save the settings and redeploy the Preview environment.

Do not add the binding to Production yet. Production should remain unchanged until the implementation has passed review and the separate release is approved.

## 3. Apply the D1 schema

The Pages Function expects a D1 binding named `JT_AUTH_DB`. For Preview, point that binding at a **Preview-safe D1 database** that contains the same required account tables (`users` and `sessions`) as the app expects. Do not point this feature Preview at the Production account database, and do not apply the new schema to Production as part of this task. If no safe Preview database exists yet, create and initialize one using the project's existing account schema before proceeding.

Confirm the Preview database's actual D1 name in Cloudflare. Run the SQL in `db/cloud-schema.sql` against that Preview database using the D1 console, or with Wrangler:

```powershell
npx wrangler d1 execute <ACTUAL_D1_DATABASE_NAME> --remote --file=db/cloud-schema.sql
```

Replace the placeholder with the database's actual name. `JT_AUTH_DB` is the binding name and is not necessarily the D1 database's name.

## 4. Optional per-user default quota

The API defaults new accounts to 1 GiB. To choose a different default, configure the non-secret Pages environment variable `JT_CLOUD_DEFAULT_QUOTA_BYTES` in both environments. Existing quota rows are not silently overwritten.

## 5. Preview verification

After binding and schema setup, test Preview:

- Sign in to a JT Account.
- Open JT Cloud and confirm the remote storage panel reports connected.
- Upload a small test file.
- Download it and compare its contents.
- Delete it and confirm the usage number returns to its previous value.
- Sign in as a different test account and verify the first account's file is not visible or downloadable.

Do not upload private or important files during initial verification.

## Current implementation limits

- The first upload endpoint accepts files up to 25 MiB.
- Remote folders, resumable multipart uploads, sharing links and automatic migration from IndexedDB are not included.
- The browser-local vault remains separate and is never migrated or deleted automatically.
- R2 and D1 do not share a transaction. The implementation compensates for upload failures, but operational reconciliation and a scheduled cleanup workflow remain future hardening work.


## Jeff AI provider readiness in Preview

The Jeff AI gateway reads provider credentials from server-side Cloudflare Pages environment variables. Production variables are not a substitute for Preview variables. For this feature branch, open the Pages project `jt-digital-world-new` → Settings → Variables and Secrets, select the **Preview** environment, and add:

- `JEFF_API_ENABLED=true` (plain-text variable).
- `OPENROUTER_API_KEY` (secret; use the existing OpenRouter key without putting it in source code).
- `GEMINI_API_KEY` (secret, optional).
- `GEMINI_FREE_TIER_CONFIRMED=true` (plain-text operator confirmation only if the Google AI Studio project is actually on Google's free tier).

Groq is optional and is not needed for the OpenRouter/Gemini setup. Do not set a free-tier confirmation flag unless the account/project has been checked. Save and redeploy Preview, then open `/api/jeff` on the Preview hostname. The endpoint should report `ready: true` and the expected provider `configured` flags. Never paste keys into chat, commit them, or expose them to browser JavaScript. Keep Production settings unchanged during Preview verification.
