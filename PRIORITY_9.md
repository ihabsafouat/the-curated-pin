# Priority 9 — Editorial media and image delivery

Priority 9 replaces arbitrary image URLs as the primary editorial workflow with a controlled media library built for an image-heavy Pinterest publication.

## Architecture

```text
Publisher Studio
      ↓
POST /api/admin/media/signature
(session + RBAC + CSRF + same-origin + rate limit)
      ↓
short-lived signed Cloudinary upload request
      ↓
Browser ───────────────→ Cloudinary Upload API
   (binary never passes through the Next.js / Netlify function)
      ↓
Cloudinary response
      ↓
POST /api/admin/media/complete
      ↓
verify provider response signature + URL + format + bytes + dimensions
      ↓
media_assets in PostgreSQL
      ↓
CMS media picker
      ↓
responsive Cloudinary delivery variants
```

The direct-upload shape is intentional. The application server authorizes the upload but does not receive the image bytes. This avoids making a serverless function an image proxy and keeps the Cloudinary API secret server-only.

## Upload policy

Editorial upload is available only to authenticated `author`, `editor`, and `admin` roles.

Accepted source formats:

- JPEG
- PNG
- WebP
- AVIF

Application limits:

- maximum declared/final stored size: 10 MB
- normalized maximum dimensions: 6000 × 6000
- final maximum pixel count: 36 MP
- media is stored under the `the-curated-pin/editorial` asset folder/public-ID prefix
- each authorization signs one server-generated UUID public ID, limiting replay after a successful upload
- overwriting existing public IDs is disabled
- original browser filenames are never trusted as public IDs

The browser performs a convenience MIME/size check, but it is not the security boundary. The completion endpoint validates the provider-confirmed format, size and dimensions and verifies the signed Cloudinary response before inserting the asset into PostgreSQL.

If the completion response fails validation, the application attempts to remove that just-uploaded provider asset.

## Cloudinary setup

Create one Cloudinary product environment and create a **signed** upload preset, for example:

```text
tcp_editorial_signed
```

Recommended preset guardrails:

- signing mode: **Signed**
- resource type: images through the image upload endpoint
- allowed formats: `jpg,jpeg,png,webp,avif`
- maximum file size: 10 MB
- do not enable an unsigned upload flow for this Studio uploader

The application signs the folder/public-ID prefix, overwrite behavior, file-format allowlist and incoming 6000×6000 limit for every authorization. Current Cloudinary dynamic-folder environments use `asset_folder` plus `public_id_prefix`; the integration deliberately avoids new use of the legacy `folder` parameter.

