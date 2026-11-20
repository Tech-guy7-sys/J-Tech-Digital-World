-- Apply once to the same D1 database bound as JT_AUTH_DB.
-- Existing users and their profile/preferences rows are preserved.
CREATE TABLE IF NOT EXISTS jt_auth_identities (
  auth_user_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL COLLATE NOCASE,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_jt_auth_identities_email ON jt_auth_identities(email);
