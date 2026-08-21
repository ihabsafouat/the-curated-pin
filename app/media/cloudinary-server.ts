// Server-only module: import this file only from route handlers/server code. Never import it from a client component.
import { createHash, timingSafeEqual } from "node:crypto";
import { getRuntimeValue, type RuntimeEnvKey } from "../runtime-env";

function required(name: RuntimeEnvKey): string {
  const value = String(getRuntimeValue(name) ?? "").trim();
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

export function cloudinaryConfig() {
  return {
    cloudName: required("CLOUDINARY_CLOUD_NAME"),
    apiKey: required("CLOUDINARY_API_KEY"),
    apiSecret: required("CLOUDINARY_API_SECRET"),
    uploadPreset: required("CLOUDINARY_UPLOAD_PRESET"),
  };
}

function serialize(params: Record<string, string | number | boolean>): string {
  return Object.entries(params)
    .filter(([, value]) => value !== "" && value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join("&");
}

export function signCloudinaryParams(params: Record<string, string | number | boolean>): string {
  const { apiSecret } = cloudinaryConfig();
  return createHash("sha1").update(`${serialize(params)}${apiSecret}`).digest("hex");
}

export function verifyCloudinaryResponse(publicId: string, version: number, signature: string): boolean {
  if (!signature || signature.length !== 40) return false;
  const { apiSecret } = cloudinaryConfig();
  const expected = createHash("sha1").update(`public_id=${publicId}&version=${version}${apiSecret}`).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"));
  } catch {
    return false;
  }
}

export function cloudinaryUploadEndpoint() {
  const { cloudName } = cloudinaryConfig();
  return `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`;
}

export function isExpectedCloudinarySecureUrl(value: string, publicId: string, version: number): boolean {
  try {
    const { cloudName } = cloudinaryConfig();
    const url = new URL(value);
    const prefix = `/${cloudName}/image/upload/`;
    if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com" || !url.pathname.startsWith(prefix)) return false;
    const segments = url.pathname.slice(prefix.length).split("/");
    const versionIndex = segments.findIndex((segment) => segment === `v${version}`);
    if (versionIndex < 0) return false;
    const deliveredAsset = segments.slice(versionIndex + 1).join("/");
    const dot = deliveredAsset.lastIndexOf(".");
    return dot > 0 && deliveredAsset.slice(0, dot) === publicId;
  } catch {
    return false;
  }
}

export async function destroyCloudinaryPublicId(publicId: string): Promise<void> {
  if (!publicId) return;
  const config = cloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { invalidate: true, public_id: publicId, timestamp };
  const body = new URLSearchParams({
    public_id: publicId,
    invalidate: "true",
    timestamp: String(timestamp),
    api_key: config.apiKey,
    signature: signCloudinaryParams(params),
  });
  await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/destroy`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  }).catch(() => undefined);
}
