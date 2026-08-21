# Priority 10 — Production readiness gate

Priority 10 is the final engineering gate before The Curated Pin starts content production and external promotion.

## Added in this phase

- `/api/health/live`: process/app liveness without touching PostgreSQL.
- `/api/health/ready`: dependency-aware readiness; returns `503` when PostgreSQL is unavailable.
- `app/error.tsx` and `app/global-error.tsx`: accessible recovery UI for route-level and root failures.
- `0010_production_readiness.sql`: targeted operational/query indexes.
- Conservative PostgreSQL pool timeouts and a smaller application-side pool for a serverless runtime.
- Daily cleanup for expired rate-limit buckets, reset tokens, refresh sessions and upload authorizations.
- `npm run prod:audit`: static/environment production audit.
- `npm run smoke -- https://your-domain.example`: post-deploy HTTP smoke test.
- Tighter CSP destinations: Cloudinary stays in `connect-src`; it is no longer allowed as a script or frame source.
- Extra browser hardening headers (`Origin-Agent-Cluster`, DNS prefetch policy).

## Caching decision

Do not manually overwrite Next.js page `Cache-Control` globally. Next.js 16 derives CDN cache headers from route/rendering strategy. User/account/Studio/auth surfaces remain explicit `private, no-store`; public content is left to the framework so static/ISR behavior can be adopted without conflicting CDN headers.

For The Curated Pin, only introduce explicit article/category revalidation after publishing workflows call the corresponding Next.js revalidation API. Until then, correctness is more important than serving stale editorial data.

## Database production rules

- `DATABASE_URL`: pooled Neon URL (`-pooler`) in the Netlify runtime.
- `DATABASE_MIGRATION_URL` / `DATABASE_ADMIN_URL`: direct privileged connection only for migrations/provisioning.
- Keep the runtime role least-privileged.
- Run `ANALYZE` after large content imports if query plans become stale.
- Use Neon branches before destructive migrations or bulk imports.

## Backup / recovery runbook

1. Production is the Neon root/production branch.
2. Before schema changes or large imports, create a Neon branch/snapshot/restore point supported by your plan.
3. Test migrations on a branch first.
4. Document the current restore window in the launch checklist; do not assume the provider default forever.
5. Quarterly, perform a restore drill into a non-production branch and verify article/user/subscriber counts.
6. Never test restore procedures for the first time during an incident.

## Launch gates

Run locally/CI:

```bash
npm ci
npm run env:check
NODE_ENV=production npm run prod:audit
npm run setup:priority10
npm run check
```

After Netlify deploy:

```bash
npm run smoke -- https://thecuratedpin.example
```

Then manually verify:

- homepage/category/article mobile + desktop
- login/register/reset-password flows
- Studio RBAC
- newsletter + preference/unsubscribe flow
- Turnstile production keys
- GA4 and Clarity only after analytics consent
- affiliate disclosure + sponsored link attributes
- social/OG/Pinterest preview
- sitemap/robots/canonical/noindex behavior
- Cloudinary upload + responsive derivatives
- custom 404 + forced error recovery
- keyboard navigation and visible focus states
- Lighthouse/PageSpeed on representative homepage, category and long article

## Core Web Vitals target

Treat these as launch objectives, measured at the 75th percentile once field data exists:

- LCP <= 2.5 s
- INP <= 200 ms
- CLS <= 0.1

Before field data exists, use Lighthouse/PageSpeed only as laboratory diagnostics, not as proof of real-user CWV performance.

## Operational alerts

At minimum, configure an external uptime monitor to request `/api/health/ready`. Alert on repeated 5xx/timeout results. Do not expose database credentials, stack traces or provider details from health responses.

## Deferred intentionally

- APM/error SaaS: choose only once traffic justifies another vendor/data processor.
- Redis: not justified at launch; current persistent rate limiter and Neon pooling are adequate for initial traffic.
- Custom global CDN cache handler: unnecessary on Netlify at launch.
- CSP nonce migration: valuable later if we want to remove `'unsafe-inline'`, but requires coordinated Next.js/analytics/Turnstile testing and should not be rushed before launch.
