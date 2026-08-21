import { setReaderFeedbackStatus } from "../../../../../db/data";
import { writeAuditLog } from "../../../../../db/auth";
import { getCurrentUser, roleAtLeast } from "../../../../security/auth";
import { checkRateLimit, clientIpHash, rateLimitResponse } from "../../../../security/rate-limit";
import { csrfMatches, readForm, requestHasSafeOrigin } from "../../../../security/request";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!requestHasSafeOrigin(request)) return new Response("Forbidden", { status: 403 });
  const rate = await checkRateLimit(request, "feedback:moderate", 60, 60 * 60);
  if (!rate.allowed) return rateLimitResponse(rate);
  const user = await getCurrentUser();
  if (!user || !roleAtLeast(user, "editor")) return new Response("Forbidden", { status: 403 });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Invalid feedback id", { status: 400 });
  const form = await readForm(request, 10_000);
  if (!form || !await csrfMatches(form.get("_csrf"))) return new Response("Invalid request", { status: 403 });
  const status = form.get("status");
  if (status !== "approved" && status !== "rejected") return new Response("Invalid status", { status: 400 });
  if (!await setReaderFeedbackStatus(id, status)) return new Response("Not found", { status: 404 });
  await writeAuditLog({ actorUserId: user.id, action: `feedback.${status}`, targetType: "reader_feedback", targetId: id, ipHash: await clientIpHash(request) });
  return Response.redirect(new URL("/studio/feedback", request.url), 303);
}
