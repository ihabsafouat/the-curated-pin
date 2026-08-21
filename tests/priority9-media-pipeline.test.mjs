import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=(path)=>fs.readFileSync(new URL(`../${path}`,import.meta.url),"utf8");
const migration=read("postgres/migrations/0009_media_library.sql");
const cloudinary=read("app/media/cloudinary.ts");
const cloudinaryServer=read("app/media/cloudinary-server.ts");
const signature=read("app/api/admin/media/signature/route.ts");
const complete=read("app/api/admin/media/complete/route.ts");
const update=read("app/api/admin/media/[id]/route.ts");
const mediaDb=read("db/media.ts");
const library=read("app/studio/media/page.tsx");
const upload=read("app/studio/components/MediaUploadPanel.tsx");
const picker=read("app/studio/components/MediaPickerField.tsx");
const gallery=read("app/studio/components/GalleryMediaField.tsx");
const articleForm=read("app/studio/components/ArticleForm.tsx");
const image=read("app/components/MediaImage.tsx");
const config=read("next.config.ts");
const env=read(".env.example");
const packageJson=JSON.parse(read("package.json"));


test("Priority 9 adds a first-party media catalog with provenance metadata",()=>{
  assert.match(migration,/CREATE TABLE IF NOT EXISTS media_upload_authorizations/);
  assert.match(migration,/CREATE TABLE IF NOT EXISTS media_assets/);
  assert.doesNotMatch(migration,/provider_asset_id/);
  assert.match(migration,/alt_text/);
  assert.match(migration,/credit/);
  assert.match(migration,/license_note/);
  assert.match(migration,/status IN \('active','archived'\)/);
  assert.match(mediaDb,/usageCount/);
  assert.match(mediaDb,/blocks_json::text/);
});

test("uploads are signed server-side and the Cloudinary API secret never becomes a client value",()=>{
  assert.match(cloudinaryServer,/signCloudinaryParams/);
  assert.match(cloudinaryServer,/apiSecret/);
  assert.match(signature,/roleAtLeast\(user, "author"\)/);
  assert.match(signature,/csrfMatches/);
  assert.match(signature,/requestHasSafeOrigin/);
  assert.match(signature,/MEDIA_ALLOWED_MIME/);
  assert.match(signature,/MEDIA_UPLOAD_MAX_BYTES/);
  assert.match(signature,/asset_folder: "the-curated-pin\/editorial"/);
  assert.match(signature,/public_id_prefix: "the-curated-pin\/editorial"/);
  assert.match(signature,/const generatedId = randomUUID\(\)/);
  assert.match(signature,/expectedPublicId/);
  assert.match(signature,/createMediaUploadAuthorization/);
  assert.match(signature,/overwrite: false/);
  assert.match(signature,/signature/);
  assert.doesNotMatch(signature,/apiSecret:/);
  assert.doesNotMatch(env,/NEXT_PUBLIC_CLOUDINARY_API_SECRET/);
});

test("provider completion is verified before an uploaded asset is registered",()=>{
  assert.match(complete,/verifyCloudinaryResponse/);
  assert.match(complete,/isExpectedCloudinarySecureUrl/);
  assert.match(complete,/MEDIA_ALLOWED_FORMATS/);
  assert.match(complete,/MEDIA_MAX_PIXELS/);
  assert.match(complete,/getMediaUploadAuthorization/);
  assert.match(complete,/consumeMediaUploadAuthorization/);
  assert.match(complete,/responseTrusted/);
  assert.match(complete,/destroyCloudinaryPublicId/);
  assert.match(cloudinaryServer,/image\/destroy/);
  assert.match(complete,/createMediaAsset/);
  assert.doesNotMatch(complete,/assetId/);
  assert.doesNotMatch(upload,/uploaded\.asset_id/);
});

test("media delivery uses responsive widths, automatic format and automatic quality",()=>{
  assert.match(cloudinary,/f_auto\/q_auto:good/);
  assert.match(cloudinary,/responsiveWidths/);
  assert.match(cloudinary,/cloudinarySrcSet/);
  assert.match(cloudinary,/1000,h_1500/);
  assert.match(cloudinary,/1200,h_630/);
  assert.match(cloudinary,/versionIndex/);
  assert.match(image,/srcSet/);
  assert.match(image,/mediaVariantDimensions/);
});

test("Studio has a searchable media library, secure uploader and non-destructive archival",()=>{
  assert.match(library,/MEDIA SYSTEM/);
  assert.match(library,/MediaUploadPanel/);
  assert.match(library,/usageCount/);
  assert.match(upload,/Uploading directly to the image CDN/);
  assert.match(upload,/fetch\(authorization\.uploadUrl/);
  assert.match(update,/media\.archived/);
  assert.match(update,/updateMediaAsset/);
  assert.doesNotMatch(update,/DELETE FROM media_assets/);
});

test("the CMS can choose verified assets for hero, social, rich image, gallery and Pinterest uses",()=>{
  assert.match(articleForm,/MediaPickerField/);
  assert.match(articleForm,/GalleryMediaField/);
  assert.match(articleForm,/mode="social"/);
  assert.match(articleForm,/mode="pinterest"/);
  assert.match(picker,/mediaVariantUrls/);
  assert.match(gallery,/Add from media library/);
  assert.match(gallery,/asset\.altText/);
});

test("Cloudinary direct upload is allowed by CSP and production configuration requires media secrets",()=>{
  assert.match(config,/https:\/\/api\.cloudinary\.com/);
  assert.match(env,/CLOUDINARY_CLOUD_NAME/);
  assert.match(env,/CLOUDINARY_API_KEY/);
  assert.match(env,/CLOUDINARY_API_SECRET/);
  assert.match(env,/CLOUDINARY_UPLOAD_PRESET/);
  assert.equal(packageJson.scripts["setup:priority9"],"npm run db:migrate && npm run seo:seed:birthday && npm run audience:seed && npm run seo:simulate");
});
