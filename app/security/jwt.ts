import { getRuntimeValue } from "../runtime-env";
import type { UserRole } from "../../db/types";
import { fromBase64Url, hmacSha256, toBase64Url, verifyHmacSha256 } from "./crypto";

export type AccessClaims = {
  type: "access";
  sub: string;
  role: UserRole;
  tokenVersion: number;
  csrf: string;
  iat: number;
  exp: number;
  iss: "the-curated-pin";
  aud: "web";
};

export type RefreshClaims = {
  type: "refresh";
  sub: string;
  sid: string;
  tokenVersion: number;
  nonce: string;
  iat: number;
  exp: number;
  iss: "the-curated-pin";
  aud: "web";
};

type JwtClaims = AccessClaims | RefreshClaims;

function jwtSecret(): string {
  const secret = getRuntimeValue("JWT_SECRET") ?? "";
  if (secret.length < 32) throw new Error("JWT_SECRET must contain at least 32 characters.");
  return secret;
}

export function jwtIsConfigured(): boolean {
  return (getRuntimeValue("JWT_SECRET")?.length ?? 0) >= 32;
}

export async function signJwt(payload: JwtClaims): Promise<string> {
  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = toBase64Url(JSON.stringify(payload));
  const message = `${header}.${body}`;
  const signature = toBase64Url(await hmacSha256(message, jwtSecret()));
  return `${message}.${signature}`;
}

export async function verifyJwt<T extends JwtClaims>(token: string, type: T["type"]): Promise<T | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const message = `${parts[0]}.${parts[1]}`;
  try {
    const valid = await verifyHmacSha256(message, fromBase64Url(parts[2]), jwtSecret());
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(parts[1]))) as T;
    const now = Math.floor(Date.now() / 1000);
    if (
      payload.type !== type ||
      payload.iss !== "the-curated-pin" ||
      payload.aud !== "web" ||
      !Number.isInteger(payload.iat) ||
      !Number.isInteger(payload.exp) ||
      payload.exp <= now ||
      payload.iat > now + 60
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
