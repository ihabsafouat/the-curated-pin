import { createReaderFeedback } from "../../../db/data";
import { writeAuditLog } from "../../../db/auth";
import { verifyTurnstile } from "../../security/bot";
import { checkRateLimit, clientIpHash, rateLimitResponse } from "../../security/rate-limit";
import { readJson, requestHasSafeOrigin } from "../../security/request";
import { readerFeedbackSchema } from "../../security/validation";

export async function POST(request: Request) {
  if (!requestHasSafeOrigin(request)) return Response.json({ ok: false }, { status: 403 });
  const rate = await checkRateLimit(request, "reader:feedback", 6, 60 * 60);
  if (!rate.allowed) return rateLimitResponse(rate);
  const parsed = readerFeedbackSchema.safeParse(await readJson(request, 16_000));
  if (!parsed.success) return Response.json({ ok: false, error: "Please check the feedback form." }, { status: 400 });
  if (!await verifyTurnstile(parsed.data.turnstileToken, request)) return Response.json({ ok: false, error: "We could not verify this request." }, { status: 400 });
  const ipHash = await clientIpHash(request);
  const ok = await createReaderFeedback({ id: crypto.randomUUID(), articleSlug: parsed.data.articleSlug, rating: parsed.data.rating, helpful: parsed.data.helpful, message: parsed.data.message, displayName: parsed.data.displayName, consentPublish: parsed.data.consentPublish, ipHash });
  if (ok) await writeAuditLog({ actorUserId: null, action: "reader.feedback", targetType: "article", targetId: parsed.data.articleSlug, ipHash }).catch(() => {});
  return Response.json({ ok }, { status: ok ? 200 : 404 });
}
