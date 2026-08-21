# Priority 4 — Advanced Technical SEO

Priority 4 turns the Birthday authority architecture from Priority 2 into a technically consistent indexing, metadata, schema, social-sharing and image-discovery layer.

## 1. Canonical rules

Every indexable public article and category uses a self-referential canonical by default.

Articles may define `canonical_path`, but the value is deliberately restricted to a same-site path. Leave it blank for normal original content. Use it only when an editorial page intentionally duplicates or substantially overlaps another canonical page and there is a real consolidation reason.

A page with a non-self canonical is excluded from the XML sitemap so the sitemap and canonical signals do not conflict.

Do not use `robots.txt` or `noindex` to choose between duplicate in-site canonicals. Merge/redirect truly redundant pages when possible; use a canonical when duplicate variants legitimately need to remain accessible.

## 2. Indexation rules

Articles and categories have an explicit `seo_index` control.

Categories are indexable only when:

1. the taxonomy node is active;
2. `seo_index` is enabled; and
3. the category or one of its descendants has published content.

This lets us build the complete topical architecture without indexing empty/thin taxonomy pages.

Private/user utility pages such as login, registration, account, saved content, search and thank-you pages use `noindex`. They remain crawlable so crawlers can actually read that directive.

System surfaces are different: `/admin/` and `/api/` are excluded through robots/system headers because there is no public-search reason for them to be crawled.

## 3. Article metadata

Each published article can control:

- SEO title
- meta description
- hero image alt text
- social/Open Graph image
- same-site canonical override
- index/noindex state

Article metadata emits:

- canonical URL
- Open Graph article metadata
- Twitter card metadata
- publication/modification timestamps
- article section/category
- author identity
- large-image-preview crawler permission

The default social image is a local branded 1200×630 image. Individual articles should use a specific high-quality social image whenever possible.

## 4. Structured data

### Articles

Articles use `BlogPosting` with:

- headline
- description
- image
- datePublished
- dateModified
- mainEntityOfPage
- author
- publisher
- publishingPrinciples
- isPartOf
- inLanguage
- isAccessibleForFree

The editorial author is represented as an `Organization` and links to a visible author/profile page. The page itself is marked up with `ProfilePage`.

### Homepage

`Organization` and `WebSite` structured data live on the homepage instead of being repeated unnecessarily on every page.

### Categories

Category pages use `CollectionPage` plus `ItemList` for the published entries they expose.

### Breadcrumbs

Breadcrumb schema follows the visible hierarchy. The final/current breadcrumb intentionally omits `item` instead of incorrectly pointing it to the homepage.

### FAQ content

Visible FAQ blocks remain useful editorial content, but we do not add generic `FAQPage` structured data to ordinary Birthday articles. Structured data should only be added where the feature is appropriate and accurately represents visible content.

## 5. Author and editorial entity signals

The public profile is:

`/authors/the-curated-pin-editors`

Articles visibly link to it and structured data references the same identity. The profile links readers to the editorial policy and contact routes.

This gives authorship a stable first-party URL instead of an unlinked text label.

## 6. Image SEO and social discovery

Editorial rules:

- every meaningful content/hero image must have descriptive alt text;
- avoid keyword-stuffed alt text;
- use descriptive filenames when we control the asset;
- hero/social images should be high quality;
- create social/Discover images at least 1200px wide;
- a 16:9 landscape crop is preferred for primary social/Discover assets when practical;
- pages permit `max-image-preview:large`;
- article and category images can be listed in the XML sitemap;
- below-the-fold block images use lazy loading and async decoding.

Pinterest Article Rich Pins can consume the Open Graph and Schema.org article information already emitted by the article pages. We should not add Product Rich Pin / merchant markup to affiliate-only recommendations. When The Curated Pin eventually sells an owned product directly through the site, its dedicated commerce implementation can use the appropriate Product markup.

## 7. Sitemap strategy

`app/sitemap.ts` is database-driven.

It includes:

- core public editorial pages;
- indexable populated categories;
- indexable published self-canonical articles;
- relevant article/category images.

It excludes:

- non-indexable pages;
- empty categories;
- articles canonicalized to another URL;
- account/admin/API/search utility surfaces.

Category `lastModified` is derived from the latest published descendant article instead of pretending the category changed on every sitemap request.

## 8. Robots/crawl strategy

`robots.txt` only blocks system surfaces that should not be crawled (`/admin/` and `/api/`).

Do not add `/login`, `/account`, `/saved`, `/search`, etc. to robots.txt simply because they are noindex. Those HTML pages need to remain crawlable for the robots meta directive to be read.

The API also receives an `X-Robots-Tag: noindex, nofollow` response header.

## 9. CMS operating rules

Before publishing an article:

1. assign its Priority-2 SEO-plan category;
2. write a unique SEO title and description;
3. write human-useful hero alt text;
4. upload/select a representative social image;
5. leave canonical override empty unless there is a documented duplicate/consolidation reason;
6. keep indexing enabled only when the page is complete and intended to rank;
7. ensure its internal links follow the semantic/authority plan;
8. verify visible author/byline and publication dates;
9. inspect the rendered head tags and structured data before launch.

## 10. Setup

After configuring PostgreSQL/Neon:

```bash
npm ci
npm run setup:priority4
npm test
npm run check
npm run dev
```

`setup:priority4` applies all migrations, re-syncs the Birthday SEO map and runs the PageRank-style internal-link simulation.

## 11. Pre-launch external validation

Once deployed to the final HTTPS domain:

- inspect representative URLs with Google Search Console URL Inspection;
- validate structured data with Google's Rich Results Test / schema tooling as appropriate;
- submit `/sitemap.xml` in Search Console;
- confirm canonical URLs in rendered HTML;
- confirm noindex pages are crawlable but not indexable;
- confirm `/admin/` and `/api/` crawl controls;
- validate Pinterest article metadata on live article URLs;
- test Open Graph/Twitter previews;
- verify hero/social images are publicly fetchable.

Priority 4 intentionally does not redesign the visual interface. Priority 5 owns the homepage/navigation/UI redesign.
