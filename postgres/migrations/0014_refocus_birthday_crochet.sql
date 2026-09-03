-- Refocus The Curated Pin on its proven Birthday collection and the closely
-- related Crochet/Crafts expansion. Nothing is deleted: Aurora and Wedding
-- content is returned to draft status for transfer to its matching brand.

UPDATE categories
SET status = 'active',
    seo_index = TRUE,
    updated_at = CURRENT_TIMESTAMP
WHERE path = 'celebrations'
   OR path LIKE 'celebrations/birthday-parties%'
   OR path = 'crafts'
   OR path LIKE 'crafts/crochet%';

UPDATE categories
SET status = 'inactive',
    show_in_nav = FALSE,
    seo_index = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE path = 'style'
   OR path LIKE 'style/nails%'
   OR path LIKE 'style/jewelry%'
   OR path LIKE 'celebrations/weddings%';

-- Navigation points directly at the two useful collection hubs. Parent
-- categories remain active for breadcrumbs and clean hierarchical URLs.
UPDATE categories
SET show_in_nav = FALSE,
    updated_at = CURRENT_TIMESTAMP;

UPDATE categories
SET show_in_nav = TRUE,
    updated_at = CURRENT_TIMESTAMP
WHERE path IN ('celebrations/birthday-parties', 'crafts/crochet');

-- Preserve the finished articles in PostgreSQL while preventing them from
-- appearing in public routes, search, related stories or the XML sitemap.
UPDATE articles
SET status = 'draft',
    seo_index = FALSE,
    published_at = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE category_id IN (
  SELECT id FROM categories
  WHERE path LIKE 'style/nails%'
     OR path LIKE 'style/jewelry%'
     OR path LIKE 'celebrations/weddings%'
);

UPDATE seo_pages
SET status = 'planned',
    updated_at = CURRENT_TIMESTAMP
WHERE category_id IN (
  SELECT id FROM categories
  WHERE path LIKE 'style/nails%'
     OR path LIKE 'style/jewelry%'
     OR path LIKE 'celebrations/weddings%'
);
