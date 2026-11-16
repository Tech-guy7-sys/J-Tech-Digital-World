import assert from "node:assert/strict";
import { safeFilename, uploadMetadata, limitUploadStream, encodeCursor, decodeCursor, sameOriginMutation } from "../functions/api/cloud/_shared.js";
import { onRequestGet, onRequestPost } from "../functions/api/cloud/files.js";
import { onRequestGet as downloadFile, onRequestDelete } from "../functions/api/cloud/files/[id].js";

assert.equal(safeFilename("../../notes.txt"), "notes.txt");
assert.equal(safeFilename(".."), "");
assert.equal(safeFilename("report\\draft.txt"), "draft.txt");
assert.deepEqual(decodeCursor(encodeCursor(1794000000, "123e4567-e89b-12d3-a456-426614174000")), {
  createdAt: 1794000000, id: "123e4567-e89b-12d3-a456-426614174000"
});
assert.equal(decodeCursor("not-a-valid-cursor"), null);

const uploadRequest = new Request("https://jt.example/api/cloud/files", {
  method: "POST", headers: {
    origin: "https://jt.example", "x-jt-file-name": encodeURIComponent("notes.txt"),
    "x-jt-file-size": "5", "content-type": "text/plain"
  }, body: "hello"
});
assert.equal(sameOriginMutation(uploadRequest), true);
assert.deepEqual(uploadMetadata(uploadRequest), { name: "notes.txt", size: 5, mime: "text/plain" });
const encodedNameRequest = new Request("https://jt.example/api/cloud/files", { method: "POST", headers: {
  "x-jt-file-name": encodeURIComponent("project notes.txt"), "x-jt-file-size": "5", "content-type": "text/plain"
}, body: "hello" });
assert.equal(uploadMetadata(encodedNameRequest).name, "project notes.txt");
assert.equal(sameOriginMutation(new Request("https://jt.example/api/cloud/files", { method: "POST" })), false);
assert.equal(await new Response(limitUploadStream(new Blob(["hello"]).stream(), 5)).text(), "hello");
await assert.rejects(() => new Response(limitUploadStream(new Blob(["hello"]).stream(), 4)).text());

const unauthenticatedEnv = { JT_AUTH_DB: { prepare() { return { bind() { return { first: async () => null }; } }; } } };
let response = await onRequestGet({ request: new Request("https://jt.example/api/cloud/files"), env: unauthenticatedEnv });
assert.equal(response.status, 401);
response = await onRequestPost({ request: uploadRequest, env: unauthenticatedEnv });
assert.equal(response.status, 401);

const missingBindingEnv = { JT_AUTH_DB: { prepare() { return { bind() { return { first: async () => ({ id: "user-1", name: "Test", email: "test@example.com" }) }; } }; } } };
const signedRequest = new Request("https://jt.example/api/cloud/files", {
  method: "POST", headers: { origin: "https://jt.example", cookie: "jt_session=test", "x-jt-file-name": "notes.txt", "x-jt-file-size": "5", "content-type": "text/plain" }, body: "hello"
});
response = await onRequestPost({ request: signedRequest, env: missingBindingEnv });
assert.equal(response.status, 503);
response = await downloadFile({ request: new Request("https://jt.example/api/cloud/files/123e4567-e89b-12d3-a456-426614174000", { headers: { cookie: "jt_session=test" } }), env: missingBindingEnv, params: { id: "123e4567-e89b-12d3-a456-426614174000" } });
assert.equal(response.status, 503);

const crossOrigin = new Request("https://jt.example/api/cloud/files", {
  method: "POST", headers: { origin: "https://attacker.example", cookie: "jt_session=test" }, body: "hello"
});
response = await onRequestPost({ request: crossOrigin, env: missingBindingEnv });
assert.equal(response.status, 403);

const sqlSeen = [];
let storedBody = "";
let storedKey = "";
const mockD1 = {
  prepare(sql) {
    sqlSeen.push(sql);
    return {
      bind() {
        return {
          first: async () => sql.includes("FROM sessions") ? { id: "user-1", name: "Test", email: "test@example.com" } : null,
          all: async () => ({ results: [] }),
          run: async () => ({ meta: { changes: 1 } })
        };
      }
    };
  }
};
const mockBucket = {
  async put(key, body) { storedKey = key; storedBody = await new Response(body).text(); return { etag: "mock-etag" }; },
  async delete() {},
  async get() { throw new Error("Ownership test should not reach R2."); }
};
const validUpload = new Request("https://jt.example/api/cloud/files", {
  method: "POST",
  headers: {
    origin: "https://jt.example", cookie: "jt_session=valid-session",
    "x-jt-file-name": encodeURIComponent("notes.txt"), "x-jt-file-size": "5", "content-type": "text/plain"
  },
  body: "hello"
});
response = await onRequestPost({ request: validUpload, env: { JT_AUTH_DB: mockD1, JT_CLOUD_BUCKET: mockBucket } });
assert.equal(response.status, 201);
assert.equal(storedBody, "hello");
assert.ok(storedKey.startsWith("users/user-1/"));
assert.ok(sqlSeen.some(sql => sql.includes("WHERE user_id=? AND used_bytes+?<=quota_bytes")));

const mismatchedUpload = new Request("https://jt.example/api/cloud/files", {
  method: "POST",
  headers: {
    origin: "https://jt.example", cookie: "jt_session=valid-session",
    "x-jt-file-name": "notes.txt", "x-jt-file-size": "4", "content-type": "text/plain"
  },
  body: "hello"
});
response = await onRequestPost({ request: mismatchedUpload, env: { JT_AUTH_DB: mockD1, JT_CLOUD_BUCKET: mockBucket } });
assert.equal(response.status, 502);

let r2Read = false;
const ownershipDb = {
  prepare(sql) {
    return { bind() { return { first: async () => {
      if (sql.includes("FROM sessions")) return { id: "user-1", name: "Test", email: "test@example.com" };
      if (sql.includes("FROM cloud_files")) return null;
      return null;
    } }; } };
  }
};
response = await downloadFile({
  request: new Request("https://jt.example/api/cloud/files/123e4567-e89b-12d3-a456-426614174000", { headers: { cookie: "jt_session=valid-session" } }),
  env: { JT_AUTH_DB: ownershipDb, JT_CLOUD_BUCKET: { async get() { r2Read = true; return null; } } },
  params: { id: "123e4567-e89b-12d3-a456-426614174000" }
});
assert.equal(response.status, 404);
assert.equal(r2Read, false);

console.log("JT Cloud API tests passed: auth gates, validation, streaming size, upload mock and ownership isolation.");
