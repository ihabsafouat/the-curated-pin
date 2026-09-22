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
  const isCrochet = magnet?.slug.includes("crochet") || magnet?.slug.includes("bralette");
  return <main><SubHeader/><section className="thankYou shell"><small>{magnet ? "YOUR FREE RESOURCE IS READY ✦" : "YOU'RE ON THE LIST ✦"}</small><h1>{magnet ? <>Open it now.<br/><em>Keep the email for later.</em></> : <>Your inbox just got<br/><em>a little more useful.</em></>}</h1><p>{magnet ? `We sent ${magnet.name} to your inbox. You can also open the PDF immediately below—no need to wait for delivery.` : "Look for The Sunday Save in your inbox. While you wait, explore the library or build your private saved list."}</p><div className="thankYouActions">{magnet ? <><a className="primaryCta downloadButton" href={magnet.assetUrl || `/free/${magnet.slug}/print`} download={magnet.assetUrl ? true : undefined}>Download the PDF</a><Link className="secondaryCta" href={isCrochet ? "/category/crafts/crochet" : "/category/celebrations/birthday-parties"}>{isCrochet ? "Browse crochet projects →" : "Keep planning →"}</Link></> : <><Link className="primaryCta" href="/category/celebrations/birthday-parties">Explore birthday ideas</Link><Link className="secondaryCta" href="/register">Create a free reader account →</Link></>}</div><div className="thankYouGrid">{isCrochet ? <><Link href="/category/crafts/crochet"><span>01</span><b>Crochet patterns</b><p>Explore step-by-step crochet projects.</p></Link><Link href="/shop"><span>02</span><b>Pattern shop</b><p>Browse our complete crochet pattern collection.</p></Link><Link href="/category/crafts"><span>03</span><b>All craft guides</b><p>Tips, stitches, and beginner-friendly tutorials.</p></Link></> : <><Link href="/category/celebrations/birthday-parties/by-age"><span>01</span><b>Ideas by age</b><p>Start with the birthday you are planning.</p></Link><Link href="/category/celebrations/birthday-parties/party-themes"><span>02</span><b>Party themes</b><p>Build a celebration around one clear idea.</p></Link><Link href="/category/celebrations/birthday-parties/party-games"><span>03</span><b>Party games</b><p>Activities that keep the room moving.</p></Link></>}</div></section><SubFooter/></main>;
}
