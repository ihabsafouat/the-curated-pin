# Security notes

The Curated Pin uses layered controls rather than treating any single framework feature as a security boundary.

## Authentication

- passwords are one-way PBKDF2-SHA-256 hashes with a unique random salt and 600,000 iterations
- signed access + rotating refresh sessions are held in HttpOnly cookies (`Secure` in production, `SameSite=Lax`)
- public registration creates only the `reader` role
- roles are `reader`, `author`, `editor`, `admin`; privileged changes revoke previous sessions
- password changes/resets increment `token_version` and revoke all refresh sessions
- reset tokens are cryptographically random, stored only as SHA-256 hashes, single-use and expire after 30 minutes
- login errors and password-recovery responses are generic to reduce user enumeration
- failed logins are throttled and accounts temporarily lock after repeated failures

## Request protections

- state-changing browser requests require safe same-origin/same-site signals
- authenticated JSON mutations use a double-submit CSRF token
- body readers enforce byte caps before parsing
- public inputs are schema validated; untrusted free text is normalized before storage
- URLs are constrained to same-site paths or HTTP(S), depending on field intent
- database calls use parameters rather than interpolated user data
- no broad CORS policy is enabled
- no raw HTML article block exists

## Bot and abuse controls

Cloudflare Turnstile is validated server-side for public high-abuse forms. Database-backed rate limits cover login, registration, newsletter, password recovery, reader feedback and privileged writes. Production fails closed if Turnstile is missing.

## Browser security headers

Production config includes CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, strict referrer policy, restricted permissions, COOP and CORP. HSTS preload is intentionally deferred until all subdomains can permanently guarantee HTTPS.

## Database

Use the pooled `DATABASE_URL` with a restricted runtime role. Use `DATABASE_MIGRATION_URL`/`DATABASE_ADMIN_URL` only for migrations/provisioning. `saved_articles` uses forced PostgreSQL Row Level Security with a transaction-local reader identity. Do not give the runtime role ownership/superuser/DDL permissions.

## Audit trail

Authentication failures, account locks, password events, registrations, role changes, taxonomy/article mutations and feedback moderation generate audit records. Admins can review them at `/studio/security`. IP addresses used for security/rate limiting are represented as keyed hashes rather than stored directly.

## Secrets

Never expose `JWT_SECRET`, `RATE_LIMIT_SECRET`, DB passwords, `TURNSTILE_SECRET_KEY` or `RESEND_API_KEY` to `NEXT_PUBLIC_*`. Browser API keys do not protect server actions; sessions + CSRF do.

## Files and AI

There is currently no arbitrary file-upload endpoint and no AI endpoint. This is intentional: do not add upload/prompt surfaces before their validation, quota and threat-model controls are designed. See `PRIORITY_5.md`.

## Audience/email security (Priority 6)

Newsletter and lead-magnet forms require explicit consent, Turnstile verification, input validation, request-size limits and durable rate limiting. Audience segmentation is derived from active server-side interest/lead-magnet records rather than trusting arbitrary client tags.

Email-preference links are HMAC-signed with `EMAIL_PREFERENCE_SECRET`. They authorize newsletter preference/unsubscribe actions only and are not authentication tokens. They intentionally remain valid so old emails retain a working opt-out route. One-click unsubscribe cancels active nurture enrollments.

Sequence dispatch is bounded. Netlify's scheduled function invokes the server-side dispatcher directly; the optional HTTP dispatcher requires a separate `EMAIL_CRON_SECRET`. Resend keys and cron/preference secrets are never exposed through `NEXT_PUBLIC_*` variables.

## Priority 7 analytics and commerce integrity

- Public analytics requests are same-origin, schema validated, body-size capped and rate limited.
- Event IDs are UUIDs with a unique index so retrying `sendBeacon` does not intentionally double count the same event.
- `newsletter_signup` and `email_click` are server-only event types; the public `/api/track` endpoint rejects them.
- Email CTA tracking uses an HMAC-signed same-site target and cannot be used as an arbitrary open redirect.
- Browser analytics never sends email addresses or subscriber IDs to GA4.
- Persistent cross-page analytics session attribution is created only after analytics consent and is kept in `sessionStorage`.
- Confirmed purchase records are accepted only through the server-to-server conversion adapter protected by `CONVERSION_WEBHOOK_SECRET`.
- Conversion provider event IDs are unique so webhook retries are idempotent.
- The conversion adapter stores product/revenue/attribution metadata but does not require buyer email or other payment-card data.


## Editorial media uploads

Priority 9 does not accept arbitrary public file uploads. Media upload authorization requires an authenticated publisher role, safe origin, CSRF token and rate-limit allowance. The browser uploads the binary directly to Cloudinary using server-signed parameters; `CLOUDINARY_API_SECRET` remains server-only. The completion endpoint independently verifies the Cloudinary response signature and expected account URL, then enforces provider-confirmed format, bytes, dimensions and pixel-count limits before the asset is registered. Rejected uploads are scheduled for provider deletion.

Allowed editorial formats are JPEG, PNG, WebP and AVIF with a 10 MB application cap. Provider public IDs are generated rather than trusted from user filenames. Routine Studio actions archive media instead of destructively deleting provider objects so old published references cannot be broken accidentally. Credit and license notes are retained for provenance.

### Priority 9 upload authorization binding

Each publisher image upload is bound to a short-lived PostgreSQL authorization row before the browser is allowed to upload. The server generates the Cloudinary public ID, signs only that ID, stores the publisher ID, declared MIME/size, filename, and expiry, and refuses completion from another account or a consumed authorization. Cleanup is never triggered from an arbitrary client asset identifier: the server only removes an invalid/expired provider object after Cloudinary's signed response and exact delivery URL prove that it is the image created by that stored authorization.

## Priority 10 operational security

Production exposes minimal liveness/readiness endpoints without secrets or stack traces. Expired security artifacts are cleaned daily. PostgreSQL queries have bounded connection/query/statement timeouts. Production deploys should run the static audit and post-deploy smoke test documented in `PRIORITY_10.md`. The runtime database role remains separate from migration/admin credentials.
