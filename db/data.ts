import { legacySectionsToBlocks, type Article } from "../app/content";
import { getCategoryById } from "./categories";
import { execute, executeAsUser, queryOne, queryRows, queryRowsAsUser } from "./client";
import { releaseSeoPlanArticle, syncSeoPlanForArticle } from "./seo";
import type { AnalyticsSummary, ArticleInput, ManagedArticle } from "./types";
import { databaseIsConfigured } from "./client";
import { fallbackLaunchArticles } from "./fallback-content";

export type { AnalyticsSummary, ArticleInput, ManagedArticle } from "./types";

type ArticleRow = {
  id: number | string;
  author_id: string | null;
  category_id: number | string;
  category_name: string;
  category_path: string;
  slug: string;
  title: string;
  dek: string;
  image: string;
  read_time: string;
  sections_json: string | Article["sections"];
  blocks_json: string | Article["blocks"];
  status: string;
  seo_title: string;
  seo_description: string;
  affiliate_url: string;
  affiliate_label: string;
  image_alt: string;
  social_image: string;
  canonical_path: string;
  seo_index: boolean;
  created_at: string | Date;
  updated_at: string | Date;
  published_at: string | Date | null;
};

const ARTICLE_SELECT = `SELECT
  a.id, a.author_id, a.category_id, c.name AS category_name, c.path AS category_path,
  a.slug, a.title, a.dek, a.image, a.read_time, a.sections_json, a.blocks_json, a.status,
  a.seo_title, a.seo_description, a.affiliate_url, a.affiliate_label,
  a.image_alt, a.social_image, a.canonical_path, a.seo_index,
  a.created_at, a.updated_at, a.published_at
  FROM articles a JOIN categories c ON c.id = a.category_id`;

function dateString(value: string | Date | null): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : String(value);
}

function rowToArticle(row: ArticleRow): ManagedArticle {
  let sections: Article["sections"] = [];
  let blocks: Article["blocks"] = [];
  try {
    const parsed = typeof row.sections_json === "string" ? JSON.parse(row.sections_json) : row.sections_json;
    if (Array.isArray(parsed)) sections = parsed;
  } catch {}
  try {
    const parsed = typeof row.blocks_json === "string" ? JSON.parse(row.blocks_json) : row.blocks_json;
    if (Array.isArray(parsed)) blocks = parsed;
  } catch {}
  if (!blocks.length && sections.length) blocks = legacySectionsToBlocks(sections);
  return {
    id: Number(row.id),
    authorId: row.author_id ?? null,
    categoryId: Number(row.category_id),
    category: row.category_name,
    categoryPath: row.category_path,
    slug: row.slug,
    title: row.title,
    dek: row.dek,
    image: row.image,
    readTime: row.read_time,
    sections,
    blocks,
    status: row.status === "published" ? "published" : "draft",
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    affiliateUrl: row.affiliate_url,
    affiliateLabel: row.affiliate_label,
    imageAlt: row.image_alt || row.title,
    socialImage: row.social_image,
    canonicalPath: row.canonical_path,
    seoIndex: Boolean(row.seo_index),
    createdAt: dateString(row.created_at) ?? "",
    updatedAt: dateString(row.updated_at) ?? "",
    publishedAt: dateString(row.published_at),
  };
}

export async function getPublishedArticles(): Promise<ManagedArticle[]> {
  if (!databaseIsConfigured()) return fallbackLaunchArticles;
  try {
    const rows = await queryRows<ArticleRow>(
      `${ARTICLE_SELECT} WHERE a.status = 'published' AND c.status = 'active' ORDER BY a.published_at DESC, a.id DESC`,
    );
    return rows.map(rowToArticle);
  } catch (error) {
    console.error("Unable to load published articles; using bundled launch content.", error);
    return fallbackLaunchArticles;
  }
}

