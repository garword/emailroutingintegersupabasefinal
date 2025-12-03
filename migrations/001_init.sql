-- Cloudflare Config Table
CREATE TABLE IF NOT EXISTS cloudflare_config (
  id INTEGER PRIMARY KEY,
  api_token TEXT NOT NULL,
  account_id TEXT NOT NULL,
  d1_database TEXT NOT NULL,
  worker_api TEXT NOT NULL,
  kv_storage TEXT NOT NULL,
  destination_emails TEXT DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Email Routings Table
CREATE TABLE IF NOT EXISTS email_routings (
  id TEXT PRIMARY KEY,
  zone_id TEXT NOT NULL,
  zone_name TEXT NOT NULL,
  alias_part TEXT NOT NULL,
  full_email TEXT NOT NULL,
  destination TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  rule_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_routings_zone_id ON email_routings(zone_id);
CREATE INDEX IF NOT EXISTS idx_email_routings_created_at ON email_routings(created_at);
CREATE INDEX IF NOT EXISTS idx_email_routings_full_email ON email_routings(full_email);

-- Sample data (optional)
INSERT OR IGNORE INTO cloudflare_config (id, api_token, account_id, d1_database, worker_api, kv_storage, destination_emails)
VALUES (1, 'your-api-token', 'your-account-id', 'your-db-id', 'your-worker-api', 'your-kv-id', '["manulsinul99@gmail.com"]');
