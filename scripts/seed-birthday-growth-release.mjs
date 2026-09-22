import pg from "pg";
import { growthArticles } from "../launch/birthday-growth-content.mjs";

const databaseUrl = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_MIGRATION_URL or DATABASE_URL is required.");

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes("localhost") ? false : { rejectUnauthorized: false },
});
await client.connect();

try {
  await client.query("BEGIN");
  for (const article of growthArticles) {
    const category = await client.query(
      "SELECT id,name,path FROM categories WHERE path=$1 AND status='active' LIMIT 1",
      [article.categoryPath],
    );
    if (!category.rowCount) throw new Error(`Active category not found: ${article.categoryPath}`);
    const currentCategory = category.rows[0];
    const current = await client.query("SELECT id,published_at FROM articles WHERE slug=$1 LIMIT 1", [article.slug]);

    if (current.rowCount) {
      await client.query(
        `UPDATE articles
         SET category_id=$2,category=$3,category_slug=$4,title=$5,dek=$6,image=$7,read_time=$8,
             sections_json='[]'::jsonb,blocks_json=$9::jsonb,status='published',seo_title=$10,
             seo_description=$11,affiliate_url='',affiliate_label='',image_alt=$12,social_image=$13,
             canonical_path='',seo_index=TRUE,published_at=COALESCE(published_at,CURRENT_TIMESTAMP),
             updated_at=CURRENT_TIMESTAMP
         WHERE id=$1`,
        [current.rows[0].id,currentCategory.id,currentCategory.name,currentCategory.path,article.title,article.dek,
          article.image,article.readTime,JSON.stringify(article.blocks),article.seoTitle,article.seoDescription,
          article.imageAlt,article.socialImage],
      );
    } else {
      await client.query(
        `INSERT INTO articles
           (author_id,category_id,slug,category,category_slug,title,dek,image,read_time,sections_json,
            blocks_json,status,seo_title,seo_description,affiliate_url,affiliate_label,image_alt,
            social_image,canonical_path,seo_index,published_at)
         VALUES (NULL,$1,$2,$3,$4,$5,$6,$7,$8,'[]'::jsonb,$9::jsonb,'published',$10,$11,'','',$12,$13,'',TRUE,CURRENT_TIMESTAMP)`,
        [currentCategory.id,article.slug,currentCategory.name,currentCategory.path,article.title,article.dek,
          article.image,article.readTime,JSON.stringify(article.blocks),article.seoTitle,article.seoDescription,
          article.imageAlt,article.socialImage],
      );
    }

    await client.query(
      `UPDATE seo_pages
       SET article_id=(SELECT id FROM articles WHERE slug=$1),status='published',updated_at=CURRENT_TIMESTAMP
       WHERE page_key=$2`,
      [article.slug,`article:${article.slug}`],
    );
  }
  await client.query("COMMIT");
  process.stdout.write(`Published ${growthArticles.length} Birthday growth articles. Existing URLs were preserved.\n`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
