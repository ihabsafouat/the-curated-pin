import { setUserRole, writeAuditLog } from "../../../../../../db/auth";
import { getCurrentUser } from "../../../../../security/auth";
import { checkRateLimit, clientIpHash, rateLimitResponse } from "../../../../../security/rate-limit";
import { csrfMatches, readForm, requestHasSafeOrigin } from "../../../../../security/request";
import { roleSchema } from "../../../../../security/validation";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!requestHasSafeOrigin(request)) return new Response("Forbidden", { status: 403 });
  const rate = await checkRateLimit(request, "admin:roles", 30, 60 * 60);
  if (!rate.allowed) return rateLimitResponse(rate);
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  if (!id || id === admin.id) return new Response("This role cannot be changed here.", { status: 400 });
  const form = await readForm(request, 10_000);
  if (!form || !await csrfMatches(form.get("_csrf"))) return new Response("Invalid request", { status: 403 });
  const parsed = roleSchema.safeParse({ role: form.get("role") });
  if (!parsed.success) return new Response("Invalid role", { status: 400 });
  const updated = await setUserRole(id, parsed.data.role);
  if (!updated) return new Response("User not found", { status: 404 });
  await writeAuditLog({ actorUserId: admin.id, action: "user.role_update", targetType: "user", targetId: id, metadata: { role: parsed.data.role }, ipHash: await clientIpHash(request) });
  return Response.redirect(new URL("/studio/users", request.url), 303);
}
