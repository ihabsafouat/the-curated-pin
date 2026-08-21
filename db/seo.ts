import { execute, queryRows } from "./client";
import type {
  SeoBacklinkAsset,
  SeoCannibalizationRisk,
  SeoInternalLink,
  SeoKeywordClaim,
  SeoMapSummary,
  SeoPlanPage,
} from "./types";

const SEO_PAGE_SELECT = `SELECT
  p.id, p.page_key, p.entity_type, p.category_id, p.article_id, p.planned_slug, p.title,
  p.page_role, p.cluster_key, p.primary_keyword, p.search_intent, p.semantic_scope,
  p.status, p.priority, p.target_volume, p.target_kd, p.target_cpc, p.backlink_priority, p.page_rank_score,
  c.path AS category_path, c.status AS category_status,
  CASE WHEN c.path IS NULL THEN FALSE ELSE EXISTS (
    SELECT 1 FROM articles ca JOIN categories cc ON cc.id = ca.category_id
    WHERE ca.status = 'published' AND cc.status = 'active' AND (cc.path = c.path OR cc.path LIKE c.path || '/%')
  ) END AS category_has_content,
  COALESCE(a.slug, p.planned_slug) AS resolved_article_slug, a.status AS article_status,
  ac.status AS article_category_status
  FROM seo_pages p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN articles a ON a.id = p.article_id OR (p.entity_type = 'article' AND p.article_id IS NULL AND a.slug = p.planned_slug)
  LEFT JOIN categories ac ON ac.id = a.category_id`;

type PageRow = {
  id: number | string;
  page_key: string;
  entity_type: "category" | "article";
  category_id: number | string | null;
  article_id: number | string | null;
  planned_slug: string | null;
  title: string;
  page_role: SeoPlanPage["pageRole"];
  cluster_key: string;
  primary_keyword: string;
  search_intent: SeoPlanPage["searchIntent"];
  semantic_scope: string;
  status: SeoPlanPage["status"];
  priority: number | string;
  target_volume: number | string | null;
  target_kd: number | string | null;
  target_cpc: number | string | null;
  backlink_priority: number | string;
  page_rank_score: number | string;
  category_path: string | null;
  category_status: string | null;
  category_has_content: boolean;
  resolved_article_slug: string | null;
  article_status: string | null;
  article_category_status: string | null;
};

function toNumber(value: number | string | null): number | null {
  return value === null ? null : Number(value);
}

function rowToPage(row: PageRow): SeoPlanPage {
  const isCategory = row.entity_type === "category";
  const live = isCategory
    ? row.category_status === "active" && Boolean(row.category_has_content)
    : row.article_status === "published" && row.article_category_status === "active";
  return {
    id: Number(row.id),
    pageKey: row.page_key,
    entityType: row.entity_type,
    categoryId: row.category_id === null ? null : Number(row.category_id),
    articleId: row.article_id === null ? null : Number(row.article_id),
    plannedSlug: row.planned_slug,
    title: row.title,
    pageRole: row.page_role,
    clusterKey: row.cluster_key,
    primaryKeyword: row.primary_keyword,
    searchIntent: row.search_intent,
    semanticScope: row.semantic_scope,
    status: row.status,
    priority: Number(row.priority),
    targetVolume: toNumber(row.target_volume),
    targetKd: toNumber(row.target_kd),
    targetCpc: toNumber(row.target_cpc),
    backlinkPriority: Number(row.backlink_priority),
    pageRankScore: Number(row.page_rank_score),
    url: isCategory && row.category_path ? `/category/${row.category_path}` : row.resolved_article_slug ? `/article/${row.resolved_article_slug}` : null,
    isLive: live,
  };
}

export async function getSeoPages(): Promise<SeoPlanPage[]> {
  const rows = await queryRows<PageRow>(`${SEO_PAGE_SELECT} ORDER BY p.priority ASC, p.id ASC`);
  return rows.map(rowToPage);
}

export async function getArticleSeoPlans(): Promise<SeoPlanPage[]> {
  return (await getSeoPages()).filter((page) => page.entityType === "article");
}

