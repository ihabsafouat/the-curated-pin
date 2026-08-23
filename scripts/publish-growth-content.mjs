import pg from "pg";
import { growthArticles } from "../launch/birthday-growth-content.mjs";

const databaseUrl = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_MIGRATION_URL or DATABASE_URL is required.");
if (!process.argv.includes("--confirm=publish-reviewed-growth")) {
  throw new Error("Publishing changes public database state. Review the new growth articles and run npm run growth:publish when you are ready.");
}

const requestedSlugs = process.argv.filter((argument) => argument.startsWith("--slug=")).map((argument) => argument.slice(7));
const publishAll = process.argv.includes("--all");
if (!publishAll && !requestedSlugs.length) throw new Error("Pass --all or one or more --slug=<article-slug> values.");

const bySlug = new Map(growthArticles.map((article) => [article.slug, article]));
const slugs = publishAll ? [...bySlug.keys()] : [...new Set(requestedSlugs)];

for (const slug of slugs) {
  const article = bySlug.get(slug);
  if (!article) throw new Error(`Unknown growth article slug: ${slug}`);
  const promisedCount = Number(article.title.match(/^(\d+)/)?.[1] || 0);
  const ideaCount = article.blocks.filter((entry) => entry.type === "idea").length;
  const hasFaq = article.blocks.some((entry) => entry.type === "faq");
  const hasInternalLink = article.blocks.some((entry) => entry.type === "internal_link");
  if (!ideaCount || ideaCount !== promisedCount || !hasFaq || !hasInternalLink) {
    throw new Error(`${slug} failed the title, idea count, FAQ or internal-link review gate.`);
  }
}

const client = new pg.Client({ connectionString: databaseUrl });
await client.connect();

try {
  await client.query("BEGIN");
  const found = await client.query("SELECT slug FROM articles WHERE slug=ANY($1::text[])", [slugs]);
  const foundSlugs = new Set(found.rows.map((row) => row.slug));
  const missing = slugs.filter((slug) => !foundSlugs.has(slug));
  if (missing.length) throw new Error(`Run npm run growth:seed before publishing: ${missing.join(", ")}`);

  const published = await client.query(
    `UPDATE articles
     SET status='published',published_at=COALESCE(published_at,CURRENT_TIMESTAMP),updated_at=CURRENT_TIMESTAMP
     WHERE slug=ANY($1::text[])`,
    [slugs],
  );
  await client.query(
    "UPDATE seo_pages SET status='published',updated_at=CURRENT_TIMESTAMP WHERE page_key=ANY($1::text[])",
    [slugs.map((slug) => `article:${slug}`)],
  );
  await client.query("COMMIT");
  console.log(`Published ${published.rowCount} reviewed growth articles. Existing first-wave articles were not touched.`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
