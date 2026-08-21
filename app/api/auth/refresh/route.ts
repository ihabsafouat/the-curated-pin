import { refreshAuthSession } from "../../../security/auth";
import { checkRateLimit, rateLimitResponse } from "../../../security/rate-limit";
import { requestHasSafeOrigin } from "../../../security/request";

export async function POST(request: Request) {
  if (!requestHasSafeOrigin(request)) return Response.json({ ok: false }, { status: 403 });
  const rate = await checkRateLimit(request, "auth:refresh", 30, 60 * 60);
  if (!rate.allowed) return rateLimitResponse(rate);
  const user = await refreshAuthSession(request);
  return Response.json({ ok: Boolean(user), user }, { status: user ? 200 : 401 });
}
