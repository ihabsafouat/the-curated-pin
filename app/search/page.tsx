import { getPublishedArticles } from "../../db/data";
import SubFooter from "../components/SubFooter";
import SubHeader from "../components/SubHeader";
import MediaImage from "../components/MediaImage";
import { privateRobots } from "../seo";

export const metadata = { title: "Search", description: "Search The Curated Pin's practical guides across celebrations, crafts and creative lifestyle topics.", alternates: { canonical: "/search" }, robots: privateRobots(true) };

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const normalized = query.toLowerCase();
  const articles = await getPublishedArticles();
  const results = normalized ? articles.filter((article) => `${article.title} ${article.dek} ${article.category}`.toLowerCase().includes(normalized)) : articles;
  return <main><SubHeader/><section className="searchPage shell"><small>SEARCH THE EDIT</small><h1>Find a useful idea</h1><form action="/search"><input name="q" defaultValue={query} placeholder="Try “teen birthday”, “party games” or “crochet”" autoFocus/><button type="submit">Search</button></form><div className="searchSummary">{query ? <><b>{results.length}</b> result{results.length === 1 ? "" : "s"} for “{query}”</> : "Browse all guides"}</div><div className="searchResults">{results.map((article) => <a href={`/article/${article.slug}`} key={article.slug}><MediaImage src={article.image} alt={`Preview for ${article.title}`} variant="thumb" loading="lazy" decoding="async" sizes="100px"/><div><small>{article.category} · {article.readTime}</small><h2>{article.title}</h2><p>{article.dek}</p></div><b>↗</b></a>)}</div></section><SubFooter/></main>;
}
