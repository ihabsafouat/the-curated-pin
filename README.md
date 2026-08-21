# The Curated Pin

A full-stack Next.js editorial publication with reader accounts, a role-protected publishing dashboard, contextual lead magnets, segmented email nurture, saves/read-later, affiliate-click analytics, and PostgreSQL persistence.

This repository now uses the standard Next.js runtime and is designed to deploy cleanly to Netlify with Neon PostgreSQL. It does not require Cloudflare Workers, D1, Vinext, Wrangler, or a separate backend service.

## Stack

- Next.js App Router
- React
- PostgreSQL (`pg`)
- Zod validation
- JWT access + rotating refresh sessions
- Tailwind/PostCSS tooling plus the existing editorial CSS
- Netlify-ready standard `next build` output
- Neon-ready pooled PostgreSQL connection

## What is included

- Public editorial website with database-driven hierarchical categories
- Registration, login, logout, and session refresh
- PostgreSQL schema and migration runner
- RBAC with `reader`, `author`, `editor`, and `admin` roles
- Article create/edit/publish/delete workflows with database-managed category assignment
- Hierarchical taxonomy management for editors/admins
- User-role management for administrators
- Synced favorites and read-later lists for signed-in readers
- Contextual lead magnets, hierarchical email-interest segmentation, welcome sequences, preferences/unsubscribe, and audience CSV export
- Page-view, search, referral, save, and outbound-link analytics
- Docker-based local PostgreSQL setup
- Responsive login, account, saved-library, and admin interfaces

## Roles

| Role | Permissions |
| --- | --- |
| Reader | Read articles and sync favorites/read-later lists |
| Author | Reader permissions plus create and edit their own drafts |
| Editor | Publish, edit, and delete all articles; export subscribers |
| Admin | Editor permissions plus user and role management |

All authorization is enforced on the server. Hiding a button is never treated as a security boundary.

## Security model

- Passwords are hashed with PBKDF2-HMAC-SHA256 and unique salts.
- Short-lived JWT access tokens and rotating refresh tokens are stored in `HttpOnly`, `SameSite=Lax` cookies.
- Refresh sessions are hashed in PostgreSQL and can be revoked.
- Role changes invalidate active sessions.
- Database values use parameterized PostgreSQL queries; user input is never concatenated into SQL.
- Zod validates authentication, content, newsletter, analytics, save, and role-management input.
- State-changing requests require a same-origin browser context; authenticated JSON writes also require a CSRF token.
- Durable per-IP rate limits protect login, registration, refresh, saves, analytics, newsletter, and publishing routes.
- Security headers include CSP, HSTS on HTTPS, frame denial, MIME sniffing protection, a restrictive permissions policy, and a strict referrer policy.
- Password hashes, JWT secrets, database credentials, and full user records are server-only.

The browser's developer tools can always show public HTML, CSS, JavaScript, network requests, and public article content. Security comes from never sending secrets or unauthorized data to the browser.

See [SECURITY.md](./SECURITY.md) for the operational checklist.

## Local development

Requirements: Node.js 22+, npm, Docker, and Docker Compose.

1. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

2. Change the placeholder secrets in `.env.local`.

3. Start PostgreSQL:

   ```bash
   docker compose up -d postgres
   ```

4. Install dependencies:

   ```bash
   npm ci
   ```

5. Apply the PostgreSQL schema:

   ```bash
   npm run db:migrate
   ```

6. Start Next.js:

   ```bash
   npm run dev
   ```

7. Open `http://localhost:3000`.

To promote a registered owner account locally:

```bash
npm run user:promote -- owner@example.com
```

The promotion command is intentionally server-side. Public registration cannot assign itself a privileged role.

