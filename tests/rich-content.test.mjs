import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const migration = read("postgres/migrations/0004_rich_content_blocks.sql");
const content = read("app/content.ts");
const validation = read("app/security/validation.ts");
const renderer = read("app/components/ArticleBlocks.tsx");
const articlePage = read("app/article/[slug]/page.tsx");
const form = read("app/studio/components/ArticleForm.tsx");

test("priority 3 stores rich blocks while retaining legacy section compatibility", () => {
  assert.match(migration, /blocks_json\s+JSONB/i);
  assert.match(content, /type:\s*"affiliate_product"/);
  assert.match(content, /type:\s*"lead_magnet"/);
  assert.match(content, /type:\s*"product_cta"/);
  assert.match(content, /type:\s*"faq"/);
  assert.match(content, /legacySectionsToBlocks/);
});

test("rich block validation separates paid, owned and internal links", () => {
  assert.match(validation, /z\.literal\("affiliate_product"\)/);
  assert.match(validation, /z\.literal\("product_cta"\)/);
  assert.match(validation, /Internal link blocks must use a same-site path/);
});

test("affiliate blocks are qualified and disclosed close to the recommendation", () => {
  assert.match(renderer, /rel="nofollow sponsored noopener"/);
  assert.match(renderer, /We may earn a commission if you purchase/);
  assert.match(articlePage, /Affiliate disclosure:/);
});

test("article pages render blocks and a block-derived TOC without unsupported FAQ rich-result markup", () => {
  assert.match(articlePage, /<ArticleBlocks blocks=\{blocksBeforeLead\}/);
  assert.match(articlePage, /<ArticleBlocks blocks=\{blocksAfterLead\}/);
  assert.match(articlePage, /getArticleHeadings/);
  assert.match(articlePage, /BlogPosting/);
  assert.doesNotMatch(articlePage, /FAQPage/);
});

test("editor exposes conversion and semantic block types without raw HTML", () => {
  assert.match(form, /Affiliate product/);
  assert.match(form, /Lead magnet CTA/);
  assert.match(form, /Digital product CTA/);
  assert.match(form, /Internal link card/);
  assert.doesNotMatch(form, /dangerouslySetInnerHTML/);
});
