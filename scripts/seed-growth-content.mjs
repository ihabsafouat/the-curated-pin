import pg from "pg";
import { growthArticles } from "../launch/birthday-growth-content.mjs";

const databaseUrl = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_MIGRATION_URL or DATABASE_URL is required.");

const client = new pg.Client({ connectionString: databaseUrl });
await client.connect();

try {
  await client.query("BEGIN");
  let created = 0;
  let refreshed = 0;

  for (const article of growthArticles) {
    const category = await client.query(
      "SELECT id,name,path FROM categories WHERE path=$1 AND status='active' LIMIT 1",
      [article.categoryPath],
    );
    if (!category.rowCount) throw new Error(`Active category not found: ${article.categoryPath}`);
    const currentCategory = category.rows[0];
    const current = await client.query("SELECT id,status FROM articles WHERE slug=$1 LIMIT 1", [article.slug]);

    let articleId;
    let articleStatus;
    if (current.rowCount) {
      articleId = current.rows[0].id;
      articleStatus = current.rows[0].status;
      await client.query(
        `UPDATE articles
         SET category_id=$2,category=$3,category_slug=$4,title=$5,dek=$6,image=$7,read_time=$8,
             sections_json='[]'::jsonb,blocks_json=$9::jsonb,seo_title=$10,seo_description=$11,
             affiliate_url='',affiliate_label='',image_alt=$12,social_image=$13,canonical_path='',
             seo_index=TRUE,updated_at=CURRENT_TIMESTAMP
         WHERE id=$1`,
        [articleId,currentCategory.id,currentCategory.name,currentCategory.path,article.title,article.dek,
          article.image,article.readTime,JSON.stringify(article.blocks),article.seoTitle,article.seoDescription,
          article.imageAlt,article.socialImage],
      );
      refreshed += 1;
    } else {
      const inserted = await client.query(
        `INSERT INTO articles
           (author_id,category_id,slug,category,category_slug,title,dek,image,read_time,sections_json,
            blocks_json,status,seo_title,seo_description,affiliate_url,affiliate_label,image_alt,
            social_image,canonical_path,seo_index,published_at)
         VALUES (NULL,$1,$2,$3,$4,$5,$6,$7,$8,'[]'::jsonb,$9::jsonb,'draft',$10,$11,'','',$12,$13,'',TRUE,NULL)
         RETURNING id`,
        [currentCategory.id,article.slug,currentCategory.name,currentCategory.path,article.title,article.dek,
          article.image,article.readTime,JSON.stringify(article.blocks),article.seoTitle,article.seoDescription,
          article.imageAlt,article.socialImage],
      );
      articleId = inserted.rows[0].id;
      articleStatus = "draft";
      created += 1;
    }

    await client.query(
      `UPDATE seo_pages SET article_id=$1,status=$2,updated_at=CURRENT_TIMESTAMP WHERE page_key=$3`,
      [articleId,articleStatus === "published" ? "published" : "briefed",`article:${article.slug}`],
    );
  }

  await client.query("COMMIT");
  console.log(`Prepared ${growthArticles.length} growth articles: ${created} new drafts, ${refreshed} existing articles refreshed without changing their publication status.`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
