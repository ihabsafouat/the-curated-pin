# Priority 2 — Birthday Authority Silo & Internal-Link Architecture

Priority 2 turns `Celebrations → Birthday Parties` from a taxonomy into an SEO authority system. It does **not** mass-publish articles. It defines which page owns which intent, how authority should flow internally, which cross-links are semantically safe, and which pages are worth earning external links to.

## What is implemented

- 9 category/thematic nodes and **30 planned article nodes**.
- One primary keyword owner per page, plus secondary and explicit `excluded` claims.
- Search intent, semantic scope, priority, validated US volume/KD/CPC when we actually collected those metrics, and research status for terms that still need validation.
- Database-backed internal-link graph with anchor text, link type, placement, semantic relevance score and a planning weight.
- Weighted PageRank-style simulation (`npm run seo:simulate`).
- Cannibalization checks for duplicate active keyword ownership and high-overlap claims within one cluster.
- Semantic-drift checks: required editorial links below 65/100 are flagged.
- Linkable/backlink asset plan designed for **earned editorial links**, not paid/exchanged link schemes.
- `/admin/seo-map` dashboard for editors/admins.
- Strategic internal-link cards on live article/category pages.
- Empty category pages remain followable but are `noindex` until they contain published editorial content.
- Random cross-vertical recommendations were removed from category pages.
- Planned article slugs automatically attach to their SEO plan when the article is created/published.
- A planned slug is required to stay inside its intended category, preventing accidental semantic misclassification.

## Birthday silo roles

### Hub
`/category/celebrations/birthday-parties`

Owns **birthday party planning**, not the exact `birthday party ideas` listicle intent. Its job is routing, orientation and authority distribution.

### Main pillar
`/article/birthday-party-ideas`

Owns **birthday party ideas** (validated: 368K US volume, KD 22 in our research). It is deliberately the strongest internal authority target.

### Thematic pages

- Birthday Ideas by Age
- Teen Birthday Planning
- First Birthday Planning / broad first-birthday themes
- Birthday Party Themes
- Birthday Party Games
- Birthday Party Food Ideas
- Birthday Party Decorations
- Birthday Printables & Planners

Thematic pages organize a semantic field. They should answer the overview intent and send narrower searches to dedicated supporting pages.

### Supporting pages

Examples:

- 13th Birthday Party Ideas
- 18th Birthday Party Ideas
- Birthday Party Ideas for Girls
- Party Games for Kindergarteners
- Large Group Party Games
- Inexpensive Party Food

Each supporting page owns a distinct modifier or problem and returns authority to its thematic page plus the main birthday pillar where context allows.

### Money / utility pages

Examples:

- Balloon Decorating Ideas for Birthday Parties
- Birthday Party Favor Ideas
- Birthday Party Planning Checklist
- Birthday Party Budget Planner

These pages are not allowed to become thin affiliate/product pages. They must solve the query first and monetize second.

## Internal net-linking rules

1. **Every important page is reachable through crawlable `<a>` links.**
2. Supporting pages link upward to their thematic hub.
3. Thematic hubs link downward to their owned pages.
4. Every major thematic branch has a natural route to the broad `Birthday Party Ideas` pillar.
5. Sibling links are sparse and contextual. We do not link two pages merely because both contain the word “birthday.”
6. Cross-cluster links need a shared semantic bridge:
   - setting: `Backyard Party Games → Outdoor Birthday Party Ideas`
   - budget: `Cheap Birthday Party Ideas → Inexpensive Party Food`
   - age: `13th Birthday Ideas → Teen Birthday Party Games`
7. Required editorial links use a **semantic score ≥ 65/100**; launch links are currently ≥ 70.
8. Anchor text is descriptive and concise. Exact-match anchors may be used when natural, but anchor variation and reader clarity take precedence over mechanical optimization.
9. Global navigation can connect broader verticals later; editorial body links should remain much stricter.
10. Empty/noindex taxonomy nodes do not receive strategic public link cards until they contain publishable content.

## “Semantic sliding” / semantic drift

A link changes the contextual neighborhood around both pages. That is useful when the bridge is real, but repeated weak cross-topic links can blur the silo.

Priority 2 therefore stores `semantic_score` on every planned editorial edge. `/admin/seo-map` flags any required link below the threshold. The public runtime only exposes strategic links with strong relevance and a live target.

## Cannibalization rules

- One active page owns one exact primary search intent.
- Secondary terms may live on the same page when the SERP/search intent is effectively identical.
- Specific modifiers get separate pages only when they change user intent enough to justify a complete page.
- `excluded` keyword claims document boundaries. Example: `Teen Birthday Party Ideas` explicitly excludes `13th birthday party ideas`; that query belongs to the 13th-birthday page.
- Category hubs and listicle pillars are intentionally separated. Example:
  - Birthday hub → `birthday party planning`
  - Main article → `birthday party ideas`
- If Search Console later shows two pages repeatedly ranking for the same query, review the SERP and either differentiate, merge + redirect, or consolidate duplicates. Canonicals are for duplicate/near-duplicate URL consolidation, not a substitute for fixing two competing editorial pages.

## Weighted PageRank simulation

Run:

```bash
npm run seo:simulate
```

It writes `seo/PAGERANK_SIMULATION.md` and, when a database URL is available, stores the simulated score in `seo_pages.page_rank_score`.

The simulation uses the planned internal graph, a damping factor of 0.85 and edge weights. It is **not Google's PageRank algorithm and not a ranking prediction**. It is a planning tool for questions like:

- Are we accidentally orphaning a supporting page?
- Are we concentrating enough internal authority on our primary pillar?
- Is a utility page accumulating authority and returning it to the money/traffic pages?
- Are thematic hubs receiving enough links from their children?

Current offline plan places the strongest authority on:

1. Birthday Party Ideas — main pillar
2. Birthday Party Planning Hub
3. Birthday Party Planning Checklist — linkable utility asset
4. Printables & Planners hub
5. Birthday Party Budget Planner
6. Birthday Ideas by Age
7. Teen Birthday Planning Hub
8. Birthday Party Games

The checklist ranking highly is intentional only if it becomes a genuinely link-worthy reference. It links back into the core silo so externally earned authority can circulate rather than becoming a dead end.

## Backlink strategy

Priority 2 does not create or buy backlinks. It identifies pages that can deserve links by providing something reference-worthy:

- Birthday Party Planning Timeline
- Birthday Ideas Decision Matrix
- Teen Party Activity Picker
- Party Game Selector by Age & Group Size
- Party Food Quantity Chart
- Balloon Quantity & Decoration Budget Guide
- First Birthday Planning Timeline

Potential outreach is to relevant publishers such as parenting sites, party venues, event planners, teachers/community organizations and useful local resources. The asset must be genuinely useful and the link must be editorially deserved. Paid/sponsored outbound links on our own site remain qualified appropriately.

## Setup

After pulling Priority 2:

```bash
npm ci
npm run setup:priority2
npm run check
npm run dev
```

`setup:priority2` runs:

1. PostgreSQL migrations
2. idempotent Birthday SEO seed
3. internal authority simulation

Then open:

```text
/admin/seo-map
```

## Publication rule

`planned` means metrics and intent are sufficiently validated for the editorial queue.

`research` means the page has a useful place in the architecture but its search volume/difficulty or SERP intent still needs validation **before publication**.

Do not publish all 30 because they exist in the map. The map prevents random content production; it does not justify it.
