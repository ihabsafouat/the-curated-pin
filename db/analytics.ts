import { randomUUID } from "node:crypto";
import { execute, queryOne, queryRows } from "./client";

export const analyticsEventTypes = [
  "page_view",
  "content_engaged",
  "cta_impression",
  "cta_click",
  "form_start",
  "newsletter_signup",
  "lead_magnet_access",
  "email_click",
  "affiliate_click",
  "product_click",
  "checkout_click",
  "outbound_click",
  "internal_link_click",
  "share_click",
  "favorite",
  "read_later",
  "search",
] as const;

export type AnalyticsEventType = (typeof analyticsEventTypes)[number];

export type AnalyticsEventInput = {
  eventId?: string;
  eventType: AnalyticsEventType;
  sessionId?: string;
  subscriberId?: number;
  articleSlug?: string;
  pagePath?: string;
  categoryPath?: string;
  leadMagnetSlug?: string;
  productSlug?: string;
  merchant?: string;
  linkKind?: string;
  placement?: string;
  targetUrl?: string;
  targetLabel?: string;
  source?: string;
  utmSource?: string;
  referrerHost?: string;
  campaign?: string;
  medium?: string;
  content?: string;
  term?: string;
  searchQuery?: string;
  engagementSeconds?: number;
  scrollDepth?: number;
  value?: number;
  currency?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

const limits: Record<string, number> = {
  articleSlug: 120, pagePath: 500, categoryPath: 240, leadMagnetSlug: 120, productSlug: 160,
  merchant: 120, linkKind: 40, placement: 80, targetUrl: 2000, targetLabel: 180,
  source: 120, referrerHost: 180, campaign: 160, medium: 120, content: 160, term: 160, searchQuery: 200,
};

function cut(value: string | undefined, key: keyof typeof limits) {
  return value?.trim().slice(0, limits[key]) || null;
}

function cleanMetadata(value: AnalyticsEventInput["metadata"]): Record<string, string | number | boolean | null> {
  if (!value) return {};
  const entries: Array<[string, string | number | boolean | null]> = [];
  for (const [key, item] of Object.entries(value).slice(0, 20)) {
    const safeKey = key.replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 60);
    if (!safeKey) continue;
    if (typeof item === "string") entries.push([safeKey, item.slice(0, 300)]);
    else if (typeof item === "number" && Number.isFinite(item)) entries.push([safeKey, item]);
    else if (typeof item === "boolean" || item === null) entries.push([safeKey, item]);
  }
  return Object.fromEntries(entries);
}

export async function recordAnalyticsEvent(event: AnalyticsEventInput) {
  const { databaseIsConfigured } = await import("./client");
  if (!databaseIsConfigured()) return true;
  const eventId = event.eventId || randomUUID();
  try {
    await execute(
      `INSERT INTO analytics_events
       (event_id,event_type,session_id,subscriber_id,article_slug,page_path,category_path,lead_magnet_slug,product_slug,merchant,link_kind,placement,target_url,target_label,source,referrer_host,campaign,utm_source,utm_medium,utm_content,utm_term,search_query,engagement_seconds,scroll_depth,event_value,currency,metadata_json)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?::jsonb)`,
      [
        eventId, event.eventType, event.sessionId || null, event.subscriberId || null,
        cut(event.articleSlug,"articleSlug"), cut(event.pagePath,"pagePath"), cut(event.categoryPath,"categoryPath"),
        cut(event.leadMagnetSlug,"leadMagnetSlug"), cut(event.productSlug,"productSlug"), cut(event.merchant,"merchant"),
        cut(event.linkKind,"linkKind"), cut(event.placement,"placement"), cut(event.targetUrl,"targetUrl"), cut(event.targetLabel,"targetLabel"),
        cut(event.source,"source"), cut(event.referrerHost,"referrerHost"), cut(event.campaign,"campaign"), cut(event.utmSource,"source"),
        cut(event.medium,"medium"), cut(event.content,"content"), cut(event.term,"term"), cut(event.searchQuery,"searchQuery"),
        Number.isFinite(event.engagementSeconds) ? Math.max(0, Math.min(86_400, Math.round(event.engagementSeconds!))) : null,
        Number.isFinite(event.scrollDepth) ? Math.max(0, Math.min(100, Math.round(event.scrollDepth!))) : null,
        Number.isFinite(event.value) ? Math.max(0, Number(event.value)) : null,
        event.currency?.trim().toUpperCase().slice(0,3) || null,
        JSON.stringify(cleanMetadata(event.metadata)),
      ],
    );
    return true;
  } catch (error) {
    // Duplicate event IDs are deliberately idempotent for beacon retries.
    if (String(error).includes("analytics_event_id_unique_idx") || String(error).includes("duplicate key")) return true;
    console.warn("Analytics event record skipped:", error);
    return false;
  }
}

