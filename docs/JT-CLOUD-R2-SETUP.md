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
4. Configure the binding separately for Preview and Production environments.
5. Save the settings and redeploy the Preview environment first.

Production should remain unchanged until the implementation has passed review and the separate release is approved.

## 3. Apply the D1 schema

The existing account database is exposed to Pages Functions as `JT_AUTH_DB`. Confirm its actual D1 database name in the Cloudflare dashboard.

Run the SQL in `db/cloud-schema.sql` against that existing D1 database using the D1 console, or with Wrangler:

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
