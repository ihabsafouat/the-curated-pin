# Priority 1 — Database-driven hierarchical taxonomy

## Status

Priority 1 is complete at source level.

## What changed

- [x] Added a PostgreSQL `categories` table with parent/child relationships.
- [x] Added stable full category paths such as `celebrations/birthday-parties/teen-birthdays`.
- [x] Added category status (`active` / `inactive`), navigation visibility, color, mark, intro, and sort order.
- [x] Added `articles.category_id` as a foreign key to the taxonomy.
- [x] Kept legacy `category` / `category_slug` columns synchronized during the transition so existing data remains recoverable.
- [x] Archived old demo articles instead of deleting them.
- [x] Removed the hard-coded Cats / Dogs / Jewelry / Nails / Home / Digital Studio category enum from article validation.
- [x] Removed the hard-coded public category lists from the homepage and sub-navigation.
- [x] Added nested category routes with `/category/[...path]`.
- [x] Parent category pages automatically include articles published in descendant categories.
- [x] Added category breadcrumbs using the real parent chain.
- [x] Added child-category discovery cards to category pages.
- [x] Made article publishing choose a category by database ID.
- [x] Added an editor/admin taxonomy manager at `/admin/categories`.
- [x] Taxonomy changes use CSRF checks, same-origin checks, RBAC, rate limiting, and audit logs.
- [x] Parent or slug changes update descendant category paths transactionally.
- [x] Public navigation now reads from the database.
- [x] The sitemap now reads published database articles and categories instead of static seed content.
- [x] Empty new sections render safely while the first article cluster is being produced.

## Seeded taxonomy

The first active editorial vertical is:

```text
Celebrations
└── Birthday Parties
    ├── Birthday Ideas by Age
    ├── Teen Birthdays
    ├── First Birthdays
    ├── Party Themes
    ├── Party Games
    ├── Party Food
    ├── Decorations
    └── Printables & Planners
```

Future verticals are already represented in the database but start inactive:

```text
Crafts
├── Crochet
│   ├── Crochet Flowers
│   ├── Crochet Blankets
│   ├── Crochet Bags
│   ├── Beginner Crochet
│   └── Tools & Yarn
└── Sewing
    ├── Beginner Projects
    ├── Sewing Patterns
    └── Quilting

Style
├── Nails
└── Capsule Wardrobe

Celebrations
└── Weddings
```

They can be activated later from `/admin/categories` without changing source code.

## Existing database migration

Run:

```bash
npm run db:migrate
```

The new migration is:

```text
postgres/migrations/0002_hierarchical_taxonomy.sql
```

If an existing Priority 0 database contains the old demo articles, the migration keeps those rows but assigns them to the inactive `Archive` category. They will no longer appear publicly. Reassign any article you want to keep through the article editor.

No old article is deleted by Priority 1.

## Category management

Editors and admins can open:

```text
/admin/categories
```

They can:

- create root or child categories;
- edit names, slugs, intros, colors, marks, status, and sort order;
- move a category to another parent;
- choose which categories appear in public navigation;
- activate future verticals when their content is ready.

Deletion is intentionally not included. A category can be made inactive instead, which protects article relationships and URLs from accidental destructive changes.

## URL model

Category paths are hierarchical:

```text
/category/celebrations
/category/celebrations/birthday-parties
/category/celebrations/birthday-parties/teen-birthdays
```

Article URLs remain stable:

```text
/article/<article-slug>
```

A later SEO priority can decide whether to introduce shorter category aliases or redirects. Priority 1 keeps one predictable URL model while the taxonomy is being built.

## Verification performed

- TypeScript/TSX syntax parse: passed for all source files.
- Relative import audit: passed with zero missing imports.
- Deployment + taxonomy contract tests: 7 passed.
- Hard-coded legacy category references in application/database code: removed.

A complete `npm ci` / Next.js production build still requires normal registry access. The sandbox could not complete dependency installation from npm. Run the full check locally or on Netlify:

```bash
npm ci
npm run db:migrate
npm run check
```

## Next priority

Priority 2: build the Birthday Party content silo on top of this taxonomy and prepare the initial article cluster structure.

The rich block editor remains Priority 3; Priority 2 should establish the editorial silo and content/data requirements before the editor is expanded.
