-- Priority 10: production-readiness indexes and operational guardrails.
-- Keep this migration additive and safe to re-run.

-- Common public article lookup: published slug + category/status navigation.
CREATE INDEX IF NOT EXISTS articles_published_slug_idx
  ON articles(slug)
  WHERE status = 'published';
CREATE INDEX IF NOT EXISTS articles_category_published_idx
  ON articles(category_id, published_at DESC)
  WHERE status = 'published';

-- Subscriber operations: exports, active-list counts, suppression checks and source attribution.
CREATE INDEX IF NOT EXISTS newsletter_subscribers_status_created_idx
  ON newsletter_subscribers(status, created_at DESC);
CREATE INDEX IF NOT EXISTS newsletter_subscribers_interest_status_idx
  ON newsletter_subscribers(primary_interest, status)
  WHERE primary_interest IS NOT NULL;

-- Authentication/session cleanup and lockout checks.
CREATE INDEX IF NOT EXISTS refresh_sessions_expiry_active_idx
  ON refresh_sessions(expires_at)
  WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS users_locked_until_idx
  ON users(locked_until)
  WHERE locked_until IS NOT NULL;

-- Operational cleanup tables.
CREATE INDEX IF NOT EXISTS password_reset_tokens_cleanup_idx
  ON password_reset_tokens(expires_at, used_at);
CREATE INDEX IF NOT EXISTS media_upload_authorizations_cleanup_idx
  ON media_upload_authorizations(expires_at, consumed_at);

-- Feedback moderation and recent security/audit review are frequent Studio operations.
CREATE INDEX IF NOT EXISTS reader_feedback_status_article_idx
  ON reader_feedback(status, article_slug, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_action_created_idx
  ON audit_logs(action, created_at DESC);

-- Keep planner statistics healthy after substantial migrations/imports.
ANALYZE articles;
ANALYZE categories;
ANALYZE analytics_events;
ANALYZE newsletter_subscribers;
