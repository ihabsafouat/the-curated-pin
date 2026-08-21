import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [pkg, migration, bot, login, register, forgot, reset, change, analytics, experience, config, env, privacy, feedback, data, dbClient, robots] = await Promise.all([
  read("package.json"), read("postgres/migrations/0006_priority5_security_experience.sql"), read("app/security/bot.ts"), read("app/api/auth/login/route.ts"), read("app/api/auth/register/route.ts"), read("app/api/auth/forgot-password/route.ts"), read("app/api/auth/reset-password/route.ts"), read("app/api/auth/change-password/route.ts"), read("app/components/AnalyticsConsent.tsx"), read("app/components/ExperienceLayer.tsx"), read("next.config.ts"), read(".env.example"), read("app/privacy/page.tsx"), read("app/components/ReaderFeedback.tsx"), read("db/data.ts"), read("db/client.ts"), read("app/robots.ts")
]);

test("Priority 5 uses one light animation stack and smooth scrolling", () => {
  assert.match(pkg, /"animejs": "4\.5\.0"/);
  assert.match(pkg, /"lenis": "1\.3\.26"/);
  assert.match(experience, /prefers-reduced-motion/);
  assert.match(experience, /new Lenis/);
  assert.match(experience, /animate\(/);
  assert.doesNotMatch(pkg, /three|framer-motion|motion\/react/);
});

test("authentication hardening covers lockout, generic recovery and session reset", () => {
  assert.match(login, /registerLoginFailure/);
  assert.match(login, /Invalid email or password/);
  assert.match(register, /GENERIC_SUCCESS/);
  assert.match(register, /status: 202/);
  assert.match(forgot, /If that email is registered/);
  assert.match(forgot, /checkRateLimitKey/);
  assert.match(reset, /consumePasswordResetToken/);
  assert.match(change, /changeUserPassword/);
  assert.match(migration, /locked_until/);
  assert.match(migration, /password_reset_tokens/);
});

test("Turnstile validates server-side and fails closed in production", () => {
  assert.match(bot, /siteverify/);
  assert.match(bot, /return !production/);
  assert.match(bot, /result\.success !== true/);
  assert.match(env, /TURNSTILE_SECRET_KEY/);
});

test("analytics and heatmaps remain behind consent", () => {
  assert.match(analytics, /Accept analytics/);
  assert.match(analytics, /loadGA4/);
  assert.match(analytics, /loadClarity/);
  assert.match(analytics, /analytics_storage/);
  assert.match(privacy, /Microsoft Clarity/);
  assert.match(migration, /utm_medium/);
});

test("reader reviews are moderation-first", () => {
  assert.match(migration, /reader_feedback/);
  assert.match(feedback, /consentPublish/);
  assert.match(data, /createReaderFeedback/);
  assert.match(data, /getReaderFeedback/);
});

test("database defense in depth includes RLS and per-user query context", () => {
  assert.match(migration, /ENABLE ROW LEVEL SECURITY/);
  assert.match(migration, /FORCE ROW LEVEL SECURITY/);
  assert.match(migration, /current_setting\('app\.user_id'/);
  assert.match(dbClient, /set_config\('app\.user_id'/);
});

test("security headers, private studio path and crawl controls remain present", async () => {
  assert.match(config, /Strict-Transport-Security/);
  assert.match(config, /Content-Security-Policy/);
  assert.match(config, /Cross-Origin-Resource-Policy/);
  assert.match(config, /source: "\/studio\/:path\*"/);
  assert.match(robots, /"\/studio\/"/);
  await stat(new URL("../app/studio", import.meta.url));
  await assert.rejects(() => stat(new URL("../app/admin", import.meta.url)));
});
