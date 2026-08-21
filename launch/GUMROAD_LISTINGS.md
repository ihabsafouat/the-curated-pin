# Gumroad launch listings

The paid files are already included in `launch-assets/products/`. Upload only those source PDFs to Gumroad; do not move them into `public/`.

## Ultimate Birthday Party Planner

- Product file: `ultimate-birthday-party-planner.pdf`
- Suggested price: **$12**
- Checkout variable: `CHECKOUT_URL_ULTIMATE_BIRTHDAY_PARTY_PLANNER`
- Short description: A reusable 29-page printable workbook for planning the budget, guests, venue, menu, activities, decor, shopping, setup and party-day timeline.
- Gumroad summary: Turn scattered birthday ideas into one practical plan. This 29-page printable workbook keeps the guest count, budget and main activity visible while you organize invitations, food, games, shopping, setup and the day-of schedule. Use only the pages your celebration needs; print them or annotate the PDF on a tablet.
- Customer license: Personal use only. The customer may print or duplicate pages for their own household events. Resale, redistribution, public sharing and template-library uploads are not permitted.

Suggested bullets:

- Party snapshot and priorities
- Budget overview and detailed tracker
- Guest, RSVP and dietary tracker
- Venue, theme and decor planning
- Menu, quantities and dessert sheets
- Games and activity planner
- Shopping, setup and day-of checklists
- Party timeline, photos, gifts and thank-yous

## Teen Birthday Planner + Games Pack

- Product file: `teen-birthday-party-planner-games-pack.pdf`
- Suggested price: **$14**
- Checkout variable: `CHECKOUT_URL_TEEN_BIRTHDAY_PARTY_PLANNER`
- Short description: A 27-page teen-party planning workbook with activity selectors, low-pressure games, photo prompts, challenges and score sheets.
- Gumroad summary: Plan a teen birthday around one strong activity, flexible social time and food that is easy to serve. This 27-page printable pack includes the planning sheets plus optional original games and photo challenges for arrivals, downtime and groups that want more structure—without forcing every guest to participate.
- Customer license: Personal use only. The customer may print or duplicate pages for their own household events. Resale, redistribution, public sharing and template-library uploads are not permitted.

Suggested bullets:

- Teen party snapshot and vibe selector
- Guest, budget and anchor-activity planning
- Movie, sleepover, spa and backyard worksheets
- Food, playlist and timeline planners
- Photo scavenger hunt and photo prompts
- This-or-That and Would-You-Rather sheets
- Mini-tournament scoreboard and one-minute challenge planner
- Conversation cards and optional group games

## After each product is live

Copy the public Gumroad checkout URL into the matching Netlify environment variable, redeploy, and open the matching `/shop/<slug>` page. The purchase button remains disabled until that server-side URL is configured.
