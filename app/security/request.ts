import { cookies } from "next/headers";
import { getRuntimeValue } from "../runtime-env";
import { constantTimeEqual } from "./crypto";

const encoder = new TextEncoder();
export const CSRF_COOKIE = "tcp_csrf";

export function requestHasSafeOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const requestOrigin = new URL(request.url).origin;
  const configuredOrigin = getRuntimeValue("APP_ORIGIN");
  if (origin && origin !== requestOrigin && origin !== configuredOrigin) return false;
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && !["same-origin", "same-site", "none"].includes(fetchSite)) return false;
  return Boolean(origin || fetchSite);
}

export async function csrfMatches(value: unknown): Promise<boolean> {
  if (typeof value !== "string" || value.length < 20 || value.length > 200) return false;
  const cookie = (await cookies()).get(CSRF_COOKIE)?.value;
  if (!cookie) return false;
  return constantTimeEqual(encoder.encode(value), encoder.encode(cookie));
}

export function bodyWithinLimit(request: Request, maxBytes: number): boolean {
  const length = Number(request.headers.get("content-length") ?? 0);
  return Number.isFinite(length) && length >= 0 && (length === 0 || length <= maxBytes);
}

export async function readJson<T>(request: Request, maxBytes = 32_000): Promise<T | null> {
  if (!bodyWithinLimit(request, maxBytes)) return null;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > maxBytes) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function readForm(request: Request, maxBytes = 200_000): Promise<FormData | null> {
  if (!bodyWithinLimit(request, maxBytes)) return null;
  try {
    const clone = request.clone();
    const bytes = await clone.arrayBuffer();
    if (bytes.byteLength > maxBytes) return null;
    return request.formData();
  } catch {
    return null;
  }
}