export async function getPlannedCategoryIdForArticleSlug(slug: string): Promise<number | null> {
  const rows = await queryRows<{ category_id: number | string | null }>(
    `SELECT category_id FROM seo_pages WHERE entity_type = 'article' AND planned_slug = ? LIMIT 1`,
    [slug],
  );
  if (!rows.length || rows[0].category_id === null) return null;
  return Number(rows[0].category_id);
}

type LinkRow = {
  id: number | string;
  source_page_id: number | string;
  target_page_id: number | string;
  source_key: string;
  target_key: string;
  source_title: string;
  target_title: string;
  target_entity_type: "category" | "article";
  target_category_path: string | null;
  target_category_status: string | null;
  target_article_slug: string | null;
  target_article_status: string | null;
  target_article_category_status: string | null;
  anchor_text: string;
  link_type: SeoInternalLink["linkType"];
  placement: SeoInternalLink["placement"];
  semantic_score: number | string;
  weight: number | string;
  required: boolean;
  rationale: string;
};

const LINK_SELECT = `SELECT
  l.id, l.source_page_id, l.target_page_id,
  sp.page_key AS source_key, tp.page_key AS target_key, sp.title AS source_title, tp.title AS target_title,
  tp.entity_type AS target_entity_type, tc.path AS target_category_path, tc.status AS target_category_status,
  COALESCE(ta.slug, tp.planned_slug) AS target_article_slug, ta.status AS target_article_status,
  tac.status AS target_article_category_status,
  l.anchor_text, l.link_type, l.placement, l.semantic_score, l.weight, l.required, l.rationale
  FROM seo_internal_links l
  JOIN seo_pages sp ON sp.id = l.source_page_id
  JOIN seo_pages tp ON tp.id = l.target_page_id
  LEFT JOIN categories tc ON tc.id = tp.category_id
  LEFT JOIN articles ta ON ta.id = tp.article_id OR (tp.entity_type = 'article' AND tp.article_id IS NULL AND ta.slug = tp.planned_slug)
  LEFT JOIN categories tac ON tac.id = ta.category_id`;

function rowToLink(row: LinkRow): SeoInternalLink {
  const targetUrl = row.target_entity_type === "category"
    ? row.target_category_path && row.target_category_status === "active" ? `/category/${row.target_category_path}` : null
    : row.target_article_slug && row.target_article_status === "published" && row.target_article_category_status === "active" ? `/article/${row.target_article_slug}` : null;
  return {
    id: Number(row.id),
    sourcePageId: Number(row.source_page_id),
    targetPageId: Number(row.target_page_id),
    sourceKey: row.source_key,
    targetKey: row.target_key,
    sourceTitle: row.source_title,
    targetTitle: row.target_title,
    targetUrl,
    anchorText: row.anchor_text,
    linkType: row.link_type,
    placement: row.placement,
    semanticScore: Number(row.semantic_score),
    weight: Number(row.weight),
    required: Boolean(row.required),
    rationale: row.rationale,
  };
}

export async function getSeoLinks(): Promise<SeoInternalLink[]> {
  return (await queryRows<LinkRow>(`${LINK_SELECT} ORDER BY l.source_page_id, l.weight DESC, l.semantic_score DESC`)).map(rowToLink);
}

export async function getStrategicLinksForArticle(slug: string, limit = 4): Promise<SeoInternalLink[]> {
  const rows = await queryRows<LinkRow>(
    `${LINK_SELECT}
     WHERE (sp.planned_slug = ? OR sp.article_id = (SELECT id FROM articles WHERE slug = ? LIMIT 1))
       AND l.required = TRUE AND l.semantic_score >= 70
       AND ((tp.entity_type = 'article' AND ta.status = 'published' AND tac.status = 'active')
         OR (tp.entity_type = 'category' AND tc.status = 'active' AND EXISTS (
           SELECT 1 FROM articles ca JOIN categories cc ON cc.id = ca.category_id
           WHERE ca.status = 'published' AND cc.status = 'active' AND (cc.path = tc.path OR cc.path LIKE tc.path || '/%')
         )))
     ORDER BY CASE l.placement WHEN 'body' THEN 1 WHEN 'related' THEN 2 WHEN 'cta' THEN 3 ELSE 4 END,
              l.weight DESC, l.semantic_score DESC
     LIMIT ?`,
    [slug, slug, limit * 3],
  );
  return rows.map(rowToLink).filter((link) => Boolean(link.targetUrl)).slice(0, limit);
}

