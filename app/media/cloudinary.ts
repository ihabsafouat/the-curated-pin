const CLOUDINARY_HOST = "res.cloudinary.com";
const UPLOAD_MARKER = "/image/upload/";

export const MEDIA_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
export const MEDIA_MAX_WIDTH = 6000;
export const MEDIA_MAX_HEIGHT = 6000;
export const MEDIA_MAX_PIXELS = 36_000_000;
export const MEDIA_ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const MEDIA_ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp", "avif"] as const;

export type MediaVariant = "content" | "hero" | "card" | "social" | "pinterest" | "thumb";

const transforms: Record<MediaVariant, string> = {
  content: "c_limit,w_1600/f_auto/q_auto:good",
  hero: "c_fill,g_auto,w_1600,h_900/f_auto/q_auto:good",
  card: "c_fill,g_auto,w_800,h_600/f_auto/q_auto:good",
  social: "c_fill,g_auto,w_1200,h_630/f_jpg/q_auto:good",
  pinterest: "c_fill,g_auto,w_1000,h_1500/f_jpg/q_auto:good",
  thumb: "c_fill,g_auto,w_360,h_270/f_auto/q_auto:eco",
};

const responsiveWidths: Partial<Record<MediaVariant | "original", number[]>> = {
  original: [320, 480, 640, 800, 1200, 1600],
  content: [320, 480, 640, 800, 1200, 1600],
  hero: [480, 720, 960, 1200, 1600],
  card: [240, 360, 480, 640, 800],
  pinterest: [360, 600, 800, 1000],
  thumb: [120, 180, 240, 360],
};

export const mediaVariantDimensions: Partial<Record<MediaVariant, { width: number; height: number }>> = {
  hero: { width: 1600, height: 900 },
  card: { width: 800, height: 600 },
  social: { width: 1200, height: 630 },
  pinterest: { width: 1000, height: 1500 },
  thumb: { width: 360, height: 270 },
};

type CloudinaryParts = { before: string; assetPath: string };

export function isCloudinaryImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === CLOUDINARY_HOST && url.pathname.includes(UPLOAD_MARKER);
  } catch {
    return false;
  }
}

/**
 * Returns the immutable asset portion of a Cloudinary delivery URL.
 * If the URL already contains one of our transformations, strip it back to the
 * versioned asset path before applying the requested variant. This prevents
 * chained duplicate crops when a social/Pinterest derivative is re-used.
 */
function cloudinaryParts(value: string): CloudinaryParts | null {
  if (!isCloudinaryImageUrl(value)) return null;
  const markerIndex = value.indexOf(UPLOAD_MARKER);
  if (markerIndex < 0) return null;
  const before = value.slice(0, markerIndex);
  const after = value.slice(markerIndex + UPLOAD_MARKER.length);
  const segments = after.split("/");
  const versionIndex = segments.findIndex((segment) => /^v\d+$/.test(segment));
  const assetPath = versionIndex >= 0 ? segments.slice(versionIndex).join("/") : after;
  return { before, assetPath };
}

function transformed(value: string, transform: string): string {
  const parts = cloudinaryParts(value);
  if (!parts) return value;
  return `${parts.before}${UPLOAD_MARKER}${transform}/${parts.assetPath}`;
}

export function cloudinaryVariantUrl(value: string, variant: MediaVariant): string {
  return transformed(value, transforms[variant]);
}

export function cloudinaryWidthUrl(value: string, width: number): string {
  const safeWidth = Math.max(160, Math.min(2400, Math.trunc(width)));
  return transformed(value, `c_limit,w_${safeWidth}/f_auto/q_auto:good`);
}

function fixedCropUrl(value: string, variant: "hero" | "card" | "pinterest" | "thumb", width: number): string {
  const ratio = mediaVariantDimensions[variant]!;
  const safeWidth = Math.max(120, Math.min(ratio.width, Math.trunc(width)));
  const height = Math.max(1, Math.round(safeWidth * ratio.height / ratio.width));
  const quality = variant === "thumb" ? "q_auto:eco" : "q_auto:good";
  return transformed(value, `c_fill,g_auto,w_${safeWidth},h_${height}/f_auto/${quality}`);
}

export function cloudinarySrcSet(value: string, variant: MediaVariant | "original" = "content"): string | undefined {
  if (!isCloudinaryImageUrl(value)) return undefined;
  const widths = responsiveWidths[variant];
  if (!widths) return undefined;
  return widths.map((width) => {
    const url = variant === "hero" || variant === "card" || variant === "pinterest" || variant === "thumb"
      ? fixedCropUrl(value, variant, width)
      : cloudinaryWidthUrl(value, width);
    return `${url} ${width}w`;
  }).join(", ");
}

export function mediaVariantUrls(value: string) {
  return {
    original: value,
    content: cloudinaryVariantUrl(value, "content"),
    hero: cloudinaryVariantUrl(value, "hero"),
    card: cloudinaryVariantUrl(value, "card"),
    social: cloudinaryVariantUrl(value, "social"),
    pinterest: cloudinaryVariantUrl(value, "pinterest"),
    thumb: cloudinaryVariantUrl(value, "thumb"),
  };
}
