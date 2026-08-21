-- Priority 4: advanced SEO controls for public editorial pages.
ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_alt VARCHAR(320) NOT NULL DEFAULT '';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS social_image TEXT NOT NULL DEFAULT '';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS canonical_path VARCHAR(300) NOT NULL DEFAULT '';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS seo_index BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE categories ADD COLUMN IF NOT EXISTS seo_title VARCHAR(180) NOT NULL DEFAULT '';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS seo_description VARCHAR(180) NOT NULL DEFAULT '';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS social_image TEXT NOT NULL DEFAULT '';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS seo_index BOOLEAN NOT NULL DEFAULT TRUE;

-- Existing hero images receive a conservative fallback; editors should replace it with descriptive alt text.
UPDATE articles SET image_alt = title WHERE image_alt = '';
