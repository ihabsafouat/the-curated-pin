import { getPublishedArticles } from "../../db/data";
import SubFooter from "../components/SubFooter";
import SubHeader from "../components/SubHeader";
import MediaImage from "../components/MediaImage";
import Pagination from "../components/Pagination";
import { privateRobots } from "../seo";

export const metadata = { title: "Search", description: "Search The Curated Pin's practical guides across celebrations, crafts and creative lifestyle topics.", alternates: { canonical: "/search" }, robots: privateRobots(true) };

export const dynamic = "force-dynamic";

const PAGE_SIZE = 8;

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const requestedPage = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const normalized = query.toLowerCase();
  const articles = await getPublishedArticles();
  const results = normalized ? articles.filter((article) => `${article.title} ${article.dek} ${article.category}`.toLowerCase().includes(normalized)) : articles;

  const totalItems = results.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const paginatedResults = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return <main><SubHeader/><section className="searchPage shell"><small>SEARCH THE EDIT</small><h1>Find a useful idea</h1><form action="/search"><input name="q" defaultValue={query} placeholder="Try “teen birthday”, “party games” or “crochet”" autoFocus/><button type="submit">Search</button></form><div className="searchSummary">{query ? <><b>{results.length}</b> result{results.length === 1 ? "" : "s"} for “{query}”</> : "Browse all guides"}{totalPages > 1 && <> · Page {currentPage} of {totalPages}</>}</div><div className="searchResults">{paginatedResults.map((article) => <a href={`/article/${article.slug}`} key={article.slug}><MediaImage src={article.image} alt={`Preview for ${article.title}`} variant="thumb" loading="lazy" decoding="async" sizes="100px"/><div><small>{article.category} · {article.readTime}</small><h2>{article.title}</h2><p>{article.dek}</p></div><b>↗</b></a>)}</div><Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} pageSize={PAGE_SIZE} baseUrl="/search" searchParams={{ q: query || undefined }}/></section><SubFooter/></main>;
}
