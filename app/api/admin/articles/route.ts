import { createArticle, type ArticleInput } from "../../../../db/data";
import { blocksToLegacySections } from "../../../content";
import { getCategoryById } from "../../../../db/categories";
import { getPlannedCategoryIdForArticleSlug } from "../../../../db/seo";
import { writeAuditLog } from "../../../../db/auth";
import { getCurrentUser, roleAtLeast } from "../../../security/auth";
import { checkRateLimit, clientIpHash, rateLimitResponse } from "../../../security/rate-limit";
import { csrfMatches, readForm, requestHasSafeOrigin } from "../../../security/request";
import { articleSchema } from "../../../security/validation";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);
}

export async function readArticleInput(form: FormData): Promise<ArticleInput | null> {
  const title = String(form.get("title") ?? "").trim();
  let blocks: unknown = [];
  try { blocks = JSON.parse(String(form.get("blocksJson") ?? "[]")); } catch { return null; }
  const parsed = articleSchema.safeParse({
    categoryId: form.get("categoryId"),
    title,
    dek: String(form.get("dek") ?? ""),
    image: String(form.get("image") ?? ""),
    slug: slugify(String(form.get("slug") ?? "")) || slugify(title),
    readTime: String(form.get("readTime") ?? "6 min read"),
    status: form.get("status") === "published" ? "published" : "draft",
    seoTitle: String(form.get("seoTitle") ?? ""),
    seoDescription: String(form.get("seoDescription") ?? ""),
    affiliateUrl: String(form.get("affiliateUrl") ?? ""),
    affiliateLabel: String(form.get("affiliateLabel") ?? ""),
    imageAlt: String(form.get("imageAlt") ?? title),
    socialImage: String(form.get("socialImage") ?? ""),
    canonicalPath: String(form.get("canonicalPath") ?? ""),
    seoIndex: form.get("seoIndex") === "on",
    blocks,
  });
  if (!parsed.success) return null;
  const category = await getCategoryById(parsed.data.categoryId);
  if (!category) return null;
  const plannedCategoryId = await getPlannedCategoryIdForArticleSlug(parsed.data.slug);
  if (plannedCategoryId !== null && plannedCategoryId !== parsed.data.categoryId) return null;
  return { ...parsed.data, sections: blocksToLegacySections(parsed.data.blocks) };
}

export async function POST(request: Request) {
  if (!requestHasSafeOrigin(request)) return new Response("Forbidden", { status: 403 });
  const rate = await checkRateLimit(request, "publisher:create", 30, 60 * 60);
  if (!rate.allowed) return rateLimitResponse(rate);
  const user = await getCurrentUser();
  if (!user || !roleAtLeast(user, "author")) return new Response("Unauthorized", { status: 401 });
  const form = await readForm(request);
  if (!form || !await csrfMatches(form.get("_csrf"))) return new Response("Invalid request", { status: 403 });
  const input = await readArticleInput(form);
  if (!input) return new Response("Please check the article fields and choose an active category.", { status: 400 });
  if (!roleAtLeast(user, "editor")) input.status = "draft";
  try {
    await createArticle(input, user.id);
    await writeAuditLog({ actorUserId: user.id, action: "article.create", targetType: "article", targetId: input.slug, ipHash: await clientIpHash(request) });
  } catch {
    return new Response("That slug is already in use or the selected category is invalid.", { status: 409 });
  }
  return Response.redirect(new URL("/studio", request.url), 303);
}