export type FunnelDashboard = {
  windowDays: number;
  totals: {
    views: number; engaged: number; leadImpressions: number; leadClicks: number; formStarts: number; signups: number;
    affiliateClicks: number; productClicks: number; checkoutClicks: number; purchases: number; revenue: number; revenueCurrency: string | null; multiCurrency: boolean; sessions: number;
  };
  funnel: Array<{ key: string; label: string; count: number; fromPreviousPct: number | null; fromViewsPct: number | null }>;
  articles: Array<{ slug: string; title: string; views: number; engaged: number; signups: number; affiliateClicks: number; productClicks: number; signupRate: number }>;
  sources: Array<{ source: string; medium: string; views: number; signups: number; affiliateClicks: number; purchases: number; revenue: number }>;
  leadMagnets: Array<{ slug: string; name: string; impressions: number; clicks: number; signups: number; accesses: number; signupRate: number }>;
  affiliates: Array<{ merchant: string; clicks: number }>;
  products: Array<{ slug: string; clicks: number; checkoutClicks: number; purchases: number; revenue: number }>;
};

type DbNumber = number | string | null;
type FunnelTotalsRow = {
  views: DbNumber; engaged: DbNumber; lead_impressions: DbNumber; lead_clicks: DbNumber; form_starts: DbNumber;
  signups: DbNumber; affiliate_clicks: DbNumber; product_clicks: DbNumber; checkout_clicks: DbNumber; sessions: DbNumber;
};
type FunnelArticleRow = { slug: string; title: string; views: DbNumber; engaged: DbNumber; signups: DbNumber; affiliate_clicks: DbNumber; product_clicks: DbNumber };
type FunnelSourceRow = { source: string; medium: string; views: DbNumber; signups: DbNumber; affiliate_clicks: DbNumber };
type FunnelMagnetRow = { slug: string; name: string; impressions: DbNumber; clicks: DbNumber; signups: DbNumber; accesses: DbNumber };
type FunnelAffiliateRow = { merchant: string; clicks: DbNumber };
type FunnelProductRow = { slug: string; clicks: DbNumber; checkout_clicks: DbNumber };
type CommerceRow = { currency: string; purchases: DbNumber; revenue: DbNumber };
type CommerceSourceRow = { source: string; medium: string; purchases: DbNumber; revenue: DbNumber };
type CommerceProductRow = { slug: string; purchases: DbNumber; revenue: DbNumber };

const n = (value: number | string | null | undefined) => Number(value || 0);
const pct = (a: number, b: number) => b > 0 ? Math.round((a / b) * 10_000) / 100 : 0;

