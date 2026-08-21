import { clearAuthSession } from "../../../security/auth";
import { requestHasSafeOrigin } from "../../../security/request";

export async function POST(request: Request) {
  if (!requestHasSafeOrigin(request)) return Response.json({ ok: false }, { status: 403 });
  await clearAuthSession(request);
  return Response.json({ ok: true });
}
