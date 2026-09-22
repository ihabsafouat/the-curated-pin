import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fallbackCategories, fallbackLaunchArticles } from "../db/fallback-content.ts";
import { halloweenCrochetArticles } from "../launch/halloween-crochet-content.mjs";
import { braletteArticles } from "../launch/bralette-content.mjs";
import { verticalArticles } from "../launch/vertical-launch-content.mjs";

test("all crochet blogs are included in fallback launch articles", () => {
  const allCrochetSlugs = [
    ...verticalArticles.map((a) => a.slug),
    ...halloweenCrochetArticles.map((a) => a.slug),
    ...braletteArticles.map((a) => a.slug),
  ];

  assert.equal(allCrochetSlugs.length, 15, "Expected 15 crochet articles");

  const publishedSlugs = new Set(fallbackLaunchArticles.map((a) => a.slug));
  for (const slug of allCrochetSlugs) {
    assert.ok(publishedSlugs.has(slug), `Crochet article ${slug} must be in fallbackLaunchArticles`);
  }

  const crochetArticles = fallbackLaunchArticles.filter(
    (a) => a.categoryPath === "crafts/crochet" || a.categoryPath.startsWith("crafts/crochet/"),
  );
  assert.equal(crochetArticles.length, 15, "All 15 crochet articles must belong to crafts/crochet");

  // Verify key article properties
  for (const article of crochetArticles) {
    assert.ok(article.title, `${article.slug} must have title`);
    assert.ok(article.dek, `${article.slug} must have dek`);
    assert.ok(article.blocks && article.blocks.length > 0, `${article.slug} must have content blocks`);
    assert.ok(article.image, `${article.slug} must have image`);
  }
});

test("crafts/crochet category exists and is set to show in navigation", () => {
  const crochetCategory = fallbackCategories.find((c) => c.path === "crafts/crochet");
  assert.ok(crochetCategory, "crafts/crochet category must exist in fallbackCategories");
  assert.equal(crochetCategory.status, "active");
  assert.equal(crochetCategory.showInNav, true);
});

test("data.ts merges bundled crochet articles with production database", () => {
  const dataCode = readFileSync(new URL("../db/data.ts", import.meta.url), "utf8");
  assert.match(dataCode, /LOCAL_CONTENT_SLUGS/, "Must define LOCAL_CONTENT_SLUGS");
  assert.match(dataCode, /crafts\/crochet/, "LOCAL_CONTENT_SLUGS must include crafts/crochet articles");
  assert.match(dataCode, /extraArticles/, "Must compute extraArticles from fallbackLaunchArticles");
  assert.match(dataCode, /bundledForPath/, "getPublishedArticlesByCategoryPath must include bundled articles");
});

test("categories.ts ensures crochet categories and content exist even if DB lacks them", () => {
  const categoriesCode = readFileSync(new URL("../db/categories.ts", import.meta.url), "utf8");
  assert.match(categoriesCode, /fallbackHasContent/, "categoryHasPublishedArticles must check fallbackHasContent");
  assert.match(categoriesCode, /missing = fallbackCategories/, "getCategories must merge missing fallback categories");
  assert.match(categoriesCode, /missing = fallbackNavigationCategories/, "getPublicNavigationCategories must ensure fallback nav paths exist");
});

test("seed-vertical-content.mjs seeds all 15 crochet articles during deployment", () => {
  const seeder = readFileSync(new URL("../scripts/seed-vertical-content.mjs", import.meta.url), "utf8");
  assert.match(seeder, /halloweenCrochetArticles/);
  assert.match(seeder, /braletteArticles/);
  assert.match(seeder, /verticalArticles/);
  assert.match(seeder, /\.\.\.verticalArticles,\s*\.\.\.halloweenCrochetArticles,\s*\.\.\.braletteArticles/);
});

test("next.config.ts redirects legacy crochet pattern slugs", () => {
  const nextConfig = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
  assert.match(nextConfig, /\/article\/crochet-ghost-amigurumi-pattern/);
  assert.match(nextConfig, /\/article\/crochet-dinosaur-pattern/);
});
