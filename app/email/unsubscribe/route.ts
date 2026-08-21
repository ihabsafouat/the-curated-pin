import { updateSubscriberPreferences } from "../../../db/audience";
import { readPreferenceToken } from "../../security/email-preferences";

async function unsubscribeFromToken(token: string) {
  const payload = await readPreferenceToken(token);
  if (!payload) return false;
  return updateSubscriberPreferences(payload.id,payload.email,[],true);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  return Response.redirect(new URL(`/email/preferences?token=${encodeURIComponent(token)}`,url.origin),302);
}

export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  await unsubscribeFromToken(token);
  return new Response(null,{ status:200,headers:{"cache-control":"no-store"} });
}
