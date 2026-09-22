import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Pagination component supports accessible page navigation and query preservation", () => {
  const component = read("app/components/Pagination.tsx");
  assert.match(component, /aria-label="Pagination"/);
  assert.match(component, /aria-label="Previous page"/);
  assert.match(component, /aria-label="Next page"/);
  assert.match(component, /aria-current="page"/);
  assert.match(component, /if \(totalPages <= 1\) return null/);
  assert.match(component, /createPageUrl/);
});

test("Category pages integrate pagination with page size controls", () => {
  const categoryPage = read("app/category/[...path]/page.tsx");
  assert.match(categoryPage, /Pagination/);
  assert.match(categoryPage, /PAGE_SIZE/);
  assert.match(categoryPage, /searchParams/);
  assert.match(categoryPage, /paginatedItems/);
  assert.match(categoryPage, /Showing \$\{/);
});

test("Articles library page provides full blog listing with category filters and pagination", () => {
  const articlesPage = read("app/articles/page.tsx");
  assert.match(articlesPage, /Pagination/);
  assert.match(articlesPage, /getPublishedArticles/);
  assert.match(articlesPage, /articlesFilterBar/);
  assert.match(articlesPage, /All guides/);
});

test("Blog route re-exports articles archive with metadata", () => {
  const blogPage = read("app/blog/page.tsx");
  assert.match(blogPage, /ArticlesPage/);
  assert.match(blogPage, /\.\.\/articles\/page/);
});

test("Search page supports paginated results", () => {
  const searchPage = read("app/search/page.tsx");
  assert.match(searchPage, /Pagination/);
  assert.match(searchPage, /PAGE_SIZE/);
  assert.match(searchPage, /paginatedResults/);
});
