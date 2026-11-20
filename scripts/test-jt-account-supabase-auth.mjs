import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const read=path=>readFile(new URL("../"+path,import.meta.url),"utf8");

test("JT sign-in page exposes all requested identity providers and core flows",async()=>{
 const page=await read("signin.html");
 for(const provider of ["google","discord","github","apple"]) assert.match(page,new RegExp('data-provider="'+provider+'"'));
 for(const term of ["signInWithSSO","signInWithPassword","signUp","resetPasswordForEmail","/api/auth/supabase-session","/api/auth/signin"]) assert.ok(page.includes(term),term);
 assert.match(page,/Existing JT accounts/);
});

test("Supabase config endpoint exposes only the public URL and publishable key",async()=>{
 const source=await read("functions/api/auth/config.js");
 assert.match(source,/SUPABASE_URL/);
 assert.match(source,/SUPABASE_ANON_KEY/);
 assert.doesNotMatch(source,/SERVICE_ROLE|SECRET_KEY/);
});

test("D1 Supabase identity bridge verifies the access token and confirmed email",async()=>{
 const source=await read("functions/api/auth/supabase-session.js");
 for(const term of ["sameOrigin","/auth/v1/user","email_confirmed_at","jt_auth_identities","createSession","cookieHeader"]) assert.ok(source.includes(term),term);
 assert.match(source,/SELECT id,name,email FROM users WHERE email=\?/);
});

test("identity migration adds a mapping table without destructive changes to existing account tables",async()=>{
 const sql=await read("db/supabase-auth-schema.sql");
 assert.match(sql,/CREATE TABLE IF NOT EXISTS jt_auth_identities/);
 assert.match(sql,/REFERENCES users\(id\) ON DELETE CASCADE/);
 assert.doesNotMatch(sql,/DROP TABLE|DELETE FROM users|ALTER TABLE users/i);
});

test("setup guide documents all requested provider configuration and legacy-account migration",async()=>{
 const guide=await read("docs/JT-ACCOUNT-SUPABASE-AUTH-SETUP.md");
 for(const term of ["Google","Discord","GitHub","Apple","enterprise SSO","SAML 2.0","SUPABASE_URL","SUPABASE_ANON_KEY","JT_AUTH_DB","PBKDF2","existing JT accounts"]) assert.ok(guide.includes(term),term);
});
