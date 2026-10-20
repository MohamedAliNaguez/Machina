CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  language TEXT NOT NULL CHECK(language IN ('tr', 'en')),
  machineId TEXT NOT NULL DEFAULT '',
  payload_hash TEXT NOT NULL,
  notification_status TEXT NOT NULL DEFAULT 'pending' CHECK(notification_status IN ('preview', 'pending', 'sending', 'sent', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at INTEGER NOT NULL,
  lease_until INTEGER,
  created_at INTEGER NOT NULL,
  sent_at INTEGER
);
CREATE INDEX IF NOT EXISTS enquiries_outbox ON enquiries(notification_status, next_attempt_at);
CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires_at INTEGER NOT NULL);
