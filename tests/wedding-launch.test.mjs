import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { weddingArticles } from "../launch/wedding-launch-content.mjs";

test("wedding launch adds five product-connected guides",()=>{
  assert.equal(weddingArticles.length,5);
  assert.equal(new Set(weddingArticles.map((article)=>article.slug)).size,5);
  for(const article of weddingArticles){
    assert.ok(article.categoryPath.startsWith("celebrations/weddings"),`${article.slug} category`);
    assert.equal(article.secondaryKeywords.length,3,`${article.slug} keyword cluster`);
    assert.ok(article.blocks.filter((block)=>block.type==="internal_link").length>=2,`${article.slug} internal links`);
    assert.ok(article.blocks.some((block)=>block.type==="product_cta"&&block.url==="https://theweddinggazette.netlify.app/"),`${article.slug} product path`);
    assert.ok(article.blocks.some((block)=>block.type==="source_list"),`${article.slug} sources`);
    assert.ok(article.blocks.some((block)=>block.type==="faq"),`${article.slug} FAQ`);
    assert.ok(!article.blocks.some((block)=>block.type==="pinterest_asset"),`${article.slug} Pins wait for the proven creative style`);
    assert.ok(existsSync(new URL(`../public/wedding-media/${article.slug}.png`,import.meta.url)),`${article.slug} hero image`);
  }
});

test("wedding work is preserved but excluded from The Curated Pin publishing",()=>{
  const migration=readFileSync(new URL("../postgres/migrations/0013_wedding_content_funnel.sql",import.meta.url),"utf8");
  const refocus=readFileSync(new URL("../postgres/migrations/0014_refocus_birthday_crochet.sql",import.meta.url),"utf8");
  const seed=readFileSync(new URL("../scripts/seed-vertical-content.mjs",import.meta.url),"utf8");
  assert.match(migration,/celebrations\/weddings/);
  assert.match(refocus,/celebrations\/weddings/);
  assert.match(refocus,/status = 'inactive'/);
  assert.doesNotMatch(seed,/weddingArticles/);
});
