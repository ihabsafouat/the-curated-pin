-- Wedding informational silo and product funnel.
INSERT INTO categories (parent_id, name, slug, path, intro, color, mark, status, show_in_nav, sort_order, seo_title, seo_description, seo_index)
SELECT id, 'Weddings', 'weddings', 'celebrations/weddings',
       'Wedding stationery, reception and planning guides designed to turn saved inspiration into a coherent guest experience.',
       '#eadfd8', '♡', 'active', TRUE, 20,
       'Wedding Planning, Stationery and Reception Guides',
       'Plan wedding newspapers, signage, reception activities and coordinated stationery with practical guides and editable resources.',
       TRUE
FROM categories WHERE path = 'celebrations'
ON CONFLICT(path) DO UPDATE SET
  intro=EXCLUDED.intro,
  status='active',
  show_in_nav=TRUE,
  seo_title=EXCLUDED.seo_title,
  seo_description=EXCLUDED.seo_description,
  seo_index=TRUE,
  updated_at=CURRENT_TIMESTAMP;

INSERT INTO categories (parent_id, name, slug, path, intro, color, mark, status, show_in_nav, sort_order, seo_title, seo_description, seo_index)
SELECT parent.id, seed.name, seed.slug, 'celebrations/weddings/' || seed.slug,
       seed.intro, seed.color, seed.mark, 'active', FALSE, seed.sort_order,
       seed.name || ' Guides', seed.intro, TRUE
FROM categories parent
CROSS JOIN (VALUES
  ('Wedding Stationery', 'wedding-stationery', 'Wedding newspapers, invitations, welcome signs, menus and coordinated print guidance.', '#eadfd8', '✦', 10),
  ('Wedding Reception', 'reception', 'Reception activities, table details and guest-experience planning.', '#e6ddd3', '◇', 20),
  ('Wedding Planning', 'planning', 'Practical checklists, production schedules and decision guides for a coherent wedding day.', '#e8e0d8', '✓', 30)
) AS seed(name, slug, intro, color, mark, sort_order)
WHERE parent.path = 'celebrations/weddings'
ON CONFLICT(path) DO UPDATE SET
  intro=EXCLUDED.intro,
  status='active',
  show_in_nav=FALSE,
  seo_title=EXCLUDED.seo_title,
  seo_description=EXCLUDED.seo_description,
  seo_index=TRUE,
  updated_at=CURRENT_TIMESTAMP;