export async function getPublishedArticlesByCategoryPath(path: string): Promise<ManagedArticle[]> {
  if (!databaseIsConfigured()) return fallbackLaunchArticles.filter((article) => article.categoryPath === path || article.categoryPath.startsWith(`${path}/`));
  try {
    const rows = await queryRows<ArticleRow>(
      `${ARTICLE_SELECT} WHERE a.status = 'published' AND c.status = 'active' AND (c.path = ? OR c.path LIKE ?)
       ORDER BY a.published_at DESC, a.id DESC`,
      [path, `${path}/%`],
    );
    return rows.map(rowToArticle);
  } catch (error) {
    console.error(`Unable to load published articles for ${path}; using bundled launch content.`, error);
    return fallbackLaunchArticles.filter((article) => article.categoryPath === path || article.categoryPath.startsWith(`${path}/`));
  }
}

export async function getArticleBySlug(slug: string): Promise<ManagedArticle | null> {
  const bundled = fallbackLaunchArticles.find((article) => article.slug === slug) ?? null;
  if (!databaseIsConfigured()) return bundled;
  try {
    const row = await queryOne<ArticleRow>(
      `${ARTICLE_SELECT} WHERE a.slug = ? AND a.status = 'published' AND c.status = 'active' LIMIT 1`,
      [slug],
    );
    return row ? rowToArticle(row) : null;
  } catch (error) {
    console.error(`Unable to load ${slug}; using bundled launch content when available.`, error);
    return bundled;
  }
}

export async function getAdminArticles(): Promise<ManagedArticle[]> {
  const rows = await queryRows<ArticleRow>(`${ARTICLE_SELECT} ORDER BY a.updated_at DESC, a.id DESC`);
  return rows.map(rowToArticle);
}

export async function getAdminArticleById(id: number): Promise<ManagedArticle | null> {
  const row = await queryOne<ArticleRow>(`${ARTICLE_SELECT} WHERE a.id = ? LIMIT 1`, [id]);
  return row ? rowToArticle(row) : null;
}

async function categoryForArticle(categoryId: number) {
  const category = await getCategoryById(categoryId, { includeInactive: true });
  if (!category) throw new Error("Category not found.");
  return category;
}

