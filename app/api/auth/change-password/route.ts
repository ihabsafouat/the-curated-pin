import { changeUserPassword, findUserById, writeAuditLog } from "../../../../db/auth";
import { getCurrentUser, issueAuthSession } from "../../../security/auth";
import { hashPassword, verifyPassword } from "../../../security/password";
import { checkRateLimit, clientIpHash, rateLimitResponse } from "../../../security/rate-limit";
import { csrfMatches, readJson, requestHasSafeOrigin } from "../../../security/request";
import { changePasswordSchema } from "../../../security/validation";

export async function POST(request: Request) {
  if (!requestHasSafeOrigin(request) || !await csrfMatches(request.headers.get("x-csrf-token"))) return Response.json({ ok: false }, { status: 403 });
  const rate = await checkRateLimit(request, "auth:change-password", 5, 60 * 60);
  if (!rate.allowed) return rateLimitResponse(rate);
  const current = await getCurrentUser();
  if (!current) return Response.json({ ok: false }, { status: 401 });
  const parsed = changePasswordSchema.safeParse(await readJson(request, 12_000));
  if (!parsed.success) return Response.json({ ok: false, error: "Use a stronger new password." }, { status: 400 });
  const user = await findUserById(current.id);
  if (!user || !await verifyPassword(parsed.data.currentPassword, user.passwordHash)) return Response.json({ ok: false, error: "Current password is incorrect." }, { status: 400 });
  const changed = await changeUserPassword(user.id, await hashPassword(parsed.data.newPassword));
  if (!changed) return Response.json({ ok: false }, { status: 500 });
  await issueAuthSession(changed, request);
  await writeAuditLog({ actorUserId: changed.id, action: "auth.password_changed", targetType: "user", targetId: changed.id, ipHash: await clientIpHash(request) }).catch(() => {});
  return Response.json({ ok: true });
}
