import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=(path)=>fs.readFileSync(new URL(`../${path}`,import.meta.url),"utf8");
const pathOf=(path)=>new URL(`../${path}`,import.meta.url);
const pkg=JSON.parse(read("package.json"));
const manifest=JSON.parse(read("launch/launch-manifest.json"));
const seed=read("scripts/seed-launch-content.mjs");
const audience=read("scripts/seed-audience.mjs");
const catalog=read("app/shop/catalog.ts");
const productPage=read("app/shop/[slug]/page.tsx");
const env=read(".env.example");

function pngDimensions(path){
  const buf=fs.readFileSync(pathOf(path));
  assert.equal(buf.subarray(1,4).toString(),"PNG");
  return [buf.readUInt32BE(16),buf.readUInt32BE(20)];
}

test("Priority 11 seeds exactly 12 validated first-wave Birthday articles as drafts",async()=>{
  assert.equal(manifest.articles.length,12);
  assert.equal(pkg.scripts["launch:seed"],"node --env-file-if-exists=.env --env-file-if-exists=.env.local scripts/seed-launch-content.mjs --status=draft");
  assert.equal(pkg.scripts["launch:publish-all"],undefined);
  assert.match(pkg.scripts["setup:priority11"],/launch:seed/);
  assert.match(seed,/const requested = "draft"/);
  assert.match(seed,/Bulk publishing is disabled/);
});

test("article list-number promises match the actual rich idea-card count",async()=>{
  const mod=await import(pathOf("launch/birthday-launch-content.mjs"));
  assert.equal(mod.launchArticles.length,12);
  for(const article of mod.launchArticles){
    const ideas=article.blocks.filter((block)=>block.type==="idea").length;
    const promised=Number(article.title.match(/^(\d+)/)?.[1]||0);
    assert.equal(promised,ideas,`${article.slug} title count should equal idea blocks`);
    assert.ok(article.blocks.some((block)=>block.type==="internal_link"),`${article.slug} should have a semantic internal link`);
    assert.ok(article.blocks.some((block)=>block.type==="faq"),`${article.slug} should have FAQ content`);
  }
});

test("launch manifest matches article SEO titles and has three distinct Pinterest hooks per page",async()=>{
  const mod=await import(pathOf("launch/birthday-launch-content.mjs"));
  const bySlug=new Map(mod.launchArticles.map((article)=>[article.slug,article]));
  for(const plan of manifest.articles){
    assert.equal(bySlug.get(plan.slug)?.seoTitle,plan.seoTitle);
    assert.equal(plan.pins.length,3);
    assert.equal(new Set(plan.pins).size,3);
    for(const title of plan.pins) assert.ok(title.length<=100,`${plan.slug} Pin title <= 100 chars`);
  }
});

test("36 dedicated 2:3 Pinterest creatives and 12 article heroes are bundled",()=>{
  for(const plan of manifest.articles){
    assert.deepEqual(pngDimensions(`public/launch-media/${plan.slug}.png`),[1600,900]);
    for(let i=1;i<=3;i++){
      assert.deepEqual(pngDimensions(`public/pinterest/${plan.slug}-pin-${i}.png`),[1000,1500]);
      assert.deepEqual(pngDimensions(`launch-assets/pinterest/${plan.slug}-pin-${i}.png`),[1000,1500]);
    }
  }
});

test("two real free lead magnets and two paid launch workbooks are included",()=>{
  const files=[
    "public/downloads/birthday-party-quick-start-kit.pdf",
    "public/downloads/teen-birthday-party-planning-kit.pdf",
    "launch-assets/products/ultimate-birthday-party-planner.pdf",
    "launch-assets/products/teen-birthday-party-planner-games-pack.pdf",
  ];
  for(const file of files){
    const stat=fs.statSync(pathOf(file));
    assert.ok(stat.size>8000,`${file} should contain a non-trivial PDF`);
  }
  assert.match(audience,/birthday-party-quick-start-kit\.pdf/);
  assert.match(audience,/teen-birthday-party-planning-kit\.pdf/);
});

test("owned product pages are first-party and require server-configured checkout URLs",()=>{
  assert.match(catalog,/Ultimate Birthday Party Planner/);
  assert.match(catalog,/Teen Birthday Planner \+ Games Pack/);
  assert.match(catalog,/CHECKOUT_URL_ULTIMATE_BIRTHDAY_PARTY_PLANNER/);
  assert.match(catalog,/CHECKOUT_URL_TEEN_BIRTHDAY_PARTY_PLANNER/);
  assert.match(productPage,/data-analytics-kind="checkout"/);
  assert.match(env,/CHECKOUT_URL_ULTIMATE_BIRTHDAY_PARTY_PLANNER=/);
  assert.match(env,/CHECKOUT_URL_TEEN_BIRTHDAY_PARTY_PLANNER=/);
});