export async function getStrategicLinksForCategory(categoryId: number, limit = 8): Promise<SeoInternalLink[]> {
  const rows = await queryRows<LinkRow>(
    `${LINK_SELECT}
     WHERE sp.category_id = ? AND sp.entity_type = 'category' AND l.required = TRUE AND l.semantic_score >= 70
       AND ((tp.entity_type = 'article' AND ta.status = 'published' AND tac.status = 'active')
         OR (tp.entity_type = 'category' AND tc.status = 'active' AND EXISTS (
           SELECT 1 FROM articles ca JOIN categories cc ON cc.id = ca.category_id
           WHERE ca.status = 'published' AND cc.status = 'active' AND (cc.path = tc.path OR cc.path LIKE tc.path || '/%')
         )))
     ORDER BY CASE l.placement WHEN 'hub' THEN 1 WHEN 'body' THEN 2 WHEN 'related' THEN 3 ELSE 4 END,
              l.weight DESC, l.semantic_score DESC
     LIMIT ?`,
    [categoryId, limit * 3],
  );
  return rows.map(rowToLink).filter((link) => Boolean(link.targetUrl)).slice(0, limit);
}

export async function syncSeoPlanForArticle(articleId: number, slug: string, status: "draft" | "published") {
  await execute(
    `UPDATE seo_pages SET article_id = NULL, status = CASE WHEN status = 'published' THEN 'planned' ELSE status END, updated_at = CURRENT_TIMESTAMP
     WHERE entity_type = 'article' AND article_id = ? AND planned_slug <> ?`,
    [articleId, slug],
  );
  await execute(
    `UPDATE seo_pages SET article_id = ?, status = CASE WHEN ? = 'published' THEN 'published' WHEN status = 'research' THEN status ELSE 'briefed' END, updated_at = CURRENT_TIMESTAMP
     WHERE entity_type = 'article' AND planned_slug = ?`,
    [articleId, status, slug],
  );
}

export async function releaseSeoPlanArticle(articleId: number) {
  await execute(
    `UPDATE seo_pages SET article_id = NULL, status = CASE WHEN status = 'published' THEN 'planned' ELSE status END, updated_at = CURRENT_TIMESTAMP WHERE article_id = ?`,
    [articleId],
  );
}

