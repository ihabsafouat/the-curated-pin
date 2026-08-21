import { randomUUID } from "node:crypto";
import { createMediaUploadAuthorization } from "../../../../../db/media";
import { writeAuditLog } from "../../../../../db/auth";
import { getCurrentUser, roleAtLeast } from "../../../../security/auth";
import { checkRateLimit, clientIpHash, rateLimitResponse } from "../../../../security/rate-limit";
import { csrfMatches, readJson, requestHasSafeOrigin } from "../../../../security/request";
import { sanitizePlainText } from "../../../../security/sanitize";
import { cloudinaryConfig, cloudinaryUploadEndpoint, signCloudinaryParams } from "../../../../media/cloudinary-server";
import { MEDIA_ALLOWED_MIME, MEDIA_UPLOAD_MAX_BYTES } from "../../../../media/cloudinary";

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "avif"]);
const UPLOAD_AUTHORIZATION_TTL_MS = 15 * 60 * 1000;

function extensionOf(filename: string) {
  const last = filename.toLowerCase().split(".").pop() ?? "";
  return last.replace(/[^a-z0-9]/g, "");
}

export async function POST(request: Request) {
  if (!requestHasSafeOrigin(request)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const rate = await checkRateLimit(request, "publisher:media-signature", 80, 60 * 60);
  if (!rate.allowed) return rateLimitResponse(rate);
  const user = await getCurrentUser();
  if (!user || !roleAtLeast(user, "author")) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const input = await readJson<{ csrf?: string; filename?: string; mime?: string; bytes?: number }>(request, 12_000);
  if (!input || !await csrfMatches(input.csrf)) return Response.json({ error: "Invalid request" }, { status: 403 });

  const filename = sanitizePlainText(String(input.filename ?? ""), 240);
  const mime = String(input.mime ?? "").toLowerCase();
  const bytes = Number(input.bytes ?? 0);
  if (!filename || !MEDIA_ALLOWED_MIME.includes(mime as (typeof MEDIA_ALLOWED_MIME)[number])) {
    return Response.json({ error: "Only JPEG, PNG, WebP and AVIF images are allowed." }, { status: 415 });
  }
  if (!ALLOWED_EXTENSIONS.has(extensionOf(filename))) return Response.json({ error: "The file extension is not allowed." }, { status: 415 });
  if (!Number.isFinite(bytes) || bytes < 1 || bytes > MEDIA_UPLOAD_MAX_BYTES) {
    return Response.json({ error: "Images must be 10 MB or smaller." }, { status: 413 });
  }

  try {
    const config = cloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000);
    const generatedId = randomUUID();
    const expectedPublicId = `the-curated-pin/editorial/${generatedId}`;
    const params = {
      allowed_formats: "jpg,jpeg,png,webp,avif",
      asset_folder: "the-curated-pin/editorial",
      public_id_prefix: "the-curated-pin/editorial",
      overwrite: false,
      public_id: generatedId,
      tags: "tcp-editorial",
      timestamp,
      transformation: "c_limit,w_6000,h_6000",
      unique_filename: false,
      upload_preset: config.uploadPreset,
      use_filename: false,
    };
    const signature = signCloudinaryParams(params);

    await createMediaUploadAuthorization({
      publicId: expectedPublicId,
      userId: user.id,
      originalFilename: filename,
      declaredMime: mime,
      declaredBytes: bytes,
      expiresAt: new Date(Date.now() + UPLOAD_AUTHORIZATION_TTL_MS),
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: "media.upload.authorized",
      targetType: "media",
      targetId: expectedPublicId,
      metadata: { filename, mime, bytes, expiresInSeconds: UPLOAD_AUTHORIZATION_TTL_MS / 1000 },
      ipHash: await clientIpHash(request),
    });
    return Response.json({
      uploadUrl: cloudinaryUploadEndpoint(),
      apiKey: config.apiKey,
      signature,
      params,
      maxBytes: MEDIA_UPLOAD_MAX_BYTES,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "Media storage is not configured or the upload could not be authorized." }, { status: 503 });
  }
}
