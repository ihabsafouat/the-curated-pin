import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { pages, keywords, links, backlinkAssets } from "../seo/birthday-plan.mjs";

const migration = await readFile(new URL("../postgres/migrations/0003_seo_authority_architecture.sql", import.meta.url), "utf8");
const seoDb = await readFile(new URL("../db/seo.ts", import.meta.url), "utf8");
const articlePage = await readFile(new URL("../app/article/[slug]/page.tsx", import.meta.url), "utf8");
const categoryPage = await readFile(new URL("../app/category/[...path]/page.tsx", import.meta.url), "utf8");
const adminMap = await readFile(new URL("../app/studio/seo-map/page.tsx", import.meta.url), "utf8");

test("priority 2 persists page ownership, net-linking and linkable assets", () => {
  assert.match(migration, /CREATE TABLE IF NOT EXISTS seo_pages/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS seo_keywords/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS seo_internal_links/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS seo_backlink_assets/);
  assert.match(migration, /semantic_score INTEGER NOT NULL/);
});

test("birthday launch plan contains 30 article plans plus 9 thematic/category nodes", () => {
  assert.equal(pages.filter((page) => page.entityType === "article").length, 30);
  assert.equal(pages.filter((page) => page.entityType === "category").length, 9);
  assert.ok(pages.some((page) => page.key === "article:birthday-party-ideas" && page.volume === 368000 && page.kd === 22));
  assert.ok(pages.some((page) => page.key === "article:teen-birthday-party-ideas" && page.kd === 14));
});

test("keyword ownership avoids exact active cannibalization", () => {
  const active = keywords.filter((keyword) => keyword.role !== "excluded");
  const owners = new Map();
  for (const claim of active) {
    const key = claim.keyword.toLowerCase().trim();
    const previous = owners.get(key);
    assert.ok(!previous || previous === claim.page, `duplicate active owner for ${claim.keyword}: ${previous} / ${claim.page}`);
    owners.set(key, claim.page);
  }
});

test("required internal links respect the semantic floor and concentrate authority", () => {
  assert.ok(links.length >= 100);
  assert.equal(links.filter((link) => link.required && link.semantic < 65).length, 0);
  assert.ok(links.filter((link) => link.target === "article:birthday-party-ideas").length >= 20);
  assert.ok(links.some((link) => link.source === "article:teen-birthday-party-ideas" && link.target === "article:13th-birthday-party-ideas"));
  assert.ok(links.some((link) => link.source === "article:backyard-party-games" && link.target === "article:outdoor-birthday-party-ideas"));
});

test("public pages use strategic internal links rather than random cross-vertical recommendations", () => {
  assert.match(articlePage, /getStrategicLinksForArticle/);
  assert.match(categoryPage, /getStrategicLinksForCategory/);
  assert.doesNotMatch(categoryPage, /From another corner/);
  assert.match(categoryPage, /publicRobots\(index\)/);
});

test("admin exposes PageRank simulation, cannibalization and backlink planning", () => {
  assert.match(adminMap, /Highest authority targets/);
  assert.match(adminMap, /Cannibalization & semantic drift/);
  assert.match(adminMap, /Earned-link assets/);
  assert.match(seoDb, /simulatePageRank/);
  assert.match(seoDb, /detectCannibalization/);
  assert.ok(backlinkAssets.length >= 6);
});
