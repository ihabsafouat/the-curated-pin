import { createHash, timingSafeEqual } from "node:crypto";
import { recordCommerceConversion } from "../../../../db/analytics";
import { getRuntimeValue } from "../../../runtime-env";
import { readJson } from "../../../security/request";
import { commerceConversionSchema } from "../../../security/validation";

function authorized(request:Request){
  const secret=getRuntimeValue("CONVERSION_WEBHOOK_SECRET");
  if(!secret||secret.length<32)return false;
  const provided=request.headers.get("x-conversion-secret")||"";
  const a=createHash("sha256").update(secret).digest();
  const b=createHash("sha256").update(provided).digest();
  return timingSafeEqual(a,b);
}

export async function POST(request:Request){
  if(!authorized(request))return Response.json({ok:false},{status:401});
  const parsed=commerceConversionSchema.safeParse(await readJson(request,16_000));
  if(!parsed.success)return Response.json({ok:false},{status:400});
  const inserted=await recordCommerceConversion(parsed.data);
  return Response.json({ok:true,inserted});
}
