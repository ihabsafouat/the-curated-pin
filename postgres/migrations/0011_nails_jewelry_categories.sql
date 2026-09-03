-- Nails subcategories (Nails itself already exists under style from 0002)
INSERT INTO categories (parent_id, name, slug, path, intro, color, mark, status, show_in_nav, sort_order)
SELECT id, seed.name, seed.slug, 'style/nails/' || seed.slug, seed.intro, seed.color, seed.mark, 'inactive', FALSE, seed.sort_order
FROM categories parent
CROSS JOIN (VALUES
  ('Nail Art', 'nail-art', 'Creative nail art ideas, tutorials and design inspiration for every skill level.', '#ebd0d8', '✦', 10),
  ('Nail Care & Tips', 'nail-care-tips', 'Practical nail care routines, product recommendations and maintenance guides.', '#e8d5dc', '✧', 20)
) AS seed(name, slug, intro, color, mark, sort_order)
WHERE parent.path = 'style/nails'
ON CONFLICT(path) DO NOTHING;

-- Jewelry: new subcategory of Style
INSERT INTO categories (parent_id, name, slug, path, intro, color, mark, status, show_in_nav, sort_order)
SELECT id, 'Jewelry', 'jewelry', 'style/jewelry', 'Curated jewelry guides, styling ideas and practical buying advice.', '#e6ddd5', '💎', 'inactive', FALSE, 15
FROM categories WHERE path = 'style'
ON CONFLICT(path) DO NOTHING;

-- Jewelry subcategories
INSERT INTO categories (parent_id, name, slug, path, intro, color, mark, status, show_in_nav, sort_order)
SELECT id, seed.name, seed.slug, 'style/jewelry/' || seed.slug, seed.intro, seed.color, seed.mark, 'inactive', FALSE, seed.sort_order
FROM categories parent
CROSS JOIN (VALUES
  ('Rings', 'rings', 'Ring guides covering styles, sizing, stacking ideas and buying recommendations.', '#e8dbd2', '◯', 10),
  ('Necklaces', 'necklaces', 'Necklace styling guides, layering ideas and curated picks for every occasion.', '#e4dcd6', '◇', 20),
  ('Bracelets', 'bracelets', 'Bracelet guides from everyday styles to stacking ideas and gift picks.', '#e2ddd8', '○', 30),
  ('Earrings', 'earrings', 'Earring styling guides, face-shape advice and curated seasonal edits.', '#e7d9d4', '✧', 40),
  ('Styling & Layering Guides', 'styling-layering', 'Practical guides for mixing, layering and styling jewelry with intent.', '#e5ddd0', '▤', 50)
) AS seed(name, slug, intro, color, mark, sort_order)
WHERE parent.path = 'style/jewelry'
ON CONFLICT(path) DO NOTHING;
