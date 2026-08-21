import { recordAnalyticsEvent } from "../../../db/analytics";
import { checkRateLimit, rateLimitResponse } from "../../security/rate-limit";
import { readJson, requestHasSafeOrigin } from "../../security/request";
import { trackingSchema } from "../../security/validation";

const serverOnlyEvents = new Set(["newsletter_signup","email_click"]);

export async function POST(request: Request) {
  if (!requestHasSafeOrigin(request)) return Response.json({ ok:false },{status:403});
  const rate = await checkRateLimit(request,"analytics",180,60).catch((error) => {
    console.error("Unable to rate-limit a non-critical analytics event.", error);
    return null;
  });
  if (!rate) return Response.json({ ok: false }, { status: 202 });
  if (!rate.allowed) return rateLimitResponse(rate);
  const parsed = trackingSchema.safeParse(await readJson(request,16_000));
  if (!parsed.success || serverOnlyEvents.has(parsed.data.eventType)) return Response.json({ok:false},{status:400});
  try {
    const ok = await recordAnalyticsEvent(parsed.data);
    return Response.json({ok},{status:ok?200:400});
  } catch (error) {
    console.error("Unable to persist a non-critical analytics event.", error);
    return Response.json({ ok: false }, { status: 202 });
  }
}