export async function createArticle(input: ArticleInput, authorId: string | null = null) {
  const category = await categoryForArticle(input.categoryId);
  const publishedAt = input.status === "published" ? new Date().toISOString() : null;
  const row = await queryOne<{ id: number | string }>(
    `INSERT INTO articles
      (author_id, category_id, slug, category, category_slug, title, dek, image, read_time, sections_json, blocks_json, status, seo_title, seo_description, affiliate_url, affiliate_label, image_alt, social_image, canonical_path, seo_index, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    [
      authorId,
      category.id,
      input.slug,
      category.name,
      category.path,
      input.title,
      input.dek,
      input.image,
      input.readTime,
      JSON.stringify(input.sections),
      JSON.stringify(input.blocks),
      input.status,
      input.seoTitle,
      input.seoDescription,
      input.affiliateUrl,
      input.affiliateLabel,
      input.imageAlt,
      input.socialImage,
      input.canonicalPath,
      input.seoIndex,
      publishedAt,
    ],
  );
  if (row) await syncSeoPlanForArticle(Number(row.id), input.slug, input.status);
}

export async function updateArticle(id: number, input: ArticleInput) {
  const current = await getAdminArticleById(id);
  if (!current) return false;
  const category = await categoryForArticle(input.categoryId);
  const publishedAt = input.status === "published" ? current.publishedAt ?? new Date().toISOString() : null;
  const changed = await execute(
    `UPDATE articles SET category_id = ?, category = ?, category_slug = ?, slug = ?, title = ?, dek = ?, image = ?, read_time = ?, sections_json = ?, blocks_json = ?, status = ?, seo_title = ?, seo_description = ?, affiliate_url = ?, affiliate_label = ?, image_alt = ?, social_image = ?, canonical_path = ?, seo_index = ?, updated_at = CURRENT_TIMESTAMP, published_at = ?
     WHERE id = ?`,
    [
      category.id,
      category.name,
      category.path,
      input.slug,
      input.title,
      input.dek,
      input.image,
      input.readTime,
      JSON.stringify(input.sections),
      JSON.stringify(input.blocks),
      input.status,
      input.seoTitle,
      input.seoDescription,
      input.affiliateUrl,
      input.affiliateLabel,
      input.imageAlt,
      input.socialImage,
      input.canonicalPath,
      input.seoIndex,
      publishedAt,
      id,
    ],
  );
  if (changed > 0) await syncSeoPlanForArticle(id, input.slug, input.status);
  return changed > 0;
}

export async function deleteArticle(id: number) {
  await releaseSeoPlanArticle(id);
  await execute("DELETE FROM articles WHERE id = ?", [id]);
}

// Newsletter writes moved to db/audience.ts in Priority 6 so consent, segmentation and attribution cannot be bypassed.

export { recordAnalyticsEvent as trackEvent } from "./analytics";

export async function createReaderFeedback(input: {
  id: string; articleSlug: string; rating?: number; helpful?: boolean; message: string; displayName: string; consentPublish: boolean; ipHash: string | null;
}) {
  const article = await queryOne<{ id: number }>(`SELECT id FROM articles WHERE slug = ? AND status = 'published' LIMIT 1`, [input.articleSlug]);
  if (!article) return false;
  await execute(`INSERT INTO reader_feedback (id, article_id, article_slug, rating, helpful, message, display_name, consent_publish, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
    input.id, article.id, input.articleSlug, input.rating ?? null, input.helpful ?? null, input.message, input.displayName, input.consentPublish, input.ipHash,
  ]);
  return true;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const [totalsRow, subRow, articleRows, linkRows, searchRows, sourceRows, statusRows] = await Promise.all([
    queryOne<{ views: number | string | null; clicks: number | string | null; saves: number | string | null }>(`SELECT
      SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) AS views,
      SUM(CASE WHEN event_type IN ('outbound_click','affiliate_click','product_click','checkout_click') THEN 1 ELSE 0 END) AS clicks,
      SUM(CASE WHEN event_type IN ('favorite','read_later') THEN 1 ELSE 0 END) AS saves
      FROM analytics_events`),
    queryOne<{ subscribers: number | string }>(
      "SELECT COUNT(*) AS subscribers FROM newsletter_subscribers WHERE status = 'subscribed'",
    ),
    queryRows<{ slug: string; title: string; views: number | string }>(`SELECT e.article_slug AS slug, COALESCE(a.title, e.article_slug) AS title, COUNT(*) AS views
      FROM analytics_events e LEFT JOIN articles a ON a.slug = e.article_slug
      WHERE e.event_type = 'page_view' AND e.article_slug IS NOT NULL
      GROUP BY e.article_slug, a.title ORDER BY views DESC LIMIT 6`),
    queryRows<{ url: string; label: string; clicks: number | string }>(`SELECT COALESCE(target_url,'') AS url, COALESCE(target_label,'External link') AS label, COUNT(*) AS clicks
      FROM analytics_events WHERE event_type IN ('outbound_click','affiliate_click','product_click','checkout_click') AND target_url IS NOT NULL
      GROUP BY target_url, target_label ORDER BY clicks DESC LIMIT 6`),
    queryRows<{ query: string; searches: number | string }>(`SELECT search_query AS query, COUNT(*) AS searches FROM analytics_events
      WHERE event_type = 'search' AND search_query IS NOT NULL GROUP BY search_query ORDER BY searches DESC LIMIT 6`),
    queryRows<{ source: string; views: number | string }>(`SELECT COALESCE(source,'Direct / other') AS source, COUNT(*) AS views FROM analytics_events
      WHERE event_type = 'page_view' GROUP BY source ORDER BY views DESC LIMIT 6`),
    queryRows<{ status: string; count: number | string }>(`SELECT a.status, COUNT(*) AS count FROM articles a JOIN categories c ON c.id = a.category_id WHERE c.status = 'active' GROUP BY a.status`),
  ]);
  const statusMap = Object.fromEntries(statusRows.map((row) => [row.status, Number(row.count)]));
  return {
    totals: {
      views: Number(totalsRow?.views ?? 0),
      clicks: Number(totalsRow?.clicks ?? 0),
      saves: Number(totalsRow?.saves ?? 0),
      subscribers: Number(subRow?.subscribers ?? 0),
      published: Number(statusMap.published ?? 0),
      drafts: Number(statusMap.draft ?? 0),
    },
    topArticles: articleRows.map((row) => ({ ...row, views: Number(row.views) })),
    topLinks: linkRows.map((row) => ({ ...row, clicks: Number(row.clicks) })),
    topSearches: searchRows.map((row) => ({ ...row, searches: Number(row.searches) })),
    topSources: sourceRows.map((row) => ({ ...row, views: Number(row.views) })),
  };
}

