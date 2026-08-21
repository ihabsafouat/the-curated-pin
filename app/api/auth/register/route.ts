import { createUser, findUserByEmail, writeAuditLog } from "../../../../db/auth";
import { authIsConfigured } from "../../../security/auth";
import { verifyTurnstile } from "../../../security/bot";
import { hashPassword } from "../../../security/password";
import { checkRateLimit, clientIpHash, rateLimitResponse } from "../../../security/rate-limit";
import { readJson, requestHasSafeOrigin } from "../../../security/request";
import { registerSchema } from "../../../security/validation";

const GENERIC_SUCCESS = { ok: true, message: "Registration received. Continue to sign in; if the address was already registered, use password reset instead." };

export async function POST(request: Request) {
  if (!requestHasSafeOrigin(request)) return Response.json({ ok: false }, { status: 403 });
  if (!authIsConfigured()) return Response.json({ ok: false, error: "Account access is not configured." }, { status: 503 });
  const rate = await checkRateLimit(request, "auth:register", 3, 60 * 60);
  if (!rate.allowed) return rateLimitResponse(rate);
  const parsed = registerSchema.safeParse(await readJson(request, 12_000));
  if (!parsed.success) return Response.json({ ok: false, error: "Please check every field and use a stronger password." }, { status: 400 });
  if (!await verifyTurnstile(parsed.data.turnstileToken, request)) return Response.json({ ok: false, error: "We could not verify this request. Please try again." }, { status: 400 });
  const { name, email, password } = parsed.data;
  // Always perform the expensive password hash before checking account existence so
  // duplicate and new-account requests have a more similar observable cost.
  const passwordHash = await hashPassword(password);
  const existing = await findUserByEmail(email);
  if (existing) {
    await writeAuditLog({ actorUserId: existing.id, action: "auth.register_existing", targetType: "user", targetId: existing.id, ipHash: await clientIpHash(request) }).catch(() => {});
    return Response.json(GENERIC_SUCCESS, { status: 202 });
  }
  try {
    const user = await createUser({ id: crypto.randomUUID(), name, email, passwordHash, role: "reader" });
    await writeAuditLog({ actorUserId: user.id, action: "auth.register", targetType: "user", targetId: user.id, ipHash: await clientIpHash(request) });
    return Response.json(GENERIC_SUCCESS, { status: 202 });
  } catch {
    // A race can turn a new registration into a duplicate between lookup and INSERT.
    // Return the same external response rather than exposing account existence.
    return Response.json(GENERIC_SUCCESS, { status: 202 });
  }
}
