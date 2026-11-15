-- JT Cloud remote object metadata and per-user quota.
-- Apply to the existing D1 database bound as JT_AUTH_DB before enabling remote storage.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS cloud_storage_usage (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  used_bytes INTEGER NOT NULL DEFAULT 0 CHECK(used_bytes >= 0),
  quota_bytes INTEGER NOT NULL DEFAULT 1073741824 CHECK(quota_bytes > 0),
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cloud_files (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  folder_id TEXT,
  object_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  size_bytes INTEGER NOT NULL CHECK(size_bytes > 0),
  etag TEXT,
  status TEXT NOT NULL DEFAULT 'ready' CHECK(status IN ('uploading','ready','deleting')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cloud_files_user_created
  ON cloud_files(user_id, status, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_cloud_files_user_name
  ON cloud_files(user_id, name);
