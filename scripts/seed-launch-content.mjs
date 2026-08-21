import pg from "pg";
import { launchArticles } from "../launch/birthday-launch-content.mjs";

const databaseUrl = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_MIGRATION_URL or DATABASE_URL is required.");
const requested = "draft";
if (process.argv.some((arg) => arg === "--status=published")) throw new Error("Bulk publishing is disabled. Seed launch content as drafts and publish reviewed articles individually from Studio.");
const client = new pg.Client({ connectionString: databaseUrl });
await client.connect();
try {
  await client.query("BEGIN");
  for (const article of launchArticles) {
    const category = await client.query("SELECT id,name,path FROM categories WHERE path=$1 AND status='active' LIMIT 1", [article.categoryPath]);
    if (!category.rowCount) throw new Error(`Active category not found: ${article.categoryPath}`);
    const c = category.rows[0];
    const current = await client.query("SELECT id,published_at FROM articles WHERE slug=$1 LIMIT 1", [article.slug]);
    let id;
    if (current.rowCount) {
      id = current.rows[0].id;
      await client.query(`UPDATE articles SET category_id=$2,category=$3,category_slug=$4,title=$5,dek=$6,image=$7,read_time=$8,sections_json='[]'::jsonb,blocks_json=$9::jsonb,status=$10,seo_title=$11,seo_description=$12,affiliate_url='',affiliate_label='',image_alt=$13,social_image=$14,canonical_path='',seo_index=TRUE,updated_at=CURRENT_TIMESTAMP,published_at=CASE WHEN $10='published' THEN COALESCE(published_at,CURRENT_TIMESTAMP) ELSE NULL END WHERE id=$1`,
        [id,c.id,c.name,c.path,article.title,article.dek,article.image,article.readTime,JSON.stringify(article.blocks),requested,article.seoTitle,article.seoDescription,article.imageAlt,article.socialImage]);
    } else {
      const inserted = await client.query(`INSERT INTO articles (author_id,category_id,slug,category,category_slug,title,dek,image,read_time,sections_json,blocks_json,status,seo_title,seo_description,affiliate_url,affiliate_label,image_alt,social_image,canonical_path,seo_index,published_at) VALUES (NULL,$1,$2,$3,$4,$5,$6,$7,$8,'[]'::jsonb,$9::jsonb,$10,$11,$12,'','',$13,$14,'',TRUE,CASE WHEN $10='published' THEN CURRENT_TIMESTAMP ELSE NULL END) RETURNING id`,
        [c.id,article.slug,c.name,c.path,article.title,article.dek,article.image,article.readTime,JSON.stringify(article.blocks),requested,article.seoTitle,article.seoDescription,article.imageAlt,article.socialImage]);
      id = inserted.rows[0].id;
    }
    await client.query(`UPDATE seo_pages SET article_id=$1,status=CASE WHEN $2='published' THEN 'published' ELSE 'briefed' END,updated_at=CURRENT_TIMESTAMP WHERE page_key=$3`,[id,requested,`article:${article.slug}`]);
  }
  await client.query("COMMIT");
  console.log(`Seeded ${launchArticles.length} launch articles as ${requested}.`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
