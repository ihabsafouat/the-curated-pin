import pg from "pg";
import { verticalArticles } from "../launch/vertical-launch-content.mjs";

const releaseArticles=verticalArticles;

const databaseUrl=process.env.DATABASE_MIGRATION_URL||process.env.DATABASE_URL;
if(!databaseUrl) throw new Error("DATABASE_MIGRATION_URL or DATABASE_URL is required.");
const client=new pg.Client({connectionString:databaseUrl});
await client.connect();
try{
  await client.query("BEGIN");
  for(const article of releaseArticles){
    const category=await client.query("SELECT id,name,path FROM categories WHERE path=$1 AND status='active' LIMIT 1",[article.categoryPath]);
    if(!category.rowCount) throw new Error(`Active category not found: ${article.categoryPath}`);
    const c=category.rows[0];
    const current=await client.query("SELECT id,status,published_at FROM articles WHERE slug=$1 LIMIT 1",[article.slug]);
    if(current.rowCount){
      const existing=current.rows[0];
      await client.query(`UPDATE articles SET category_id=$2,category=$3,category_slug=$4,title=$5,dek=$6,image=$7,read_time=$8,sections_json='[]'::jsonb,blocks_json=$9::jsonb,seo_title=$10,seo_description=$11,affiliate_url='',affiliate_label='',image_alt=$12,social_image=$13,canonical_path='',seo_index=TRUE,updated_at=CURRENT_TIMESTAMP WHERE id=$1`,[existing.id,c.id,c.name,c.path,article.title,article.dek,article.image,article.readTime,JSON.stringify(article.blocks),article.seoTitle,article.seoDescription,article.imageAlt,article.socialImage]);
    }else{
      await client.query(`INSERT INTO articles (author_id,category_id,slug,category,category_slug,title,dek,image,read_time,sections_json,blocks_json,status,seo_title,seo_description,affiliate_url,affiliate_label,image_alt,social_image,canonical_path,seo_index,published_at) VALUES (NULL,$1,$2,$3,$4,$5,$6,$7,$8,'[]'::jsonb,$9::jsonb,'published',$10,$11,'','',$12,$13,'',TRUE,CURRENT_TIMESTAMP)`,[c.id,article.slug,c.name,c.path,article.title,article.dek,article.image,article.readTime,JSON.stringify(article.blocks),article.seoTitle,article.seoDescription,article.imageAlt,article.socialImage]);
    }
  }
  await client.query("COMMIT");
  process.stdout.write(`Seeded ${releaseArticles.length} active Crochet articles. Existing Birthday editorial status is preserved.\n`);
}catch(error){await client.query("ROLLBACK");throw error;}finally{await client.end();}