There is no default or hidden admin password. Register the owner email you control, run the promotion command once, then sign in again.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string. In Netlify production, use Neon's pooled connection string. |
| `DATABASE_MIGRATION_URL` | Optional | Direct/unpooled PostgreSQL URL used by the migration runner when provided. |
| `JWT_SECRET` | Yes | HMAC key for access and refresh JWTs; use at least 32 random characters, preferably more. |
| `RATE_LIMIT_SECRET` | Yes | Independent secret used when hashing client identifiers. |
| `EMAIL_PREFERENCE_SECRET` | Yes | HMAC key for durable audience preference/unsubscribe links. |
| `EMAIL_CRON_SECRET` | Yes | Independent bearer secret for manual/external sequence dispatch. |
| `ADMIN_EMAIL` | Recommended | Owner email used by the admin bootstrap workflow. |
| `APP_ORIGIN` | Yes in production | Exact public HTTPS origin used by same-origin checks, for example `https://example.com`. |
| `NEXT_PUBLIC_SITE_URL` | Yes in production | Public canonical site origin used for metadata, canonical URLs, robots, and sitemap URLs. |
| `NEXT_PUBLIC_GA_ID` | Optional | Google Analytics measurement ID. |
| `NEXT_PUBLIC_CLARITY_ID` | Optional | Microsoft Clarity project ID; loaded only after analytics consent. |
| `RESEND_API_KEY` | Production email | Server-only email provider API key. |
| `MAIL_FROM` | Production email | Verified sender identity for account and audience email. |

`NODE_ENV` is managed by Next.js/the hosting platform and should not normally be added manually.

Never commit `.env.local`, production database URLs, passwords, or signing secrets.

## PostgreSQL migrations

Migrations live in:

```text
postgres/migrations/
```

Run them with:

```bash
npm run db:migrate
```

The migration runner records applied files in the `schema_migrations` table and will not re-run already-applied migrations.

For Neon, you may use:

- `DATABASE_URL`: pooled connection string for the application
- `DATABASE_MIGRATION_URL`: direct connection string for migration commands

If `DATABASE_MIGRATION_URL` is absent, the migration runner falls back to `DATABASE_URL`.

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run build

# With deployment environment variables loaded:
npm run env:check
npm run db:check
```

Or run the full sequence:

```bash
npm run check
```

## Netlify + Neon deployment

The repository includes `netlify.toml` with the standard Next.js settings:

```toml
[build]
  command = "npm run build"
  publish = ".next"
