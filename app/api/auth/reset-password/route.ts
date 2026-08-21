import { changeUserPassword, consumePasswordResetToken, writeAuditLog } from "../../../../db/auth";
import { verifyTurnstile } from "../../../security/bot";
import { sha256 } from "../../../security/crypto";
import { hashPassword } from "../../../security/password";
import { checkRateLimit, clientIpHash, rateLimitResponse } from "../../../security/rate-limit";
import { readJson, requestHasSafeOrigin } from "../../../security/request";
import { resetPasswordSchema } from "../../../security/validation";

export async function POST(request: Request) {
  if (!requestHasSafeOrigin(request)) return Response.json({ ok: false }, { status: 403 });
  const rate = await checkRateLimit(request, "auth:reset-password", 8, 60 * 60);
  if (!rate.allowed) return rateLimitResponse(rate);
  const parsed = resetPasswordSchema.safeParse(await readJson(request, 12_000));
  if (!parsed.success) return Response.json({ ok: false, error: "The reset link is invalid or the new password does not meet the requirements." }, { status: 400 });
  if (!await verifyTurnstile(parsed.data.turnstileToken, request)) return Response.json({ ok: false, error: "We could not verify this request. Please try again." }, { status: 400 });
  const user = await consumePasswordResetToken(await sha256(parsed.data.token));
  if (!user) return Response.json({ ok: false, error: "This reset link is invalid, expired, or has already been used." }, { status: 400 });
  await changeUserPassword(user.id, await hashPassword(parsed.data.password));
  await writeAuditLog({ actorUserId: user.id, action: "auth.password_reset_completed", targetType: "user", targetId: user.id, ipHash: await clientIpHash(request) }).catch(() => {});
  return Response.json({ ok: true });
}
