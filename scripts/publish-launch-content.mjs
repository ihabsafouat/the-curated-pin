import pg from "pg";
import { launchArticles } from "../launch/birthday-launch-content.mjs";

const databaseUrl = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_MIGRATION_URL or DATABASE_URL is required.");

const confirm = process.argv.includes("--confirm=publish-reviewed-launch");
if (!confirm) {
  throw new Error("Publishing changes public database state. Re-run with --confirm=publish-reviewed-launch after reviewing the bundled guides.");
}

const requestedSlugs = process.argv
  .filter((value) => value.startsWith("--slug="))
  .map((value) => value.slice("--slug=".length));
const publishAll = process.argv.includes("--all");
if (!publishAll && requestedSlugs.length === 0) throw new Error("Pass --all or one or more --slug=<article-slug> values.");

const bundledBySlug = new Map(launchArticles.map((article) => [article.slug, article]));
const slugs = publishAll ? [...bundledBySlug.keys()] : requestedSlugs;
for (const slug of slugs) {
  const article = bundledBySlug.get(slug);
  if (!article) throw new Error(`Unknown bundled launch slug: ${slug}`);
  const ideaCount = article.blocks.filter((block) => block.type === "idea").length;
  const promisedCount = Number(article.title.match(/^(\d+)/)?.[1] || 0);
  if (!ideaCount || ideaCount !== promisedCount) throw new Error(`${slug} failed its title/idea-count review gate.`);
}

const client = new pg.Client({ connectionString: databaseUrl });
await client.connect();
try {
  await client.query("BEGIN");
  const existing = await client.query("SELECT slug,status FROM articles WHERE slug = ANY($1::text[])", [slugs]);
  const existingSlugs = new Set(existing.rows.map((row) => row.slug));
  const missing = slugs.filter((slug) => !existingSlugs.has(slug));
  if (missing.length) throw new Error(`Seed these launch articles before publishing: ${missing.join(", ")}`);

  const result = await client.query(
    `UPDATE articles
     SET status='published', published_at=COALESCE(published_at,CURRENT_TIMESTAMP), updated_at=CURRENT_TIMESTAMP
     WHERE slug = ANY($1::text[])`,
    [slugs],
  );
  await client.query(
    `UPDATE seo_pages SET status='published',updated_at=CURRENT_TIMESTAMP
     WHERE page_key = ANY($1::text[])`,
    [slugs.map((slug) => `article:${slug}`)],
  );
  await client.query("COMMIT");
  process.stdout.write(`Published ${result.rowCount} reviewed launch article${result.rowCount === 1 ? "" : "s"}.\n`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
