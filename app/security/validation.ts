import { z } from "zod";
import { userRoles } from "../../db/types";
import { sanitizePlainText } from "./sanitize";

const normalizedEmail = z.string().trim().toLowerCase().email().max(254);
const turnstileToken = z.string().trim().max(2048).optional().default("");

const password = z
  .string()
  .min(12)
  .max(128)
  .regex(/[a-z]/)
  .regex(/[A-Z]/)
  .regex(/[0-9]/)
  .regex(/[^A-Za-z0-9]/);

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80).transform((value) => sanitizePlainText(value, 80)),
  email: normalizedEmail,
  password,
  acceptTerms: z.literal(true),
  turnstileToken,
});

export const loginSchema = z.object({
  email: normalizedEmail,
  password: z.string().min(1).max(128),
  turnstileToken,
});

export const newsletterSchema = z.object({
  email: normalizedEmail,
  firstName: z.string().trim().max(80).transform((value) => sanitizePlainText(value, 80)).default(""),
  source: z.string().trim().max(80).transform((value) => sanitizePlainText(value, 80)).default("website"),
  interestKey: z.string().trim().regex(/^[a-z0-9-]+$/).max(80).optional(),
  leadMagnetSlug: z.string().trim().regex(/^[a-z0-9-]+$/).max(120).optional(),
  articleSlug: z.string().trim().regex(/^[a-z0-9-]+$/).max(120).optional(),
  categoryPath: z.string().trim().regex(/^[a-z0-9-/]+$/).max(240).optional(),
  utmSource: z.string().trim().max(120).transform((value) => sanitizePlainText(value, 120)).optional(),
  utmMedium: z.string().trim().max(120).transform((value) => sanitizePlainText(value, 120)).optional(),
  utmCampaign: z.string().trim().max(160).transform((value) => sanitizePlainText(value, 160)).optional(),
  utmContent: z.string().trim().max(160).transform((value) => sanitizePlainText(value, 160)).optional(),
  utmTerm: z.string().trim().max(160).transform((value) => sanitizePlainText(value, 160)).optional(),
  referrerHost: z.string().trim().max(180).transform((value) => sanitizePlainText(value, 180)).optional(),
  analyticsSessionId: z.string().uuid().optional(),
  consent: z.literal(true),
  consentVersion: z.string().trim().max(40).default("email-v1"),
  turnstileToken,
});

export const newsletterPreferencesSchema = z.object({
  token: z.string().trim().min(40).max(1200),
  interestKeys: z.array(z.string().trim().regex(/^[a-z0-9-]+$/).max(80)).max(20).default([]),
  unsubscribe: z.boolean().default(false),
});

export const sequenceStatusSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(["draft", "active", "paused", "retired"]),
});

const safeExternalUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((value) => {
    if (!value) return true;
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  });

const safeSiteOrExternalUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((value) => {
    if (!value) return true;
    if (value.startsWith("/") && !value.startsWith("//")) return true;
    return safeExternalUrl.safeParse(value).success;
  }, "Use a same-site path beginning with / or a valid http(s) URL.");

export const trackingSchema = z.object({
  eventId: z.string().uuid().optional(),
  eventType: z.enum(["page_view", "content_engaged", "cta_impression", "cta_click", "form_start", "newsletter_signup", "lead_magnet_access", "email_click", "affiliate_click", "product_click", "checkout_click", "outbound_click", "internal_link_click", "share_click", "favorite", "read_later", "search"]),
  sessionId: z.string().uuid().optional(),
  articleSlug: z.string().trim().regex(/^[a-z0-9-]+$/).max(120).optional(),
  pagePath: z.string().trim().max(500).refine((value) => !value || (value.startsWith("/") && !value.startsWith("//")), "Page paths must be same-site paths.").optional(),
  categoryPath: z.string().trim().regex(/^[a-z0-9-/]+$/).max(240).optional(),
  leadMagnetSlug: z.string().trim().regex(/^[a-z0-9-]+$/).max(120).optional(),
  productSlug: z.string().trim().regex(/^[a-z0-9-]+$/).max(160).optional(),
  merchant: z.string().trim().max(120).transform((value) => sanitizePlainText(value, 120)).optional(),
  linkKind: z.string().trim().regex(/^[a-z0-9_-]+$/).max(40).optional(),
  placement: z.string().trim().regex(/^[a-z0-9:_-]+$/).max(80).optional(),
  targetUrl: safeSiteOrExternalUrl.optional(),
  targetLabel: z.string().trim().max(180).transform((value) => sanitizePlainText(value, 180)).optional(),
  source: z.string().trim().max(120).transform((value) => sanitizePlainText(value, 120)).optional(),
  utmSource: z.string().trim().max(120).transform((value) => sanitizePlainText(value, 120)).optional(),
  referrerHost: z.string().trim().max(180).transform((value) => sanitizePlainText(value, 180)).optional(),
  campaign: z.string().trim().max(160).transform((value) => sanitizePlainText(value, 160)).optional(),
  medium: z.string().trim().max(120).transform((value) => sanitizePlainText(value, 120)).optional(),
  content: z.string().trim().max(160).transform((value) => sanitizePlainText(value, 160)).optional(),
  term: z.string().trim().max(160).transform((value) => sanitizePlainText(value, 160)).optional(),
  searchQuery: z.string().trim().max(200).transform((value) => sanitizePlainText(value, 200)).optional(),
  engagementSeconds: z.coerce.number().int().min(0).max(86400).optional(),
  scrollDepth: z.coerce.number().int().min(0).max(100).optional(),
  value: z.coerce.number().min(0).max(1000000).optional(),
  currency: z.string().trim().regex(/^[A-Za-z]{3}$/).transform((value) => value.toUpperCase()).optional(),
  metadata: z.record(z.string(), z.union([z.string().max(300), z.number(), z.boolean(), z.null()])).optional(),
});

