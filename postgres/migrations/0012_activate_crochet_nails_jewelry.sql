-- Launch the three completed editorial verticals. Article content is seeded by
-- scripts/seed-vertical-content.mjs during deployment.
UPDATE categories
SET status = 'active', updated_at = CURRENT_TIMESTAMP
WHERE path = 'crafts' OR path LIKE 'crafts/crochet%'
   OR path = 'style' OR path LIKE 'style/nails%'
   OR path LIKE 'style/jewelry%';

UPDATE categories
SET show_in_nav = CASE WHEN path IN ('crafts/crochet', 'style/nails', 'style/jewelry') THEN TRUE ELSE FALSE END,
    updated_at = CURRENT_TIMESTAMP
WHERE path = 'crafts' OR path LIKE 'crafts/crochet%'
   OR path = 'style' OR path LIKE 'style/nails%'
   OR path LIKE 'style/jewelry%';

UPDATE categories SET
  intro = 'Crochet patterns, project plans, beginner help and yarn guidance built around projects readers can finish.',
  seo_title = 'Crochet Patterns, Projects and Beginner Guides',
  seo_description = 'Explore practical crochet flower, bag, blanket and beginner guides with clear planning and finishing advice.',
  seo_index = TRUE
WHERE path = 'crafts/crochet';

UPDATE categories SET
  intro = 'Wearable nail ideas, trend-led art and practical care guidance with clear product-safety guardrails.',
  seo_title = 'Nail Ideas, Designs and Practical Care Guides',
  seo_description = 'Explore short almond, cat-eye, lace and press-on nail guides with wearable ideas and practical care guidance.',
  seo_index = TRUE
WHERE path = 'style/nails';

UPDATE categories SET
  intro = 'Jewelry styling, material and buying guides designed to make beautiful choices easier to understand.',
  seo_title = 'Jewelry Styling, Materials and Buying Guides',
  seo_description = 'Explore necklace layering, ring stacking, jewelry metals, earrings and birthstone guides.',
  seo_index = TRUE
WHERE path = 'style/jewelry';
