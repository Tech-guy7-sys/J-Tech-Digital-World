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

test("account, cloud and connector schemas remain present without requiring setup documentation", async () => {
  const [auth, cloud, connectors] = await Promise.all([
    read("db/auth-schema.sql"),
    read("db/cloud-schema.sql"),
    read("db/connectors-schema.sql")
  ]);
  assert.match(auth, /CREATE TABLE IF NOT EXISTS users/);
  assert.match(auth, /CREATE TABLE IF NOT EXISTS sessions/);
  assert.match(cloud, /CREATE TABLE IF NOT EXISTS cloud_files/);
  assert.match(cloud, /CREATE TABLE IF NOT EXISTS cloud_storage_usage/);
  assert.match(connectors, /CREATE TABLE IF NOT EXISTS connector_accounts/);
  assert.match(connectors, /CREATE TABLE IF NOT EXISTS connector_oauth_states/);
});
