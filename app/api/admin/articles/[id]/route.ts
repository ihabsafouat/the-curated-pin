import { deleteArticle, getAdminArticleById, updateArticle } from "../../../../../db/data";
import { writeAuditLog } from "../../../../../db/auth";
import { getCurrentUser, roleAtLeast } from "../../../../security/auth";
import { checkRateLimit, clientIpHash, rateLimitResponse } from "../../../../security/rate-limit";
import { csrfMatches, readForm, requestHasSafeOrigin } from "../../../../security/request";
import { readArticleInput } from "../route";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!requestHasSafeOrigin(request)) return new Response("Forbidden", { status: 403 });
  const rate = await checkRateLimit(request, "publisher:update", 60, 60 * 60);
  if (!rate.allowed) return rateLimitResponse(rate);
  const user = await getCurrentUser();
  if (!user || !roleAtLeast(user, "author")) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const articleId = Number(id);
  if (!Number.isInteger(articleId) || articleId < 1) return new Response("Invalid article", { status: 400 });
  const current = await getAdminArticleById(articleId);
  if (!current) return new Response("Not found", { status: 404 });
  const form = await readForm(request);
  if (!form || !await csrfMatches(form.get("_csrf"))) return new Response("Invalid request", { status: 403 });
  const ipHash = await clientIpHash(request);
  if (form.get("intent") === "delete") {
    if (!roleAtLeast(user, "editor")) return new Response("Forbidden", { status: 403 });
    await deleteArticle(articleId);
    await writeAuditLog({ actorUserId: user.id, action: "article.delete", targetType: "article", targetId: String(articleId), metadata: { slug: current.slug }, ipHash });
    return Response.redirect(new URL("/studio", request.url), 303);
  }
  if (!roleAtLeast(user, "editor") && current.authorId !== user.id) return new Response("Forbidden", { status: 403 });
  const input = await readArticleInput(form);
  if (!input) return new Response("Please check the article fields.", { status: 400 });
  if (!roleAtLeast(user, "editor")) input.status = "draft";
  try {
    const updated = await updateArticle(articleId, input);
    if (!updated) return new Response("Not found", { status: 404 });
    await writeAuditLog({ actorUserId: user.id, action: "article.update", targetType: "article", targetId: String(articleId), ipHash });
  } catch {
    return new Response("That slug is already in use.", { status: 409 });
  }
  return Response.redirect(new URL("/studio", request.url), 303);
}
