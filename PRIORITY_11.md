# Priority 11 — Birthday Launch Package

Priority 11 converts The Curated Pin from a production-ready platform into a launchable Birthday publication. The code deliberately seeds launch articles as **drafts**. Bulk publishing is disabled so content is reviewed in Publisher Studio before it becomes public.

## What is included

### First-wave content

Twelve complete rich-CMS Birthday articles are included in `launch/birthday-launch-content.mjs` and seeded by `scripts/seed-launch-content.mjs`.

Recommended publication order:

1. `birthday-party-ideas` — 20 Birthday Party Ideas for Every Age, Budget & Vibe
2. `teen-birthday-party-ideas` — 20 Teen Birthday Party Ideas That Feel Fun, Not Forced
3. `13th-birthday-party-ideas` — 15 13th Birthday Party Ideas for a Fun First Teen Celebration
4. `18th-birthday-party-ideas` — 15 18th Birthday Party Ideas for a Memorable Milestone
5. `birthday-party-ideas-for-girls` — 15 Birthday Party Ideas for Girls, From Creative to Low-Key
6. `birthday-party-ideas-for-boys` — 15 Birthday Party Ideas for Boys, From Active to Creative
7. `11-year-old-birthday-party-ideas` — 15 Birthday Party Ideas for 11 Year Olds That Feel Grown-Up Enough
8. `12-year-old-birthday-party-ideas` — 15 Birthday Party Ideas for 12 Year Olds, From Chill to Active
9. `1st-birthday-party-ideas` — 15 First Birthday Party Ideas That Keep the Day Simple and Special
10. `party-games-for-kindergarteners` — 15 Party Games for Kindergarteners That Are Easy to Explain
11. `large-group-party-games` — 15 Large Group Party Games That Keep Everyone Involved
12. `party-games-for-kids` — 20 Party Games for Kids by Age, Space and Energy Level

The headline counts are tested against the actual number of idea blocks. This prevents a headline promising 25 ideas while the article contains 15.

### Free lead magnets

Public deliverables:

- `/downloads/birthday-party-quick-start-kit.pdf`
- `/downloads/teen-birthday-party-planning-kit.pdf`

The Priority 6 lead-magnet flows now point to these real PDFs. The broad Birthday kit is used for general Birthday intent; the Teen kit is used for Teen/13th/18th intent.

### Paid products

Publisher source files:

- `launch-assets/products/ultimate-birthday-party-planner.pdf` — 29 pages — launch price $12
- `launch-assets/products/teen-birthday-party-planner-games-pack.pdf` — 27 pages — launch price $14

First-party sales pages:

- `/shop/ultimate-birthday-party-planner`
- `/shop/teen-birthday-party-planner`

The paid PDFs intentionally live outside `/public`. Upload them to the checkout provider, then configure:

```env
CHECKOUT_URL_ULTIMATE_BIRTHDAY_PARTY_PLANNER=
CHECKOUT_URL_TEEN_BIRTHDAY_PARTY_PLANNER=
```

Do not launch the product pages with the checkout-placeholder state visible in production.

## Pinterest launch assets

Priority 11 includes:

- 12 article hero graphics at `1600×900`
- 36 dedicated Pinterest creatives at `1000×1500` (3 per article)
- launch metadata and Pin hooks in `launch/launch-manifest.json`

The Pin graphics are an editorial launch baseline. Once real photography/illustration is available in the Priority 9 media library, test photo-led variants against these graphic-led variants instead of replacing everything before data exists.

### Pinterest operating rules

- Use 2:3 vertical creative for the launch assets.
- Keep Pin title copy concise; the manifest keeps every title under 100 characters.
- Give every Pin its final canonical article URL with UTM parameters.
- Optimize for **outbound clicks and outbound click rate**, not saves alone.
- Do not upload exact duplicate creatives repeatedly. Each article has three different hooks so we can test intent, not just color changes.
- Use one strong board match per initial Pin. Expand board distribution only when it remains semantically relevant.

Current official Pinterest references used when building the plan:
- https://help.pinterest.com/en/business/article/pinterest-product-specs
- https://help.pinterest.com/en/business/article/pin-stats
- https://help.pinterest.com/en/business/article/pin-performance-and-distribution
- https://help.pinterest.com/en-gb/business/article/bulk-upload-video-pins

