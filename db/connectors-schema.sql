-- JT Connectors Hub schema migration
-- Run this once in the existing Cloudflare D1 database (JT_AUTH_DB).
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS connector_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_account_id TEXT,
  display_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','connected','error','revoked')),
  granted_scopes TEXT NOT NULL DEFAULT '',
  encrypted_access_token TEXT,
  encrypted_refresh_token TEXT,
  token_expires_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(user_id, provider, provider_account_id)
);
CREATE INDEX IF NOT EXISTS idx_connector_accounts_user ON connector_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_connector_accounts_provider ON connector_accounts(provider);

CREATE TABLE IF NOT EXISTS connector_oauth_states (
  state_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_connector_oauth_states_expiry ON connector_oauth_states(expires_at);

CREATE TABLE IF NOT EXISTS connector_audit_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  connector_account_id TEXT REFERENCES connector_accounts(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  outcome TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_connector_audit_user_time ON connector_audit_events(user_id, created_at);
