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
assert.equal(response.status, 503); // An Anthropic-only secret cannot enable this free-only gateway.
assert.equal((await response.json()).error, "provider_not_configured");

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

// Mock a successful free OpenRouter response. This tests adapter routing, not live provider access.
const originalFetch = globalThis.fetch;
try {
  let calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), body: JSON.parse(init.body) });
    return new Response(JSON.stringify({ choices: [{ message: { content: "Free route works." } }] }), {
      status: 200, headers: { "content-type": "application/json" }
    });
  };
  response = await invoke({ message: "test auto route" }, {
    env: { JEFF_API_ENABLED: "true", OPENROUTER_API_KEY: "test-key" }
  });
  let result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.provider, "OpenRouter");
  assert.equal(result.profile, "JT AI Core v1 · Free");
  assert.equal(calls[0].body.model, "openrouter/free");

  // Explicit Groq selection uses only the Groq API and the configured free-tier model.
  calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), body: JSON.parse(init.body) });
    return new Response(JSON.stringify({ choices: [{ message: { content: "Groq free route works." } }] }), {
      status: 200, headers: { "content-type": "application/json" }
    });
  };
  response = await invoke({ message: "test Groq", model: "groq" }, {
    env: { JEFF_API_ENABLED: "true", GROQ_API_KEY: "test-groq-key", GROQ_FREE_TIER_CONFIRMED: "true" }
  });
  result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.provider, "Groq");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.groq.com/openai/v1/chat/completions");
  assert.equal(calls[0].body.model, "openai/gpt-oss-20b");

  // Gemini 2.5 Flash-Lite uses the same free-tier gate and never triggers a paid fallback.
  calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), body: JSON.parse(init.body) });
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "Flash-Lite works." }] } }] }), { status: 200 });
  };
  response = await invoke({ message: "test Gemini Flash-Lite", model: "gemini-2.5-flash-lite" }, {
    env: { JEFF_API_ENABLED: "true", GEMINI_API_KEY: "test-gemini-key", GEMINI_FREE_TIER_CONFIRMED: "true" }
  });
  result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.model, "gemini-2.5-flash-lite");
  assert.equal(calls.length, 1);
  assert.ok(calls[0].url.includes("gemini-2.5-flash-lite"));

  // Gemini quota errors remain errors; they do not trigger another provider or a paid fallback.
  calls = [];
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    return new Response(JSON.stringify({ error: { message: "quota exceeded" } }), { status: 429 });
  };
  response = await invoke({ message: "test Gemini", model: "gemini-2.5-flash" }, {
    env: { JEFF_API_ENABLED: "true", GEMINI_API_KEY: "test-gemini-key", GEMINI_FREE_TIER_CONFIRMED: "true" }
  });
  result = await response.json();
  assert.equal(response.status, 429);
  assert.equal(result.error, "free_quota_exhausted");
  assert.equal(calls.length, 1);
  assert.ok(calls[0].includes("gemini-2.5-flash"));
} finally {
  globalThis.fetch = originalFetch;
}

// A provider key alone is not enough: Gemini must be explicitly confirmed as a free-tier project.
response = await invoke({ message: "test Gemini without free confirmation", model: "gemini-2.5-flash" }, {
  env: { JEFF_API_ENABLED: "true", GEMINI_API_KEY: "test-gemini-key" }
});
assert.equal(response.status, 503);
assert.equal((await response.json()).error, "provider_not_configured");

console.log("Jeff AI free-only gateway tests passed (provider calls mocked; no live provider was tested).");
