import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const migration = read("postgres/migrations/0007_contextual_email_funnel.sql");
const seed = read("scripts/seed-audience.mjs");
const audience = read("db/audience.ts");
const newsletter = read("app/components/NewsletterSignup.tsx");
const newsletterApi = read("app/api/newsletter/route.ts");
const article = read("app/article/[slug]/page.tsx");
const category = read("app/category/[...path]/page.tsx");
const email = read("app/security/email.ts");
const preferences = read("app/security/email-preferences.ts");
const scheduled = read("netlify/functions/email-sequences.mts");
const netlify = read("netlify.toml");
const studio = read("app/studio/audience/page.tsx");

 test("priority 6 stores subscriber intent, consent and reusable audience segments", () => {
  assert.match(migration, /CREATE TABLE IF NOT EXISTS audience_interests/);
  assert.match(migration, /newsletter_subscriber_interests/);
  assert.match(migration, /consent_at/);
  assert.match(migration, /utm_campaign/);
  assert.match(seed, /"teen-birthdays"/);
  assert.match(seed, /"crochet"[^\n]+"inactive"/);
});

test("contextual lead magnets are targeted by article/category instead of a single generic popup", () => {
  assert.match(migration, /CREATE TABLE IF NOT EXISTS lead_magnets/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS lead_magnet_targets/);
  assert.match(audience, /getLeadMagnetForContext/);
  assert.match(article, /ContextualLeadMagnet/);
  assert.match(category, /ContextualLeadMagnet/);
  assert.match(newsletter, /leadMagnetSlug/);
  assert.match(newsletterApi, /deliverLeadMagnet/);
});

test("birthday and teen lead magnets ship with printable browser resources", () => {
  assert.match(seed, /birthday-party-quick-start-kit/);
  assert.match(seed, /teen-birthday-party-planning-kit/);
  assert.match(seed, /resource_json/);
  assert.equal(fs.existsSync(new URL("../app/free/[slug]/print/page.tsx", import.meta.url)), true);
});

test("audience email has durable preference and one-click unsubscribe support", () => {
  assert.match(email, /List-Unsubscribe/);
  assert.match(email, /List-Unsubscribe-Post/);
  assert.match(preferences, /do not expire/);
  assert.equal(fs.existsSync(new URL("../app/email/unsubscribe/route.ts", import.meta.url)), true);
  assert.equal(fs.existsSync(new URL("../app/email/preferences/page.tsx", import.meta.url)), true);
});

test("nurture sequence dispatch is scheduled and can be paused from Studio", () => {
  assert.match(migration, /email_sequences/);
  assert.match(migration, /subscriber_sequence_enrollments/);
  assert.match(scheduled, /dispatchDueAudienceEmails/);
  assert.match(netlify, /schedule\s*=\s*"@hourly"/);
  assert.match(studio, /Welcome sequences/);
  assert.match(studio, /status/);
});
