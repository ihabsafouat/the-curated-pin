import type { Article } from "../app/content";

export const userRoles = ["reader", "author", "editor", "admin"] as const;
export type UserRole = (typeof userRoles)[number];

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "suspended";
  tokenVersion: number;
  createdAt: string;
};

export type CategoryStatus = "active" | "inactive";

export type Category = {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  path: string;
  intro: string;
  color: string;
  mark: string;
  status: CategoryStatus;
  showInNav: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  socialImage: string;
  seoIndex: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CategoryTreeNode = Category & {
  children: CategoryTreeNode[];
};

export type CategoryInput = {
  parentId: number | null;
  name: string;
  slug: string;
  intro: string;
  color: string;
  mark: string;
  status: CategoryStatus;
  showInNav: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  socialImage: string;
  seoIndex: boolean;
};

export type ManagedArticle = Article & {
  id: number;
  authorId: string | null;
  categoryId: number;
  category: string;
  categoryPath: string;
  status: "draft" | "published";
  seoTitle: string;
  seoDescription: string;
  affiliateUrl: string;
  affiliateLabel: string;
  imageAlt: string;
  socialImage: string;
  canonicalPath: string;
  seoIndex: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type ArticleInput = Article & {
  categoryId: number;
  status: "draft" | "published";
  seoTitle: string;
  seoDescription: string;
  affiliateUrl: string;
  affiliateLabel: string;
  imageAlt: string;
  socialImage: string;
  canonicalPath: string;
  seoIndex: boolean;
};

export type AnalyticsSummary = {
  totals: {
    views: number;
    clicks: number;
    saves: number;
    subscribers: number;
    published: number;
    drafts: number;
  };
  topArticles: { slug: string; title: string; views: number }[];
  topLinks: { url: string; label: string; clicks: number }[];
  topSearches: { query: string; searches: number }[];
  topSources: { source: string; views: number }[];
};

export type SeoPageRole = "hub" | "pillar" | "thematic" | "supporting" | "money" | "utility";
export type SeoPlanStatus = "research" | "planned" | "briefed" | "published" | "hold";
export type SeoSearchIntent = "informational" | "commercial" | "transactional" | "mixed" | "navigational";

export type SeoPlanPage = {
  id: number;
  pageKey: string;
  entityType: "category" | "article";
  categoryId: number | null;
  articleId: number | null;
  plannedSlug: string | null;
  title: string;
  pageRole: SeoPageRole;
  clusterKey: string;
  primaryKeyword: string;
  searchIntent: SeoSearchIntent;
  semanticScope: string;
  status: SeoPlanStatus;
  priority: number;
  targetVolume: number | null;
  targetKd: number | null;
  targetCpc: number | null;
  backlinkPriority: number;
  pageRankScore: number;
  url: string | null;
  isLive: boolean;
};

export type SeoInternalLink = {
  id: number;
  sourcePageId: number;
  targetPageId: number;
  sourceKey: string;
  targetKey: string;
  sourceTitle: string;
  targetTitle: string;
  targetUrl: string | null;
  anchorText: string;
  linkType: "parent" | "child" | "sibling" | "contextual" | "commercial" | "conversion";
  placement: "body" | "hub" | "related" | "cta";
  semanticScore: number;
  weight: number;
  required: boolean;
  rationale: string;
};

export type SeoKeywordClaim = {
  pageKey: string;
  pageTitle: string;
  clusterKey: string;
  pageRole: SeoPageRole;
  keyword: string;
  keywordRole: "primary" | "secondary" | "supporting" | "excluded";
  volume: number | null;
  kd: number | null;
  cpc: number | null;
};

export type SeoCannibalizationRisk = {
  severity: "critical" | "review";
  pageA: string;
  pageB: string;
  keywordA: string;
  keywordB: string;
  reason: string;
};

export type SeoBacklinkAsset = {
  id: number;
  pageKey: string;
  pageTitle: string;
  assetName: string;
  assetType: string;
  outreachAngle: string;
  targetAudience: string;
  status: "planned" | "building" | "live" | "outreach" | "earned" | "retired";
  priority: number;
};

export type SeoMapSummary = {
  pages: SeoPlanPage[];
  links: SeoInternalLink[];
  keywordClaims: SeoKeywordClaim[];
  backlinkAssets: SeoBacklinkAsset[];
  cannibalizationRisks: SeoCannibalizationRisk[];
  semanticDriftLinks: SeoInternalLink[];
  topAuthorityPages: Array<SeoPlanPage & { simulatedPageRank: number; incomingLinks: number; outgoingLinks: number }>;
};

export type AudienceInterest = {
  interestKey: string;
  parentKey: string | null;
  name: string;
  description: string;
  status: "active" | "inactive";
  sortOrder: number;
};

export type LeadMagnetResourceSection = {
  title: string;
  fields?: string[];
  checklist?: string[];
};

export type LeadMagnet = {
  id: number;
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  ctaLabel: string;
  interestKey: string | null;
  assetUrl: string;
  resource: LeadMagnetResourceSection[];
  emailSubject: string;
  emailIntro: string;
  status: "draft" | "active" | "retired";
  seoIndex: boolean;
};

export type AudienceSignupInput = {
  email: string;
  firstName?: string;
  source: string;
  interestKey?: string;
  leadMagnetSlug?: string;
  articleSlug?: string;
  categoryPath?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrerHost?: string;
  analyticsSessionId?: string;
  consentVersion?: string;
};

export type AudienceSubscriber = {
  id: number;
  email: string;
  firstName: string;
  status: "subscribed" | "unsubscribed";
  source: string;
  lastSource: string;
  primaryInterest: string | null;
  leadMagnetSlug: string | null;
  createdAt: string;
  updatedAt: string;
  interests: string[];
};

export type EmailSequenceSummary = {
  id: number;
  slug: string;
  name: string;
  interestKey: string | null;
  status: "draft" | "active" | "paused" | "retired";
  steps: number;
  activeEnrollments: number;
};

export type AudienceDashboard = {
  subscribers: number;
  unsubscribed: number;
  interests: Array<{ interestKey: string; name: string; subscribers: number }>;
  magnets: Array<LeadMagnet & { subscribers: number }>;
  sequences: EmailSequenceSummary[];
};
