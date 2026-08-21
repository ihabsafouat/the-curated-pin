# Monetization pre-launch plan

This document is the monetization contract for the Birthday Parties launch. It separates four things that should never be mixed in the CMS:

1. **Editorial/internal links** — pass users and internal authority to semantically related pages.
2. **Affiliate links** — paid outbound links; every rendered affiliate block uses `rel="sponsored nofollow"` and a nearby disclosure.
3. **Owned-product links** — links to The Curated Pin's own landing pages or checkout; these are not affiliate links.
4. **Lead magnets** — free conversion assets used to acquire an email subscriber.

## Affiliate applications: priority order

### Network layer

Apply once the site is live and has enough original content to look like a real publication.

| Priority | Platform | Role for The Curated Pin |
|---|---|---|
| 1 | Impact | Best first network for party-oriented merchants such as Oriental Trading, Minted and Walmart where available. |
| 1 | CJ Affiliate | Broad retail/craft coverage; Michaels is a direct fit. |
| 1 | Awin | Large global network; use Awin rather than the retired ShareASale platform. |
| 1 | Rakuten Advertising | Broad publisher network and another source of relevant retailers. |
| 2 | FlexOffers | Secondary network with thousands of programs; useful when a merchant is not available elsewhere. |
| 2 | Sovrn Commerce | Long-tail/fallback commerce layer with a very large merchant catalog; do not let automatic linking replace deliberate editorial recommendations. |
| Later | Amazon Associates | Apply after the publication has at least ~10 strong public posts and a realistic chance of generating 3 qualifying sales within the first 180 days. |

### Direct merchants / programs to target

- **Oriental Trading** — party supplies, favors, decorations, crafts; program uses Impact.
- **Minted** — invitations/stationery; program uses Impact.
- **Michaels** — DIY decorations, craft supplies, party-project materials; program uses CJ.
- **Etsy Affiliates** — custom invitations, printable party items, favors, personalized decor.
- **Zazzle Ambassador Program** — invitations, stationery and personalized party items; can later complement our own designs.
- **Walmart Affiliate Program** — broad party supplies and inexpensive practical items; standard affiliate program uses Impact. Treat Walmart Creator as a separate creator program with its own eligibility rules.
- **Canva affiliate program** — relevant only where an article genuinely teaches invitation/design workflows; avoid forcing Canva links into unrelated party articles.

### Application timing

**Before launch:** create network accounts where registration is possible, but do not delay launch waiting for merchant approvals.

**After 10–15 strong articles are public:** apply aggressively to Impact merchants, CJ/Michaels, Awin, Rakuten and Etsy. Apply to Amazon only when the 180-day/3-sale review clock is realistic.

## Affiliate placement rules

- Never add an affiliate link merely because a merchant has a program.
- Put the product in a section where it solves the reader's current task.
- Add original context: who it is for, trade-offs, dimensions/quantity considerations, setup implications, or why it belongs in this particular party plan.
- Do not copy merchant descriptions.
- Avoid hard-coded price promises unless the price is maintained; prefer wording such as **Check current price**.
- Affiliate blocks are paid links and do not participate in the internal authority graph.
- If we have not personally used/tested a product, do not claim that we tested it or that it is “the best.” Present it as a curated shopping option with evidence-based context.

## Minimum digital-product funnel before traffic launch

Do not create twenty products before validation. Launch with three conversion assets.

### 1. Free — Birthday Party Quick-Start Kit

**Purpose:** email acquisition across almost every Birthday article.

Suggested contents:
- master planning checklist
- budget page
- guest list
- theme decision worksheet
- food/drinks planner
- games/activity planner
- shopping list
- party-day timeline
- notes page

**Suggested owned URL:** `/free/birthday-party-quick-start-kit`

The landing page can be indexable when it contains useful explanatory content, while the actual download/thank-you URL should not be treated as an SEO landing page.

### 2. Paid evergreen — Ultimate Birthday Party Planner

**Initial price test:** roughly $9–15.

Suggested contents:
- expanded planning workbook
- editable budget
- guest/RSVP tracker
- shopping/decor planner
- menu quantities
- game planner
- setup timeline
- day-of checklist
- gift/thank-you tracker
- reusable planning templates

**Suggested owned URL:** `/shop/ultimate-birthday-party-planner`

**SEO boundary:** the product page targets transactional/product intent such as a printable birthday party planner. The editorial planning/checklist page should remain the owner of informational planning-checklist intent. Do not create near-duplicate text across both pages.

### 3. Paid validated-cluster offer — Teen Birthday Party Planner + Games Pack

**Initial price test:** roughly $12–17.

This should exist early because Teen Birthdays is one of the strongest low-KD clusters in the launch map.

Suggested contents:
- teen party planner
- theme picker
- guest/vibe planner
- activity/game cards
- sleepover/movie-night planning pages
- playlist/food planner
- party photo challenge
- printable game sheets

**Suggested owned URL:** `/shop/teen-birthday-party-planner`

### First post-launch product

**Party Games Printable Pack** ($7–12 test range) after we see which game articles earn the most clicks/subscribers.

## Linkable free assets that support SEO and backlinks

These are not primarily paid products. They are indexable tools/resources designed to deserve links and push internal authority back toward the Birthday pillar structure:

- Party Game Selector by age, group size and indoor/outdoor setting
- Party Food Quantity Chart / calculator
- Balloon Quantity + Decoration Budget guide
- Birthday Planning Timeline

Each asset should link contextually back to the relevant pillar/thematic pages, and those pages should link to the asset only where it genuinely helps the reader.

## Product SEO rules

- Give every owned product a first-party landing page even if checkout is eventually handled by an external platform.
- Use a distinct search intent from the informational article feeding it.
- Index complete, useful product landing pages; do not index bare checkout-success, download-token or thank-you URLs.
- Use original screenshots/mockups, contents, use cases, compatibility information and FAQs rather than thin sales copy.
- Product CTAs inside articles should normally link first to the owned landing page; the product page can then send the buyer to checkout.
- Do not use affiliate markup on our own product links.

## Launch conversion map

`Pinterest / Google -> article -> contextual lead magnet -> segmented email -> owned product -> affiliate shopping options where useful`

The point is to make each monetization layer useful even if another layer is unavailable. An article should still be excellent if every affiliate link is removed.

## Priority 6 implementation status

The email-acquisition layer is now implemented:

- Birthday Party Quick-Start Kit landing + printable: **ready in code**
- Teen Birthday Party Planning Kit landing + printable: **ready in code**
- contextual article/category targeting: **ready**
- subscriber interest tagging + UTM attribution: **ready**
- preference/unsubscribe flows: **ready**
- Birthday + Teen nurture sequences: **ready**

The two paid products are still pre-launch deliverables rather than placeholders we should pretend are finished:

- Ultimate Birthday Party Planner
- Teen Birthday Party Planner + Games Pack

Their first-party `/shop/...` pages and checkout/product files should be completed before the monetized launch. The free lead-magnet pages stay `noindex` for now to avoid competing with the planned informational SEO pages until separate product-intent keyword research is completed.
