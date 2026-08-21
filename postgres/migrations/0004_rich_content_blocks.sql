ALTER TABLE articles ADD COLUMN IF NOT EXISTS blocks_json JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Priority 3 keeps sections_json for backwards compatibility while blocks_json becomes
-- the richer source of truth for newly edited articles. Existing articles are converted
-- at runtime until they are next saved in the editor.
CREATE INDEX IF NOT EXISTS articles_blocks_gin_idx ON articles USING GIN (blocks_json);
