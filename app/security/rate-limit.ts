import { consumeRateLimitBucket } from "../../db/auth";
import { getRuntimeValue } from "../runtime-env";
import { sha256 } from "./crypto";

export type RateLimitResult = { allowed: boolean; limit: number; remaining: number; resetAt: number };

export async function clientIpHash(request: Request): Promise<string> {
  const address =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const secret = getRuntimeValue("RATE_LIMIT_SECRET") ?? getRuntimeValue("JWT_SECRET") ?? "local-development";
  return sha256(`${secret}:${address}`);
}

export async function checkRateLimit(
  request: Request,
  scope: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / windowSeconds) * windowSeconds;
  const resetAt = windowStart + windowSeconds;
  const count = await consumeRateLimitBucket({
    bucketKey: await clientIpHash(request),
    scope,
    windowStart,
    expiresAt: new Date((resetAt + windowSeconds) * 1000).toISOString(),
  });
  return { allowed: count <= limit, limit, remaining: Math.max(0, limit - count), resetAt };
}

export async function checkRateLimitKey(
  key: string,
  scope: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / windowSeconds) * windowSeconds;
  const resetAt = windowStart + windowSeconds;
  const secret = getRuntimeValue("RATE_LIMIT_SECRET") ?? getRuntimeValue("JWT_SECRET") ?? "local-development";
  const count = await consumeRateLimitBucket({
    bucketKey: await sha256(`${secret}:${key}`),
    scope,
    windowStart,
    expiresAt: new Date((resetAt + windowSeconds) * 1000).toISOString(),
  });
  return { allowed: count <= limit, limit, remaining: Math.max(0, limit - count), resetAt };
}

export function rateLimitResponse(result: RateLimitResult): Response {
  return Response.json(
    { ok: false, error: "Too many requests. Please wait and try again." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(1, result.resetAt - Math.floor(Date.now() / 1000))),
        "RateLimit-Limit": String(result.limit),
        "RateLimit-Remaining": String(result.remaining),
        "RateLimit-Reset": String(result.resetAt),
      },
    },
  );
}
