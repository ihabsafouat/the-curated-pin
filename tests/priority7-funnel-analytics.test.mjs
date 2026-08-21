import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const migration = read("postgres/migrations/0008_funnel_conversion_analytics.sql");
const analytics = read("db/analytics.ts");
const client = read("app/components/analytics-client.ts");
const tracker = read("app/components/EngagementTracker.tsx");
const newsletter = read("app/api/newsletter/route.ts");
const blocks = read("app/components/ArticleBlocks.tsx");
const studio = read("app/studio/analytics/page.tsx");
const header = read("app/studio/components/AdminHeader.tsx");
const emailTracking = read("app/security/email-tracking.ts");
const emailDelivery = read("app/security/audience-delivery.ts");
const webhook = read("app/api/webhooks/conversion/route.ts");
const env = read(".env.example");

test("Priority 7 adds first-party funnel event dimensions and idempotent event IDs", () => {
  assert.match(migration, /event_id UUID/);
  assert.match(migration, /session_id UUID/);
  assert.match(migration, /lead_magnet_slug/);
  assert.match(migration, /product_slug/);
  assert.match(migration, /metadata_json JSONB/);
  assert.match(analytics, /recordAnalyticsEvent/);
  assert.match(analytics, /Duplicate event IDs are deliberately idempotent/);
});

test("client attribution is consent-aware and GA4 receives the same business event names", () => {
  assert.match(client, /tcp:analytics-consent/);
  assert.match(client, /sessionStorage/);
  assert.match(client, /utm_source/);
  assert.match(client, /window\.gtag\("event", event\.eventType/);
  assert.match(tracker, /usePathname/);
  assert.match(tracker, /content_engaged/);
  assert.match(tracker, /cta_impression/);
  assert.match(tracker, /form_start/);
});

test("newsletter signup is a trusted server event tied to lead magnet and subscriber", () => {
  assert.match(newsletter, /recordAnalyticsEvent/);
  assert.match(newsletter, /eventType:"newsletter_signup"/);
  assert.match(newsletter, /subscriberId:result\.subscriber\.id/);
  assert.match(read("app/api/track/route.ts"), /serverOnlyEvents/);
});

test("affiliate, product, lead magnet and semantic internal links are tracked separately", () => {
  assert.match(blocks, /data-analytics-kind="affiliate"/);
  assert.match(blocks, /data-analytics-kind="product"/);
  assert.match(blocks, /data-analytics-kind="lead_magnet"/);
  assert.match(blocks, /data-analytics-kind="internal"/);
  assert.match(tracker, /affiliate_click/);
  assert.match(tracker, /product_click/);
  assert.match(tracker, /internal_link_click/);
});

test("email sequence CTAs use signed same-site redirect tracking", () => {
  assert.match(emailTracking, /email-click\./);
  assert.match(emailTracking, /safeTarget/);
  assert.match(emailDelivery, /createEmailTrackingToken/);
  assert.equal(fs.existsSync(new URL("../app/go/email/route.ts", import.meta.url)), true);
});

test("commerce conversions are server-to-server, deduplicated and visible in Studio", () => {
  assert.match(migration, /CREATE TABLE IF NOT EXISTS commerce_conversions/);
  assert.match(migration, /UNIQUE\(provider, provider_event_id\)/);
  assert.match(webhook, /x-conversion-secret/);
  assert.match(webhook, /timingSafeEqual/);
  assert.match(env, /CONVERSION_WEBHOOK_SECRET/);
  assert.match(studio, /FUNNEL ANALYTICS/);
  assert.match(studio, /Confirmed purchases/);
  assert.match(header, /\/studio\/analytics/);
});
