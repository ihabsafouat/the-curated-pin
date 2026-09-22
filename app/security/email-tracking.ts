import { fromBase64Url, hmacSha256, toBase64Url, verifyHmacSha256 } from "./crypto";
import { getRuntimeValue } from "../runtime-env";

const decoder = new TextDecoder();
type Payload = { subscriberId:number; target:string; messageKey:string; issuedAt:number };

function secret(){
  const value=getRuntimeValue("EMAIL_PREFERENCE_SECRET");
  if(!value||value.length<32) {
    if (getRuntimeValue("NODE_ENV") === "production") throw new Error("EMAIL_PREFERENCE_SECRET must be configured.");
    return "development-email-preference-secret-at-least-32-chars-long";
  }
  return value;
}
function safeTarget(target:string){return target.startsWith("/")&&!target.startsWith("//")&&target.length<=1200;}

export async function createEmailTrackingToken(subscriberId:number,target:string,messageKey:string){
  if(!safeTarget(target))return "";
  const encoded=toBase64Url(JSON.stringify({subscriberId,target,messageKey:messageKey.slice(0,160),issuedAt:Date.now()} satisfies Payload));
  const signature=toBase64Url(await hmacSha256(`email-click.${encoded}`,secret()));
  return `${encoded}.${signature}`;
}
export async function readEmailTrackingToken(token:string):Promise<Payload|null>{
  const [encoded,signatureText,...rest]=token.split(".");if(!encoded||!signatureText||rest.length)return null;
  try{const signature=fromBase64Url(signatureText);if(!await verifyHmacSha256(`email-click.${encoded}`,signature,secret()))return null;
    const payload=JSON.parse(decoder.decode(fromBase64Url(encoded))) as Partial<Payload>;
    if(!Number.isInteger(payload.subscriberId)||typeof payload.target!=="string"||!safeTarget(payload.target)||typeof payload.messageKey!=="string"||typeof payload.issuedAt!=="number")return null;
    return {subscriberId:Number(payload.subscriberId),target:payload.target,messageKey:payload.messageKey.slice(0,160),issuedAt:payload.issuedAt};
  }catch{return null;}
}
