# Priority 7 — Funnel & conversion analytics

Priority 7 turns The Curated Pin's scattered tracking hooks into a first-party business analytics layer.

## What is measured

The event model now separates:

- `page_view`
- `content_engaged`
- `cta_impression`
- `cta_click`
- `form_start`
- `newsletter_signup`
- `lead_magnet_access`
- `email_click`
- `affiliate_click`
- `product_click`
- `checkout_click`
- `outbound_click`
- `internal_link_click`
- `favorite`
- `read_later`
- `search`

Affiliate clicks, owned-product clicks and semantic internal links are intentionally different event types. This prevents a generic outbound-click count from hiding what is actually creating business value.

## Attribution

The browser reads standard UTM fields:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`

When analytics consent is accepted, a short-lived session ID and first-touch attribution are kept in `sessionStorage`. If analytics consent is declined, the site can still count anonymous request-level events but does not create a persistent analytics session identifier.

Newsletter signups are recorded server-side after a successful, consented subscription. This makes the signup event materially harder to spoof than a browser-only conversion event and links it to the actual lead magnet, article/category context and subscriber record.

## Content engagement

An article becomes `content_engaged` after either:

- roughly 45 seconds of active page time, or
- at least 75% scroll depth after 10 seconds.

This is not treated as a ranking signal. It is an internal publishing signal for deciding whether traffic is actually consuming the page.

## CTA funnel

The email funnel can now be measured as:

`view -> lead magnet impression -> CTA click -> form start -> signup -> resource access`

Dynamic popup CTAs are observed through a MutationObserver, while in-article and category lead magnets use the same event model.

## Monetization tracking

Rich CMS blocks now identify their business role with explicit analytics metadata:

- Affiliate recommendation → `affiliate_click`
- Owned digital product → `product_click`
- Checkout link → `checkout_click`
- Lead magnet → `cta_click`
- Internal editorial recommendation → `internal_link_click`

This preserves the semantic-linking work from Priority 2 while allowing the business dashboard to distinguish editorial link flow from monetization.

## Email click tracking

Lead-magnet delivery links and nurture-sequence CTAs use a signed, same-site redirect token under `/go/email`.

The signed payload contains only:

- subscriber ID
- same-site target path
- message key
- issued timestamp

The target must be a same-site path, preventing the tracking route from becoming an open redirect.

## Confirmed purchases

Clicks are not revenue. Priority 7 therefore adds `commerce_conversions`, a separate server-trusted table for purchases.

A generic server-to-server endpoint is available at:

`POST /api/webhooks/conversion`

It requires `x-conversion-secret` matching `CONVERSION_WEBHOOK_SECRET` and accepts a provider event ID so retries are idempotent. Use this as an adapter point when Gumroad, Lemon Squeezy, Stripe, Shopify or another checkout is chosen. Do not call this endpoint from browser JavaScript.

## Studio dashboard

Editors/admins now have:

`/studio/analytics`

with 7, 30, 90 and 365-day windows. It reports:

- views and engagement rate
- newsletter signup rate
- affiliate CTR
- product and checkout clicks
- confirmed purchases/revenue
- article-level conversion rates
- acquisition source performance
- lead-magnet impression-to-signup conversion
- merchant click share
- owned-product intent and revenue

The dashboard intentionally describes browser product/affiliate events as intent signals and only describes rows in `commerce_conversions` as confirmed purchases.

## GA4 + Clarity

GA4 and Clarity remain consent-gated from Priority 5. When GA4 is allowed, first-party business event names are also forwarded to `gtag` without sending email addresses or subscriber IDs.

PostgreSQL remains the source of truth for the core editorial/commercial funnel so the business is not dependent on GA4 retention, ad blockers or a future analytics migration.

## Database migration

Priority 7 adds:

`postgres/migrations/0008_funnel_conversion_analytics.sql`

Run:

```bash
npm ci
npm run setup:priority7
npm run check
npm run dev
```

## Optional commerce secret

Add a strong server-only value before enabling a purchase integration:

```env
CONVERSION_WEBHOOK_SECRET=replace-with-at-least-32-random-characters
```

Until a checkout provider is connected, leave the endpoint unused and purchase/revenue metrics will correctly remain zero.
