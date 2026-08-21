import { updateSubscriberPreferences } from "../../../../db/audience";
import { readPreferenceToken } from "../../../security/email-preferences";
import { checkRateLimit, rateLimitResponse } from "../../../security/rate-limit";
import { readJson, requestHasSafeOrigin } from "../../../security/request";
import { newsletterPreferencesSchema } from "../../../security/validation";

export async function POST(request: Request) {
  if (!requestHasSafeOrigin(request)) return Response.json({ ok:false },{ status:403 });
  const rate = await checkRateLimit(request,"email-preferences",20,60*60);
  if (!rate.allowed) return rateLimitResponse(rate);
  const parsed = newsletterPreferencesSchema.safeParse(await readJson(request,8_000));
  if (!parsed.success) return Response.json({ok:false},{status:400});
  const payload = await readPreferenceToken(parsed.data.token);
  if (!payload) return Response.json({ok:false},{status:400});
  const ok = await updateSubscriberPreferences(payload.id,payload.email,parsed.data.interestKeys,parsed.data.unsubscribe);
  return Response.json({ ok });
}
