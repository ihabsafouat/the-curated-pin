import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const migration = read("postgres/migrations/0005_advanced_seo.sql");
const seo = read("app/seo.ts");
const article = read("app/article/[slug]/page.tsx");
const category = read("app/category/[...path]/page.tsx");
const sitemap = read("app/sitemap.ts");
const robots = read("app/robots.ts");
const breadcrumbs = read("app/components/Breadcrumbs.tsx");
const author = read("app/authors/the-curated-pin-editors/page.tsx");
const config = read("next.config.ts");

test("priority 4 persists editorial SEO controls", () => {
  assert.match(migration, /image_alt/);
  assert.match(migration, /social_image/);
  assert.match(migration, /canonical_path/);
  assert.match(migration, /seo_index/);
});

test("public metadata uses self canonicals, crawl controls and large image previews", () => {
  assert.match(seo, /max-image-preview/);
  assert.match(article, /sameSiteCanonical/);
  assert.match(article, /publicRobots\(article\.seoIndex\)/);
  assert.match(category, /hasPublishedContent && category\.seoIndex/);
  assert.match(category, /siteName: SITE_NAME/);
});

test("article schema and Pinterest/Open Graph fields expose editorial authorship", () => {
  assert.match(article, /BlogPosting/);
  assert.match(article, /EDITORIAL_AUTHOR_PATH/);
  assert.match(article, /publishedTime/);
  assert.match(article, /modifiedTime/);
  assert.match(article, /section: article\.category/);
  assert.match(author, /ProfilePage/);
});

test("sitemap contains canonical indexable URLs and image entries only", () => {
  assert.match(sitemap, /article\.seoIndex/);
  assert.match(sitemap, /sameSiteCanonical/);
  assert.match(sitemap, /images:/);
  assert.doesNotMatch(sitemap, /const now = new Date/);
});

test("crawl policy leaves noindex HTML crawlable and blocks only system surfaces", () => {
  assert.match(robots, /"\/studio\/"/);
  assert.match(robots, /"\/api\/"/);
  assert.doesNotMatch(robots, /"\/login"/);
  assert.doesNotMatch(robots, /"\/search"/);
  assert.match(config, /X-Robots-Tag/);
});

test("breadcrumb markup does not incorrectly point the current crumb at home", () => {
  assert.match(breadcrumbs, /\.\.\.\(item\.href \? \{ item: absoluteUrl\(item\.href\) \} : \{\}\)/);
  assert.doesNotMatch(breadcrumbs, /item\.href \|\| "\/"/);
});