export async function getSavedSlugs(userId: string, kind?: "favorite" | "read_later") {
  const rows = kind
    ? await queryRowsAsUser<{ article_slug: string; kind: "favorite" | "read_later" }>(
        userId,
        `SELECT a.slug AS article_slug, s.kind FROM saved_articles s
         JOIN articles a ON a.id = s.article_id
         JOIN categories c ON c.id = a.category_id
         WHERE s.user_id = ? AND s.kind = ? AND a.status = 'published' AND c.status = 'active'
         ORDER BY s.created_at DESC`,
        [userId, kind],
      )
    : await queryRowsAsUser<{ article_slug: string; kind: "favorite" | "read_later" }>(
        userId,
        `SELECT a.slug AS article_slug, s.kind FROM saved_articles s
         JOIN articles a ON a.id = s.article_id
         JOIN categories c ON c.id = a.category_id
         WHERE s.user_id = ? AND a.status = 'published' AND c.status = 'active'
         ORDER BY s.created_at DESC`,
        [userId],
      );
  return rows;
}

export async function setSavedArticle(
  userId: string,
  slug: string,
  kind: "favorite" | "read_later",
  saved: boolean,
) {
  const article = await queryOne<{ id: number }>(
    `SELECT a.id FROM articles a JOIN categories c ON c.id = a.category_id
     WHERE a.slug = ? AND a.status = 'published' AND c.status = 'active' LIMIT 1`,
    [slug],
  );
  if (!article) return false;
  if (saved) {
    await executeAsUser(
      userId,
      `INSERT INTO saved_articles (user_id, article_id, kind) VALUES (?, ?, ?)
       ON CONFLICT(user_id, article_id, kind) DO NOTHING`,
      [userId, article.id, kind],
    );
  } else {
    await executeAsUser(userId, "DELETE FROM saved_articles WHERE user_id = ? AND article_id = ? AND kind = ?", [
      userId,
      article.id,
      kind,
    ]);
  }
  return true;
}

export type ReaderFeedbackRow = {
  id: string;
  articleSlug: string;
  articleTitle: string;
  rating: number | null;
  helpful: boolean | null;
  message: string;
  displayName: string;
  consentPublish: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export async function getReaderFeedback(status?: "pending" | "approved" | "rejected"): Promise<ReaderFeedbackRow[]> {
  const rows = await queryRows<{
    id: string; article_slug: string; article_title: string; rating: number | null; helpful: boolean | null;
    message: string; display_name: string; consent_publish: boolean; status: string; created_at: string | Date;
  }>(`SELECT f.id, f.article_slug, COALESCE(a.title, f.article_slug) AS article_title, f.rating, f.helpful,
      f.message, f.display_name, f.consent_publish, f.status, f.created_at
      FROM reader_feedback f LEFT JOIN articles a ON a.id = f.article_id
      ${status ? "WHERE f.status = ?" : ""}
      ORDER BY f.created_at DESC LIMIT 250`, status ? [status] : []);
  return rows.map((row) => ({
    id: row.id,
    articleSlug: row.article_slug,
    articleTitle: row.article_title,
    rating: row.rating === null ? null : Number(row.rating),
    helpful: row.helpful === null ? null : Boolean(row.helpful),
    message: row.message,
    displayName: row.display_name,
    consentPublish: Boolean(row.consent_publish),
    status: ["approved", "rejected"].includes(row.status) ? row.status as "approved" | "rejected" : "pending",
    createdAt: dateString(row.created_at) ?? "",
  }));
}

export async function setReaderFeedbackStatus(id: string, status: "approved" | "rejected") {
  return (await execute(`UPDATE reader_feedback SET status = ? WHERE id = ?`, [status, id])) > 0;
}
