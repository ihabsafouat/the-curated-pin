import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=(path)=>fs.readFileSync(new URL(`../${path}`,import.meta.url),"utf8");
const page=read("app/article/[slug]/page.tsx");
const blocks=read("app/components/ArticleBlocks.tsx");
const nav=read("app/components/ArticleGuideNav.tsx");
const utility=read("app/components/ArticleUtilityBar.tsx");
const gallery=read("app/components/ArticleGallery.tsx");
const faq=read("app/components/ArticleFaq.tsx");
const experience=read("app/components/ExperienceLayer.tsx");
const validation=read("app/security/validation.ts");
const analytics=read("db/analytics.ts");
const css=read("app/globals.css");

test("Priority 8 fixes split-block anchor IDs and preserves idea numbering",()=>{
  assert.match(blocks,/startIndex = 0/);
  assert.match(blocks,/const globalIndex=startIndex\+index/);
  assert.match(page,/startIndex=\{leadInsertAt\}/);
  assert.match(page,/ideaStart=\{ideasBeforeLead\}/);
});

test("article navigation is sticky, active-section aware and mobile friendly",()=>{
  assert.match(page,/ArticleGuideNav/);
  assert.match(nav,/IntersectionObserver/);
  assert.match(nav,/aria-current/);
  assert.match(css,/articleGuideLinks a\.active/);
  assert.match(css,/articleLayout>aside\.articleTocAside\{display:block!important/);
});

test("article actions support native share, copy and Pinterest with first-party analytics",()=>{
  assert.match(utility,/navigator\.share/);
  assert.match(utility,/navigator\.clipboard/);
  assert.match(utility,/pinterest\.com\/pin\/create\/button/);
  assert.match(utility,/eventType:"share_click"/);
  assert.match(validation,/"share_click"/);
  assert.match(analytics,/"share_click"/);
});

test("galleries use an accessible native dialog lightbox and FAQ has bulk controls",()=>{
  assert.match(gallery,/<dialog/);
  assert.match(gallery,/showModal/);
  assert.match(gallery,/aria-label="Close image viewer"/);
  assert.match(faq,/Expand all/);
  assert.match(faq,/querySelectorAll\("details"\)/);
  assert.match(blocks,/ArticleGallery/);
  assert.match(blocks,/ArticleFaq/);
});

test("article tables expose an accessible scroll region and mobile hint",()=>{
  assert.match(blocks,/role="region"/);
  assert.match(blocks,/tabIndex=\{0\}/);
  assert.match(blocks,/data-label=\{header\}/);
  assert.match(css,/\.tableHint\{display:none/);
});

test("contextual lead magnet placement follows content structure rather than a blind percentage",()=>{
  assert.match(page,/function leadInsertIndex/);
  assert.match(page,/if \(h2 === 2\)/);
  assert.match(page,/ContextualLeadMagnet/);
});

test("global reading progress becomes article-relative on article pages",()=>{
  assert.match(experience,/article\.articlePage/);
  assert.match(experience,/article\.offsetHeight/);
});
