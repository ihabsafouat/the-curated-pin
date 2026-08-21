import { dispatchDueAudienceEmails } from "../../../security/audience-delivery";
import { getRuntimeValue } from "../../../runtime-env";

export async function POST(request: Request) {
  const secret = getRuntimeValue("EMAIL_CRON_SECRET");
  const auth = request.headers.get("authorization") || "";
  if (!secret || auth !== `Bearer ${secret}`) return Response.json({ ok:false },{ status:401 });
  const result = await dispatchDueAudienceEmails(12);
  return Response.json({ ok:true,...result },{ headers:{"cache-control":"no-store"} });
}