export async function getFunnelAnalyticsDashboard(windowDays = 30): Promise<FunnelDashboard> {
  const days = Math.max(1, Math.min(365, Math.round(windowDays)));
  const since = `${days} days`;
  const [totalsRow, articleRows, sourceRows, magnetRows, affiliateRows, productRows, commerceRows] = await Promise.all([
    queryOne<FunnelTotalsRow>(`SELECT
      COUNT(*) FILTER (WHERE event_type='page_view' AND article_slug IS NOT NULL) AS views,
      COUNT(*) FILTER (WHERE event_type='content_engaged') AS engaged,
      COUNT(*) FILTER (WHERE event_type='cta_impression' AND link_kind='lead_magnet') AS lead_impressions,
      COUNT(*) FILTER (WHERE event_type='cta_click' AND link_kind='lead_magnet') AS lead_clicks,
      COUNT(*) FILTER (WHERE event_type='form_start') AS form_starts,
      COUNT(*) FILTER (WHERE event_type='newsletter_signup') AS signups,
      COUNT(*) FILTER (WHERE event_type='affiliate_click') AS affiliate_clicks,
      COUNT(*) FILTER (WHERE event_type='product_click') AS product_clicks,
      COUNT(*) FILTER (WHERE event_type='checkout_click') AS checkout_clicks,
      COUNT(DISTINCT session_id) FILTER (WHERE session_id IS NOT NULL) AS sessions
      FROM analytics_events WHERE created_at >= CURRENT_TIMESTAMP - (?::interval)`, [since]),
    queryRows<FunnelArticleRow>(`SELECT e.article_slug AS slug, COALESCE(a.title,e.article_slug) AS title,
      COUNT(*) FILTER (WHERE e.event_type='page_view') AS views,
      COUNT(*) FILTER (WHERE e.event_type='content_engaged') AS engaged,
      COUNT(*) FILTER (WHERE e.event_type='newsletter_signup') AS signups,
      COUNT(*) FILTER (WHERE e.event_type='affiliate_click') AS affiliate_clicks,
      COUNT(*) FILTER (WHERE e.event_type='product_click') AS product_clicks
      FROM analytics_events e LEFT JOIN articles a ON a.slug=e.article_slug
      WHERE e.created_at >= CURRENT_TIMESTAMP - (?::interval) AND e.article_slug IS NOT NULL
      GROUP BY e.article_slug,a.title HAVING COUNT(*) FILTER (WHERE e.event_type='page_view') > 0
      ORDER BY views DESC LIMIT 20`, [since]),
    queryRows<FunnelSourceRow>(`SELECT COALESCE(NULLIF(utm_source,''),NULLIF(source,''),'Direct / other') AS source, COALESCE(NULLIF(utm_medium,''),'') AS medium,
      COUNT(*) FILTER (WHERE event_type='page_view' AND article_slug IS NOT NULL) AS views,
      COUNT(*) FILTER (WHERE event_type='newsletter_signup') AS signups,
      COUNT(*) FILTER (WHERE event_type='affiliate_click') AS affiliate_clicks
      FROM analytics_events WHERE created_at >= CURRENT_TIMESTAMP - (?::interval)
      GROUP BY 1,2 ORDER BY views DESC LIMIT 20`, [since]),
    queryRows<FunnelMagnetRow>(`SELECT lm.slug,lm.name,
      COUNT(e.id) FILTER (WHERE e.event_type='cta_impression') AS impressions,
      COUNT(e.id) FILTER (WHERE e.event_type='cta_click') AS clicks,
      COUNT(e.id) FILTER (WHERE e.event_type='newsletter_signup') AS signups,
      COUNT(e.id) FILTER (WHERE e.event_type='lead_magnet_access') AS accesses
      FROM lead_magnets lm LEFT JOIN analytics_events e ON e.lead_magnet_slug=lm.slug AND e.created_at >= CURRENT_TIMESTAMP - (?::interval)
      GROUP BY lm.slug,lm.name ORDER BY signups DESC,impressions DESC`, [since]),
    queryRows<FunnelAffiliateRow>(`SELECT COALESCE(NULLIF(merchant,''),'Other') AS merchant,COUNT(*) AS clicks FROM analytics_events
      WHERE event_type='affiliate_click' AND created_at >= CURRENT_TIMESTAMP - (?::interval)
      GROUP BY 1 ORDER BY clicks DESC LIMIT 20`, [since]),
    queryRows<FunnelProductRow>(`SELECT COALESCE(product_slug,'unknown') AS slug,
      COUNT(*) FILTER (WHERE event_type='product_click') AS clicks,
      COUNT(*) FILTER (WHERE event_type='checkout_click') AS checkout_clicks
      FROM analytics_events WHERE product_slug IS NOT NULL AND created_at >= CURRENT_TIMESTAMP - (?::interval)
      GROUP BY product_slug ORDER BY clicks DESC LIMIT 20`, [since]),
    queryRows<CommerceRow>(`SELECT currency,COUNT(*) AS purchases,COALESCE(SUM(amount),0) AS revenue FROM commerce_conversions WHERE occurred_at >= CURRENT_TIMESTAMP - (?::interval) GROUP BY currency ORDER BY currency`, [since]),
  ]);

  const commerceBySource = await queryRows<CommerceSourceRow>(`SELECT COALESCE(NULLIF(utm_source,''),'Direct / other') AS source,COALESCE(NULLIF(utm_medium,''),'') AS medium,COUNT(*) AS purchases,COALESCE(SUM(amount),0) AS revenue
    FROM commerce_conversions WHERE occurred_at >= CURRENT_TIMESTAMP - (?::interval) GROUP BY 1,2`, [since]);
  const commerceByProduct = await queryRows<CommerceProductRow>(`SELECT product_slug AS slug,COUNT(*) AS purchases,COALESCE(SUM(amount),0) AS revenue
    FROM commerce_conversions WHERE occurred_at >= CURRENT_TIMESTAMP - (?::interval) GROUP BY product_slug`, [since]);
  const sourceCommerce = new Map(commerceBySource.map((r) => [`${r.source}\n${r.medium}`, r]));
  const productCommerce = new Map(commerceByProduct.map((r) => [r.slug, r]));
  const purchaseCount = commerceRows.reduce((sum,r)=>sum+n(r.purchases),0);
  const multiCurrency = commerceRows.length > 1;
  const revenueCurrency = commerceRows.length === 1 ? String(commerceRows[0].currency || "USD") : null;
  const confirmedRevenue = commerceRows.length === 1 ? n(commerceRows[0].revenue) : 0;

  const totals = {
    views:n(totalsRow?.views), engaged:n(totalsRow?.engaged), leadImpressions:n(totalsRow?.lead_impressions), leadClicks:n(totalsRow?.lead_clicks),
    formStarts:n(totalsRow?.form_starts), signups:n(totalsRow?.signups), affiliateClicks:n(totalsRow?.affiliate_clicks), productClicks:n(totalsRow?.product_clicks),
    checkoutClicks:n(totalsRow?.checkout_clicks), purchases:purchaseCount, revenue:confirmedRevenue, revenueCurrency, multiCurrency, sessions:n(totalsRow?.sessions),
  };
  const funnelRaw = [
    ["views","Article views",totals.views],["leadImpressions","Lead-magnet impressions",totals.leadImpressions],["leadClicks","Lead-magnet clicks",totals.leadClicks],
    ["formStarts","Form starts",totals.formStarts],["signups","Email signups",totals.signups],
  ] as const;
  const funnel = funnelRaw.map((row,index) => ({ key:row[0],label:row[1],count:row[2],fromPreviousPct:index ? pct(row[2],funnelRaw[index-1][2]) : null,fromViewsPct:index ? pct(row[2],totals.views) : null }));

  return {
    windowDays: days, totals, funnel,
    articles: articleRows.map((r) => ({ slug:r.slug,title:r.title,views:n(r.views),engaged:n(r.engaged),signups:n(r.signups),affiliateClicks:n(r.affiliate_clicks),productClicks:n(r.product_clicks),signupRate:pct(n(r.signups),n(r.views)) })),
    sources: sourceRows.map((r) => { const c=sourceCommerce.get(`${r.source}\n${r.medium}`); return { source:r.source,medium:r.medium,views:n(r.views),signups:n(r.signups),affiliateClicks:n(r.affiliate_clicks),purchases:n(c?.purchases),revenue:multiCurrency?0:n(c?.revenue) }; }),
    leadMagnets: magnetRows.map((r) => ({ slug:r.slug,name:r.name,impressions:n(r.impressions),clicks:n(r.clicks),signups:n(r.signups),accesses:n(r.accesses),signupRate:pct(n(r.signups),n(r.impressions)) })),
    affiliates: affiliateRows.map((r) => ({ merchant:r.merchant,clicks:n(r.clicks) })),
    products: productRows.map((r) => { const c=productCommerce.get(r.slug); return { slug:r.slug,clicks:n(r.clicks),checkoutClicks:n(r.checkout_clicks),purchases:n(c?.purchases),revenue:multiCurrency?0:n(c?.revenue) }; }),
  };
}

