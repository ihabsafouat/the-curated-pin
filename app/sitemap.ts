import type { MetadataRoute } from "next";
import { getCategories } from "../db/categories";
import { getPublishedArticles } from "../db/data";
import { getActiveLeadMagnets } from "../db/audience";
import { absoluteUrl } from "./site";
import { sameSiteCanonical, socialImage } from "./seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, articles, leadMagnets] = await Promise.all([getCategories(), getPublishedArticles(), getActiveLeadMagnets()]);
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/case-studies"), changeFrequency: "monthly", priority: 0.65 },
    { url: absoluteUrl("/editorial-policy"), changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/authors/the-curated-pin-editors"), changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.4 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.3 },
  ];

  const visibleCategories = categories.filter((category) => category.seoIndex &&
    articles.some((article) => article.categoryPath === category.path || article.categoryPath.startsWith(`${category.path}/`)),
  );
  const categoryEntries = visibleCategories.map((category) => {
    const descendants = articles.filter((article) => article.categoryPath === category.path || article.categoryPath.startsWith(`${category.path}/`));
    const lastModified = descendants.reduce<Date | undefined>((latest, article) => {
      const value = new Date(article.updatedAt);
      return !latest || value > latest ? value : latest;
    }, undefined);
    return {
      url: absoluteUrl(`/category/${category.path}`),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: category.parentId === null ? 0.85 : 0.8,
      images: category.socialImage ? [socialImage(category.socialImage)] : undefined,
    };
  });

  const articleEntries = articles
    .filter((article) => article.seoIndex && sameSiteCanonical(article.canonicalPath, `/article/${article.slug}`) === `/article/${article.slug}`)
    .map((article) => ({
      url: absoluteUrl(`/article/${article.slug}`),
      lastModified: new Date(article.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.75,
      images: [socialImage(article.socialImage || article.image)],
    }));

  const leadMagnetEntries = leadMagnets.filter((magnet) => magnet.seoIndex).map((magnet) => ({
    url: absoluteUrl(`/free/${magnet.slug}`),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryEntries, ...articleEntries, ...leadMagnetEntries];
}
