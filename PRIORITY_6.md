# Priority 6 — Contextual lead magnets + segmented email funnel

Priority 6 turns newsletter capture into an audience system. The Curated Pin still has one publication-level list, but subscribers are tagged by the problem/topic they actually requested so future verticals do not contaminate one another.

## What changed

### Database audience model

Migration `0007_contextual_email_funnel.sql` adds:

- `audience_interests` — reusable hierarchical topic segments
- `newsletter_subscriber_interests` — many-to-many subscriber tags
- contextual signup attribution on `newsletter_subscribers` (lead magnet, article/category source, consent timestamp, UTM fields)
- `lead_magnets` + `lead_magnet_targets`
- `email_sequences` + `email_sequence_steps`
- `subscriber_sequence_enrollments`
- `email_delivery_logs`

The seed intentionally marks future `crochet` and `sewing` interests inactive. They can be activated when those content silos are ready without changing the signup code.

## Launch lead magnets

Two working browser-printable resources are seeded:

1. **Birthday Party Quick-Start Kit**
   - `/free/birthday-party-quick-start-kit`
   - `/free/birthday-party-quick-start-kit/print`
   - default segment: `birthday-parties`

2. **Teen Birthday Party Planning Kit**
   - `/free/teen-birthday-party-planning-kit`
   - `/free/teen-birthday-party-planning-kit/print`
   - default segment: `teen-birthdays`

The printable versions work immediately and can be printed or saved as PDF from the browser. A fully art-directed downloadable PDF can replace/augment these later through the media pipeline without changing the funnel.

The `/free/*` landing pages remain `noindex` by default. That is deliberate until keyword research proves a separate transactional/free-printable intent that will not cannibalize the information pages in the Birthday SEO map.

## Contextual targeting

Lead magnets can target:

- an exact article slug
- a category path and descendants
- an entire vertical prefix

Current priority order is article > most-specific category > vertical fallback.

Examples:

- `teen-birthday-party-ideas` → Teen Birthday Planning Kit
- `13th-birthday-party-ideas` → Teen Birthday Planning Kit
- `/category/celebrations/birthday-parties/teen-birthdays` → Teen Birthday Planning Kit
- other Birthday Party pages → Birthday Party Quick-Start Kit
- future Crochet pages → **no Birthday lead magnet**

The same resolver powers article CTAs, category CTAs and the delayed popup.

## Contextual placement

On long articles, the automatic lead magnet is inserted roughly one-third through the rich content. It does not replace manually placed CMS conversion blocks; editors can still add a specific lead magnet CTA when the article brief calls for a different position.

Category pages receive the best-fit contextual offer above the article listing.

## Subscriber segmentation

Signup records include:

- email
- optional first name
- original and latest signup source
- primary interest
- all hierarchical interests
- lead magnet requested
- latest article/category context
- UTM source/medium/campaign/content/term
- consent time and consent version

A Teen subscriber receives `teen-birthdays`, `birthday-parties`, and `general` tags. This allows precise campaigns plus broader Birthday campaigns without maintaining duplicate lists.

If a reader later requests a more specific lead magnet, the specific welcome sequence replaces an active ancestor sequence so they do not receive overlapping generic + specific nurture flows.

## Welcome sequences

Two seeded sequences are active:

- `birthday-party-welcome`
- `teen-birthday-welcome`

The free resource delivery is immediate. Nurture emails begin later according to `email_sequence_steps.delay_hours`.

Editors can pause/resume sequences at:

`/studio/audience`

The page also shows interest counts, lead magnet signups, active enrollments and links to each resource.

## Delivery scheduler

Netlify is configured with an hourly Scheduled Function:

`netlify/functions/email-sequences.mts`

It processes a bounded batch of due sequence steps. A protected Next.js dispatch endpoint also exists at:

`POST /api/cron/email-sequences`

using `Authorization: Bearer $EMAIL_CRON_SECRET` for manual/external scheduling. The local/deployed helper is:

```bash
npm run email:dispatch
```

## Preference + unsubscribe model

Audience emails include:

- a signed preferences link
- `List-Unsubscribe`
- `List-Unsubscribe-Post: List-Unsubscribe=One-Click`

Preferences live at:

`/email/preferences?token=...`

One-click email-client unsubscribes use:

`/email/unsubscribe?token=...`

Preference tokens are HMAC-signed and deliberately do not expire, because old marketing emails must retain a functional opt-out path. The token authorizes audience preference changes only; it is not an account/session token.

Unsubscribing:

- sets the newsletter subscriber to `unsubscribed`
- records `unsubscribed_at`
- cancels active nurture enrollments

A reader can rejoin later through a normal signup form.

## Consent

Every public email form requires explicit checkbox consent. The stored `consent_at` and `consent_version` provide an auditable record of the signup state. The wording discloses both the requested resource and relevant Curated Pin email follow-up.

## Resend

Priority 6 continues to use the existing server-only `RESEND_API_KEY` + `MAIL_FROM`. Lead-magnet delivery does not expose any provider key to browser code.

If email delivery is temporarily unavailable, the thank-you page still gives immediate access to the browser-printable resource, so the reader is not blocked by provider failure.

## Studio

New page:

`/studio/audience`

Editors/admins can see:

- subscribed / unsubscribed counts
- topic segment counts
- lead magnet signup counts
- sequence status
- active sequence enrollments
- direct links to landing/printable resources
- audience CSV export

## New environment variables

```text
EMAIL_PREFERENCE_SECRET=<32+ random characters>
EMAIL_CRON_SECRET=<32+ different random characters>
```

Both are server-only.

## Setup

```bash
npm ci
npm run setup:priority6
npm run env:check
npm test
npm run check
npm run dev
```

`setup:priority6` applies migrations, reseeds the Birthday SEO map, seeds the audience system and reruns the internal PageRank simulation.

## Before public launch

1. Verify the sending domain in the chosen email provider.
2. Set `RESEND_API_KEY` and a branded `MAIL_FROM` address.
3. Set the two new email secrets.
4. Run `npm run setup:priority6` against Neon.
5. Test each free-resource form with a real inbox.
6. Test `/email/preferences` from the received email.
7. Test one-click unsubscribe on a non-production test address.
8. Verify the hourly Netlify Scheduled Function appears in the deploy dashboard.
9. Keep the two lead-magnet landing pages noindex until their target keywords are researched against existing silo pages.
10. Replace the browser printable with an art-directed branded PDF later if desired; do not delay launch solely for that design upgrade.
