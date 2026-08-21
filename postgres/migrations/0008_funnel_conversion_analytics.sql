ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS event_id UUID;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS session_id UUID;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS subscriber_id BIGINT REFERENCES newsletter_subscribers(id) ON DELETE SET NULL;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS page_path VARCHAR(500);
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS category_path VARCHAR(240);
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS lead_magnet_slug VARCHAR(120);
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS product_slug VARCHAR(160);
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS merchant VARCHAR(120);
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS link_kind VARCHAR(40);
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS placement VARCHAR(80);
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS referrer_host VARCHAR(180);
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS utm_source VARCHAR(120);
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(160);
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS engagement_seconds INTEGER;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS scroll_depth SMALLINT CHECK (scroll_depth IS NULL OR (scroll_depth BETWEEN 0 AND 100));
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS event_value NUMERIC(12,2);
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS currency CHAR(3);
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS analytics_event_id_unique_idx ON analytics_events(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS analytics_session_created_idx ON analytics_events(session_id, created_at) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS analytics_article_event_idx ON analytics_events(article_slug, event_type, created_at DESC) WHERE article_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS analytics_lead_event_idx ON analytics_events(lead_magnet_slug, event_type, created_at DESC) WHERE lead_magnet_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS analytics_product_event_idx ON analytics_events(product_slug, event_type, created_at DESC) WHERE product_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS analytics_campaign_idx ON analytics_events(utm_source, utm_medium, utm_campaign, created_at DESC);

CREATE TABLE IF NOT EXISTS commerce_conversions (
  id UUID PRIMARY KEY,
  provider VARCHAR(40) NOT NULL,
  provider_event_id VARCHAR(180) NOT NULL,
  product_slug VARCHAR(160) NOT NULL,
  article_slug VARCHAR(120),
  session_id UUID,
  subscriber_id BIGINT REFERENCES newsletter_subscribers(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  utm_source VARCHAR(120),
  utm_medium VARCHAR(120),
  utm_campaign VARCHAR(160),
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, provider_event_id)
);
CREATE INDEX IF NOT EXISTS commerce_product_idx ON commerce_conversions(product_slug, occurred_at DESC);
CREATE INDEX IF NOT EXISTS commerce_article_idx ON commerce_conversions(article_slug, occurred_at DESC) WHERE article_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS commerce_campaign_idx ON commerce_conversions(utm_source, utm_medium, utm_campaign, occurred_at DESC);
