ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_failed_login_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS password_reset_tokens_user_idx ON password_reset_tokens(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS password_reset_tokens_expiry_idx ON password_reset_tokens(expires_at);

ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(120);
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS utm_content VARCHAR(160);
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS utm_term VARCHAR(160);

CREATE TABLE IF NOT EXISTS reader_feedback (
  id UUID PRIMARY KEY,
  article_id BIGINT REFERENCES articles(id) ON DELETE CASCADE,
  article_slug VARCHAR(120),
  rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
  helpful BOOLEAN,
  message VARCHAR(1200) NOT NULL DEFAULT '',
  display_name VARCHAR(80) NOT NULL DEFAULT '',
  consent_publish BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  ip_hash CHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS reader_feedback_article_idx ON reader_feedback(article_slug, created_at DESC);
CREATE INDEX IF NOT EXISTS reader_feedback_status_idx ON reader_feedback(status, created_at DESC);

-- Defense in depth for reader-owned saves. The application sets app.user_id
-- inside a transaction before querying this table.
ALTER TABLE saved_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_articles FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS saved_articles_reader_isolation ON saved_articles;
CREATE POLICY saved_articles_reader_isolation ON saved_articles
  USING (user_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (user_id = NULLIF(current_setting('app.user_id', true), '')::uuid);