export const commerceConversionSchema = z.object({
  provider: z.string().trim().regex(/^[a-z0-9_-]+$/i).max(40),
  providerEventId: z.string().trim().min(4).max(180),
  productSlug: z.string().trim().regex(/^[a-z0-9-]+$/).max(160),
  articleSlug: z.string().trim().regex(/^[a-z0-9-]+$/).max(120).optional(),
  sessionId: z.string().uuid().optional(),
  amount: z.coerce.number().min(0).max(1000000),
  currency: z.string().trim().regex(/^[A-Za-z]{3}$/).transform((value) => value.toUpperCase()),
  utmSource: z.string().trim().max(120).transform((value) => sanitizePlainText(value, 120)).optional(),
  utmMedium: z.string().trim().max(120).transform((value) => sanitizePlainText(value, 120)).optional(),
  utmCampaign: z.string().trim().max(160).transform((value) => sanitizePlainText(value, 160)).optional(),
  occurredAt: z.string().datetime({ offset: true }).optional(),
  metadata: z.record(z.string(), z.union([z.string().max(300), z.number(), z.boolean(), z.null()])).optional(),
});

export const forgotPasswordSchema = z.object({
  email: normalizedEmail,
  turnstileToken,
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(32).max(300),
  password,
  turnstileToken,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: password,
});

export const readerFeedbackSchema = z.object({
  articleSlug: z.string().trim().regex(/^[a-z0-9-]+$/).max(120),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  helpful: z.boolean().optional(),
  message: z.string().max(1200).transform((value) => sanitizePlainText(value, 1200)).default(""),
  displayName: z.string().max(80).transform((value) => sanitizePlainText(value, 80)).default(""),
  consentPublish: z.boolean().default(false),
  turnstileToken,
}).refine((value) => value.rating !== undefined || value.helpful !== undefined || value.message.length > 0, "Feedback cannot be empty.");

export const saveSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9-]+$/).max(120),
  kind: z.enum(["favorite", "read_later"]),
  saved: z.boolean(),
});

export const roleSchema = z.object({ role: z.enum(userRoles) });

const blockId = z.string().trim().min(1).max(80).regex(/^[A-Za-z0-9_-]+$/);
const shortText = z.string().trim().max(240);
const bodyText = z.string().trim().max(12000);
const listItems = z.array(z.string().trim().min(1).max(500)).max(40);
const imageItemSchema = z.object({
  url: safeExternalUrl.refine(Boolean),
  alt: z.string().trim().min(2).max(220),
  caption: z.string().trim().max(400).optional(),
});

