import Link from "next/link";
import SubFooter from "../components/SubFooter";
import SubHeader from "../components/SubHeader";
import { privateRobots } from "../seo";
import { getLeadMagnetBySlug } from "../../db/audience";

export const metadata = { title: "You're on the list", description: "Thanks for joining The Curated Pin.", alternates: { canonical: "/thank-you" }, robots: privateRobots(true) };
export const dynamic = "force-dynamic";

export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ leadMagnet?: string }> }) {
  const { leadMagnet = "" } = await searchParams;
  const magnet = leadMagnet ? await getLeadMagnetBySlug(leadMagnet) : null;
  return <main><SubHeader/><section className="thankYou shell"><small>{magnet ? "YOUR FREE RESOURCE IS READY ✦" : "YOU'RE ON THE LIST ✦"}</small><h1>{magnet ? <>Open it now.<br/><em>Keep the email for later.</em></> : <>Your inbox just got<br/><em>a little more useful.</em></>}</h1><p>{magnet ? `We sent ${magnet.name} to your inbox. You can also open the PDF immediately below—no need to wait for delivery.` : "Look for The Sunday Save in your inbox. While you wait, explore the birthday-party library or build your private saved list."}</p><div className="thankYouActions">{magnet ? <><Link className="primaryCta" href={magnet.assetUrl || `/free/${magnet.slug}/print`} target={magnet.assetUrl ? "_blank" : undefined}>Open the PDF now</Link><Link className="secondaryCta" href="/category/celebrations/birthday-parties">Keep planning →</Link></> : <><Link className="primaryCta" href="/category/celebrations/birthday-parties">Explore birthday ideas</Link><Link className="secondaryCta" href="/register">Create a free reader account →</Link></>}</div><div className="thankYouGrid"><Link href="/category/celebrations/birthday-parties/by-age"><span>01</span><b>Ideas by age</b><p>Start with the birthday you are planning.</p></Link><Link href="/category/celebrations/birthday-parties/party-themes"><span>02</span><b>Party themes</b><p>Build a celebration around one clear idea.</p></Link><Link href="/category/celebrations/birthday-parties/party-games"><span>03</span><b>Party games</b><p>Activities that keep the room moving.</p></Link></div></section><SubFooter/></main>;
}
