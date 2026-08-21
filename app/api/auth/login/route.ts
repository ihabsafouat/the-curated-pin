import { clearLoginFailures, findUserByEmail, registerLoginFailure, writeAuditLog } from "../../../../db/auth";
import { authIsConfigured, issueAuthSession } from "../../../security/auth";
import { verifyTurnstile } from "../../../security/bot";
import { hashPassword, verifyPassword } from "../../../security/password";
import { checkRateLimit, clientIpHash, rateLimitResponse } from "../../../security/rate-limit";
import { readJson, requestHasSafeOrigin } from "../../../security/request";
import { loginSchema } from "../../../security/validation";

export async function POST(request: Request) {
  if (!requestHasSafeOrigin(request)) return Response.json({ ok: false }, { status: 403 });
  if (!authIsConfigured()) return Response.json({ ok: false, error: "Account access is not configured." }, { status: 503 });
  const rate = await checkRateLimit(request, "auth:login", 5, 15 * 60);
  if (!rate.allowed) return rateLimitResponse(rate);
  const parsed = loginSchema.safeParse(await readJson(request, 12_000));
  if (!parsed.success) return Response.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
  if (!await verifyTurnstile(parsed.data.turnstileToken, request)) return Response.json({ ok: false, error: "We could not verify this request. Please try again." }, { status: 400 });

  const user = await findUserByEmail(parsed.data.email);
  const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : Boolean(await hashPassword("Timing-only-password!42"));
  const locked = Boolean(user?.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now());
  if (!user || !valid || locked || user.status !== "active") {
    if (user && !locked) {
      const failure = await registerLoginFailure(user.id);
      if (failure.lockedUntil) await writeAuditLog({ actorUserId: user.id, action: "auth.account_locked", targetType: "user", targetId: user.id, ipHash: await clientIpHash(request), metadata: { failedCount: failure.failedCount } }).catch(() => {});
    }
    await writeAuditLog({ actorUserId: user?.id ?? null, action: "auth.login_failed", targetType: "user", targetId: user?.id, ipHash: await clientIpHash(request) }).catch(() => {});
    return Response.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
  }
  await clearLoginFailures(user.id);
  const safe = await issueAuthSession(user, request);
  await writeAuditLog({ actorUserId: user.id, action: "auth.login", targetType: "user", targetId: user.id, ipHash: await clientIpHash(request) });
  return Response.json({ ok: true, user: safe });
}
