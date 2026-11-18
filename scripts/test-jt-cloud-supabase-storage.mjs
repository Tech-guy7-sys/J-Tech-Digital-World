import test from "node:test";
import assert from "node:assert/strict";
import {
  storageConfig, putCloudObject, getCloudObject, deleteCloudObject,
  DEFAULT_QUOTA_BYTES, MAX_FILE_BYTES
} from "../functions/api/cloud/_shared.js";

test("Supabase storage configuration requires HTTPS URL and service-role secret", () => {
  assert.equal(storageConfig({ SUPABASE_S3_ENDPOINT: "https://example.storage.supabase.co/storage/v1/s3" }), null);
  assert.equal(storageConfig({ SUPABASE_S3_ENDPOINT: "http://example.storage.supabase.co/storage/v1/s3", SUPABASE_S3_ACCESS_KEY_ID: "id", SUPABASE_S3_SECRET_ACCESS_KEY: "secret", SUPABASE_S3_REGION: "us-east-1" }), null);
  assert.deepEqual(storageConfig({
    SUPABASE_S3_ENDPOINT: "https://example.storage.supabase.co/storage/v1/s3",
    SUPABASE_S3_ACCESS_KEY_ID: "access-key",
    SUPABASE_S3_SECRET_ACCESS_KEY: "private-key",
    SUPABASE_S3_REGION: "us-east-1"
  }), {
    endpoint: "https://example.storage.supabase.co/storage/v1/s3",
    accessKeyId: "access-key",
    secretAccessKey: "private-key",
    region: "us-east-1",
    bucket: "jt-cloud-private"
  });
});

test("JT Cloud signs Supabase S3 object operations with server-side credentials", async t => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    if (init.method === "GET") return new Response("hello", { status: 200 });
    if (init.method === "DELETE") return new Response(null, { status: 204 });
    return new Response(null, { status: 200, headers: { etag: '"abc123"' } });
  };
  t.after(() => { globalThis.fetch = originalFetch; });

  const env = {
    SUPABASE_S3_ENDPOINT: "https://example.storage.supabase.co/storage/v1/s3",
    SUPABASE_S3_ACCESS_KEY_ID: "access-key",
    SUPABASE_S3_SECRET_ACCESS_KEY: "server-only-secret",
    SUPABASE_S3_REGION: "us-east-1"
  };
  const key = "users/u1/file one.txt";
  assert.equal(await putCloudObject(env, key, "hello", "text/plain"), '"abc123"');
  const downloaded = await getCloudObject(env, key);
  assert.equal(await downloaded.text(), "hello");
  await deleteCloudObject(env, key);

  assert.equal(calls.length, 3);
  assert.equal(calls[0].url, "https://example.storage.supabase.co/storage/v1/s3/jt-cloud-private/users/u1/file%20one.txt");
  assert.equal(calls[0].init.method, "PUT");
  assert.equal(calls[1].init.method, "GET");
  assert.equal(calls[2].init.method, "DELETE");
  for (const call of calls) {
    assert.match(call.init.headers.get("authorization"), /^AWS4-HMAC-SHA256 /);
  }
});

test("Supabase adapter keeps uploads bounded for the initial free-tier integration", () => {
  assert.equal(MAX_FILE_BYTES, 25 * 1024 * 1024);
  assert.equal(DEFAULT_QUOTA_BYTES, 100 * 1024 * 1024);
});
