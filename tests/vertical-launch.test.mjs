import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { allVerticalArticles, auroraArticles, verticalArticles } from "../launch/vertical-launch-content.mjs";
import { pages, keywords, links, backlinkAssets } from "../seo/vertical-plan.mjs";

test("The Curated Pin publishes Crochet and preserves Aurora content for transfer",()=>{
  assert.equal(verticalArticles.length,9);
  assert.equal(new Set(verticalArticles.map((article)=>article.slug)).size,verticalArticles.length);
  for(const article of verticalArticles){
    assert.ok(article.categoryPath.startsWith("crafts/crochet"),`${article.slug} stays in Crochet`);
    assert.ok(article.blocks.filter((block)=>block.type==="internal_link").length>=2,`${article.slug} internal links`);
    assert.ok(article.blocks.some((block)=>block.type==="source_list"),`${article.slug} sources`);
    assert.ok(article.blocks.some((block)=>block.type==="pinterest_asset"),`${article.slug} Pinterest asset`);
    assert.ok(article.blocks.some((block)=>block.type==="faq"),`${article.slug} FAQ`);
    assert.ok(existsSync(new URL(`../public/vertical-media/${article.slug}.png`,import.meta.url)),`${article.slug} hero image`);
    assert.ok(existsSync(new URL(`../public/pinterest/verticals/${article.slug}.png`,import.meta.url)),`${article.slug} pin image`);
  }
  assert.equal(allVerticalArticles.length,verticalArticles.length+auroraArticles.length);
  assert.equal(auroraArticles.length,10);
  assert.ok(auroraArticles.every((article)=>article.categoryPath.startsWith("style/nails")||article.categoryPath.startsWith("style/jewelry")));
});

test("vertical SEO plan uses qualitative research and connected architecture",()=>{
  assert.equal(pages.length,verticalArticles.length+1);
  assert.equal(keywords.length,verticalArticles.reduce((total,article)=>total+1+article.secondaryKeywords.length,0));
  assert.ok(links.length>=20);
  assert.equal(backlinkAssets.length,3);
  assert.ok(pages.every((page)=>page.volume===undefined&&page.kd===undefined));
});

test("deployment activates public categories and releases database content",()=>{
  const migration=readFileSync(new URL("../postgres/migrations/0012_activate_crochet_nails_jewelry.sql",import.meta.url),"utf8");
  const refocus=readFileSync(new URL("../postgres/migrations/0014_refocus_birthday_crochet.sql",import.meta.url),"utf8");
  const netlify=readFileSync(new URL("../netlify.toml",import.meta.url),"utf8");
  assert.match(migration,/crafts\/crochet/);
  assert.match(refocus,/celebrations\/birthday-parties/);
  assert.match(refocus,/crafts\/crochet/);
  assert.match(refocus,/status = 'inactive'/);
  assert.match(refocus,/status = 'draft'/);
  assert.match(netlify,/npm run deploy:prepare/);
});