export async function recordCommerceConversion(input: {
  id?: string; provider: string; providerEventId: string; productSlug: string; articleSlug?: string; sessionId?: string; subscriberId?: number;
  amount: number; currency: string; utmSource?: string; utmMedium?: string; utmCampaign?: string; metadata?: Record<string, string | number | boolean | null>; occurredAt?: string;
}) {
  const id = input.id || randomUUID();
  const changed = await execute(`INSERT INTO commerce_conversions
    (id,provider,provider_event_id,product_slug,article_slug,session_id,subscriber_id,amount,currency,utm_source,utm_medium,utm_campaign,metadata_json,occurred_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?::jsonb,COALESCE(?::timestamptz,CURRENT_TIMESTAMP))
    ON CONFLICT(provider,provider_event_id) DO NOTHING`, [
      id,input.provider.slice(0,40),input.providerEventId.slice(0,180),input.productSlug.slice(0,160),input.articleSlug?.slice(0,120)||null,input.sessionId||null,input.subscriberId||null,
      Math.max(0,input.amount),input.currency.toUpperCase().slice(0,3),input.utmSource?.slice(0,120)||null,input.utmMedium?.slice(0,120)||null,input.utmCampaign?.slice(0,160)||null,
      JSON.stringify(cleanMetadata(input.metadata)),input.occurredAt||null,
    ]);
  return changed > 0;
}