export const articleBlockSchema = z.discriminatedUnion("type", [
  z.object({ id: blockId, type: z.literal("paragraph"), text: bodyText.min(20) }),
  z.object({ id: blockId, type: z.literal("heading"), level: z.union([z.literal(2), z.literal(3)]), text: shortText.min(2) }),
  z.object({ id: blockId, type: z.literal("image"), url: safeExternalUrl.refine(Boolean), alt: shortText.min(2), caption: z.string().trim().max(500) }),
  z.object({ id: blockId, type: z.literal("gallery"), title: shortText, images: z.array(imageItemSchema).min(2).max(10) }),
  z.object({ id: blockId, type: z.literal("idea"), eyebrow: shortText, title: shortText.min(2), body: bodyText.min(20), image: safeExternalUrl, imageAlt: shortText, budget: shortText, bestFor: shortText, setting: shortText }),
  z.object({ id: blockId, type: z.literal("checklist"), title: shortText.min(2), items: listItems.min(1) }),
  z.object({ id: blockId, type: z.literal("bullets"), title: shortText, items: listItems.min(1) }),
  z.object({ id: blockId, type: z.literal("table"), title: shortText, headers: z.array(z.string().trim().min(1).max(120)).min(2).max(8), rows: z.array(z.array(z.string().trim().max(500)).min(1).max(8)).min(1).max(40) }),
  z.object({ id: blockId, type: z.literal("comparison"), title: shortText.min(2), leftTitle: shortText.min(1), leftItems: listItems.min(1), rightTitle: shortText.min(1), rightItems: listItems.min(1) }),
  z.object({ id: blockId, type: z.literal("tip"), label: shortText, title: shortText, body: bodyText.min(10) }),
  z.object({ id: blockId, type: z.literal("pros_cons"), title: shortText.min(2), pros: listItems.min(1), cons: listItems.min(1) }),
  z.object({ id: blockId, type: z.literal("affiliate_product"), merchant: shortText.min(1), network: shortText, name: shortText.min(2), description: bodyText.min(10), url: safeExternalUrl.refine(Boolean), image: safeExternalUrl, imageAlt: shortText, cta: shortText.min(2), priceNote: shortText }),
  z.object({ id: blockId, type: z.literal("lead_magnet"), eyebrow: shortText, title: shortText.min(2), body: bodyText.min(10), cta: shortText.min(2), url: safeSiteOrExternalUrl.refine(Boolean) }),
  z.object({ id: blockId, type: z.literal("product_cta"), eyebrow: shortText, title: shortText.min(2), body: bodyText.min(10), cta: shortText.min(2), url: safeSiteOrExternalUrl.refine(Boolean), price: shortText, image: safeSiteOrExternalUrl, imageAlt: shortText }),
  z.object({ id: blockId, type: z.literal("internal_link"), eyebrow: shortText, title: shortText.min(2), body: bodyText, anchor: shortText.min(2), url: z.string().trim().min(1).max(1000).refine((value) => value.startsWith("/") && !value.startsWith("//"), "Internal link blocks must use a same-site path beginning with /." ) }),
  z.object({ id: blockId, type: z.literal("source_list"), title: shortText.min(2), items: z.array(z.object({ label: shortText.min(2), publisher: shortText.min(2), url: safeExternalUrl.refine(Boolean) })).min(1).max(16) }),
  z.object({ id: blockId, type: z.literal("faq"), title: shortText, items: z.array(z.object({ question: shortText.min(3), answer: bodyText.min(10) })).min(1).max(16) }),
  z.object({ id: blockId, type: z.literal("pinterest_asset"), title: shortText, image: safeExternalUrl.refine(Boolean), imageAlt: shortText.min(2), pinTitle: shortText.min(2), pinDescription: z.string().trim().min(10).max(500) }),
  z.object({ id: blockId, type: z.literal("quote"), text: bodyText.min(5), attribution: shortText }),
  z.object({ id: blockId, type: z.literal("divider") }),
]);

export const articleBlocksSchema = z.array(articleBlockSchema).min(1).max(100);

export const articleSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  title: z.string().trim().min(4).max(180),
  dek: z.string().trim().min(20).max(700),
  image: safeExternalUrl.refine(Boolean),
  slug: z.string().trim().regex(/^[a-z0-9-]*$/).max(100),
  readTime: z.string().trim().min(3).max(30),
  status: z.enum(["draft", "published"]),
  seoTitle: z.string().trim().max(180),
  seoDescription: z.string().trim().max(180),
  affiliateUrl: safeExternalUrl,
  affiliateLabel: z.string().trim().max(160),
  imageAlt: z.string().trim().min(4).max(320),
  socialImage: safeSiteOrExternalUrl,
  canonicalPath: z.string().trim().max(300).refine((value) => !value || (value.startsWith("/") && !value.startsWith("//")), "Canonical override must be a same-site path beginning with /."),
  seoIndex: z.boolean(),
  blocks: articleBlocksSchema,
});


export const categorySchema = z.object({
  parentId: z.union([z.coerce.number().int().positive(), z.null()]),
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),
  intro: z.string().trim().max(700),
  color: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/),
  mark: z.string().trim().min(1).max(16),
  status: z.enum(["active", "inactive"]),
  showInNav: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(10000),
  seoTitle: z.string().trim().max(180),
  seoDescription: z.string().trim().max(180),
  socialImage: safeSiteOrExternalUrl,
  seoIndex: z.boolean(),
});
