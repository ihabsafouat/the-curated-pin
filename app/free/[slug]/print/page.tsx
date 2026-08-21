import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLeadMagnetBySlug } from "../../../../db/audience";
import { privateRobots } from "../../../seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Printable resource", robots: privateRobots(true) };

export default async function PrintableLeadMagnet({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const magnet = await getLeadMagnetBySlug(slug);
  if (!magnet) notFound();
  return <main className="printableResource"><header><small>THE CURATED PIN · FREE PLANNING RESOURCE</small><h1>{magnet.name}</h1><p>{magnet.description}</p><div className="printHint">Print / Save as PDF: use your browser&apos;s print command</div></header><div className="printableSheets">{magnet.resource.map((section,index) => <section key={`${magnet.slug}-print-${index}`}><div className="printSectionNumber">0{index+1}</div><h2>{section.title}</h2>{section.fields?.map((field) => <div className="printField" key={field}><b>{field}</b><span/></div>)}{section.checklist?.map((item) => <div className="printChecklist" key={item}><i/> <span>{item}</span></div>)}</section>)}</div><footer>the-curated-pin.netlify.app · {magnet.name}</footer></main>;
}
