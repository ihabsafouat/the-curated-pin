import Link from "next/link";
import Breadcrumbs from "../components/Breadcrumbs";
import SubHeader from "../components/SubHeader";
import SubFooter from "../components/SubFooter";
import { staticPageMetadata } from "../seo";

export const metadata = staticPageMetadata({ title: 'Contact & Reader Feedback', description: 'Contact The Curated Pin, suggest a correction or share verified reader feedback.', path: '/contact' });

export default function ContactPage() {
  return <main><SubHeader/><Breadcrumbs items={[{label:"Home",href:"/"},{label:"Contact"}]}/><section className="legalHero shell"><small>CONTACT & FEEDBACK</small><h1>A real note gets<br/><em>a real answer.</em></h1><p>Questions, corrections, collaboration ideas and thoughtful reader feedback are welcome.</p></section><section className="contactGrid shell"><article className="responsePromise"><span>OUR RESPONSE PROMISE</span><strong>Within two business days</strong><p>We aim to reply Monday through Friday. If a question needs research, we will acknowledge it first and tell you when to expect the full answer.</p></article><article><span>GENERAL & EDITORIAL</span><h2>Say hello or flag a correction</h2><p>Include the guide URL when reporting an error so we can review it quickly.</p><a href="mailto:the-curated-pin@gmail.com?subject=Editorial%20question">the-curated-pin@gmail.com →</a></article><article><span>READER FEEDBACK</span><h2>Share a real reader note</h2><p>Tell us which guide you used and what changed. We never publish a name, quote or result without explicit permission and verification.</p><a href="mailto:the-curated-pin@gmail.com?subject=Verified%20reader%20feedback">Share feedback →</a></article><article><span>PARTNERSHIPS</span><h2>Products and collaborations</h2><p>Sending a product never guarantees coverage. Commercial relationships are disclosed and do not buy a positive recommendation.</p><Link href="/editorial-policy">Read the editorial policy →</Link></article></section><SubFooter/></main>;
}