function normalizeKeyword(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function keywordJaccard(leftValue: string, rightValue: string) {
  const left = new Set(normalizeKeyword(leftValue).split(" ").filter(Boolean));
  const right = new Set(normalizeKeyword(rightValue).split(" ").filter(Boolean));
  const union = new Set([...left, ...right]);
  if (!union.size) return 0;
  let intersection = 0;
  left.forEach((token) => { if (right.has(token)) intersection += 1; });
  return intersection / union.size;
}

function detectCannibalization(claims: SeoKeywordClaim[]): SeoCannibalizationRisk[] {
  const owned = claims.filter((claim) => claim.keywordRole !== "excluded");
  const risks: SeoCannibalizationRisk[] = [];
  for (let i = 0; i < owned.length; i += 1) {
    for (let j = i + 1; j < owned.length; j += 1) {
      const a = owned[i], b = owned[j];
      if (a.pageKey === b.pageKey) continue;
      const normalizedA = normalizeKeyword(a.keyword), normalizedB = normalizeKeyword(b.keyword);
      if (normalizedA === normalizedB) {
        risks.push({ severity: "critical", pageA: a.pageTitle, pageB: b.pageTitle, keywordA: a.keyword, keywordB: b.keyword, reason: "The same query is actively claimed by two pages." });
        continue;
      }
      const overlap = keywordJaccard(a.keyword, b.keyword);
      if (a.clusterKey === b.clusterKey && overlap >= 0.82 && (a.keywordRole === "primary" || b.keywordRole === "primary")) {
        risks.push({ severity: "review", pageA: a.pageTitle, pageB: b.pageTitle, keywordA: a.keyword, keywordB: b.keyword, reason: `High semantic overlap inside the same cluster (${Math.round(overlap * 100)}%). Review SERP intent before publishing both.` });
      }
    }
  }
  return risks;
}

function simulatePageRank(pages: SeoPlanPage[], links: SeoInternalLink[]) {
  const keys = pages.map((page) => page.pageKey);
  const count = Math.max(1, keys.length);
  const scores = new Map(keys.map((key) => [key, 1 / count]));
  const outgoing = new Map<string, SeoInternalLink[]>(keys.map((key) => [key, []]));
  links.filter((link) => link.required).forEach((link) => outgoing.get(link.sourceKey)?.push(link));
  const damping = 0.85;
  for (let iteration = 0; iteration < 80; iteration += 1) {
    const next = new Map(keys.map((key) => [key, (1 - damping) / count]));
    let dangling = 0;
    keys.forEach((source) => {
      const edges = outgoing.get(source) ?? [];
      const sourceScore = scores.get(source) ?? 0;
      if (!edges.length) { dangling += sourceScore; return; }
      const totalWeight = edges.reduce((sum, edge) => sum + edge.weight, 0);
      edges.forEach((edge) => next.set(edge.targetKey, (next.get(edge.targetKey) ?? 0) + damping * sourceScore * edge.weight / totalWeight));
    });
    if (dangling) keys.forEach((key) => next.set(key, (next.get(key) ?? 0) + damping * dangling / count));
    scores.clear(); next.forEach((score, key) => scores.set(key, score));
  }
  return scores;
}

export async function getSeoMapSummary(): Promise<SeoMapSummary> {
  const [pages, links, keywordRows, assetRows] = await Promise.all([
    getSeoPages(),
    getSeoLinks(),
    queryRows<{
      page_key: string; page_title: string; cluster_key: string; page_role: SeoKeywordClaim["pageRole"];
      keyword: string; keyword_role: SeoKeywordClaim["keywordRole"]; volume: number | string | null; kd: number | string | null; cpc: number | string | null;
    }>(`SELECT p.page_key, p.title AS page_title, p.cluster_key, p.page_role, k.keyword, k.keyword_role, k.volume, k.kd, k.cpc
        FROM seo_keywords k JOIN seo_pages p ON p.id = k.seo_page_id ORDER BY p.priority, k.keyword_role, k.volume DESC NULLS LAST`),
    queryRows<{
      id: number | string; page_key: string; page_title: string; asset_name: string; asset_type: string; outreach_angle: string; target_audience: string; status: SeoBacklinkAsset["status"]; priority: number | string;
    }>(`SELECT b.id, p.page_key, p.title AS page_title, b.asset_name, b.asset_type, b.outreach_angle, b.target_audience, b.status, b.priority
        FROM seo_backlink_assets b JOIN seo_pages p ON p.id = b.seo_page_id ORDER BY b.priority ASC, b.id ASC`),
  ]);
  const keywordClaims: SeoKeywordClaim[] = keywordRows.map((row) => ({
    pageKey: row.page_key, pageTitle: row.page_title, clusterKey: row.cluster_key, pageRole: row.page_role,
    keyword: row.keyword, keywordRole: row.keyword_role,
    volume: toNumber(row.volume), kd: toNumber(row.kd), cpc: toNumber(row.cpc),
  }));
  const backlinkAssets: SeoBacklinkAsset[] = assetRows.map((row) => ({
    id: Number(row.id), pageKey: row.page_key, pageTitle: row.page_title, assetName: row.asset_name,
    assetType: row.asset_type, outreachAngle: row.outreach_angle, targetAudience: row.target_audience,
    status: row.status, priority: Number(row.priority),
  }));
  const scores = simulatePageRank(pages, links);
  const topAuthorityPages = pages.map((page) => ({
    ...page,
    simulatedPageRank: scores.get(page.pageKey) ?? 0,
    incomingLinks: links.filter((link) => link.required && link.targetKey === page.pageKey).length,
    outgoingLinks: links.filter((link) => link.required && link.sourceKey === page.pageKey).length,
  })).sort((a, b) => b.simulatedPageRank - a.simulatedPageRank);
  return {
    pages,
    links,
    keywordClaims,
    backlinkAssets,
    cannibalizationRisks: detectCannibalization(keywordClaims),
    semanticDriftLinks: links.filter((link) => link.required && link.semanticScore < 65),
    topAuthorityPages,
  };
}
