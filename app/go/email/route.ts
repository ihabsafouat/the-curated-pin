import { recordAnalyticsEvent } from "../../../db/analytics";
import { readEmailTrackingToken } from "../../security/email-tracking";

export async function GET(request:Request){
  const token=new URL(request.url).searchParams.get("token")||"";
  const payload=await readEmailTrackingToken(token);
  if(!payload)return Response.redirect(new URL("/",request.url),302);
  await recordAnalyticsEvent({eventType:"email_click",subscriberId:payload.subscriberId,pagePath:payload.target,targetUrl:payload.target,linkKind:"email",placement:payload.messageKey,metadata:{message_key:payload.messageKey}});
  return Response.redirect(new URL(payload.target,request.url),302);
}
