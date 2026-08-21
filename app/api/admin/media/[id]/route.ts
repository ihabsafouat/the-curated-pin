import { getMediaAsset, updateMediaAsset } from "../../../../../db/media";
import { writeAuditLog } from "../../../../../db/auth";
import { getCurrentUser, roleAtLeast } from "../../../../security/auth";
import { checkRateLimit, clientIpHash, rateLimitResponse } from "../../../../security/rate-limit";
import { csrfMatches, readForm, requestHasSafeOrigin } from "../../../../security/request";
import { sanitizePlainText } from "../../../../security/sanitize";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!requestHasSafeOrigin(request)) return new Response("Forbidden", { status: 403 });
  const rate = await checkRateLimit(request, "publisher:media-update", 100, 60 * 60);
  if (!rate.allowed) return rateLimitResponse(rate);
  const user = await getCurrentUser();
  if (!user || !roleAtLeast(user, "author")) return new Response("Unauthorized", { status: 401 });
  const form = await readForm(request, 48_000);
  if (!form || !await csrfMatches(form.get("_csrf"))) return new Response("Invalid request", { status: 403 });
  const { id } = await params;
  const asset = await getMediaAsset(id);
  if (!asset) return new Response("Not found", { status: 404 });

  const altText = sanitizePlainText(String(form.get("altText") ?? ""), 320);
  if (altText.length < 2) return new Response("Alt text is required.", { status: 400 });
  const caption = sanitizePlainText(String(form.get("caption") ?? ""), 500);
  const credit = sanitizePlainText(String(form.get("credit") ?? ""), 240);
  const licenseNote = sanitizePlainText(String(form.get("licenseNote") ?? ""), 240);
  const tags = String(form.get("tags") ?? "").split(",").map((tag) => sanitizePlainText(tag, 40).toLowerCase()).filter(Boolean).slice(0, 16);
  const status = form.get("status") === "archived" ? "archived" as const : "active" as const;
  await updateMediaAsset(id, { altText, caption, credit, licenseNote, tags, status });
  await writeAuditLog({
    actorUserId: user.id,
    action: status === "archived" ? "media.archived" : "media.updated",
    targetType: "media",
    targetId: id,
    metadata: { publicId: asset.publicId, usageCount: asset.usageCount, status },
    ipHash: await clientIpHash(request),
  });
  return Response.redirect(new URL("/studio/media", request.url), 303);
}
