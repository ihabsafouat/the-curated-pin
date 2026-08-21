import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migration = await readFile(new URL("../postgres/migrations/0002_hierarchical_taxonomy.sql", import.meta.url), "utf8");
const validation = await readFile(new URL("../app/security/validation.ts", import.meta.url), "utf8");
const header = await readFile(new URL("../app/components/SubHeader.tsx", import.meta.url), "utf8");
const articleForm = await readFile(new URL("../app/studio/components/ArticleForm.tsx", import.meta.url), "utf8");
const sitemap = await readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8");

 test("hierarchical categories are persisted in PostgreSQL", () => {
  assert.match(migration, /CREATE TABLE IF NOT EXISTS categories/);
  assert.match(migration, /parent_id BIGINT REFERENCES categories/);
  assert.match(migration, /path VARCHAR\(260\) NOT NULL UNIQUE/);
  assert.match(migration, /ALTER TABLE articles ADD COLUMN IF NOT EXISTS category_id/);
  assert.match(migration, /celebrations\/birthday-parties/);
  assert.match(migration, /crafts\/crochet/);
  assert.match(migration, /crafts\/sewing/);
});

test("article publishing validates category IDs instead of a hard-coded enum", () => {
  assert.match(validation, /categoryId:\s*z\.coerce\.number\(\)\.int\(\)\.positive\(\)/);
  assert.doesNotMatch(validation, /categorySlug:\s*z\.enum/);
  assert.match(articleForm, /name="categoryId"/);
  for (const legacy of ["cats", "dogs", "jewelry", "home-and-decor", "digital-studio"]) {
    assert.doesNotMatch(articleForm, new RegExp(`\\[?\\\"${legacy}\\\"`));
  }
});

test("public navigation and sitemap are database-driven", () => {
  assert.match(header, /getPublicNavigationCategories/);
  assert.match(sitemap, /getCategories/);
  assert.match(sitemap, /getPublishedArticles/);
});
