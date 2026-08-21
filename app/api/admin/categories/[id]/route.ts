import { updateCategory } from "../../../../../db/categories";
import { writeAuditLog } from "../../../../../db/auth";
import { getCurrentUser, roleAtLeast } from "../../../../security/auth";
import { checkRateLimit, clientIpHash, rateLimitResponse } from "../../../../security/rate-limit";
import { csrfMatches, readForm, requestHasSafeOrigin } from "../../../../security/request";
import { readCategoryInput } from "../route";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!requestHasSafeOrigin(request)) return new Response("Forbidden", { status: 403 });
  const rate = await checkRateLimit(request, "taxonomy:update", 60, 60 * 60);
  if (!rate.allowed) return rateLimitResponse(rate);
  const user = await getCurrentUser();
  if (!user || !roleAtLeast(user, "editor")) return new Response("Forbidden", { status: 403 });
  const { id } = await params;
  const categoryId = Number(id);
  if (!Number.isInteger(categoryId) || categoryId < 1) return new Response("Invalid category", { status: 400 });
  const form = await readForm(request);
  if (!form || !await csrfMatches(form.get("_csrf"))) return new Response("Invalid request", { status: 403 });
  const input = readCategoryInput(form);
  if (!input) return new Response("Please check the category fields.", { status: 400 });
  try {
    const category = await updateCategory(categoryId, input);
    if (!category) return new Response("Not found", { status: 404 });
    await writeAuditLog({ actorUserId: user.id, action: "category.update", targetType: "category", targetId: String(category.id), metadata: { path: category.path, status: category.status }, ipHash: await clientIpHash(request) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update category.";
    return new Response(message, { status: 409 });
  }
  return Response.redirect(new URL("/studio/categories", request.url), 303);
}
