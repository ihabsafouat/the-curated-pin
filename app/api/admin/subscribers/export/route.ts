import { getNewsletterSubscribersDetailed } from "../../../../../db/audience";
import { getCurrentUser, roleAtLeast } from "../../../../security/auth";

function csvCell(value: string | number | null | undefined) { return `"${String(value ?? "").replaceAll('"','""')}"`; }

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !roleAtLeast(user, "editor")) return new Response("Unauthorized", { status: 401 });
  const rows = await getNewsletterSubscribersDetailed();
  const header = ["email","first_name","status","first_source","last_source","primary_interest","interests","lead_magnet","utm_source","utm_medium","utm_campaign","consent_at","subscribed_at"];
  const csv = [header.join(","), ...rows.map((row) => [row.email,row.first_name,row.status,row.source,row.last_source,row.primary_interest,row.interests,row.lead_magnet_slug,row.utm_source,row.utm_medium,row.utm_campaign,row.consent_at,row.created_at].map(csvCell).join(","))].join("\n");
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=the-curated-pin-audience.csv", "cache-control": "private, no-store" } });
}