## Affiliate application sequence

Apply only when the production site is publicly accessible with finished editorial content and legal/affiliate disclosure pages.

### Apply first

1. **Impact** — verify The Curated Pin as a media property, then apply to relevant brands. Initial targets include Walmart, Minted and Oriental Trading where available/approved.
2. **CJ Affiliate** — publisher account; Michaels is a strong craft/party fit.
3. **Awin** — publisher account for broader merchant access.
4. **Etsy Affiliates** — well aligned with editorial/blog traffic and personalized party products.

### Apply after initial content is public

5. **Amazon Associates** — do not apply too early. Amazon currently reviews after at least three qualifying sales within the first 180 days and says roughly ten robust original posts is a useful rule of thumb for site readiness.

Useful current official pages:
- https://help.impact.com/partner/readme/im-a-partner/step-1-join-the-marketplace
- https://public.cj.com/signup/publisher
- https://www.awin.com/us/faqs
- https://www.etsy.com/affiliates
- https://affiliate-program.amazon.com/help/node/topic/G8TW5AE9XL2VX9VM
- https://www.michaels.com/affiliate-program
- https://affiliates.walmart.com/page/faqs
- https://www.minted.com/lp/affiliate
- https://www.orientaltrading.com/h3-affiliate-program.fltr

### Affiliate placement rule

Do not turn launch articles into shopping lists. Add a recommendation only where the section creates a real need—for example, a projector inside an outdoor movie idea or craft materials inside a craft activity. Priority 3 already renders affiliate links as sponsored/nofollow links with disclosure.

## Publication cadence

Use a staged release rather than publishing twelve URLs in one minute.

- Day 1: main Birthday Party Ideas pillar
- Day 2: Teen Birthday Party Ideas
- Day 4: 13th Birthday Party Ideas
- Day 6: 18th Birthday Party Ideas
- Week 2: girls, boys, 11-year-old and 12-year-old pages
- Week 3: First Birthday
- Week 4: Kindergarten games, Large Group games and Party Games for Kids

This cadence gives the main pillar and Teen cluster an early internal-link foundation. It also gives time to inspect indexing, internal links, CTA behavior and image rendering before broadening.

For each article, release Pin variant 1 after publication, then test variants 2 and 3 later rather than uploading all three simultaneously.

## Launch gate for every article

Before changing a draft to Published in `/studio`:

1. Read the full page on desktop and mobile.
2. Confirm title count equals the actual idea count.
3. Verify the page owns the intended keyword in `/studio/seo-map`.
4. Check required semantic internal links and anchors.
5. Confirm hero alt text and social image.
6. Confirm contextual lead magnet is correct.
7. Confirm any product CTA matches the page intent.
8. Add affiliate links only if the relevant program has approved The Curated Pin.
9. Confirm FAQ answers and any safety-sensitive wording.
10. Verify canonical/indexation settings.
11. Confirm Pinterest destination URL is the canonical URL plus UTM parameters.
12. Publish, then run the deployed smoke checks and inspect the rendered page.

## Setup

```bash
npm ci
npm run setup:priority11
npm run check
npm run dev
```

`setup:priority11` imports the twelve launch pages as **drafts**. Bulk publishing is intentionally disabled.

## External tasks that code cannot complete for you

- Create/connect the production Neon and Netlify resources and secrets.
- Upload paid PDFs to the selected checkout provider and set checkout URLs.
- Apply for affiliate networks/merchant programs and wait for approval.
- Create/claim the Pinterest Business account/website if not already done.
- Review every article and publish it individually.
- Replace baseline launch graphics with selected Cloudinary media when better visuals are available.
- Validate GA4, Clarity, email, Turnstile and payment webhook behavior against real production accounts.

## What comes after launch

Do not immediately build another vertical. Collect enough Birthday data to identify:

- pages with impressions but weak CTR,
- Pins with high impressions but weak outbound click rate,
- articles with traffic but weak lead conversion,
- lead magnets with strong/weak opt-in rates,
- affiliate categories receiving real clicks,
- paid products receiving product/checkout clicks,
- pages that earn links naturally.

Use that evidence to decide whether the next Birthday batch should emphasize Teens, First Birthdays, Games, Themes, Food or another validated subcluster. Crochet stays the next planned vertical, but not until Birthday publishing is operationally stable.
