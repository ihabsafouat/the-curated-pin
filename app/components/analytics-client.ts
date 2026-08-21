"use client";

type Primitive = string | number | boolean | null;
type Attribution = {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
  referrerHost: string;
};

const EMPTY_ATTRIBUTION: Attribution = {
  source: "",
  medium: "",
  campaign: "",
  content: "",
  term: "",
  referrerHost: "",
};

export type ClientAnalyticsEvent = {
  eventType: string;
  eventId?: string;
  sessionId?: string;
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
  metadata?: Record<string, Primitive>;
};

const CONSENT_KEY = "tcp:analytics-consent";
const SESSION_KEY = "tcp:analytics-session";
const ATTRIBUTION_KEY = "tcp:attribution";

function accepted() {
  try { return localStorage.getItem(CONSENT_KEY) === "accepted"; } catch { return false; }
}

function referrerHost() {
  if (!document.referrer) return "";
  try { return new URL(document.referrer).hostname.slice(0,180); } catch { return ""; }
}

export function getAnalyticsSessionId() {
  if (!accepted()) return undefined;
  try {
    let value = sessionStorage.getItem(SESSION_KEY) || "";
    if (!value && typeof globalThis.crypto?.randomUUID === "function") {
      value = globalThis.crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, value);
    }
    return value || undefined;
  } catch { return undefined; }
}

export function getAttribution(): Attribution {
  if (typeof window === "undefined") return EMPTY_ATTRIBUTION;
  const params = new URLSearchParams(window.location.search);
  const current = {
    source: params.get("utm_source") || "",
    medium: params.get("utm_medium") || "",
    campaign: params.get("utm_campaign") || "",
    content: params.get("utm_content") || "",
    term: params.get("utm_term") || "",
    referrerHost: referrerHost(),
  };
  if (!accepted()) return current;
  try {
    const prior = JSON.parse(sessionStorage.getItem(ATTRIBUTION_KEY) || "{}") as typeof current;
    const hasStoredTouch = Boolean(prior.source || prior.medium || prior.campaign || prior.referrerHost);
    const hasCurrentCampaign = Boolean(current.source || current.medium || current.campaign);
    if (!hasStoredTouch) {
      sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(current));
      return current;
    }
    // Keep the stored value as first-touch attribution. If a new tagged landing
    // occurs in the same tab, attribute that page event to the current campaign
    // without erasing the original acquisition touch used by later conversions.
    if (hasCurrentCampaign) return { ...current, referrerHost: current.referrerHost || prior.referrerHost || "" };
    return { ...prior, referrerHost: prior.referrerHost || current.referrerHost };
  } catch { return current; }
}

function sendToGa(event: ClientAnalyticsEvent) {
  if (!accepted() || !window.gtag) return;
  const parameters: Record<string, Primitive> = {
    page_location: window.location.href,
    page_title: document.title,
    article_slug: event.articleSlug || null,
    lead_magnet: event.leadMagnetSlug || null,
    product: event.productSlug || null,
    merchant: event.merchant || null,
    placement: event.placement || null,
    link_kind: event.linkKind || null,
    scroll_depth: event.scrollDepth ?? null,
    engagement_seconds: event.engagementSeconds ?? null,
  };
  window.gtag("event", event.eventType, parameters);
}

export function sendAnalyticsEvent(input: ClientAnalyticsEvent) {
  if (typeof window === "undefined") return;
  const attribution = getAttribution();
  const payload: ClientAnalyticsEvent = {
    ...input,
    eventId: input.eventId || globalThis.crypto?.randomUUID?.(),
    sessionId: input.sessionId || getAnalyticsSessionId(),
    pagePath: input.pagePath || window.location.pathname,
    source: input.source || attribution.source || attribution.referrerHost || undefined,
    utmSource: input.utmSource || attribution.source || undefined,
    medium: input.medium || attribution.medium || undefined,
    campaign: input.campaign || attribution.campaign || undefined,
    content: input.content || attribution.content || undefined,
    term: input.term || attribution.term || undefined,
    referrerHost: input.referrerHost || attribution.referrerHost || undefined,
  };
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
  else fetch("/api/track", { method:"POST", headers:{"content-type":"application/json"}, body, keepalive:true }).catch(()=>{});
  sendToGa(payload);
}

export function newsletterAttributionPayload() {
  const attribution = getAttribution();
  return {
    analyticsSessionId: getAnalyticsSessionId(),
    utmSource: attribution.source || undefined,
    utmMedium: attribution.medium || undefined,
    utmCampaign: attribution.campaign || undefined,
    utmContent: attribution.content || undefined,
    utmTerm: attribution.term || undefined,
    referrerHost: attribution.referrerHost || undefined,
  };
}
