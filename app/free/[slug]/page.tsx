import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLeadMagnetBySlug } from "../../../db/audience";
import SubHeader from "../../components/SubHeader";
import SubFooter from "../../components/SubFooter";
import { EmailGateSignup } from "../../components/NewsletterSignup";
import { publicRobots } from "../../seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const magnet = await getLeadMagnetBySlug(slug);
  if (!magnet) return { robots: { index: false, follow: false } };
  return {
    title: magnet.name,
    description: magnet.description,
    alternates: { canonical: `/free/${magnet.slug}` },
    robots: publicRobots(magnet.seoIndex),
    openGraph: { title: magnet.name, description: magnet.description, url: `/free/${magnet.slug}`, type: "website" },
  };
}

export default async function FreeResourceLanding({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const magnet = await getLeadMagnetBySlug(slug);
  if (!magnet) notFound();
  return <main><SubHeader/><section className="freebieHero shell"><div className="freebieCopy"><small>{magnet.eyebrow}</small><h1>{magnet.name}</h1><p>{magnet.description}</p><ul><li>Get immediate PDF access</li><li>Receive the link by email</li><li>Print it or annotate it digitally</li></ul></div><div className="freebieSignup"><span>FREE RESOURCE</span><h2>Send it to your inbox.</h2><p>We&apos;ll also tag your subscription to the topic you actually asked for, so Birthday readers don&apos;t automatically get future Crochet emails.</p><EmailGateSignup magnet={magnet} source={`free:${magnet.slug}`}/></div></section><section className="freebiePreview shell"><div><small>WHAT&apos;S INSIDE</small><h2>A planner you can actually use while making decisions.</h2></div><div className="freebieSectionGrid">{magnet.resource.map((section,index) => <article key={`${magnet.slug}-${index}`}><span>0{index+1}</span><h3>{section.title}</h3><p>{[...(section.fields||[]),...(section.checklist||[])].slice(0,4).join(" · ")}</p></article>)}</div></section><SubFooter/></main>;
}