```

Netlify automatically applies its current OpenNext adapter to supported Next.js projects, so no Netlify Next.js plugin is pinned in `package.json`.

### 1. Create Neon PostgreSQL

Create a Neon project and copy:

- the pooled connection string for `DATABASE_URL`
- optionally the direct connection string for `DATABASE_MIGRATION_URL`

Run the schema once against Neon from your local machine:

```bash
DATABASE_MIGRATION_URL="YOUR_NEON_DIRECT_URL" npm run db:migrate
```

### 2. Configure Netlify environment variables

Set at least:

```text
DATABASE_URL
JWT_SECRET
RATE_LIMIT_SECRET
EMAIL_PREFERENCE_SECRET
EMAIL_CRON_SECRET
ADMIN_EMAIL
APP_ORIGIN
NEXT_PUBLIC_SITE_URL
```

Optionally set:

```text
NEXT_PUBLIC_GA_ID
NEXT_PUBLIC_CLARITY_ID
RESEND_API_KEY
MAIL_FROM
DATABASE_MIGRATION_URL
```

Use your production URL for both `APP_ORIGIN` and `NEXT_PUBLIC_SITE_URL` once the domain is final.

### 3. Deploy

Push the repository to GitHub and import it into Netlify. Framework detection should identify Next.js automatically.

Typical settings:

```text
Build command: npm run build
Publish directory: .next
Node: 22
```

### 4. Bootstrap the admin

Register the owner account normally, then run from a trusted machine:

```bash
DATABASE_URL="YOUR_NEON_POOLED_URL" npm run user:promote -- owner@example.com
```

Sign in again after promotion so the new role is reflected in the session.

### 5. Publish the reviewed launch batch

The twelve bundled guides seed as drafts. After reviewing them, publish the complete first wave with an explicit confirmation gate:

```bash
npm run launch:publish -- --all --confirm=publish-reviewed-launch
```

To publish only selected guides, replace `--all` with one or more `--slug=<slug>` arguments.

### 6. Generate the Pinterest bulk file

After the public domain and article routes are reachable:

```bash
npm run pinterest:csv -- --site=https://YOUR-DOMAIN --start=YYYY-MM-DD
```

This creates a 36-row scheduled CSV in `launch/pinterest-bulk-upload.csv` with public media URLs and unique organic Pinterest UTM links.

## Push to GitHub

```bash
git init
git add .
git commit -m "Normalize The Curated Pin for Next.js, Netlify and Neon"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/the-curated-pin.git
git push -u origin main
```

Keep production secrets in Neon/Netlify settings, never in Git.

## Architecture migration status

### Priority 0 — complete

- Standard Next.js runtime
- Netlify-ready deployment
- Neon/PostgreSQL single database runtime
- Cloudflare/Vinext/D1 deployment layer removed
- Security headers preserved

See [`PRIORITY_0.md`](./PRIORITY_0.md).

### Priority 1 — complete

- Database-driven hierarchical taxonomy
- `Celebrations -> Birthday Parties` active as the first vertical
- Future Crafts / Crochet / Sewing / Style categories seeded inactive
- Nested public category pages and breadcrumbs
- Database-driven navigation and sitemap
- Editor/admin taxonomy manager at `/studio/categories`
- Article category assignment uses foreign keys instead of a hard-coded category enum

See [`PRIORITY_1.md`](./PRIORITY_1.md).

## Priority 2 — Birthday SEO authority map

After the normal database configuration:

```bash
npm run setup:priority2
```

This applies the SEO architecture migration, seeds the idempotent Birthday silo plan and runs the internal PageRank-style simulation. Editors/admins can review the architecture at `/studio/seo-map`.

Useful commands:

```bash
npm run seo:seed:birthday   # sync the 30-article + 9-hub editorial plan
npm run seo:simulate       # PageRank-style link-flow + cannibalization/drift report
```

The simulation is an internal planning heuristic, not a Google ranking score. See `PRIORITY_2.md` and `seo/PAGERANK_SIMULATION.md`.

## Priority 3: rich editorial CMS

The article CMS now uses validated rich content blocks for ideas, galleries, tables, checklists, affiliate products, first-party product CTAs, lead magnets, semantic internal links, FAQs and Pinterest assets. See `PRIORITY_3.md` and `MONETIZATION_PRELAUNCH.md`.

Run `npm run setup:priority3` after configuring PostgreSQL/Neon.


## Priority 4: advanced technical SEO

Priority 4 adds canonical/indexation controls, article/category SEO fields, `BlogPosting` + author entity markup, homepage Organization/WebSite markup, Open Graph/Pinterest article metadata, image sitemap support, large-image-preview controls, thin-category noindex behavior, crawl-safe private-page noindexing, and refined robots/sitemap rules.

Run after configuring PostgreSQL/Neon:

```bash
npm run setup:priority4
```

See [`PRIORITY_4.md`](./PRIORITY_4.md) for the operating rules and pre-launch validation checklist.

### Current build priorities

- Priority 0 — standard Next.js + Netlify + Neon: **complete**
- Priority 1 — hierarchical taxonomy: **complete**
- Priority 2 — Birthday SEO authority architecture: **complete**
- Priority 3 — rich editorial CMS + monetization blocks: **complete**
- Priority 4 — advanced technical SEO: **complete**
- Priority 5 — V2 experience/security layer: **complete**
- Priority 6 — contextual lead magnets + email segmentation: **complete**
- Priority 7 — funnel/conversion analytics: **complete**
- Priority 8 — article UX refinement: **complete**
- Priority 9 — media/image management: **complete**
- Priority 10 — performance/security production QA: **next**
- Priority 11 — Birthday content + Pinterest launch

## Priority 5 — experience + hardening

Priority 5 adds the production-oriented editorial experience and security controls around the existing SEO/CMS architecture:

- Inter + Playfair Display typography
- Anime.js reveal motion + Lenis smooth scrolling with reduced-motion opt-out
- dark mode, sticky navigation, scroll progress, back-to-top and floating contact controls
- loading skeletons, password visibility, explicit form states and confirmation dialogs
- consent-gated GA4 + Microsoft Clarity and first-party UTM capture
- moderated reader feedback/reviews
- Cloudflare Turnstile on high-abuse public forms
- generic auth/recovery responses, login lockout, expiring single-use reset tokens and session revocation on password changes
- expanded audit events + `/studio/security`
- least-privilege runtime PostgreSQL role provisioning
- forced RLS for reader-owned saved articles
- HSTS/CSP and existing CSRF/request-size protections retained

See `PRIORITY_5.md` and `SECURITY.md` for why Three.js, client-visible API keys, a separate proxy backend, arbitrary uploads and AI prompt filters were deliberately not added.

## Priority 6 — contextual audience funnel

Priority 6 replaces one generic newsletter bucket with contextual lead magnets, hierarchical topic tags, welcome sequences, durable preference/unsubscribe links and an audience console at `/studio/audience`.

Run:

```bash
npm run setup:priority6
```

Netlify is configured to process due welcome-sequence emails hourly. See [`PRIORITY_6.md`](./PRIORITY_6.md) for targeting rules, consent, launch lead magnets and delivery setup.

## Priority 7 — business funnel analytics

The application now includes first-party funnel analytics in addition to consent-gated GA4/Clarity. Editors can review article engagement, lead-magnet conversion, email signups, affiliate clicks, owned-product intent and confirmed server-side commerce conversions at `/studio/analytics`.

See `PRIORITY_7.md` for the event model, attribution/privacy behavior and commerce webhook contract.


## Priority 8 — article UX refinement

Long-form articles now include an active sticky TOC, mobile jump navigation, article-relative reading progress, share/Pinterest/copy actions, numbered idea cards, accessible gallery lightboxes, improved tables and FAQ controls, and content-aware lead-magnet placement. The block renderer now preserves anchor IDs and idea numbering across the lead-magnet split.

Run:

```bash
npm run setup:priority8
```

See [`PRIORITY_8.md`](./PRIORITY_8.md) for the interaction and manual QA checklist.


## Priority 9 — editorial media pipeline

The Publisher Studio now has a first-party media catalog backed by Cloudinary for binary storage/CDN delivery and PostgreSQL for editorial metadata. Authenticated publishers use a server-signed direct browser upload, then the server verifies the Cloudinary response before registering the asset. New article hero, social, image, gallery, product and Pinterest fields can choose verified library assets.

Delivery helpers generate responsive web sizes with automatic quality/format plus dedicated 1200×630 social and 1000×1500 Pinterest derivatives. The library stores alt text, caption, credit, license note, tags and non-destructive archive state.

Run:

```bash
npm run setup:priority9
```

Then open `/studio/media`. See [`PRIORITY_9.md`](./PRIORITY_9.md) for Cloudinary preset/environment setup and the launch QA checklist.

## Priority 10 — production gate

Before a production deploy, run `NODE_ENV=production npm run prod:audit`, then `npm run check`. After deployment, run `npm run smoke -- https://your-production-domain`. Liveness and readiness endpoints are available at `/api/health/live` and `/api/health/ready`. See `PRIORITY_10.md` for the backup, performance and launch runbook.

## Priority 11 — Birthday launch

The repository includes a first-wave Birthday launch package: 12 draft articles, 2 free PDF lead magnets, 2 paid PDF planners, first-party `/shop` pages, 12 article hero graphics and 36 Pinterest creatives. Run `npm run setup:priority11` to seed the launch content as drafts, then review and publish individually from Publisher Studio. See `PRIORITY_11.md`.
