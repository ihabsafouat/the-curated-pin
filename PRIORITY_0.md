# Priority 0 — Standard Next.js + Netlify + Neon

## Status

Priority 0 is complete at source level.

### Completed

- [x] Standard Next.js lifecycle (`next dev`, `next build`, `next start`)
- [x] Removed Vinext
- [x] Removed Vite deployment wrapper
- [x] Removed Cloudflare Worker entry
- [x] Removed Wrangler and Cloudflare-specific build scripts
- [x] Removed D1 runtime/database fallback
- [x] Removed SQLite/Drizzle D1 schema and migrations
- [x] Made PostgreSQL the single production data runtime
- [x] Preserved transaction batches and parameterized queries
- [x] Added Neon pooled-connection guidance
- [x] Added optional direct migration URL (`DATABASE_MIGRATION_URL`)
- [x] Added Netlify configuration
- [x] Preserved security headers in native Next.js configuration
- [x] Disabled the `X-Powered-By` header
- [x] Added environment validation helper
- [x] Added PostgreSQL connectivity helper
- [x] Replaced Worker-specific tests with deployment contract tests
- [x] Updated README and security documentation
- [x] Removed generated hosting artifacts from the source package

## Local verification performed in the migration environment

- Deployment contract tests: passed
- TypeScript/TSX syntax parse: passed for all source files
- Relative import resolution audit: passed
- `package.json` / `package-lock.json` root dependency consistency: passed

A full `npm ci && npm run build` could not be executed in the migration sandbox because its npm registry DNS access was unavailable. No dependency or build error was observed; dependency installation itself could not reach the registry. Run the commands below on a normal network or let Netlify run them on the first deploy.

## First local run

```bash
cp .env.example .env.local
docker compose up -d postgres
npm ci
npm run db:migrate
npm run dev
```

## Full verification on your machine

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

Or:

```bash
npm run check
```

## Neon setup

Use the Neon pooled URL for the app:

```text
DATABASE_URL=postgresql://...-pooler....neon.tech/...?sslmode=require
```

Optionally use the direct URL for migrations:

```text
DATABASE_MIGRATION_URL=postgresql://....neon.tech/...?sslmode=require
```

Then:

```bash
npm run db:migrate
npm run db:check
```

## Netlify environment variables

Required:

```text
DATABASE_URL
JWT_SECRET
RATE_LIMIT_SECRET
APP_ORIGIN
NEXT_PUBLIC_SITE_URL
```

Recommended:

```text
ADMIN_EMAIL
```

Optional:

```text
DATABASE_MIGRATION_URL
NEXT_PUBLIC_GA_ID
```

## Next priority

Priority 1: replace the hard-coded flat category list with a database-driven hierarchical taxonomy, starting with:

```text
Celebrations
└── Birthday Parties
    ├── By Age
    ├── Themes
    ├── Games
    ├── Food
    └── Decorations

Crafts
├── Crochet
└── Sewing
```
