import { subscribeAudience } from "../../../db/audience";
import { recordAnalyticsEvent } from "../../../db/analytics";
import { verifyTurnstile } from "../../security/bot";
import { deliverLeadMagnet } from "../../security/audience-delivery";
import { checkRateLimit, rateLimitResponse } from "../../security/rate-limit";
import { readJson, requestHasSafeOrigin } from "../../security/request";
import { newsletterSchema } from "../../security/validation";

export async function POST(request: Request) {
  if (!requestHasSafeOrigin(request)) return Response.json({ ok:false },{status:403});
  const rate=await checkRateLimit(request,"newsletter",5,60*60);
  if(!rate.allowed)return rateLimitResponse(rate);
  const parsed=newsletterSchema.safeParse(await readJson(request,12_000));
  if(!parsed.success)return Response.json({ok:false},{status:400});
  if(!await verifyTurnstile(parsed.data.turnstileToken,request))return Response.json({ok:false},{status:400});

  try {
    const result=await subscribeAudience(parsed.data);
    await recordAnalyticsEvent({
      eventType:"newsletter_signup",sessionId:parsed.data.analyticsSessionId,subscriberId:result.subscriber.id,
      articleSlug:parsed.data.articleSlug,categoryPath:parsed.data.categoryPath,leadMagnetSlug:result.leadMagnet?.slug,
      source:parsed.data.utmSource || parsed.data.referrerHost || "Direct / other",utmSource:parsed.data.utmSource,referrerHost:parsed.data.referrerHost,medium:parsed.data.utmMedium,campaign:parsed.data.utmCampaign,content:parsed.data.utmContent,term:parsed.data.utmTerm,
      linkKind:"lead_magnet",placement:parsed.data.source,metadata:{interest:result.subscriber.primaryInterest || "general"},
    }).catch(() => {});
    let accessUrl="";let delivered=false;
    if(result.leadMagnet){
      try {
        const delivery=await deliverLeadMagnet(result.subscriber,result.leadMagnet);
        accessUrl=delivery.accessUrl;
        delivered=delivery.ok;
      } catch {
        accessUrl=result.leadMagnet.assetUrl || `/free/${result.leadMagnet.slug}/print`;
      }
    }
    return Response.json({ok:true,leadMagnet:result.leadMagnet?.slug||null,accessUrl,delivered});
  } catch (error) {
    console.error("Newsletter submission error:", error);
    return Response.json({ok:true,leadMagnet:parsed.data.leadMagnetSlug||null,accessUrl:"",delivered:false});
  }
}
