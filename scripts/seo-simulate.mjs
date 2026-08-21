import { writeFile } from "node:fs/promises";
import { pages as offlinePages, keywords as offlineKeywords, links as offlineLinks } from "../seo/birthday-plan.mjs";

function normalizeKeyword(value) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
function tokenSet(value) {
  return new Set(normalizeKeyword(value).split(" ").filter(Boolean));
}
function jaccard(a, b) {
  const left = tokenSet(a); const right = tokenSet(b);
  const union = new Set([...left, ...right]);
  if (!union.size) return 0;
  let intersection = 0;
  for (const token of left) if (right.has(token)) intersection++;
  return intersection / union.size;
}
function calculatePageRank(nodes, edges, damping = 0.85, iterations = 80) {
  const keys = nodes.map((node) => node.key);
  const n = Math.max(keys.length, 1);
  const scores = Object.fromEntries(keys.map((key) => [key, 1 / n]));
  const outgoing = new Map(keys.map((key) => [key, []]));
  for (const edge of edges) if (outgoing.has(edge.source) && scores[edge.target] !== undefined) outgoing.get(edge.source).push(edge);
  for (let iteration = 0; iteration < iterations; iteration++) {
    const next = Object.fromEntries(keys.map((key) => [key, (1 - damping) / n]));
    let dangling = 0;
    for (const source of keys) {
      const sourceEdges = outgoing.get(source);
      if (!sourceEdges?.length) { dangling += scores[source]; continue; }
      const totalWeight = sourceEdges.reduce((sum, edge) => sum + Number(edge.weight || 1), 0);
      for (const edge of sourceEdges) next[edge.target] += damping * scores[source] * (Number(edge.weight || 1) / totalWeight);
    }
    if (dangling) for (const key of keys) next[key] += damping * dangling / n;
    Object.assign(scores, next);
  }
  return scores;
}
function analyzeCannibalization(pages, keywords) {
  const claims = keywords.filter((row) => row.role !== "excluded");
  const risks = [];
  for (let i = 0; i < claims.length; i++) for (let j = i + 1; j < claims.length; j++) {
    if (claims[i].page === claims[j].page) continue;
    const a = normalizeKeyword(claims[i].keyword), b = normalizeKeyword(claims[j].keyword);
    const pageA = pages.find((p) => p.key === claims[i].page), pageB = pages.find((p) => p.key === claims[j].page);
    if (a === b) risks.push({ severity:"critical", a:claims[i], b:claims[j], reason:"Exact keyword claimed by two pages." });
    else if ((claims[i].role === "primary" || claims[j].role === "primary") && pageA?.cluster === pageB?.cluster && jaccard(a,b) >= 0.82) risks.push({ severity:"review", a:claims[i], b:claims[j], reason:`High semantic overlap (${Math.round(jaccard(a,b)*100)}%) inside one cluster.` });
  }
  return risks;
}

let pages = offlinePages;
let keywords = offlineKeywords;
let links = offlineLinks;
let client = null;
const databaseUrl = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL;
if (databaseUrl) {
  const { default: pg } = await import("pg");
  client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  const [pageRows, keywordRows, linkRows] = await Promise.all([
    client.query("SELECT id, page_key, title, page_role, cluster_key, primary_keyword, status FROM seo_pages ORDER BY priority"),
    client.query("SELECT p.page_key, k.keyword, k.keyword_role FROM seo_keywords k JOIN seo_pages p ON p.id = k.seo_page_id"),
    client.query("SELECT sp.page_key AS source, tp.page_key AS target, l.weight, l.semantic_score FROM seo_internal_links l JOIN seo_pages sp ON sp.id=l.source_page_id JOIN seo_pages tp ON tp.id=l.target_page_id WHERE l.required=TRUE"),
  ]);
  pages = pageRows.rows.map((r)=>({ id:r.id, key:r.page_key, title:r.title, role:r.page_role, cluster:r.cluster_key, keyword:r.primary_keyword, status:r.status }));
  keywords = keywordRows.rows.map((r)=>({ page:r.page_key, keyword:r.keyword, role:r.keyword_role }));
  links = linkRows.rows.map((r)=>({ source:r.source, target:r.target, weight:Number(r.weight), semantic:Number(r.semantic_score) }));
}

const scores = calculatePageRank(pages, links);
const ranked = pages.map((page)=>({ ...page, score:scores[page.key] ?? 0, incoming:links.filter(l=>l.target===page.key).length, outgoing:links.filter(l=>l.source===page.key).length })).sort((a,b)=>b.score-a.score);
const risks = analyzeCannibalization(pages, keywords);
const drift = links.filter((link)=>Number(link.semantic) < 65);

if (client) {
  await client.query("BEGIN");
  try {
    for (const row of ranked) await client.query("UPDATE seo_pages SET page_rank_score=$1, updated_at=CURRENT_TIMESTAMP WHERE page_key=$2", [row.score, row.key]);
    await client.query("COMMIT");
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  await client.end();
}

const lines = [
  "# Birthday Silo — Internal Authority Simulation",
  "",
  "> This is a weighted internal-link planning heuristic, not Google's private PageRank implementation or a ranking prediction.",
  "",
  "## Highest internal-authority targets",
  "",
  "| Rank | Page | Role | Cluster | Simulated score | In | Out |",
  "|---:|---|---|---|---:|---:|---:|",
  ...ranked.slice(0,15).map((row,i)=>`| ${i+1} | ${row.title} | ${row.role} | ${row.cluster} | ${row.score.toFixed(5)} | ${row.incoming} | ${row.outgoing} |`),
  "",
  "## Cannibalization review",
  "",
  ...(risks.length ? risks.map((risk)=>`- **${risk.severity.toUpperCase()}** — ${risk.a.page} [${risk.a.keyword}] vs ${risk.b.page} [${risk.b.keyword}]: ${risk.reason}`) : ["- No critical duplicate keyword ownership detected in the seeded plan."]),
  "",
  "## Semantic-link drift",
  "",
  ...(drift.length ? drift.map((edge)=>`- ${edge.source} → ${edge.target}: semantic score ${edge.semantic}`) : ["- No required internal link falls below the 65/100 semantic-relevance floor."]),
  "",
  "## Operating rule",
  "",
  "Use the simulation to balance authority flow, not to maximize a score mechanically. A link must still help a reader in context. Parent/child hubs receive consistent links; cross-cluster links stay sparse and require a clear semantic bridge.",
  "",
];
await writeFile(new URL("../seo/PAGERANK_SIMULATION.md", import.meta.url), `${lines.join("\n")}\n`, "utf8");
console.log(lines.slice(0, ranked.length ? 24 : 8).join("\n"));
console.log(`\nWrote seo/PAGERANK_SIMULATION.md · ${ranked.length} pages · ${links.length} required links · ${risks.length} cannibalization review item(s) · ${drift.length} semantic drift warning(s).`);
