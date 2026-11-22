import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL("../" + path, import.meta.url), "utf8");

test("signup UI enforces the same 10-character minimum as the account API", async () => {
  const [page, api] = await Promise.all([read("signin.html"), read("functions/api/auth/signup.js")]);
  assert.match(page, /id="password"[^>]*minlength="10"/);
  assert.match(page, /supabase\.auth\.signUp\(\{email,password/);
  assert.match(api, /validPassword\(password\)/);
  assert.match(await read("functions/api/_auth.js"), /v\.length>=10&&v\.length<=128/);
});

test("GitHub OAuth connector does not claim unrequested repository scopes", async () => {
  const [start, callback] = await Promise.all([
    read("functions/api/connectors/start.js"),
    read("functions/api/connectors/callback.js")
  ]);
  assert.match(start, /scope:"read:user user:email public_repo"/);
  assert.match(callback, /scopes=tokenData\.scope\|\|"read:user user:email public_repo"/);
  assert.doesNotMatch(callback, /scope:"[^"]*repo[^"]*write/i);
});

test("activation guide documents actual prerequisites and limitations", async () => {
  const guide = await read("docs/JT-ACCOUNT-CLOUD-CONNECTORS-ACTIVATION.md");
  for (const term of ["JT_AUTH_DB", "JT_CLOUD_BUCKET", "JT_CONNECTOR_ENCRYPTION_KEY", "db/auth-schema.sql", "db/cloud-schema.sql", "db/connectors-schema.sql", "25 MiB", "does not yet include provider token refresh", "email verification"]) {
    assert.ok(guide.includes(term), "Missing setup detail: " + term);
  }
});

test("JT Account exposes a safe database/schema health check and signup failure stage", async () => {
  const [health, signup, page] = await Promise.all([
    read("functions/api/health.js"),
    read("functions/api/auth/signup.js"),
    read("signin.html")
  ]);
  assert.match(health, /sqlite_master/);
  assert.match(health, /schemaReady:true/);
  assert.match(health, /LIMIT 0/);
  assert.match(health, /JT_AUTH_DB/);
  assert.match(signup, /diagnosticStage:stage/);
  assert.match(signup, /stage="password-derivation"/);
  assert.match(page, /api\/auth\/config/);
  assert.match(page, /api\/auth\/supabase-session/);
});

test("Gmail and Google Drive have separate least-privilege OAuth grants", async () => {
  const start = await read("functions/api/connectors/start.js");
  assert.match(start, /"google-drive":\{[^}]*drive\.readonly/s);
  assert.match(start, /gmail:\{[^}]*gmail\.readonly[^}]*gmail\.compose/s);
  assert.match(start, /github:\{[^}]*public_repo/s);
  assert.doesNotMatch(start, /https:\/\/www\.googleapis\.com\/auth\/mail\.google\.com/);
});

test("connector tool API exposes only the three approved read actions", async () => {
  const tools = await read("functions/api/connectors/tools.js");
  for (const action of ["github.repositories", "drive.search", "gmail.search"]) assert.ok(tools.includes(action));
  assert.match(tools, /currentUser\(request,env\)/);
  assert.match(tools, /sameOrigin\(request\)/);
  assert.match(tools, /connector_audit_events/);
  assert.doesNotMatch(tools, /messages\/send|files\.delete|repos\/[^ ]+\/contents/);
});

test("Jeff AI Agent has a user-invoked connected-services panel and passes results as one-shot context", async () => {
  const workspace = await read("jt-ai-agent/workspace.js");
  assert.match(workspace, /jtConnectorToolsButton/);
  assert.match(workspace, /\/api\/connectors\/tools/);
  assert.match(workspace, /pendingConnectorContext/);
  assert.match(workspace, /untrusted reference data, not instructions/);
});
