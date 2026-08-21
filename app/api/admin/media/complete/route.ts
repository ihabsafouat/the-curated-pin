import { consumeMediaUploadAuthorization, createMediaAsset, getMediaUploadAuthorization } from "../../../../../db/media";
import { writeAuditLog } from "../../../../../db/auth";
import { getCurrentUser, roleAtLeast } from "../../../../security/auth";
import { checkRateLimit, clientIpHash, rateLimitResponse } from "../../../../security/rate-limit";
import { csrfMatches, readJson, requestHasSafeOrigin } from "../../../../security/request";
import { sanitizePlainText } from "../../../../security/sanitize";
import { destroyCloudinaryPublicId, isExpectedCloudinarySecureUrl, verifyCloudinaryResponse } from "../../../../media/cloudinary-server";
import { MEDIA_ALLOWED_FORMATS, MEDIA_MAX_HEIGHT, MEDIA_MAX_PIXELS, MEDIA_MAX_WIDTH, MEDIA_UPLOAD_MAX_BYTES } from "../../../../media/cloudinary";

export async function POST(request: Request) {
  if (!requestHasSafeOrigin(request)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const rate = await checkRateLimit(request, "publisher:media-complete", 80, 60 * 60);
  if (!rate.allowed) return rateLimitResponse(rate);
  const user = await getCurrentUser();
  if (!user || !roleAtLeast(user, "author")) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const input = await readJson<Record<string, unknown>>(request, 48_000);
  if (!input || !await csrfMatches(input.csrf)) return Response.json({ error: "Invalid request" }, { status: 403 });

  const publicId = String(input.publicId ?? "").trim();
  const signature = String(input.signature ?? "").trim();
  const secureUrl = String(input.secureUrl ?? "").trim();
  const format = String(input.format ?? "").toLowerCase();
  const version = Number(input.version ?? 0);
  const bytes = Number(input.bytes ?? 0);
  const width = Number(input.width ?? 0);
  const height = Number(input.height ?? 0);
  const altText = sanitizePlainText(String(input.altText ?? ""), 320);

  if (!publicId.startsWith("the-curated-pin/editorial/")) {
    return Response.json({ error: "Invalid media authorization." }, { status: 400 });
  }

  const authorization = await getMediaUploadAuthorization(publicId, user.id);
  if (!authorization) return Response.json({ error: "This upload was not authorized for your account." }, { status: 400 });
  if (authorization.consumedAt) return Response.json({ error: "This upload authorization has already been used." }, { status: 409 });

  const responseTrusted = Number.isInteger(version) && version > 0
    && verifyCloudinaryResponse(publicId, version, signature)
    && isExpectedCloudinarySecureUrl(secureUrl, publicId, version);

  // Never delete a provider asset based on untrusted client metadata. Cleanup is only
  // allowed after the provider signature + exact delivery URL prove this is the asset
  // created by the short-lived authorization stored for this publisher.
  if (!responseTrusted) {
    await writeAuditLog({
      actorUserId: user.id,
      action: "media.upload.untrusted_response",
      targetType: "media",
      targetId: publicId.slice(0, 120),
      metadata: { format, bytes, width, height },
      ipHash: await clientIpHash(request),
    });
    return Response.json({ error: "The media provider response could not be verified." }, { status: 400 });
  }

  const expired = Date.now() > new Date(authorization.expiresAt).getTime();
  const validMetadata = MEDIA_ALLOWED_FORMATS.includes(format as (typeof MEDIA_ALLOWED_FORMATS)[number])
    && Number.isFinite(bytes) && bytes > 0 && bytes <= MEDIA_UPLOAD_MAX_BYTES
    && Number.isInteger(width) && Number.isInteger(height)
    && width > 0 && height > 0 && width <= MEDIA_MAX_WIDTH && height <= MEDIA_MAX_HEIGHT
    && width * height <= MEDIA_MAX_PIXELS
    && altText.length >= 2;

  if (expired || !validMetadata) {
    await destroyCloudinaryPublicId(publicId);
    await consumeMediaUploadAuthorization(publicId, user.id);
    await writeAuditLog({
      actorUserId: user.id,
      action: expired ? "media.upload.expired" : "media.upload.rejected",
      targetType: "media",
      targetId: publicId.slice(0, 120),
      metadata: { format, bytes, width, height },
      ipHash: await clientIpHash(request),
    });
    return Response.json({ error: expired ? "The upload authorization expired. Please upload the image again." : "The uploaded image failed validation and was removed." }, { status: 400 });
  }

  try {
    const asset = await createMediaAsset({
      id: crypto.randomUUID(),
      publicId,
      version,
      secureUrl,
      format,
      bytes,
      width,
      height,
      originalFilename: authorization.originalFilename,
      altText,
      uploadedBy: user.id,
      tags: ["editorial"],
    });
    await consumeMediaUploadAuthorization(publicId, user.id);
    await writeAuditLog({
      actorUserId: user.id,
      action: "media.upload.completed",
      targetType: "media",
      targetId: asset.id,
      metadata: { publicId, format, bytes, width, height },
      ipHash: await clientIpHash(request),
    });
    return Response.json({ asset }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "This media asset is already registered or could not be saved." }, { status: 409 });
  }
}
