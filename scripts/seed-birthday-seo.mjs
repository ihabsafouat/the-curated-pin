import pg from "pg";
import { pages, keywords, links, backlinkAssets } from "../seo/birthday-plan.mjs";

const databaseUrl = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_MIGRATION_URL or DATABASE_URL is required.");

const client = new pg.Client({ connectionString: databaseUrl });
await client.connect();
try {
  await client.query("BEGIN");
  const pageIds = new Map();
  const categoryPathByCluster = {
    "birthday-core": "celebrations/birthday-parties",
    age: "celebrations/birthday-parties/by-age",
    teen: "celebrations/birthday-parties/teen-birthdays",
    first: "celebrations/birthday-parties/first-birthdays",
    themes: "celebrations/birthday-parties/party-themes",
    games: "celebrations/birthday-parties/party-games",
    food: "celebrations/birthday-parties/party-food",
    decor: "celebrations/birthday-parties/decorations",
    conversion: "celebrations/birthday-parties/printables-planners",
    adult: "celebrations/birthday-parties/by-age",
  };

  for (const page of pages) {
    let categoryId = null;
    let articleId = null;
    if (page.entityType === "category") {
      const category = await client.query("SELECT id FROM categories WHERE path = $1 LIMIT 1", [page.categoryPath]);
      if (!category.rowCount) throw new Error(`Category not found for SEO plan: ${page.categoryPath}`);
      categoryId = category.rows[0].id;
    } else if (page.slug) {
      const intendedPath = categoryPathByCluster[page.cluster];
      if (intendedPath) {
        const category = await client.query("SELECT id FROM categories WHERE path = $1 LIMIT 1", [intendedPath]);
        categoryId = category.rows[0]?.id ?? null;
      }
      const article = await client.query("SELECT id FROM articles WHERE slug = $1 LIMIT 1", [page.slug]);
      articleId = article.rows[0]?.id ?? null;
    }

    const result = await client.query(
      `INSERT INTO seo_pages
        (page_key, entity_type, category_id, article_id, planned_slug, title, page_role, cluster_key, primary_keyword, search_intent, semantic_scope, status, priority, target_volume, target_kd, target_cpc, backlink_priority, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       ON CONFLICT(page_key) DO UPDATE SET
         entity_type = EXCLUDED.entity_type,
         category_id = EXCLUDED.category_id,
         article_id = COALESCE(EXCLUDED.article_id, seo_pages.article_id),
         planned_slug = EXCLUDED.planned_slug,
         title = EXCLUDED.title,
         page_role = EXCLUDED.page_role,
         cluster_key = EXCLUDED.cluster_key,
         primary_keyword = EXCLUDED.primary_keyword,
         search_intent = EXCLUDED.search_intent,
         semantic_scope = EXCLUDED.semantic_scope,
         status = CASE WHEN seo_pages.status = 'published' THEN seo_pages.status ELSE EXCLUDED.status END,
         priority = EXCLUDED.priority,
         target_volume = EXCLUDED.target_volume,
         target_kd = EXCLUDED.target_kd,
         target_cpc = EXCLUDED.target_cpc,
         backlink_priority = EXCLUDED.backlink_priority,
         notes = EXCLUDED.notes,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id`,
      [page.key, page.entityType, categoryId, articleId, page.slug ?? null, page.title, page.role, page.cluster, page.keyword, page.intent, page.scope, page.status, page.priority, page.volume ?? null, page.kd ?? null, page.cpc ?? null, page.backlinkPriority ?? 1, page.notes ?? ""],
    );
    pageIds.set(page.key, result.rows[0].id);
  }

  const ids = [...pageIds.values()];
  if (ids.length) {
    await client.query("DELETE FROM seo_keywords WHERE seo_page_id = ANY($1::bigint[])", [ids]);
    await client.query("DELETE FROM seo_internal_links WHERE source_page_id = ANY($1::bigint[])", [ids]);
    await client.query("DELETE FROM seo_backlink_assets WHERE seo_page_id = ANY($1::bigint[])", [ids]);
  }

  for (const item of keywords) {
    const pageId = pageIds.get(item.page);
    if (!pageId) throw new Error(`Unknown keyword page ${item.page}`);
    const owner = pages.find((page) => page.key === item.page);
    await client.query(
      `INSERT INTO seo_keywords (seo_page_id, keyword, keyword_role, volume, kd, cpc, intent, source, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [pageId, item.keyword, item.role ?? "secondary", item.volume ?? null, item.kd ?? null, item.cpc ?? null, item.intent ?? owner?.intent ?? "informational", item.source ?? "Validated manual research · Aug 2026", item.notes ?? ""],
    );
  }

  for (const link of links) {
    const sourceId = pageIds.get(link.source);
    const targetId = pageIds.get(link.target);
    if (!sourceId || !targetId) throw new Error(`Unknown internal link page: ${link.source} -> ${link.target}`);
    await client.query(
      `INSERT INTO seo_internal_links (source_page_id, target_page_id, anchor_text, link_type, placement, semantic_score, weight, required, rationale)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [sourceId, targetId, link.anchor, link.type, link.placement, link.semantic, link.weight, link.required, link.rationale],
    );
  }

  for (const asset of backlinkAssets) {
    const pageId = pageIds.get(asset.page);
    if (!pageId) throw new Error(`Unknown backlink asset page ${asset.page}`);
    await client.query(
      `INSERT INTO seo_backlink_assets (seo_page_id, asset_name, asset_type, outreach_angle, target_audience, status, priority)
       VALUES ($1,$2,$3,$4,$5,'planned',$6)`,
      [pageId, asset.name, asset.type, asset.angle, asset.audience, asset.priority],
    );
  }

  await client.query("COMMIT");
  process.stdout.write(`Seeded ${pages.length} SEO pages, ${keywords.length} keyword claims, ${links.length} internal links and ${backlinkAssets.length} linkable assets.\n`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
