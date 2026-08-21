import Link from "next/link";
import SubFooter from "./components/SubFooter";
import SubHeader from "./components/SubHeader";

export default function NotFound() {
  return <main><SubHeader/><section className="notFound shell"><span>404</span><small>THIS PIN LED SOMEWHERE ELSE</small><h1>The page slipped<br/><em>off the board.</em></h1><p>The link may be old, or the guide may have moved. Try a fresh search or return to the latest edit.</p><div><Link className="primaryCta" href="/">Back to the homepage</Link><Link className="secondaryCta" href="/search">Search all guides →</Link></div><aside><Link href="/category/celebrations">Celebrations</Link><Link href="/category/celebrations/birthday-parties">Birthday Parties</Link><Link href="/category/celebrations/birthday-parties/party-games">Party Games</Link></aside></section><SubFooter/></main>;
}
