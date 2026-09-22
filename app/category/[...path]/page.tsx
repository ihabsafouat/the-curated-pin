import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { categoryHasPublishedArticles, getCategoryAncestors, getCategoryByPath, getChildCategories } from "../../../db/categories";
import { getPublishedArticlesByCategoryPath } from "../../../db/data";
import { getStrategicLinksForCategory } from "../../../db/seo";
import { getLeadMagnetForContext } from "../../../db/audience";
import SubFooter from "../../components/SubFooter";
import SubHeader from "../../components/SubHeader";
import Breadcrumbs from "../../components/Breadcrumbs";
import StructuredData from "../../components/StructuredData";
import { absoluteUrl, SITE_NAME } from "../../site";
import { cleanDescription, publicRobots, socialImage } from "../../seo";
import { ContextualLeadMagnet } from "../../components/NewsletterSignup";
import MediaImage from "../../components/MediaImage";
import Pagination from "../../components/Pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 6;

function pathFromSegments(path: string[]) {
  return path.map((segment) => decodeURIComponent(segment)).join("/");
}

export async function generateMetadata({ params }: { params: Promise<{ path: string[] }> }): Promise<Metadata> {
  const { path } = await params;
  const categoryPath = pathFromSegments(path);
  const category = await getCategoryByPath(categoryPath);
  if (!category) return { robots: { index: false, follow: false } };
  const hasPublishedContent = await categoryHasPublishedArticles(category.path);
  const title = category.seoTitle || `${category.name} Guides`;
  const description = cleanDescription(category.seoDescription, category.intro || `Explore practical ${category.name.toLowerCase()} guides from ${SITE_NAME}.`);
  const image = socialImage(category.socialImage);
  const index = hasPublishedContent && category.seoIndex;
  return {
    title,
    description,
    alternates: { canonical: `/category/${category.path}` },
    robots: publicRobots(index),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url: `/category/${category.path}`,
      images: [{ url: image, alt: `${category.name} guides from ${SITE_NAME}` }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ path: string[] }>;
  searchParams?: Promise<{ page?: string }>;
}) {
  const { path } = await params;
  const sParams = searchParams ? await searchParams : {};
  const requestedPage = Math.max(1, parseInt(sParams.page || "1", 10) || 1);
  const categoryPath = pathFromSegments(path);
  const category = await getCategoryByPath(categoryPath);
  if (!category) notFound();

  const [items, children, ancestors, strategicLinks, leadMagnet] = await Promise.all([
    getPublishedArticlesByCategoryPath(category.path),
    getChildCategories(category.id),
    getCategoryAncestors(category),
    getStrategicLinksForCategory(category.id, 8).catch(() => []),
    getLeadMagnetForContext({ categoryPath: category.path }),
  ]);
  const visibleChildren = (await Promise.all(children.map(async (child) => ({ child, hasContent: await categoryHasPublishedArticles(child.path) })))).filter((item) => item.hasContent).map((item) => item.child);
  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...ancestors.map((ancestor) => ({ label: ancestor.name, href: `/category/${ancestor.path}` })),
    { label: category.name },
  ];
  const categoryUrl = absoluteUrl(`/category/${category.path}`);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const paginatedItems = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const categorySchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${categoryUrl}#collection`,
    name: category.name,
    description: cleanDescription(category.seoDescription, category.intro || category.name),
    url: categoryUrl,
    isPartOf: { "@id": absoluteUrl("/#website") },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.slice(0, 24).map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/article/${article.slug}`),
        name: article.title,
      })),
    },
  };

  return <main><SubHeader/><Breadcrumbs items={breadcrumbs}/><StructuredData data={categorySchema}/>
    <section className="categoryHero" style={{ "--category-color": category.color } as React.CSSProperties}><div className="shell"><small>THE {category.name.toUpperCase()} EDIT</small><h1>{category.name}</h1><p>{category.intro}</p></div></section>
    {visibleChildren.length > 0 && <section className="categoryChildren shell"><div className="listingHead"><h2>Explore {category.name}</h2><span>{visibleChildren.length} sections</span></div><div className="categoryChildGrid">{visibleChildren.map((child) => <a href={`/category/${child.path}`} key={child.id} style={{ "--category-color": child.color } as React.CSSProperties}><span>{child.mark}</span><div><h3>{child.name}</h3><p>{child.intro}</p><b>Explore →</b></div></a>)}</div></section>}
    {leadMagnet && <section className="shell categoryLeadMagnet"><ContextualLeadMagnet magnet={leadMagnet} source={`category:${category.path}`} categoryPath={category.path}/></section>}
    {strategicLinks.length > 0 && <section className="semanticPathways shell"><div className="listingHead"><div><small>THEMATIC PATHWAYS</small><h2>Start with the strongest next page</h2></div><span>Semantically mapped</span></div><div>{strategicLinks.map((link) => <a href={link.targetUrl!} key={link.id} data-analytics-kind="internal" data-analytics-placement={`category:${link.linkType}`}><small>{link.linkType} · relevance {link.semanticScore}/100</small><h3>{link.targetTitle}</h3><p>{link.anchorText}</p><b>Explore →</b></a>)}</div></section>}
    <section className="listing shell">
      <div className="listingHead">
        <h2>Latest in {category.name}</h2>
        <span>
          {totalPages > 1
            ? `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, totalItems)} of ${totalItems} curated guides · Page ${currentPage} of ${totalPages}`
            : `${totalItems} curated guide${totalItems === 1 ? "" : "s"}`}
        </span>
      </div>
      {paginatedItems.length ? (
        <>
          <div className="listingGrid">
            {paginatedItems.map((article) => (
              <article key={article.slug}>
                <a href={`/article/${article.slug}`}>
                  <MediaImage src={article.image} alt={article.imageAlt || `Preview for ${article.title}`} variant="card" loading="lazy" decoding="async" sizes="(max-width: 800px) 100vw, 380px"/>
                </a>
                <small>{article.category} · {article.readTime}</small>
                <h3><a href={`/article/${article.slug}`}>{article.title}</a></h3>
                <p>{article.dek}</p>
                <a className="readMore" href={`/article/${article.slug}`}>Read guide →</a>
              </article>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            baseUrl={`/category/${category.path}`}
            searchParams={sParams}
          />
        </>
      ) : (
        <div className="categoryEmpty">
          <small>EDITORIAL QUEUE</small>
          <h3>Guides for this section are being curated.</h3>
          <p>This category stays followable but is marked noindex until it contains published editorial content. That keeps thin taxonomy pages out of search while preserving the internal structure.</p>
        </div>
      )}
    </section>
    <SubFooter/>
  </main>;
}
