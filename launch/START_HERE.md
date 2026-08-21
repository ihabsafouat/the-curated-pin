# The Curated Pin: premium launch checklist

## 1. Resend without a custom domain

In Netlify, open **Site configuration → Environment variables** and add:

```text
RESEND_API_KEY=your_existing_resend_api_key
MAIL_FROM=The Curated Pin <onboarding@resend.dev>
MAIL_REPLY_TO=the-curated-pin@gmail.com
```

Enter the value without quotation marks. Your Gmail address can receive replies, but it cannot be used as the sending address unless you control and verify the sending domain.

**Important:** Resend's `onboarding@resend.dev` address is for testing only. It can send only to the email address associated with your Resend account. Public password-reset emails, newsletters, and subscriber sequences require a custom domain verified in Resend. Do not advertise those features as live until you have verified a domain.

After adding the variables, redeploy the site and test using your own Resend-account email address.

## 2. Publish the two paid Gumroad products

Use `GUMROAD_LISTINGS.md` for the finished titles, summaries, descriptions, tags, pricing, licenses, and upload filenames.

| Product | Price | File | Netlify variable |
| --- | --- | --- | --- |
| Ultimate Birthday Party Planner | $12 | `ultimate-birthday-party-planner.pdf` | `CHECKOUT_URL_ULTIMATE_BIRTHDAY_PARTY_PLANNER` |
| The Teen Party Playbook + Games Pack | $14 | `teen-birthday-party-planner-games-pack.pdf` | `CHECKOUT_URL_TEEN_BIRTHDAY_PARTY_PLANNER` |

Upload each matching cover and PDF to its Gumroad product. After publishing, add the resulting Gumroad URL to the corresponding Netlify environment variable and redeploy.

The two additional free products are complete 10-page and 8-page downloads. They can remain free website lead magnets or optionally be listed on Gumroad for $0.

## 3. Import your 36 Pinterest Pins

The Pinterest package includes all 36 original PNG images and a ready-to-upload CSV. The CSV schedules three creative variants for each of your 12 birthday and party-games articles across six Pinterest boards.

1. Publish all 12 launch articles before the first scheduled Pin goes live.
2. Redeploy the updated website so the pin image files are available at their direct `/pinterest/...png` URLs.
3. Open one image URL from the CSV in a private browser window and confirm it loads without signing in.
4. In Pinterest Business, use the bulk Pin upload tool and upload the provided CSV.
5. Confirm that the listed boards exist and that the first scheduled dates still make sense.

The CSV itself is a downloadable file, not a website page. Pinterest requires every CSV **Media URL** to be publicly accessible. The supplied PNG images are also included separately, so you can upload them manually instead or host them on Cloudinary and replace the Media URLs before importing.

## 4. Final site checks

- Confirm `APP_ORIGIN=https://the-curated-pin.netlify.app`.
- Confirm `NEXT_PUBLIC_SITE_URL=https://the-curated-pin.netlify.app`.
- Confirm `DATABASE_URL` points to your pooled Neon PostgreSQL connection.
- Open both `/shop/...` pages and check that their matching cover images appear.
- Test both Gumroad buttons only after their checkout variables are configured.
- Download both free planners and confirm they contain 10 and 8 pages.
- Test owner-only Resend delivery with the email address used for your Resend account.
