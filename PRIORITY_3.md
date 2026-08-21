# Priority 3 — Rich content CMS

Priority 3 turns the old heading/paragraph article editor into a structured, safe block-based CMS designed for The Curated Pin's SEO, Pinterest and monetization model.

## Added block types

- paragraph
- H2/H3 heading
- image + caption
- gallery
- idea card
- checklist
- bullet list
- table
- comparison
- curated tip
- pros/cons
- affiliate product
- lead magnet CTA
- owned digital-product CTA
- semantic internal-link card
- FAQ
- Pinterest asset
- quote
- divider

## Data model

Migration `0004_rich_content_blocks.sql` adds `articles.blocks_json` as JSONB. The old `sections_json` remains temporarily for backward compatibility. Existing legacy section content is automatically converted to heading + paragraph blocks at read time.

New saves write both formats so we can roll forward safely while older code/data remains recoverable.

## Monetization boundaries

Affiliate products, owned products and internal editorial links are different block types on purpose.

- affiliate links render with `rel="sponsored nofollow noopener"`
- affiliate disclosure is shown at article level when needed and again next to each affiliate product
- owned product / lead-magnet blocks can point to first-party `/shop/...` and `/free/...` routes or an external checkout while those landing pages are being built
- internal-link blocks only accept a same-site path beginning with `/`

This prevents the editor from accidentally using a paid link as part of the semantic internal-link graph.

## Public article UX

Article pages now render the structured blocks instead of only legacy sections. H2 blocks generate the table of contents. FAQ blocks generate visible accordion content plus `FAQPage` structured data describing the content; no rich-result guarantee is assumed.

## Security

The editor stores validated structured data rather than arbitrary HTML. No `dangerouslySetInnerHTML` content editor was introduced. URLs and block sizes are validated through Zod; write routes retain the existing auth/RBAC/CSRF/same-origin/rate-limit protections.

## Setup

```bash
npm ci
npm run setup:priority3
npm run check
npm run dev
```

`setup:priority3` applies all migrations, re-seeds/synchronizes the Birthday SEO map and runs the internal PageRank simulation.
