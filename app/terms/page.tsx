import Breadcrumbs from "../components/Breadcrumbs";
import SubHeader from "../components/SubHeader";
import SubFooter from "../components/SubFooter";
import { staticPageMetadata } from "../seo";

export const metadata = staticPageMetadata({ title: "Terms of Use", description: "Terms for using The Curated Pin's editorial content, accounts, feedback and affiliate links.", path: "/terms" });

export default function TermsPage() {
  return <main><SubHeader/><Breadcrumbs items={[{label:"Home",href:"/"},{label:"Terms"}]}/><section className="legalHero shell"><small>TERMS OF USE · UPDATED AUGUST 18, 2026</small><h1>Simple terms for<br/><em>a useful publication.</em></h1><p>By using the site, you agree to use its content and account features lawfully and responsibly.</p></section><section className="legalBody shell">
    <section><h2>Editorial information</h2><p>Content is provided for general information, planning and inspiration. Prices, availability, schedules and third-party product details can change, so verify important details before acting or purchasing.</p></section>
    <section><h2>Accounts and acceptable use</h2><p>You are responsible for accurate registration information and reasonable protection of your account access. We may rate-limit, temporarily lock or suspend accounts and requests used to attack, scrape, automate abuse, bypass access controls, disrupt the service or interfere with other readers.</p></section>
    <section><h2>Reader feedback</h2><p>You retain responsibility for feedback you submit. Do not submit unlawful, abusive, private or infringing material. Giving publication consent allows us to display, edit for formatting or decline the note after moderation; it does not guarantee publication.</p></section>
    <section><h2>Affiliate links and third parties</h2><p>Some external links may be affiliate links, meaning we may earn a commission if you make a qualifying purchase without increasing your price. Recommendations remain editorial decisions. Third-party sites control their own products, availability, prices, returns, terms and privacy practices.</p></section>
    <section><h2>Intellectual property</h2><p>Unless otherwise stated, original articles, graphics, downloadable products, branding and site design may not be republished, redistributed or sold without permission. Short quotations with clear attribution and a link are welcome where permitted by law.</p></section>
    <section><h2>Changes and contact</h2><p>These terms may be updated when the service changes. Material updates will use a new date. Questions can be sent to hello@thecuratedpin.com.</p></section>
  </section><SubFooter/></main>;
}