Add these server-side environment variables:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_PRESET=tcp_editorial_signed
```

`CLOUDINARY_API_SECRET` must never receive a `NEXT_PUBLIC_` prefix or be sent to browser code. The browser receives only the public API key, short-lived signature, signed upload parameters and upload endpoint.

## One master image, multiple delivery jobs

One registered master can be delivered as:

| Variant | Target | Delivery |
|---|---|---|
| Content | article body | max 1600px, responsive `srcset`, `f_auto`, `q_auto:good` |
| Hero | article/home hero | 16:9, up to 1600×900, responsive |
| Card | article/category card | 4:3, up to 800×600, responsive |
| Thumb | Studio/search thumbnail | 4:3, up to 360×270, responsive, more aggressive quality |
| Social | Open Graph/social | 1200×630 JPEG |
| Pinterest | Pinterest creative | 1000×1500 JPEG (2:3) |

For browser-rendered editorial images, the same original asset produces several width candidates and the browser selects from `srcset`/`sizes`. Cloudinary applies automatic delivery format and quality to web variants. Fixed hero/card/Pinterest components also receive intrinsic dimensions to reduce layout movement.

The URL helper strips our existing transformation back to the versioned master before applying another variant. This prevents a Pinterest or social derivative from accumulating duplicate crop transformations if it is later selected elsewhere in the CMS.


## Short-lived upload authorization

Before the browser receives a Cloudinary signature, the server generates a unique public ID and stores a 15-minute authorization in `media_upload_authorizations` with the publisher user ID, original filename, declared MIME type, and byte count. Completion must match that exact publisher + public ID and the authorization must still be unused.

The completion endpoint then verifies Cloudinary's response signature and exact `res.cloudinary.com/<cloud>/image/upload/.../v<version>/<public_id>.<format>` delivery URL. Only after that provider response is trusted may an expired/invalid upload be cleaned up by signed `public_id`. Client-supplied provider asset IDs are not trusted or stored.

## Media library

`/studio/media` now provides:

- secure direct upload
- active / archived views
- search by filename, alt text, caption, credit, tags or public ID
- dimensions, format and source byte size
- approximate article usage count
- editable alt text
- caption
- credit/source
- license/provenance note
- tags
- quick-copy original, social and Pinterest URLs

Archive is deliberately non-destructive. An image that has already been published may still be referenced by old article JSON or cached search/social content; deleting its provider object from a routine CMS action would create broken pages.

## CMS integration

The article editor can now choose verified media for:

- hero image
- Open Graph/social image
- category social image
- article image blocks
- idea-card images
- affiliate-product images
- first-party product images
- Pinterest assets
- galleries

Selecting a library asset carries its stored alt text into the block. The gallery picker also carries the stored caption and allows per-article editing/reordering.

External image URLs remain compatible for migrated/legacy articles, but new editorial work should use the media library so optimization, provenance and variants are consistent.

## Alt text and licensing

Alt text should describe what is visibly useful in the image, not repeat the target keyword mechanically. Decorative UI imagery should remain decorative rather than receiving keyword-filled text.

The library stores `credit` and `license_note` as editorial provenance. Only upload imagery The Curated Pin owns, commissioned, licensed, or otherwise has permission to publish. If a license requires visible attribution, put the required attribution in the article/gallery caption as well; storing a private license note alone does not satisfy a public-attribution requirement.

## Cropping workflow

`g_auto` is useful for automatic crops, but it is not an editorial substitute for reviewing important images. Before launch, manually preview the 16:9 hero, 1200×630 social and 1000×1500 Pinterest derivatives for every priority article. If a crop cuts off important text/subjects, use a better source composition or create a dedicated creative rather than forcing one photograph to do every job.

Pinterest graphics containing typography should usually be designed as Pinterest-specific creatives; the automatic 2:3 crop is a useful baseline, not a replacement for the Pin-design workflow.

## Database migration

Priority 9 adds:

```text
postgres/migrations/0009_media_library.sql
```

The `media_assets` table is a first-party catalog of provider IDs, URLs, source dimensions/size, editorial metadata, lifecycle status and uploader identity. Cloudinary remains the binary/CDN layer; PostgreSQL stores the editorial record, not image bytes.

## Setup

After configuring Neon and Cloudinary:

```bash
npm ci
npm run setup:priority9
npm run env:check
npm run check
npm run dev
```

Then visit:

```text
http://localhost:3000/studio/media
```

Upload a test JPEG/PNG, verify that the asset appears in the library, open a new article, choose it for hero/social/gallery/Pinterest fields, and inspect the browser Network panel to confirm responsive transformed URLs are being requested.

## Manual pre-launch QA

1. Upload valid JPEG, PNG, WebP and AVIF test images.
2. Confirm an unsupported file is rejected before upload authorization.
3. Confirm a file over 10 MB is rejected.
4. Confirm a reader account cannot request an upload signature.
5. Confirm a missing/invalid CSRF token cannot request a signature or register an asset.
6. Confirm Cloudinary API secret is absent from browser source/network responses.
7. Confirm hero/card/content images request appropriately sized transformed URLs on mobile and desktop.
8. Confirm social URL is 1200×630 and Pinterest URL is 1000×1500.
9. Confirm gallery selection preserves alt text and ordering.
10. Confirm archiving removes an asset from normal picker results without breaking existing published URLs.
11. Confirm credit/license metadata is recorded for third-party licensed assets.
12. Run Lighthouse/Core Web Vitals checks using real editorial images, not placeholders.

## Deferred intentionally

Priority 9 does **not** add public/user uploads, video hosting, AI image generation, automatic copyright detection, or destructive asset deletion. Each would add a materially different abuse/cost/legal surface and is unnecessary for the launch publication.
