# Content transfer map

The Curated Pin is intentionally focused on two public collections:

- Birthday Parties, including every existing Birthday article and URL
- Crochet/Crafts, including five launch guides and their hero/Pin assets

The following finished work remains in the repository only so it can be moved to
the correct brand without rewriting it. It is not imported by fallback content,
deployment seeding, the active SEO map, navigation or the sitemap.

## Aurora package

- Source export: `auroraArticles` in `launch/vertical-launch-content.mjs`
- Ten articles: five Nails and five Jewelry
- Hero images: matching slugs in `public/vertical-media/`
- Pin images: matching slugs in `public/pinterest/verticals/`
- Research: `seo/VERTICAL_KEYWORD_RESEARCH_2026.md`
- Outreach assets: `seo/VERTICAL_BACKLINK_OUTREACH.md`

When Aurora is built, import `auroraArticles` rather than `verticalArticles`.
The latter deliberately contains only the active Crochet collection.

## Wedding Gazette package

- Source export: `weddingArticles` in `launch/wedding-launch-content.mjs`
- Five articles with contextual Wedding Gazette product calls to action
- Hero images: `public/wedding-media/`
- Funnel map: `seo/WEDDING_CONTENT_FUNNEL.md`

## Database preservation

Migration `0014_refocus_birthday_crochet.sql` does not delete off-brand work.
If a previous release inserted it, the migration returns those articles to draft,
disables indexing and deactivates their categories. Birthday and Crochet remain
published and indexable.
