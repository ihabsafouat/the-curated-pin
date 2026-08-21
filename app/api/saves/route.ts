import { getSavedSlugs, setSavedArticle, trackEvent } from "../../../db/data";
import { getCurrentUser } from "../../security/auth";
import { checkRateLimit, rateLimitResponse } from "../../security/rate-limit";
import { csrfMatches, readJson, requestHasSafeOrigin } from "../../security/request";
import { saveSchema } from "../../security/validation";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false }, { status: 401 });
  const rows = await getSavedSlugs(user.id);
  return Response.json({
    ok: true,
    favorites: rows.filter((row) => row.kind === "favorite").map((row) => row.article_slug),
    readLater: rows.filter((row) => row.kind === "read_later").map((row) => row.article_slug),
  }, { headers: { "cache-control": "private, no-store" } });
}

export async function POST(request: Request) {
  if (!requestHasSafeOrigin(request) || !await csrfMatches(request.headers.get("x-csrf-token"))) {
    return Response.json({ ok: false }, { status: 403 });
  }
  const rate = await checkRateLimit(request, "reader:saves", 90, 60 * 60);
  if (!rate.allowed) return rateLimitResponse(rate);
  const user = await getCurrentUser();
  if (!user) return Response.json({ ok: false }, { status: 401 });
  const parsed = saveSchema.safeParse(await readJson(request, 8_000));
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });
  const ok = await setSavedArticle(user.id, parsed.data.slug, parsed.data.kind, parsed.data.saved);
  if (ok && parsed.data.saved) await trackEvent({ eventType: parsed.data.kind, articleSlug: parsed.data.slug });
  return Response.json({ ok }, { status: ok ? 200 : 404 });
}
