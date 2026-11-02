import assert from "node:assert/strict";
import { onRequestPost, onRequestGet } from "../functions/api/jeff.js";

async function invoke(body, options = {}) {
  const { origin = "https://jt.example", env = {}, contentType = "application/json" } = options;
  return onRequestPost({
    request: new Request("https://jt.example/api/jeff", {
      method: "POST",
      headers: { "content-type": contentType, origin },
      body: typeof body === "string" ? body : JSON.stringify(body)
    }),
    env
  });
}

// Disabled service must return the documented 503 response.
let response = await invoke({ message: "hello" });
assert.equal(response.status, 503);
assert.equal((await response.json()).error, "service_disabled");

// Cross-origin requests are rejected before provider access.
response = await invoke({ message: "hello" }, { origin: "https://evil.example", env: { JEFF_API_ENABLED: "true" } });
assert.equal(response.status, 403);

// Invalid content type is rejected.
response = await invoke({ message: "hello" }, { env: { JEFF_API_ENABLED: "true" }, contentType: "text/plain" });
assert.equal(response.status, 415);

// Invalid JSON and missing messages are rejected when enabled.
response = await invoke("{", { env: { JEFF_API_ENABLED: "true" } });
assert.equal(response.status, 400);
assert.equal((await response.json()).error, "invalid_json");

response = await invoke({}, { env: { JEFF_API_ENABLED: "true" } });
assert.equal(response.status, 400);
assert.equal((await response.json()).error, "message_required");

// Enabled without an OpenRouter key must return a configuration error.
response = await invoke({ message: "hello" }, { env: { JEFF_API_ENABLED: "true" } });
assert.equal(response.status, 503);
assert.equal((await response.json()).error, "provider_not_configured");

// GET health reports the two bindings independently.
response = await onRequestGet({ env: { JEFF_API_ENABLED: "true", OPENROUTER_API_KEY: "test-key" } });
assert.equal(response.status, 200);
const health = await response.json();
assert.equal(health.enabled, true);
assert.equal(health.configured, true);
assert.equal(health.ready, true);

console.log("Jeff AI Pages Function tests passed.");
