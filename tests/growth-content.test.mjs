import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { growthArticles } from "../launch/birthday-growth-content.mjs";
import { launchArticles } from "../launch/birthday-launch-content.mjs";
import { pages } from "../seo/birthday-plan.mjs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("growth sprint adds twelve distinct articles without changing the original launch set", () => {
  assert.equal(growthArticles.length, 12);
  assert.equal(new Set(growthArticles.map((article) => article.slug)).size, 12);
  const originalSlugs = new Set(launchArticles.map((article) => article.slug));
  const plannedSlugs = new Set(pages.map((page) => page.slug));
  for (const article of growthArticles) {
    assert.equal(originalSlugs.has(article.slug), false, `${article.slug} must not replace an existing article`);
    assert.equal(plannedSlugs.has(article.slug), true, `${article.slug} must match an existing researched SEO page`);
  }
});

test("every growth article fulfills its title promise and includes useful conversion content", () => {
  for (const article of growthArticles) {
    const ideas = article.blocks.filter((entry) => entry.type === "idea");
    assert.equal(ideas.length, Number(article.title.match(/^(\d+)/)?.[1]), `${article.slug} idea count`);
    assert.ok(article.blocks.some((entry) => entry.type === "faq"), `${article.slug} FAQ`);
    assert.ok(article.blocks.some((entry) => entry.type === "internal_link"), `${article.slug} internal link`);
    assert.ok(article.blocks.some((entry) => entry.type === "product_cta"), `${article.slug} product CTA`);
    assert.ok(article.blocks.some((entry) => entry.type === "checklist"), `${article.slug} checklist`);
    assert.equal(article.image, `/pinterest/growth-${article.slug}.png`);
    for (const entry of ideas) assert.ok(entry.body.length >= 80, `${article.slug}: ${entry.title} needs practical detail`);
  }
});

test("growth seeding preserves existing publication state and publishing requires explicit confirmation", () => {
  const seed = read("scripts/seed-growth-content.mjs");
  const publish = read("scripts/publish-growth-content.mjs");
  const pkg = JSON.parse(read("package.json"));
  assert.doesNotMatch(seed, /published_at\s*=\s*NULL/i);
  assert.match(seed, /current\.rows\[0\]\.status/);
  assert.match(seed, /without changing their publication status/);
  assert.match(publish, /--confirm=publish-reviewed-growth/);
  assert.match(pkg.scripts["growth:publish"], /--all --confirm=publish-reviewed-growth/);
});

test("growth article planners match the existing first-party product prices", () => {
  for (const article of growthArticles) {
    const planner = article.blocks.find((entry) => entry.type === "product_cta");
    if (article.categoryPath.endsWith("teen-birthdays")) {
      assert.equal(planner.url, "/shop/teen-birthday-party-planner");
      assert.equal(planner.price, "$14");
    } else {
      assert.equal(planner.url, "/shop/ultimate-birthday-party-planner");
      assert.equal(planner.price, "$12");
    }
  }
});
