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

let response = await invoke({ message: "hello" });
assert.equal(response.status, 503);
assert.equal((await response.json()).error, "service_disabled");

response = await invoke({ message: "hello" }, {
  env: { JEFF_API_ENABLED: "false", OPENROUTER_API_KEY: "test-key" }
});
assert.equal(response.status, 503);

response = await invoke({ message: "hello" }, {
  origin: "https://evil.example",
  env: { OPENROUTER_API_KEY: "test-key" }
});
assert.equal(response.status, 403);

response = await invoke({ message: "hello" }, {
  env: { OPENROUTER_API_KEY: "test-key" },
  contentType: "text/plain"
});
assert.equal(response.status, 415);

response = await invoke("{", { env: { OPENROUTER_API_KEY: "test-key" } });
assert.equal(response.status, 400);
assert.equal((await response.json()).error, "invalid_json");

response = await invoke({}, { env: { OPENROUTER_API_KEY: "test-key" } });
assert.equal(response.status, 400);
assert.equal((await response.json()).error, "message_required");

response = await invoke({ message: "hello" }, { env: { JEFF_API_ENABLED: "true" } });
assert.equal(response.status, 503);
assert.equal((await response.json()).error, "provider_not_configured");

response = await invoke({ message: "hello", model: "claude-sonnet-4-20250514" }, {
  env: { JEFF_API_ENABLED: "true", ANTHROPIC_API_KEY: "must-not-be-used" }
});
assert.equal(response.status, 503); // Paid-only legacy secret cannot enable the gateway.
assert.equal((await response.json()).error, "service_disabled");

response = await invoke({ message: "hello", model: "claude-sonnet-4-20250514" }, {
  env: { JEFF_API_ENABLED: "true", OPENROUTER_API_KEY: "test-key" }
});
assert.equal(response.status, 400);
assert.equal((await response.json()).error, "paid_provider_not_allowed");

response = await invoke({ message: "hello", model: "not-approved" }, {
  env: { JEFF_API_ENABLED: "true", OPENROUTER_API_KEY: "test-key" }
});
assert.equal(response.status, 400);
assert.equal((await response.json()).error, "model_not_allowed");

response = await onRequestGet({ env: { OPENROUTER_API_KEY: "test-key" } });
assert.equal(response.status, 200);
let health = await response.json();
assert.equal(health.ready, true);
assert.equal(health.costPolicy, "free-tier-only");
assert.equal(health.paidFallback, false);
assert.equal(health.providers.some(p => p.id === "anthropic"), false);

response = await onRequestGet({ env: { JEFF_API_ENABLED: "false", OPENROUTER_API_KEY: "test-key" } });
assert.equal(response.status, 503);
health = await response.json();
assert.equal(health.enabled, false);
assert.equal(health.configured, true);
assert.equal(health.ready, false);

console.log("Jeff AI free-only gateway tests passed.");
