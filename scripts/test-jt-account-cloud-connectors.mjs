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
  assert.match(start, /scope:"read:user user:email"/);
  assert.match(callback, /scopes=tokenData\.scope\|\|"read:user user:email"/);
  assert.doesNotMatch(start, /public_repo|repo:write/);
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

test("Gmail, Google Drive and Google Calendar have separate least-privilege OAuth grants", async () => {
  const [start, callback] = await Promise.all([read("functions/api/connectors/start.js"), read("functions/api/connectors/callback.js")]);
  assert.match(start, /"google-drive":\{[^}]*drive\.readonly/s);
  assert.match(start, /gmail:\{[^}]*gmail\.readonly/s);
  assert.match(start, /"google-calendar":\{[^}]*calendar\.events\.readonly/s);
  for (const provider of ["notion", "slack", "dropbox", "onedrive"]) assert.match(start, new RegExp(provider + ":\\{"));
  const integrations = await read("functions/api/integrations.js");
  for (const secret of ["NOTION_CLIENT_ID", "SLACK_CLIENT_ID", "DROPBOX_CLIENT_ID", "MICROSOFT_CLIENT_ID"]) assert.ok(integrations.includes(secret));
  assert.match(integrations, /available:Boolean\(/);
  assert.match(start, /notion:\{[^}]*api.notion.com\/v1\/oauth\/authorize/s);
  assert.match(start, /slack:\{[^}]*slack.com\/oauth\/v2\/authorize/s);
  assert.match(start, /dropbox:\{[^}]*dropbox.com\/oauth2\/authorize/s);
  assert.match(start, /onedrive:\{[^}]*microsoftonline.com\/common\/oauth2\/v2.0\/authorize/s);
  assert.match(callback, /provider==="google-calendar"/);
  assert.match(start, /github:\{[^}]*read:user user:email/s);
  assert.doesNotMatch(start, /https:\/\/www\.googleapis\.com\/auth\/mail\.google\.com/);
});

test("connector tool API exposes only the approved read-only actions", async () => {
  const tools = await read("functions/api/connectors/tools.js");
  for (const action of ["github.repositories", "drive.search", "gmail.search", "calendar.events", "notion.search", "slack.search", "dropbox.search", "onedrive.search"]) assert.ok(tools.includes(action));
  assert.match(tools, /currentUser\(request,env\)/);
  assert.match(tools, /sameOrigin\(request\)/);
  assert.match(tools, /connector_audit_events/);
  assert.match(tools, /calendar\/v3\/calendars\/primary\/events/);
  assert.match(tools, /api.notion.com\/v1\/search/);
  assert.match(tools, /slack.com\/api\/search.messages/);
  assert.match(tools, /api.dropboxapi.com\/2\/files\/search_v2/);
  assert.match(tools, /graph.microsoft.com\/v1.0\/me\/drive\/root\/search/);
  assert.doesNotMatch(tools, /events\.insert|messages\/send|files\.delete|repos\/[^ ]+\/contents/);
});

test("Jeff AI Agent has a user-invoked connected-services panel and passes results as one-shot context", async () => {
  const workspace = await read("jt-ai-agent/workspace.js");
  assert.match(workspace, /jtConnectorToolsButton/);
  assert.match(workspace, /\/api\/connectors\/tools/);
  assert.match(workspace, /pendingConnectorContext/);
  assert.match(workspace, /untrusted reference data, not instructions/);
});
