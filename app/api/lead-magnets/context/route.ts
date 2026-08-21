import { getArticleBySlug } from "../../../../db/data";
import { getLeadMagnetForContext } from "../../../../db/audience";

function safePath(value: string) {
  try { return decodeURIComponent(value).slice(0, 500); } catch { return ""; }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = safePath(url.searchParams.get("path") || "");
  let articleSlug = "";
  let categoryPath = "";
  if (path.startsWith("/article/")) {
    articleSlug = path.slice("/article/".length).split(/[?#/]/)[0] || "";
    const article = articleSlug ? await getArticleBySlug(articleSlug) : null;
    categoryPath = article?.categoryPath || "";
  } else if (path.startsWith("/category/")) {
    categoryPath = path.slice("/category/".length).split(/[?#]/)[0] || "";
  } else if (path === "/" || path.startsWith("/free/")) {
    categoryPath = "celebrations/birthday-parties";
  }
  if (!categoryPath && !articleSlug) return Response.json({ magnet: null }, { headers: { "cache-control": "private, max-age=60" } });
  const magnet = await getLeadMagnetForContext({ articleSlug, categoryPath }).catch((error) => {
    console.error("Unable to load a contextual lead magnet.", error);
    return null;
  });
  if (!magnet) return Response.json({ magnet: null }, { headers: { "cache-control": "private, max-age=60" } });
  return Response.json({ magnet: { slug: magnet.slug, name: magnet.name, eyebrow: magnet.eyebrow, description: magnet.description, ctaLabel: magnet.ctaLabel, interestKey: magnet.interestKey } }, { headers: { "cache-control": "private, max-age=60" } });
}
