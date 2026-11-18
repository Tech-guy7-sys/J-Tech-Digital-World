import test from "node:test";
import assert from "node:assert/strict";
import {
  storageConfig, putCloudObject, getCloudObject, deleteCloudObject,
  DEFAULT_QUOTA_BYTES, MAX_FILE_BYTES
} from "../functions/api/cloud/_shared.js";

test("Supabase storage configuration requires HTTPS URL and service-role secret", () => {
  assert.equal(storageConfig({ SUPABASE_URL: "https://example.supabase.co" }), null);
  assert.equal(storageConfig({ SUPABASE_URL: "http://example.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "secret" }), null);
  assert.deepEqual(storageConfig({
    SUPABASE_URL: "https://example.supabase.co/",
    SUPABASE_SERVICE_ROLE_KEY: "private-key"
  }), {
    url: "https://example.supabase.co",
    serviceKey: "private-key",
    bucket: "jt-cloud-private"
  });
});

test("JT Cloud uses the Supabase Storage object API for upload, download and delete", async t => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    if (init.method === "GET") return new Response("hello", { status: 200, headers: { "content-type": "text/plain" } });
    if (init.method === "DELETE") return new Response(null, { status: 200 });
    return new Response(JSON.stringify({ Key: "users/u1/file1" }), { status: 200, headers: { etag: '"abc123"' } });
  };
  t.after(() => { globalThis.fetch = originalFetch; });

  const env = {
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "server-only-secret"
  };
  const key = "users/u1/file one.txt";
  assert.equal(await putCloudObject(env, key, "hello", "text/plain"), '"abc123"');
  const downloaded = await getCloudObject(env, key);
  assert.equal(await downloaded.text(), "hello");
  await deleteCloudObject(env, key);

  assert.equal(calls.length, 3);
  assert.equal(calls[0].url, "https://example.supabase.co/storage/v1/object/jt-cloud-private/users/u1/file%20one.txt");
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.headers.authorization, "Bearer server-only-secret");
  assert.equal(calls[1].init.method, "GET");
  assert.equal(calls[2].url, "https://example.supabase.co/storage/v1/object/jt-cloud-private");
  assert.equal(calls[2].init.method, "DELETE");
  assert.deepEqual(JSON.parse(calls[2].init.body), { prefixes: [key] });
});

test("Supabase adapter keeps uploads bounded for the initial free-tier integration", () => {
  assert.equal(MAX_FILE_BYTES, 25 * 1024 * 1024);
  assert.equal(DEFAULT_QUOTA_BYTES, 100 * 1024 * 1024);
});
