import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "../../components/Breadcrumbs";
import StructuredData from "../../components/StructuredData";
import SubFooter from "../../components/SubFooter";
import SubHeader from "../../components/SubHeader";
import { absoluteUrl, SITE_NAME } from "../../site";
import { EDITORIAL_AUTHOR_NAME, EDITORIAL_AUTHOR_PATH, staticPageMetadata } from "../../seo";

export const metadata: Metadata = staticPageMetadata({
  title: "Editorial Team",
  description: "Meet The Curated Pin editorial team and learn how its celebration and creative-lifestyle guides are researched, reviewed and updated.",
  path: EDITORIAL_AUTHOR_PATH,
});

export default function EditorialTeamPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@id": absoluteUrl(`${EDITORIAL_AUTHOR_PATH}#editorial-team`),
      "@type": "Organization",
      name: EDITORIAL_AUTHOR_NAME,
      url: absoluteUrl(EDITORIAL_AUTHOR_PATH),
      description: "The editorial team responsible for researching, editing and updating The Curated Pin's practical guides.",
      parentOrganization: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
    },
  };
  return <main><SubHeader/><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Editorial Team" }]}/><StructuredData data={schema}/><section className="legalHero shell"><small>WHO WRITES THE GUIDES</small><h1>The Curated Pin<br/><em>Editorial Team.</em></h1><p>Our guides are built from audience research, clear search intent, practical planning needs and editorial review. We separate editorial links, affiliate recommendations and our own products so readers can tell why a link is present.</p></section><section className="legalBody shell"><section><h2>What the team is responsible for</h2><p>The editorial team researches topics, defines the scope of each guide, checks semantic overlap with existing pages, reviews product recommendations, maintains disclosures and revisits time-sensitive content when it needs an update.</p></section><section><h2>How authorship works</h2><p>Until individual contributors have complete public biographies and stable author profiles, publication-level guides use the Editorial Team byline rather than inventing personal expertise. Individual authors can receive their own profile pages later.</p></section><section><h2>Editorial standards</h2><p>Recommendations are not sold, affiliate availability does not determine inclusion, and material corrections are made when identified.</p><Link href="/editorial-policy">Read the full editorial and affiliate policy →</Link></section><section><h2>Contact</h2><p>Questions, corrections and sourcing notes can be sent through the contact page.</p><Link href="/contact">Contact the editorial team →</Link></section></section><SubFooter/></main>;
}
