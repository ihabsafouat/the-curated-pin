import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getArticleBySlug, getPublishedArticles } from "../../../db/data";
import { getCategoryAncestors, getCategoryByPath } from "../../../db/categories";
import { getStrategicLinksForArticle } from "../../../db/seo";
import { getLeadMagnetForContext } from "../../../db/audience";
import SubFooter from "../../components/SubFooter";
import SubHeader from "../../components/SubHeader";
import SaveActions from "../../components/SaveActions";
import { getCurrentUser } from "../../security/auth";
import Breadcrumbs from "../../components/Breadcrumbs";
import StructuredData from "../../components/StructuredData";
import ReaderFeedback from "../../components/ReaderFeedback";
import ArticleBlocks, { articleHasAffiliateBlocks, getArticleHeadings } from "../../components/ArticleBlocks";
import ArticleGuideNav from "../../components/ArticleGuideNav";
import MediaImage from "../../components/MediaImage";
import ArticleUtilityBar from "../../components/ArticleUtilityBar";
import { ContextualLeadMagnet } from "../../components/NewsletterSignup";
import { absoluteUrl, SITE_NAME } from "../../site";
import { cleanDescription, EDITORIAL_AUTHOR_NAME, EDITORIAL_AUTHOR_PATH, publicRobots, sameSiteCanonical, socialImage } from "../../seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { robots: { index: false, follow: false } };
  const title = article.seoTitle || article.title;
  const description = cleanDescription(article.seoDescription, article.dek);
  const selfPath = `/article/${article.slug}`;
  const canonical = sameSiteCanonical(article.canonicalPath, selfPath);
  const image = socialImage(article.socialImage || article.image);
  return {
    title,
    description,
    alternates: { canonical },
    robots: publicRobots(article.seoIndex),
    authors: [{ name: EDITORIAL_AUTHOR_NAME, url: absoluteUrl(EDITORIAL_AUTHOR_PATH) }],
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: [{ url: image, alt: article.imageAlt || article.title }],
      type: "article",
      publishedTime: article.publishedAt || undefined,
      modifiedTime: article.updatedAt,
      authors: [EDITORIAL_AUTHOR_NAME],
      section: article.category,
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}


function leadInsertIndex(blocks: Array<{ type: string; level?: number }>) {
  let h2 = 0;
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    if (block.type === "heading" && block.level === 2) {
      h2 += 1;
      if (h2 === 2) return Math.min(blocks.length, index + 2);
    }
  }
  return Math.min(blocks.length, Math.max(2, Math.floor(blocks.length * 0.35)));
}

function displayDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently updated";
  return `Updated ${new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date)}`;
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();
  const category = await getCategoryByPath(article.categoryPath);
  if (!category) notFound();

  const [allArticles, user, ancestors, strategicLinks, leadMagnet] = await Promise.all([
    getPublishedArticles(),
    getCurrentUser().catch(() => null),
    getCategoryAncestors(category),
    getStrategicLinksForArticle(slug, 5).catch(() => []),
    getLeadMagnetForContext({ articleSlug: slug, categoryPath: article.categoryPath }),
  ]);

  const fallbackRelated = allArticles.filter((item) => item.categoryPath === article.categoryPath && item.slug !== article.slug).slice(0, 3);
  const strategicArticleLinks = strategicLinks.filter((link) => link.targetUrl?.startsWith("/article/"));
  const headings = getArticleHeadings(article.blocks);
  const hasAffiliateContent = articleHasAffiliateBlocks(article.blocks) || Boolean(article.affiliateUrl);
  const leadInsertAt = leadInsertIndex(article.blocks);
  const blocksBeforeLead = article.blocks.slice(0, leadInsertAt);
  const blocksAfterLead = article.blocks.slice(leadInsertAt);
  const ideasBeforeLead = blocksBeforeLead.filter((block) => block.type === "idea").length;
  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...ancestors.map((ancestor) => ({ label: ancestor.name, href: `/category/${ancestor.path}` })),
    { label: article.category, href: `/category/${article.categoryPath}` },
    { label: article.title },
  ];
  const canonicalPath = sameSiteCanonical(article.canonicalPath, `/article/${article.slug}`);
  const canonicalUrl = absoluteUrl(canonicalPath);
  const shareImage = socialImage(article.socialImage || article.image);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${absoluteUrl(canonicalPath)}#article`,
    headline: article.title,
    description: cleanDescription(article.seoDescription, article.dek),
    image: [socialImage(article.socialImage || article.image), article.image].filter(Boolean),
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt,
    author: { "@type": "Organization", "@id": absoluteUrl(`${EDITORIAL_AUTHOR_PATH}#editorial-team`), name: EDITORIAL_AUTHOR_NAME, url: absoluteUrl(EDITORIAL_AUTHOR_PATH) },
    publisher: { "@type": "Organization", "@id": absoluteUrl("/#organization"), name: SITE_NAME, url: absoluteUrl("/"), logo: { "@type": "ImageObject", url: absoluteUrl("/logo.png") } },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(canonicalPath) },
    isPartOf: { "@id": absoluteUrl("/#website") },
    articleSection: article.category,
    inLanguage: "en",
    isAccessibleForFree: true,
    publishingPrinciples: absoluteUrl("/editorial-policy"),
  };

  return <main>
    <SubHeader/>
    <Breadcrumbs items={breadcrumbs}/>
    <StructuredData data={articleSchema}/>
    <article className="articlePage" data-article-slug={article.slug}>
      <header className="articleTitle shell">
        <a href={`/category/${article.categoryPath}`}>{article.category}</a>
        <h1>{article.title}</h1>
        <p>{article.dek}</p>
        <div><span>By <Link href={EDITORIAL_AUTHOR_PATH}>{EDITORIAL_AUTHOR_NAME}</Link></span><span>{article.readTime}</span><span>{displayDate(article.updatedAt)}</span></div>
      </header>
      <div className="articleHero shell"><MediaImage src={article.image} alt={article.imageAlt || article.title} variant="hero" fetchPriority="high" decoding="async" loading="eager" sizes="(max-width: 900px) 100vw, 1180px"/><span>Save-worthy ideas, carefully edited.</span></div>
      <ArticleUtilityBar slug={article.slug} title={article.title} canonicalUrl={canonicalUrl} imageUrl={shareImage}/>
      <div className="articleLayout shell">
        <aside className="articleTocAside"><ArticleGuideNav headings={headings} categoryPath={article.categoryPath} categoryName={article.category}/></aside>
        <div className="articleBody">
          {hasAffiliateContent && <p className="affiliateNote"><b>Affiliate disclosure:</b> This guide may contain paid links. If you buy through them, we may earn a commission at no extra cost to you. Recommendations and editorial choices remain ours. <a href="/editorial-policy">See our editorial policy.</a></p>}
          <p className="intro">{article.dek}</p>
          <ArticleBlocks blocks={blocksBeforeLead} startIndex={0} ideaStart={0}/>
          {leadMagnet && <ContextualLeadMagnet magnet={leadMagnet} source={`article:${article.slug}`} articleSlug={article.slug} categoryPath={article.categoryPath}/>}
          <ArticleBlocks blocks={blocksAfterLead} startIndex={leadInsertAt} ideaStart={ideasBeforeLead}/>
          {strategicLinks.length > 0 && <aside className="seoPathways"><small>CONTINUE IN THIS TOPIC</small><h3>Useful next steps</h3><div>{strategicLinks.slice(0,4).map((link) => <a href={link.targetUrl!} key={link.id} data-analytics-kind="internal" data-analytics-placement={`seo:${link.linkType}`}><span>{link.anchorText}</span><b>{link.targetTitle}</b><i>→</i></a>)}</div></aside>}
          {!strategicLinks.length && fallbackRelated[0] && <aside className="internalLinkCard"><small>KEEP EXPLORING</small><h3>{fallbackRelated[0].title}</h3><p>{fallbackRelated[0].dek}</p><a href={`/article/${fallbackRelated[0].slug}`} data-analytics-kind="internal" data-analytics-placement="fallback-related">Read the related guide →</a></aside>}
          {article.affiliateUrl && <aside className="affiliateCta" data-analytics-impression="true" data-analytics-kind="affiliate" data-analytics-placement="article-affiliate" data-analytics-label={article.affiliateLabel || "Shopping option"}><small>SHOPPING OPTION · PAID LINK</small><h3>{article.affiliateLabel || "Explore the shopping option"}</h3><p>We may earn a commission if you purchase through this link, at no extra cost to you.</p><a href={article.affiliateUrl} target="_blank" rel="nofollow sponsored noopener" data-analytics-kind="affiliate" data-analytics-placement="article-affiliate">{article.affiliateLabel || "View option"} ↗</a></aside>}
          <ReaderFeedback slug={article.slug}/><div className="saveBox" id="save-guide"><small>THE QUICK SAVE</small><h3>Keep the idea, skip the overwhelm.</h3><p>Add this guide to your favorites or your read-later list so it&apos;s easy to find again.</p><SaveActions slug={article.slug} signedIn={Boolean(user)}/></div>
        </div>
      </div>
    </article>
    {(strategicArticleLinks.length > 0 || fallbackRelated.length > 0) && <section className="related shell"><small>MORE IN THIS TOPIC</small><h2>Keep reading</h2><div>{strategicArticleLinks.length > 0 ? strategicArticleLinks.slice(0,3).map((link) => <a href={link.targetUrl!} key={link.id} data-analytics-kind="internal" data-analytics-placement={`related:${link.linkType}`}><span className="relatedTextOnly"><small>{link.anchorText}</small><b>{link.targetTitle}</b></span></a>) : fallbackRelated.map((item) => <a href={`/article/${item.slug}`} key={item.slug} data-analytics-kind="internal" data-analytics-placement="related-fallback"><MediaImage src={item.image} alt={item.imageAlt || `Preview for ${item.title}`} variant="card" loading="lazy" decoding="async"/><span>{item.title}</span></a>)}</div></section>}
    <SubFooter/>
  </main>;
}
