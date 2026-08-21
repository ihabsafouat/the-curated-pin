# Priority 5 — Experience, Analytics & Security Hardening

Priority 5 deliberately combines the V2 interface pass with the security/measurement controls needed before public growth. The goal is a premium editorial experience without turning an SEO-first publication into a JavaScript demo.

## Design decisions

- **Typography:** Inter for interface/body copy + Playfair Display for editorial headlines. Tempting was not embedded because its commonly distributed demo is personal-use only and a separate webfont license is required. Times New Roman MT was rejected as a primary display face because it is not a dependable webfont stack and reads more like a document default than a distinct publication identity. If a licensed Tempting webfont is purchased later, it can be added as a restrained accent without changing the body/display system.
- **Motion:** Anime.js + Lenis only. Three.js is intentionally excluded: no 3D/WebGL experience is needed to help readers plan parties, and it would add bundle/GPU cost. Motion/Kokonut UI/React Bits are also not installed because a second animation runtime would duplicate responsibilities. Add a third-party UI component only when it solves a concrete accessibility/interaction problem.
- **Dark mode:** reader-controlled theme stored locally, with system preference as the first default.
- **Motion accessibility:** smooth scrolling and reveal animation are disabled when `prefers-reduced-motion` is set.

## Experience additions

- sticky editorial header
- dark/light theme toggle
- reading/scroll progress bar
- back-to-top control
- floating contact shortcut
- richer hover/focus states
- global, article and category loading skeletons
- password visibility controls
- explicit form loading/success/error states
- custom confirmation dialog for destructive article deletion
- expandable FAQ retained
- visible article `Updated` date retained
- moderated reader feedback/review collection

## Analytics

- GA4 remains consent-gated.
- Microsoft Clarity heatmaps/session behavior is also consent-gated.
- Basic consent posture: analytics scripts are not loaded until the visitor accepts analytics.
- Advertising storage, advertising user data and ad personalization are kept denied in the GA consent calls.
- first-party analytics capture UTM source, medium, campaign, content and term.

Environment variables:

```env
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_CLARITY_ID=
```

## Reader feedback / reviews

Published article pages can collect:

- useful / needs-improvement vote
- optional 1–5 rating
- optional note
- optional display name
- explicit publication consent

Feedback starts `pending`. Editors moderate it in `/studio/feedback`. A note without publication consent cannot be approved for public use. Priority 5 does not auto-publish testimonials.

## Authentication hardening

Implemented:

- generic login errors
- generic forgot-password response
- generic registration response for new/existing emails
- IP and per-account password-reset rate limits
- 30-minute, one-time password-reset tokens stored as SHA-256 hashes
- login throttling and a 15-minute lock after 7 failed attempts in a 30-minute window
- password changes increment `token_version` and revoke all refresh sessions
- password reset also revokes sessions
- secure, HttpOnly, SameSite cookies for access/refresh tokens
- separate CSRF token cookie + origin checking on state-changing requests
- PBKDF2-SHA-256 password hashes with unique random salts and 600,000 iterations

Passwords are **hashed, not encrypted**. Reversible password encryption is intentionally not used.

## Bot protection

Cloudflare Turnstile is used on login, registration, newsletter signup, password-reset requests/resets and reader feedback. Validation happens server-side through Siteverify. In production, missing Turnstile configuration fails closed and `env:check` reports the missing configuration.

## Request/XSS/input posture

- state-changing requests validate same-origin/same-site signals
- JSON/form bodies go through size-capped readers
- public free-text feedback, names, newsletter sources and campaign text are normalized before storage
- article blocks do not accept raw HTML
- external URLs are limited to HTTP(S); internal-link blocks require a same-site path
- React escaping is kept as the main HTML-output boundary
- JSON-LD is serialized with `<` escaped before the one intentional `dangerouslySetInnerHTML` use
- CSP, frame protection, MIME-sniff prevention, referrer policy and permissions policy remain enabled
- APIs do not opt into cross-origin CORS; browser clients use the same origin

## HSTS

Production keeps:

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

`preload` is intentionally not added yet. It should only be enabled after every current and future subdomain is guaranteed to stay on HTTPS.

## Publisher route

The visible publisher workspace moved from the default `/admin` route to `/studio`. APIs remain under `/api/admin/*`; obscuring API names is not treated as a security boundary—the real controls are authentication, RBAC, CSRF, origin checks, rate limits and audit logging.

Admin-only security events can be reviewed at:

```text
/studio/security
```

## Database permissions and RLS

- `scripts/provision-app-role.mjs` provisions a non-superuser runtime database role with only connection/schema/CRUD/sequence privileges.
- migrations should continue using a separate privileged migration URL.
- `saved_articles` now has forced PostgreSQL Row Level Security. Application queries set a transaction-local `app.user_id` before reads/writes.
- RLS is not blindly applied to every table: editorial/admin tables are server-owned resources governed by application RBAC, while the reader-owned saves table benefits from a direct database ownership boundary.

## Deliberately not added

### Three.js
No 3D product or visualization requirement justifies WebGL cost for this publication.

### Client-side API keys for server actions
A key shipped to browser JavaScript is not a secret. Browser actions use session authentication + CSRF. Future server-to-server keys must stay in server-only environment variables.

### Proxy microservice layer
Next.js route handlers already provide a same-origin server layer. A separate proxy/backend would add CORS, auth and deployment complexity without solving a current problem.

### Upload endpoint / MIME whitelist
The CMS currently stores image URLs; it does not accept arbitrary file bytes. Adding an upload route only to say it is “secured” would create a new attack surface. Priority 9 will add media management with MIME sniffing, extension/type allowlists, byte/pixel limits, metadata stripping and image optimization at the actual upload boundary.

### AI prompt-injection filters
There is no AI endpoint in the product, so there is currently no prompt-injection attack surface. `AI_FEATURES_ENABLED=false` and `AI_DAILY_REQUEST_LIMIT=0` remain the default. Any future AI feature must ship with a dedicated threat model, server-only provider key, prompt/request caps, per-user daily quotas, retrieval/input isolation and escaped/validated output.

### Directory-listing controls
Next.js/Netlify does not expose an Apache-style directory index. Only explicit routes and public assets are served.

### Motion / Kokonut UI / React Bits / Podium stack
Not installed just for decoration. The current experience uses one motion runtime. A component can be brought in later if it solves a specific product requirement and passes accessibility/performance review.

## Images

Priority 5 does not introduce a new upload pipeline. Existing below-the-fold rich images are lazy-decoded and Priority 4 provides image metadata/SEO. Full compression, AVIF/WebP generation, upload validation and responsive media management remain Priority 9 because they belong at the media ingestion boundary.

## Setup

```bash
npm ci
npm run setup:priority5
npm run env:check
npm run db:provision-app-role   # run with the privileged DB URL + app-role password
npm run check
npm run dev
```

Before production set Turnstile + Resend variables as well as the existing database/JWT/rate-limit/origin settings. GA4 and Clarity are optional until you create their projects.
