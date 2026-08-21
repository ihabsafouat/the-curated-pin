import { absoluteUrl } from "../site";
import { createPreferenceToken } from "./email-preferences";
import { createEmailTrackingToken } from "./email-tracking";
import { sendLeadMagnetEmail, sendSequenceEmail } from "./email";
import { completeSequenceDelivery, getDueSequenceEmails, logLeadMagnetDelivery } from "../../db/audience";
import type { AudienceSubscriber, LeadMagnet } from "../../db/types";

async function linksForSubscriber(subscriber: AudienceSubscriber) {
  const token = await createPreferenceToken(subscriber.id, subscriber.email);
  return {
    preferencesUrl: absoluteUrl(`/email/preferences?token=${encodeURIComponent(token)}`),
    unsubscribeUrl: absoluteUrl(`/email/unsubscribe?token=${encodeURIComponent(token)}`),
  };
}

async function trackedInternalUrl(subscriberId:number,target:string,messageKey:string){
  if(!target.startsWith("/")||target.startsWith("//"))return absoluteUrl(target);
  const token=await createEmailTrackingToken(subscriberId,target,messageKey);
  return token?absoluteUrl(`/go/email?token=${encodeURIComponent(token)}`):absoluteUrl(target);
}

export async function deliverLeadMagnet(subscriber: AudienceSubscriber, magnet: LeadMagnet) {
  const links = await linksForSubscriber(subscriber);
  const rawTarget=magnet.assetUrl || `/free/${magnet.slug}/print`;
  const accessUrl=await trackedInternalUrl(subscriber.id,rawTarget,`lead:${magnet.slug}`);
  const result = await sendLeadMagnetEmail({
    email: subscriber.email,firstName:subscriber.firstName,subject:magnet.emailSubject||`Your ${magnet.name}`,
    intro:magnet.emailIntro||magnet.description,accessUrl,preferencesUrl:links.preferencesUrl,unsubscribeUrl:links.unsubscribeUrl,magnetName:magnet.name,
    idempotencyKey:`lead-${magnet.slug}-${subscriber.id}-${new Date().toISOString().slice(0,10)}`,
  });
  await logLeadMagnetDelivery(subscriber.id,result.ok?"sent":result.error==="email_not_configured"?"skipped":"failed",result.id,result.error);
  return {...result,accessUrl:absoluteUrl(rawTarget)};
}

export async function dispatchDueAudienceEmails(limit=40){
  const due=await getDueSequenceEmails(limit);let sent=0;let failed=0;
  for(const item of due){
    const token=await createPreferenceToken(item.subscriberId,item.email);
    const preferencesUrl=absoluteUrl(`/email/preferences?token=${encodeURIComponent(token)}`);
    const unsubscribeUrl=absoluteUrl(`/email/unsubscribe?token=${encodeURIComponent(token)}`);
    const ctaUrl=item.ctaUrl?await trackedInternalUrl(item.subscriberId,item.ctaUrl,`sequence:${item.sequenceId}:step:${item.stepId}`):"";
    const result=await sendSequenceEmail({email:item.email,firstName:item.firstName,subject:item.subject,preheader:item.preheader,bodyText:item.bodyText,ctaLabel:item.ctaLabel,ctaUrl,preferencesUrl,unsubscribeUrl,idempotencyKey:`sequence-${item.sequenceId}-${item.stepId}-${item.subscriberId}`});
    await completeSequenceDelivery(item,result.ok?"sent":"failed",result.id,result.error);if(result.ok)sent+=1;else failed+=1;
  }
  return {due:due.length,sent,failed};
}
