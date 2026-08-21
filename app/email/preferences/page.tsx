import { redirect } from "next/navigation";
import SubHeader from "../../components/SubHeader";
import SubFooter from "../../components/SubFooter";
import EmailPreferencesForm from "../../components/EmailPreferencesForm";
import { getAudienceInterests, getSubscriberForPreferences } from "../../../db/audience";
import { readPreferenceToken } from "../../security/email-preferences";
import { privateRobots } from "../../seo";

export const metadata = { title: "Email preferences", description: "Manage The Curated Pin email preferences.", robots: privateRobots(true) };
export const dynamic = "force-dynamic";

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  return `${local.slice(0,2)}${"•".repeat(Math.max(2,Math.min(6,local.length-2)))}@${domain}`;
}

export default async function EmailPreferencesPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const payload = await readPreferenceToken(token);
  if (!payload) redirect("/?emailLink=expired");
  const [subscriber, interests] = await Promise.all([getSubscriberForPreferences(payload.id,payload.email),getAudienceInterests(true)]);
  if (!subscriber) redirect("/?emailLink=invalid");
  return <main><SubHeader/><section className="emailPreferences shell"><small>YOUR INBOX, YOUR CHOICE</small><h1>Email preferences</h1><p>Manage what we send to <b>{maskEmail(subscriber.email)}</b>. The Sunday Save remains the umbrella publication; topic tags stop unrelated verticals from being pushed into your inbox.</p><EmailPreferencesForm token={token} interests={interests} selected={subscriber.interests} subscribed={subscriber.status==="subscribed"}/></section><SubFooter/></main>;
}
