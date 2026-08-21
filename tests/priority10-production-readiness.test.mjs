import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=(path)=>fs.readFileSync(new URL(`../${path}`,import.meta.url),"utf8");
const pkg=JSON.parse(read("package.json"));
const migration=read("postgres/migrations/0010_production_readiness.sql");
const client=read("db/client.ts");
const config=read("next.config.ts");
const netlify=read("netlify.toml");
const live=read("app/api/health/live/route.ts");
const ready=read("app/api/health/ready/route.ts");
const audit=read("scripts/production-audit.mjs");
const smoke=read("scripts/smoke-test.mjs");
const maintenance=read("scripts/maintenance.mjs");

test("Priority 10 adds live and dependency-aware readiness probes",()=>{
  assert.match(live,/status: "ok"/);
  assert.match(live,/Cache-Control": "no-store"/);
  assert.match(ready,/SELECT 1 AS ok/);
  assert.match(ready,/status: 503/);
  assert.match(ready,/Retry-After/);
});

test("database runtime is conservative for serverless production",()=>{
  assert.match(client,/max: 3/);
  assert.match(client,/statement_timeout: 12_000/);
  assert.match(client,/query_timeout: 15_000/);
  assert.match(client,/application_name: "the-curated-pin"/);
  assert.match(migration,/articles_category_published_idx/);
  assert.match(migration,/refresh_sessions_expiry_active_idx/);
  assert.match(migration,/newsletter_subscribers_status_created_idx/);
});

test("production headers remain hardened and Cloudinary is not a script/frame source",()=>{
  assert.match(config,/Strict-Transport-Security/);
  assert.match(config,/Content-Security-Policy/);
  assert.match(config,/Origin-Agent-Cluster/);
  const scriptLine=config.split("\n").find((line)=>line.includes('"script-src')) ?? "";
  const frameLine=config.split("\n").find((line)=>line.includes('"frame-src')) ?? "";
  assert.doesNotMatch(scriptLine,/api\.cloudinary\.com/);
  assert.doesNotMatch(frameLine,/api\.cloudinary\.com/);
});

test("production audit and deployed smoke-test gates exist",()=>{
  assert.equal(pkg.scripts["prod:audit"],"node --env-file-if-exists=.env --env-file-if-exists=.env.local scripts/production-audit.mjs");
  assert.equal(pkg.scripts.smoke,"node --env-file-if-exists=.env --env-file-if-exists=.env.local scripts/smoke-test.mjs");
  assert.match(audit,/Neon pooled runtime URL configured/);
  assert.match(audit,/global error UI exists/);
  assert.match(smoke,/\/sitemap\.xml/);
  assert.match(smoke,/__priority10_missing_route__/);
});

test("ephemeral security data has scheduled cleanup",()=>{
  assert.equal(pkg.scripts.maintenance,"node --env-file-if-exists=.env --env-file-if-exists=.env.local scripts/maintenance.mjs");
  assert.match(maintenance,/rate_limit_buckets/);
  assert.match(maintenance,/password_reset_tokens/);
  assert.match(maintenance,/media_upload_authorizations/);
  assert.match(netlify,/functions\."maintenance"/);
  assert.match(netlify,/schedule = "@daily"/);
});

test("Priority 10 setup preserves all required seeds and adds the audit gate",()=>{
  assert.equal(pkg.scripts["setup:priority10"],"npm run db:migrate && npm run seo:seed:birthday && npm run audience:seed && npm run seo:simulate && npm run prod:audit");
});
