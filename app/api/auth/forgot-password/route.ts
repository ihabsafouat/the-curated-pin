import { createPasswordResetToken, findUserByEmail, writeAuditLog } from "../../../../db/auth";
import { verifyTurnstile } from "../../../security/bot";
import { randomToken, sha256 } from "../../../security/crypto";
import { sendPasswordResetEmail } from "../../../security/email";
import { checkRateLimit, checkRateLimitKey, clientIpHash, rateLimitResponse } from "../../../security/rate-limit";
import { readJson, requestHasSafeOrigin } from "../../../security/request";
import { forgotPasswordSchema } from "../../../security/validation";
import { absoluteUrl } from "../../../site";

const GENERIC = "If that email is registered, a reset link will be sent shortly.";

export async function POST(request: Request) {
  if (!requestHasSafeOrigin(request)) return Response.json({ ok: false }, { status: 403 });
  const ipRate = await checkRateLimit(request, "auth:forgot-password", 5, 60 * 60);
  if (!ipRate.allowed) return rateLimitResponse(ipRate);
  const parsed = forgotPasswordSchema.safeParse(await readJson(request, 8_000));
  if (!parsed.success) return Response.json({ ok: true, message: GENERIC });
  if (!await verifyTurnstile(parsed.data.turnstileToken, request)) return Response.json({ ok: false, error: "We could not verify this request. Please try again." }, { status: 400 });
  const accountRate = await checkRateLimitKey(`password-reset:${parsed.data.email}`, "auth:forgot-password-account", 3, 60 * 60);
  if (!accountRate.allowed) return Response.json({ ok: true, message: GENERIC });
  const user = await findUserByEmail(parsed.data.email);
  if (user) {
    const token = randomToken(32);
    await createPasswordResetToken({ id: crypto.randomUUID(), userId: user.id, tokenHash: await sha256(token), expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() });
    await sendPasswordResetEmail(user.email, absoluteUrl(`/reset-password?token=${encodeURIComponent(token)}`)).catch(() => false);
    await writeAuditLog({ actorUserId: user.id, action: "auth.password_reset_requested", targetType: "user", targetId: user.id, ipHash: await clientIpHash(request) }).catch(() => {});
  } else {
    await sha256(randomToken(32));
  }
  return Response.json({ ok: true, message: GENERIC });
}
