import pg from "pg";
import { pages,keywords,links,backlinkAssets } from "../seo/vertical-plan.mjs";
const databaseUrl=process.env.DATABASE_MIGRATION_URL||process.env.DATABASE_URL;
if(!databaseUrl) throw new Error("DATABASE_MIGRATION_URL or DATABASE_URL is required.");
const client=new pg.Client({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes("localhost") ? false : { rejectUnauthorized: false },
});
await client.connect();
try{
  await client.query("BEGIN");
  const pageIds=new Map();
  for(const page of pages){
    const category=await client.query("SELECT id FROM categories WHERE path=$1 LIMIT 1",[page.categoryPath]);
    if(!category.rowCount) throw new Error(`Category missing for SEO page: ${page.categoryPath}`);
    const article=page.slug?await client.query("SELECT id FROM articles WHERE slug=$1 LIMIT 1",[page.slug]):{rows:[]};
    const result=await client.query(`INSERT INTO seo_pages (page_key,entity_type,category_id,article_id,planned_slug,title,page_role,cluster_key,primary_keyword,search_intent,semantic_scope,status,priority,target_volume,target_kd,target_cpc,backlink_priority,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NULL,NULL,NULL,$14,$15) ON CONFLICT(page_key) DO UPDATE SET category_id=EXCLUDED.category_id,article_id=COALESCE(EXCLUDED.article_id,seo_pages.article_id),title=EXCLUDED.title,page_role=EXCLUDED.page_role,cluster_key=EXCLUDED.cluster_key,primary_keyword=EXCLUDED.primary_keyword,search_intent=EXCLUDED.search_intent,semantic_scope=EXCLUDED.semantic_scope,status=EXCLUDED.status,priority=EXCLUDED.priority,backlink_priority=EXCLUDED.backlink_priority,notes=EXCLUDED.notes,updated_at=CURRENT_TIMESTAMP RETURNING id`,[page.key,page.entityType,category.rows[0].id,article.rows[0]?.id??null,page.slug??null,page.title,page.role,page.cluster,page.keyword,page.intent,page.scope,page.status,page.priority,page.backlinkPriority,page.notes]);
    pageIds.set(page.key,result.rows[0].id);
  }
  const ids=[...pageIds.values()];
  await client.query("DELETE FROM seo_keywords WHERE seo_page_id=ANY($1::bigint[])",[ids]);
  await client.query("DELETE FROM seo_internal_links WHERE source_page_id=ANY($1::bigint[])",[ids]);
  await client.query("DELETE FROM seo_backlink_assets WHERE seo_page_id=ANY($1::bigint[])",[ids]);
  for(const item of keywords) await client.query("INSERT INTO seo_keywords (seo_page_id,keyword,keyword_role,volume,kd,cpc,intent,source,notes) VALUES ($1,$2,$3,NULL,NULL,NULL,'informational',$4,'Qualitative validation only; connect Search Console or a paid keyword dataset before adding numeric estimates.')",[pageIds.get(item.page),item.keyword,item.role,item.source]);
  const unique=new Map(links.map((item)=>[JSON.stringify([item.source,item.target,item.anchor]),item]));
  for(const item of unique.values()) await client.query("INSERT INTO seo_internal_links (source_page_id,target_page_id,anchor_text,link_type,placement,semantic_score,weight,required,rationale) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",[pageIds.get(item.source),pageIds.get(item.target),item.anchor,item.type,item.placement,item.semantic,item.weight,item.required,item.rationale]);
  for(const asset of backlinkAssets) await client.query("INSERT INTO seo_backlink_assets (seo_page_id,asset_name,asset_type,outreach_angle,target_audience,status,priority) VALUES ($1,$2,$3,$4,$5,'live',$6)",[pageIds.get(asset.page),asset.name,asset.type,asset.angle,asset.audience,asset.priority]);
  await client.query("COMMIT");
  process.stdout.write(`Seeded ${pages.length} vertical SEO pages, ${keywords.length} keywords, ${unique.size} internal links and ${backlinkAssets.length} linkable assets.\n`);
}catch(error){await client.query("ROLLBACK");throw error;}finally{await client.end();}
