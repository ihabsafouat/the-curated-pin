import { getPublishedArticles } from "../db/data";
import { getPublicNavigationCategories } from "../db/categories";
import { InlineNewsletter } from "./components/NewsletterSignup";
import Link from "next/link";
import AccountLink from "./components/AccountLink";
import StructuredData from "./components/StructuredData";
import HeaderSearch from "./components/HeaderSearch";
import MediaImage from "./components/MediaImage";
import { absoluteUrl, faqs, SITE_NAME } from "./site";
import { staticPageMetadata } from "./seo";

export const dynamic = "force-dynamic";

export const metadata = staticPageMetadata({
  title: "Ideas Worth Saving",
  description: "Practical birthday ideas, party-planning guides and crochet projects—organized into focused, useful collections.",
  path: "/",
});

function Arrow() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 7l5 5-5 5" /></svg>; }
function Brand() {
  return <Link className="brand" href="/" aria-label="The Curated Pin home"><span className="brandmark"><i/><i/><i/></span><span>The Curated Pin</span></Link>;
}

export default async function Home() {
  const [allArticles, categories] = await Promise.all([
    getPublishedArticles().catch((error) => {
      console.error("Unable to load published articles; showing the launch state.", error);
      return [];
    }),
    getPublicNavigationCategories(),
  ]);
  const homepageSchema = [{
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: { "@type": "ImageObject", url: absoluteUrl("/logo.png") },
    description: "An independent editorial publication for practical celebration and creative-project guides.",
    publishingPrinciples: absoluteUrl("/editorial-policy"),
  }, {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: SITE_NAME,
    url: absoluteUrl("/"),
    publisher: { "@id": absoluteUrl("/#organization") },
    potentialAction: { "@type": "SearchAction", target: absoluteUrl("/search?q={search_term_string}"), "query-input": "required name=search_term_string" },
  }];
  const feature = allArticles[0] ?? null;
  const sideStories = allArticles.slice(1, 3);
  const latest = allArticles.slice(0, 3);

  return <main>
    <StructuredData data={homepageSchema}/>
    <div className="announcement"><b>THE WEEKEND EDIT</b><span>Useful ideas for celebrations, creative projects and things worth making.</span><a href="#newsletter">Join the list →</a></div>

    <header className="header">
      <div className="headerTop shell">
        <Brand />
        <HeaderSearch/>
        <div className="headerActions"><AccountLink/><a className="darkButton" href="#newsletter">Get the weekly edit</a></div>
        <details className="mobileMenu"><summary aria-label="Open menu">☰</summary><nav>{categories.map((category) => <Link key={category.id} href={`/category/${category.path}`}>{category.name}</Link>)}<Link href="/saved">♡ Saved</Link><AccountLink compact/></nav></details>
      </div>
      <nav className="nav shell" aria-label="Main categories">{categories.map((category) => <Link key={category.id} href={`/category/${category.path}`}>{category.name}</Link>)}<a href="#latest">Latest</a><Link href="/saved">♡ Saved</Link><span className="mobileAccount"><AccountLink compact/></span></nav>
    </header>

    <section className="hero shell">
      <p className="eyebrow"><i/> THE CURATED EDIT</p>
      <div className="heroTitle"><h1>Ideas worth saving.<br/><em>Plans worth using.</em></h1><div className="heroPromise"><div className="heroCtas"><Link className="primaryCta" href="/category/celebrations/birthday-parties">Explore birthday ideas</Link><Link className="secondaryCta" href="/category/crafts/crochet">Browse crochet projects →</Link></div></div></div>

      {feature ? <div className="featured">
        <Link className="lead" href={`/article/${feature.slug}`}>
          <div className="photo"><MediaImage src={feature.image} alt={feature.imageAlt || `Featured image for ${feature.title}`} variant="hero" fetchPriority="high" decoding="async" loading="eager" sizes="(max-width: 900px) 100vw, 800px"/><span>Editor&apos;s pick</span></div>
          <div className="leadCopy"><small>{feature.category}</small><h2>{feature.title}</h2><p>{feature.dek}</p><b>Read the guide <Arrow/></b></div>
        </Link>
        <div className="sideList">{sideStories.map((story) => <Link className="side" href={`/article/${story.slug}`} key={story.title}><MediaImage src={story.image} alt={story.imageAlt || `Preview for ${story.title}`} variant="card" loading="lazy" decoding="async" sizes="(max-width: 720px) 45vw, 360px"/><div><small>{story.category}</small><h3>{story.title}</h3><p>Practical ideas, carefully edited for real planning.</p><b>↗</b></div></Link>)}</div>
      </div> : <div className="launchFeature"><small>FIRST COLLECTION</small><h2>Birthday Parties</h2><p>The new taxonomy is live. We&apos;re building the first focused library around birthdays by age, teen parties, themes, games, food, decorations and printables.</p><div><Link className="primaryCta" href="/category/celebrations/birthday-parties">Explore the structure</Link><Link className="secondaryCta" href="/category/celebrations/birthday-parties/teen-birthdays">Teen birthdays →</Link></div></div>}
    </section>

    <div className="trust"><div className="shell"><span><b>01</b> Focused topical collections</span><span><b>02</b> Clear affiliate disclosure</span><span><b>03</b> Reader-first recommendations</span></div></div>

    <section className="section shell" id="latest">
      <div className="sectionHead"><div><small>FRESHLY CURATED</small><h2>{latest.length ? "New this week" : "The editorial queue is open"}</h2></div><div style={{ display: "flex", gap: "18px", alignItems: "center", flexWrap: "wrap" }}><Link href="/articles">View all guides →</Link><Link href="/category/crafts/crochet">Browse crochet projects <Arrow/></Link></div></div>
      {latest.length ? <div className="storyGrid">{latest.map((story, i) => <article key={story.title}><Link className="storyImage" href={`/article/${story.slug}`}><MediaImage src={story.image} alt={story.imageAlt || `Preview for ${story.title}`} variant="card" loading="lazy" decoding="async" sizes="(max-width: 720px) 45vw, 360px"/><b>0{i + 1}</b></Link><small>{story.category}</small><h3><Link href={`/article/${story.slug}`}>{story.title}</Link></h3><div className="meta"><span>{story.readTime}</span><Link href="/saved">Saved library →</Link></div></article>)}</div> : <div className="emptyEditorial"><p>The old demo categories are archived rather than deleted. New articles will appear here as the Birthday Parties silo is published.</p><Link href="/category/celebrations/birthday-parties">Explore the Birthday Party structure →</Link></div>}
    </section>

    <section className="departments" id="departments"><div className="shell">
      <div className="sectionHead light"><div><small>EXPLORE YOUR WAY</small><h2>Focused collections</h2></div><p>One publication, organized into clear topical silos instead of unrelated departments.</p></div>
      <div className="categoryGrid">{categories.map((category, i) => <Link className="category" href={`/category/${category.path}`} key={category.id} style={{ "--tint": category.color } as React.CSSProperties}><span>0{i + 1}</span><i>{category.mark}</i><h3>{category.name}</h3><p>{category.intro}</p><b>Browse <Arrow/></b></Link>)}</div>
    </div></section>

    <section className="shop shell">
      <div className="shopIntro"><small>THE CURATED SHOP</small><h2>Useful tools &amp;<br/><em>crochet patterns.</em></h2><p>Original printable planners and amigurumi crochet patterns—designed to turn inspiration into finished projects.</p><div style={{ display: "flex", gap: "14px", alignItems: "center", marginTop: "18px", flexWrap: "wrap" }}><Link className="primaryCta" href="/shop">Browse the shop →</Link><a href="#newsletter" className="secondaryCta">Get new drops first</a></div><blockquote>Digital PDF downloads with instant access. Some links may earn us a commission at no extra cost to you.</blockquote></div>
      <div className="products">
        <Link className="product" href="/shop/pips-the-pumpkin"><div className="productArt" style={{ position: "relative" }}><MediaImage src="/article-media/crochet/pumpkin_kitchen.png" alt="Pips the Pumpkin Crochet Pattern" variant="card" loading="lazy" decoding="async"/><span>PATTERN</span></div><small>$5.99 · PDF PATTERN</small><h3>Pips the Pumpkin</h3><p>Adorable autumn amigurumi plush with sweet face, rosy cheeks, and detailed stalk.</p><b>Get the pattern <Arrow/></b></Link>
        <Link className="product" href="/shop/bernard-amigurumi-dino"><div className="productArt" style={{ position: "relative" }}><MediaImage src="/article-media/crochet/dino-1.png" alt="Bernard the Dinosaur Crochet Pattern" variant="card" loading="lazy" decoding="async"/><span>PATTERN</span></div><small>$5.99 · PDF PATTERN</small><h3>Bernard the Dinosaur</h3><p>Freestanding amigurumi dino with textured dorsal spikes and balanced posture.</p><b>Get the pattern <Arrow/></b></Link>
        <Link className="product" href="/shop/halloween-crochet-bundle"><div className="productArt" style={{ position: "relative" }}><MediaImage src="/article-media/crochet/halloween_ghost_pumpkin_bat.png" alt="Halloween Crochet Pattern Bundle" variant="card" loading="lazy" decoding="async"/><span>4-IN-1 BUNDLE</span></div><small>$19 · 4 PATTERNS</small><h3>Halloween Pattern Bundle</h3><p>The complete 4-piece crew: Bernard the Dino, Boo the Ghost, Oscar the Bat, and Pips.</p><b>Get the bundle <Arrow/></b></Link>
        <Link className="product" href="/shop/ultimate-birthday-party-planner"><div className="productArt guide"><span>PLAN</span><i>◇</i></div><small>$12 · ORIGINAL</small><h3>Ultimate Birthday Party Planner</h3><p>A complete printable workbook for budget, guests, food, games, setup and the party-day timeline.</p><b>View the planner <Arrow/></b></Link>
      </div>
    </section>

    <section className="fieldNotes"><div className="shell fieldNotesGrid"><div><small>HONESTLY DOCUMENTED</small><h2>From search signal<br/>to useful collection.</h2><p>Our Field Notes document why a topic earns a place in the publication, what we are testing and what the analytics say after launch.</p><Link href="/case-studies" className="primaryCta">Read the Field Notes</Link></div><Link href="/case-studies" className="fieldNoteCard"><span>IN PROGRESS · CELEBRATIONS</span><h3>How Pinterest demand and attainable search competition shaped the Birthday Party launch</h3><p>Research first, then taxonomy, content clusters and products—without inventing performance before the traffic arrives.</p><b>View the case studies →</b></Link></div></section>

    <section className="faqSection shell"><div className="faqIntro"><small>GOOD TO KNOW</small><h2>Questions, answered plainly.</h2><p>How the publication works, how recommendations are chosen and what happens when you save or subscribe.</p><Link href="/editorial-policy">Read our editorial policy →</Link></div><div className="faqList">{faqs.map((faq, index) => <details key={faq.question} open={index === 0}><summary><span>0{index + 1}</span>{faq.question}<b>+</b></summary><p>{faq.answer}</p></details>)}</div></section>

    <section className="newsletter" id="newsletter"><div className="shell"><div><small>A BETTER KIND OF INBOX</small><h2>The Sunday Save</h2><p>A small edit of useful ideas and one focused guide, sent once a week.</p></div><InlineNewsletter/></div></section>

    <footer><div className="footerGrid shell"><div><Brand/><p>Useful ideas, organized with intent.</p></div><div><h4>Explore</h4>{categories.map((category) => <Link key={category.id} href={`/category/${category.path}`}>{category.name}</Link>)}<Link href="/case-studies">Field Notes</Link></div><div><h4>Library</h4><Link href="/category/celebrations/birthday-parties/teen-birthdays">Teen Birthdays</Link><Link href="/category/celebrations/birthday-parties/party-games">Party Games</Link><Link href="/category/celebrations/birthday-parties/party-themes">Party Themes</Link><Link href="/saved">Saved guides</Link></div><div><h4>About</h4><Link href="/editorial-policy">Editorial & affiliate policy</Link><Link href="/contact">Contact & feedback</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/studio/login">Publisher login</Link></div></div><div className="footerBottom shell" id="disclosure"><span>© 2026 The Curated Pin</span><span>Independent editorial • Some links may be affiliate links.</span><span><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></span></div></footer>
  </main>;
}
