import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fallbackCategories, fallbackLaunchArticles } from "../db/fallback-content.ts";
import { caramelAppleBarArticles } from "../launch/caramel-apple-bar-content.mjs";

test("caramel apple bar article is properly published and structured", () => {
  assert.equal(caramelAppleBarArticles.length, 1);
  const raw = caramelAppleBarArticles[0];
  assert.equal(raw.slug, "caramel-apple-bar-ideas");
  assert.equal(raw.categoryPath, "celebrations/birthday-parties");
  assert.ok(raw.title.includes("Caramel Apple Bar"));
  assert.ok(raw.dek.length > 50);
  assert.ok(raw.blocks.length >= 25, "must have comprehensive blocks");
  assert.ok(raw.blocks.some((b) => b.type === "checklist"), "must have checklist block");
  assert.ok(raw.blocks.some((b) => b.type === "table"), "must have table block");
  assert.ok(raw.blocks.some((b) => b.type === "comparison"), "must have comparison block");
  assert.ok(raw.blocks.some((b) => b.type === "faq"), "must have faq block");
  assert.ok(raw.blocks.some((b) => b.type === "pinterest_asset"), "must have pinterest asset block");
  assert.ok(raw.blocks.some((b) => b.type === "internal_link"), "must have internal link block");
  assert.ok(raw.blocks.some((b) => b.type === "product_cta"), "must have product cta block");
  assert.ok(raw.blocks.some((b) => b.type === "lead_magnet"), "must have lead magnet block");
  assert.ok(raw.blocks.some((b) => b.type === "tip"), "must have tip block");
  assert.ok(raw.blocks.some((b) => b.type === "idea"), "must have idea block");

  const bundled = fallbackLaunchArticles.find((a) => a.slug === "caramel-apple-bar-ideas");
  assert.ok(bundled, "caramel-apple-bar-ideas must exist in fallbackLaunchArticles");
  assert.equal(bundled.slug, "caramel-apple-bar-ideas");
  assert.equal(bundled.categoryPath, "celebrations/birthday-parties");
  assert.equal(bundled.category, "Birthday Parties");
  assert.equal(bundled.status, "published");

  const dataCode = readFileSync(new URL("../db/data.ts", import.meta.url), "utf8");
  assert.match(dataCode, /"caramel-apple-bar-ideas"/, "data.ts must register caramel-apple-bar-ideas in LOCAL_CONTENT_SLUGS");

  const pageCode = readFileSync(new URL("../app/article/[slug]/page.tsx", import.meta.url), "utf8");
  assert.match(pageCode, /"caramel-apple-bar-ideas"/, "article page must have promise override for caramel-apple-bar-ideas");
});
