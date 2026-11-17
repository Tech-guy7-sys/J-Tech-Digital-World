import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL("../" + path, import.meta.url), "utf8");

test("signup UI enforces the same 10-character minimum as the account API", async () => {
  const [page, api] = await Promise.all([read("signin.html"), read("functions/api/auth/signup.js")]);
  assert.match(page, /id="signupPassword"[^>]*minlength="10"/);
  assert.match(api, /validPassword\(password\)/);
  assert.match(await read("functions/api/_auth.js"), /v\.length>=10&&v\.length<=128/);
});

test("GitHub OAuth does not claim unrequested repository scopes", async () => {
  const [start, callback] = await Promise.all([
    read("functions/api/connectors/start.js"),
    read("functions/api/connectors/callback.js")
  ]);
  assert.match(start, /scope:"read:user user:email"/);
  assert.match(callback, /scopes=tokenData\.scope\|\|"read:user user:email"/);
  assert.doesNotMatch(callback, /scopes=tokenData\.scope\|\|"read:user user:email repo"/);
});

test("activation guide documents actual prerequisites and limitations", async () => {
  const guide = await read("docs/JT-ACCOUNT-CLOUD-CONNECTORS-ACTIVATION.md");
  for (const term of ["JT_AUTH_DB", "JT_CLOUD_BUCKET", "JT_CONNECTOR_ENCRYPTION_KEY", "db/auth-schema.sql", "db/cloud-schema.sql", "db/connectors-schema.sql", "25 MiB", "does not yet include provider token refresh", "email verification"]) {
    assert.ok(guide.includes(term), "Missing setup detail: " + term);
  }
});
