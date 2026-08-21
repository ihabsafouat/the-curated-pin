import { execute, queryOne, queryRows } from "./client";

export type MediaAssetStatus = "active" | "archived";

export type MediaAsset = {
  id: string;
  provider: "cloudinary";
  publicId: string;
  version: number;
  secureUrl: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
  originalFilename: string;
  altText: string;
  caption: string;
  credit: string;
  licenseNote: string;
  tags: string[];
  status: MediaAssetStatus;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
};

type MediaRow = {
  id: string;
  provider: "cloudinary";
  public_id: string;
  version: number | string;
  secure_url: string;
  format: string;
  bytes: number | string;
  width: number | string;
  height: number | string;
  original_filename: string;
  alt_text: string;
  caption: string;
  credit: string;
  license_note: string;
  tags_json: string | string[];
  status: MediaAssetStatus;
  uploaded_by: string | null;
  created_at: string | Date;
  updated_at: string | Date;
  usage_count?: number | string;
};

function dateString(value: string | Date) {
  return value instanceof Date ? value.toISOString() : String(value);
}

function mapMedia(row: MediaRow): MediaAsset {
  let tags: string[] = [];
  try {
    const parsed = typeof row.tags_json === "string" ? JSON.parse(row.tags_json) : row.tags_json;
    if (Array.isArray(parsed)) tags = parsed.filter((value): value is string => typeof value === "string");
  } catch {}
  return {
    id: row.id,
    provider: row.provider,
    publicId: row.public_id,
    version: Number(row.version),
    secureUrl: row.secure_url,
    format: row.format,
    bytes: Number(row.bytes),
    width: Number(row.width),
    height: Number(row.height),
    originalFilename: row.original_filename,
    altText: row.alt_text,
    caption: row.caption,
    credit: row.credit,
    licenseNote: row.license_note,
    tags,
    status: row.status,
    uploadedBy: row.uploaded_by,
    createdAt: dateString(row.created_at),
    updatedAt: dateString(row.updated_at),
    usageCount: Number(row.usage_count ?? 0),
  };
}

const MEDIA_SELECT = `SELECT m.*,
  ((SELECT COUNT(*) FROM articles a
    WHERE a.image LIKE '%' || m.public_id || '%'
       OR a.social_image LIKE '%' || m.public_id || '%'
       OR a.blocks_json::text LIKE '%' || m.public_id || '%')
   + (SELECT COUNT(*) FROM categories c
      WHERE c.social_image LIKE '%' || m.public_id || '%')) AS usage_count
  FROM media_assets m`;

export async function listMediaAssets(options: { status?: MediaAssetStatus | "all"; q?: string; limit?: number } = {}): Promise<MediaAsset[]> {
  const status = options.status ?? "active";
  const q = String(options.q ?? "").trim().slice(0, 120);
  const limit = Math.max(1, Math.min(300, Math.trunc(options.limit ?? 120)));
  const where: string[] = [];
  const params: unknown[] = [];
  if (status !== "all") {
    where.push("m.status = ?");
    params.push(status);
  }
  if (q) {
    where.push("(m.original_filename ILIKE ? OR m.alt_text ILIKE ? OR m.caption ILIKE ? OR m.credit ILIKE ? OR m.public_id ILIKE ?)");
    const term = `%${q}%`;
    params.push(term, term, term, term, term);
  }
  params.push(limit);
  const rows = await queryRows<MediaRow>(`${MEDIA_SELECT} ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY m.created_at DESC LIMIT ?`, params);
  return rows.map(mapMedia);
}

export async function getMediaAsset(id: string): Promise<MediaAsset | null> {
  const row = await queryOne<MediaRow>(`${MEDIA_SELECT} WHERE m.id = ? LIMIT 1`, [id]);
  return row ? mapMedia(row) : null;
}

export async function createMediaAsset(input: {
  id: string;
  publicId: string;
  version: number;
  secureUrl: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
  originalFilename: string;
  altText: string;
  caption?: string;
  credit?: string;
  licenseNote?: string;
  tags?: string[];
  uploadedBy: string | null;
}): Promise<MediaAsset> {
  const row = await queryOne<MediaRow>(`INSERT INTO media_assets
    (id, public_id, version, secure_url, format, bytes, width, height, original_filename, alt_text, caption, credit, license_note, tags_json, uploaded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`, [
      input.id,
      input.publicId,
      input.version,
      input.secureUrl,
      input.format,
      input.bytes,
      input.width,
      input.height,
      input.originalFilename,
      input.altText,
      input.caption ?? "",
      input.credit ?? "",
      input.licenseNote ?? "",
      JSON.stringify(input.tags ?? []),
      input.uploadedBy,
    ]);
  if (!row) throw new Error("Unable to save media asset.");
  return mapMedia(row);
}

export async function updateMediaAsset(id: string, input: {
  altText: string;
  caption: string;
  credit: string;
  licenseNote: string;
  tags: string[];
  status: MediaAssetStatus;
}): Promise<boolean> {
  const changed = await execute(`UPDATE media_assets SET alt_text = ?, caption = ?, credit = ?, license_note = ?, tags_json = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [
    input.altText,
    input.caption,
    input.credit,
    input.licenseNote,
    JSON.stringify(input.tags),
    input.status,
    id,
  ]);
  return changed > 0;
}


export type MediaUploadAuthorization = {
  publicId: string;
  userId: string;
  originalFilename: string;
  declaredMime: string;
  declaredBytes: number;
  expiresAt: string;
  consumedAt: string | null;
};

type MediaUploadAuthorizationRow = {
  public_id: string;
  user_id: string;
  original_filename: string;
  declared_mime: string;
  declared_bytes: number | string;
  expires_at: string | Date;
  consumed_at: string | Date | null;
};

function mapAuthorization(row: MediaUploadAuthorizationRow): MediaUploadAuthorization {
  return {
    publicId: row.public_id,
    userId: row.user_id,
    originalFilename: row.original_filename,
    declaredMime: row.declared_mime,
    declaredBytes: Number(row.declared_bytes),
    expiresAt: dateString(row.expires_at),
    consumedAt: row.consumed_at ? dateString(row.consumed_at) : null,
  };
}

export async function createMediaUploadAuthorization(input: { publicId: string; userId: string; originalFilename: string; declaredMime: string; declaredBytes: number; expiresAt: Date }): Promise<void> {
  await execute(`INSERT INTO media_upload_authorizations (public_id, user_id, original_filename, declared_mime, declared_bytes, expires_at) VALUES (?, ?, ?, ?, ?, ?)`, [
    input.publicId, input.userId, input.originalFilename, input.declaredMime, input.declaredBytes, input.expiresAt,
  ]);
}

export async function getMediaUploadAuthorization(publicId: string, userId: string): Promise<MediaUploadAuthorization | null> {
  const row = await queryOne<MediaUploadAuthorizationRow>(`SELECT public_id, user_id, original_filename, declared_mime, declared_bytes, expires_at, consumed_at FROM media_upload_authorizations WHERE public_id = ? AND user_id = ? LIMIT 1`, [publicId, userId]);
  return row ? mapAuthorization(row) : null;
}

export async function consumeMediaUploadAuthorization(publicId: string, userId: string): Promise<void> {
  await execute(`UPDATE media_upload_authorizations SET consumed_at = CURRENT_TIMESTAMP WHERE public_id = ? AND user_id = ? AND consumed_at IS NULL`, [publicId, userId]);
}
