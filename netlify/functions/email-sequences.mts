import { dispatchDueAudienceEmails } from "../../app/security/audience-delivery";

export default async () => {
  const result = await dispatchDueAudienceEmails(12);
  console.log("The Curated Pin audience sequence dispatch", result);
  return new Response(JSON.stringify(result), { status: 200, headers: { "content-type": "application/json" } });
};
