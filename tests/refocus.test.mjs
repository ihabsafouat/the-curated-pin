import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fallbackCategories, fallbackLaunchArticles } from "../db/fallback-content.ts";
import { launchArticles } from "../launch/birthday-launch-content.mjs";
import { growthArticles } from "../launch/birthday-growth-content.mjs";
import { verticalArticles } from "../launch/vertical-launch-content.mjs";

test("fallback publishing contains every Birthday article plus Crochet only",()=>{
  const expectedBirthdaySlugs=new Set([...launchArticles,...growthArticles].map((article)=>article.slug));
  const publishedSlugs=new Set(fallbackLaunchArticles.map((article)=>article.slug));
  for(const slug of expectedBirthdaySlugs) assert.ok(publishedSlugs.has(slug),`Birthday URL preserved: ${slug}`);
  assert.equal(fallbackLaunchArticles.length,launchArticles.length+growthArticles.length+verticalArticles.length);
  assert.ok(fallbackLaunchArticles.every((article)=>article.categoryPath.startsWith("celebrations/birthday-parties")||article.categoryPath.startsWith("crafts/crochet")));
});

test("public category and navigation focus is Birthday plus Crochet",()=>{
  assert.ok(fallbackCategories.every((category)=>
    category.path==="celebrations"
    || category.path.startsWith("celebrations/birthday-parties")
    || category.path==="crafts"
    || category.path.startsWith("crafts/crochet"),
  ));
  assert.deepEqual(
    fallbackCategories.filter((category)=>category.showInNav).map((category)=>category.path).sort(),
    ["celebrations/birthday-parties","crafts/crochet"],
  );
});

test("homepage presents Birthday and Crochet without off-brand launch paths",()=>{
  const homepage=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
  assert.match(homepage,/Explore birthday ideas/);
  assert.match(homepage,/Browse crochet projects/);
  assert.doesNotMatch(homepage,/Explore wedding guides|Browse wedding guides|THE WEDDING GAZETTE/);
});
