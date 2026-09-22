import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedArticles } from "../../db/data";
import { getPublicNavigationCategories } from "../../db/categories";
import SubFooter from "../components/SubFooter";
import SubHeader from "../components/SubHeader";
import Breadcrumbs from "../components/Breadcrumbs";
import MediaImage from "../components/MediaImage";
import Pagination from "../components/Pagination";
import StructuredData from "../components/StructuredData";
import { absoluteUrl, SITE_NAME } from "../site";
import { staticPageMetadata } from "../seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = staticPageMetadata({
  title: "All Guides & Ideas",
  description: "Browse all practical celebration plans, birthday party guides and crochet projects from The Curated Pin.",
  path: "/articles",
});

const PAGE_SIZE = 6;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; category?: string }>;
}) {
  const sParams = searchParams ? await searchParams : {};
  const requestedPage = Math.max(1, parseInt(sParams.page || "1", 10) || 1);
  const activeCategory = (sParams.category || "").trim();

  const [allArticles, categories] = await Promise.all([
    getPublishedArticles(),
    getPublicNavigationCategories(),
  ]);

  const filteredArticles = activeCategory
    ? allArticles.filter(
        (article) =>
          article.categoryPath === activeCategory ||
          article.categoryPath.startsWith(`${activeCategory}/`) ||
          article.category.toLowerCase() === activeCategory.toLowerCase(),
      )
    : allArticles;

  const totalItems = filteredArticles.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "All Guides" },
  ];

  const articlesUrl = absoluteUrl("/articles");
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${articlesUrl}#collection`,
    name: "All Editorial Guides",
    description: "The complete archive of practical planning guides, party blueprints and crochet projects.",
    url: articlesUrl,
    isPartOf: { "@id": absoluteUrl("/#website") },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: paginatedArticles.map((article, index) => ({
        "@type": "ListItem",
        position: (currentPage - 1) * PAGE_SIZE + index + 1,
        url: absoluteUrl(`/article/${article.slug}`),
        name: article.title,
      })),
    },
  };

  return (
    <main>
      <SubHeader />
      <Breadcrumbs items={breadcrumbs} />
      <StructuredData data={schema} />

      <section className="categoryHero">
        <div className="shell">
          <small>THE COMPLETE EDITORIAL LIBRARY</small>
          <h1>All Guides & Ideas</h1>
          <p>
            Browse our full collection of celebration blueprints, party plans by age, and creative crochet patterns—organized to be genuinely useful.
          </p>
        </div>
      </section>

      <section className="shell articlesFilterBar">
        <span className="articlesFilterLabel">Filter by collection:</span>
        <div className="articlesFilterPills">
          <Link
            href="/articles"
            className={`filterPill ${!activeCategory ? "active" : ""}`}
          >
            All guides ({allArticles.length})
          </Link>
          {categories.map((cat) => {
            const count = allArticles.filter(
              (a) =>
                a.categoryPath === cat.path ||
                a.categoryPath.startsWith(`${cat.path}/`),
            ).length;
            const isActive = activeCategory === cat.path;
            return (
              <Link
                key={cat.id}
                href={isActive ? "/articles" : `/articles?category=${encodeURIComponent(cat.path)}`}
                className={`filterPill ${isActive ? "active" : ""}`}
              >
                {cat.name} ({count})
              </Link>
            );
          })}
        </div>
      </section>

      <section className="listing shell">
        <div className="listingHead">
          <h2>
            {activeCategory
              ? `Guides in ${categories.find((c) => c.path === activeCategory)?.name || activeCategory}`
              : "All Published Guides"}
          </h2>
          <span>
            {totalPages > 1
              ? `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, totalItems)} of ${totalItems} curated guides · Page ${currentPage} of ${totalPages}`
              : `${totalItems} curated guide${totalItems === 1 ? "" : "s"}`}
          </span>
        </div>

        {paginatedArticles.length ? (
          <>
            <div className="listingGrid">
              {paginatedArticles.map((article) => (
                <article key={article.slug}>
                  <a href={`/article/${article.slug}`}>
                    <MediaImage
                      src={article.image}
                      alt={article.imageAlt || `Preview for ${article.title}`}
                      variant="card"
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 800px) 100vw, 380px"
                    />
                  </a>
                  <small>
                    {article.category} · {article.readTime}
                  </small>
                  <h3>
                    <a href={`/article/${article.slug}`}>{article.title}</a>
                  </h3>
                  <p>{article.dek}</p>
                  <a className="readMore" href={`/article/${article.slug}`}>
                    Read guide →
                  </a>
                </article>
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              baseUrl="/articles"
              searchParams={sParams}
            />
          </>
        ) : (
          <div className="categoryEmpty">
            <small>NO GUIDES FOUND</small>
            <h3>No articles currently match this selection.</h3>
            <p>
              Try browsing all collections or searching for specific party ideas, games or patterns.
            </p>
            <Link href="/articles" className="primaryCta" style={{ marginTop: 18, display: "inline-block" }}>
              View all guides
            </Link>
          </div>
        )}
      </section>

      <SubFooter />
    </main>
  );
}
