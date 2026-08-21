import { createCategory, type CategoryInput } from "../../../../db/categories";
import { writeAuditLog } from "../../../../db/auth";
import { getCurrentUser, roleAtLeast } from "../../../security/auth";
import { checkRateLimit, clientIpHash, rateLimitResponse } from "../../../security/rate-limit";
import { csrfMatches, readForm, requestHasSafeOrigin } from "../../../security/request";
import { categorySchema } from "../../../security/validation";

function slugifySegment(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

export function readCategoryInput(form: FormData): CategoryInput | null {
  const parentRaw = String(form.get("parentId") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  const parsed = categorySchema.safeParse({
    parentId: parentRaw ? Number(parentRaw) : null,
    name,
    slug: slugifySegment(String(form.get("slug") ?? "")) || slugifySegment(name),
    intro: String(form.get("intro") ?? ""),
    color: String(form.get("color") ?? "#e8e4db"),
    mark: String(form.get("mark") ?? "•") || "•",
    status: form.get("status") === "inactive" ? "inactive" : "active",
    showInNav: form.get("showInNav") === "on",
    sortOrder: String(form.get("sortOrder") ?? "100"),
    seoTitle: String(form.get("seoTitle") ?? ""),
    seoDescription: String(form.get("seoDescription") ?? ""),
    socialImage: String(form.get("socialImage") ?? ""),
    seoIndex: form.get("seoIndex") === "on",
  });
  return parsed.success ? parsed.data : null;
}

export async function POST(request: Request) {
  if (!requestHasSafeOrigin(request)) return new Response("Forbidden", { status: 403 });
  const rate = await checkRateLimit(request, "taxonomy:create", 30, 60 * 60);
  if (!rate.allowed) return rateLimitResponse(rate);
  const user = await getCurrentUser();
  if (!user || !roleAtLeast(user, "editor")) return new Response("Forbidden", { status: 403 });
  const form = await readForm(request);
  if (!form || !await csrfMatches(form.get("_csrf"))) return new Response("Invalid request", { status: 403 });
  const input = readCategoryInput(form);
  if (!input) return new Response("Please check the category fields.", { status: 400 });
  try {
    const category = await createCategory(input);
    await writeAuditLog({ actorUserId: user.id, action: "category.create", targetType: "category", targetId: String(category.id), metadata: { path: category.path }, ipHash: await clientIpHash(request) });
  } catch {
    return new Response("That category path is already in use or the parent is invalid.", { status: 409 });
  }
  return Response.redirect(new URL("/studio/categories", request.url), 303);
}
