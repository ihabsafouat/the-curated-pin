import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createRefreshSession,
  findUserById,
  revokeRefreshSession,
  rotateRefreshSession,
  type UserWithPassword,
} from "../../db/auth";
import type { SafeUser, UserRole } from "../../db/types";
import { getRuntimeValue } from "../runtime-env";
import { clientIpHash } from "./rate-limit";
import { randomToken, sha256 } from "./crypto";
import { jwtIsConfigured, signJwt, verifyJwt, type AccessClaims, type RefreshClaims } from "./jwt";
import { CSRF_COOKIE } from "./request";

const ACCESS_COOKIE = "tcp_access";
const REFRESH_COOKIE = "tcp_refresh";
const ACCESS_SECONDS = 60 * 60 * 2;
const REFRESH_SECONDS = 60 * 60 * 24 * 14;

const roleRank: Record<UserRole, number> = { reader: 0, author: 1, editor: 2, admin: 3 };

function publicUser(user: UserWithPassword): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    tokenVersion: user.tokenVersion,
    createdAt: user.createdAt,
  };
}

function isSecureRequest(request: Request): boolean {
  return new URL(request.url).protocol === "https:" || getRuntimeValue("NODE_ENV") === "production";
}

function cookieBase(request: Request) {
  return { httpOnly: true, secure: isSecureRequest(request), sameSite: "lax" as const, path: "/" };
}

async function setSessionCookies(request: Request, accessToken: string, refreshToken: string, csrf: string) {
  const jar = await cookies();
  const base = cookieBase(request);
  jar.set(ACCESS_COOKIE, accessToken, { ...base, maxAge: ACCESS_SECONDS });
  jar.set(REFRESH_COOKIE, refreshToken, { ...base, maxAge: REFRESH_SECONDS });
  jar.set(CSRF_COOKIE, csrf, { ...base, httpOnly: false, maxAge: ACCESS_SECONDS });
}

async function createTokens(user: UserWithPassword, sessionId: string, csrf: string) {
  const now = Math.floor(Date.now() / 1000);
  const access = await signJwt({
    type: "access",
    sub: user.id,
    role: user.role,
    tokenVersion: user.tokenVersion,
    csrf,
    iat: now,
    exp: now + ACCESS_SECONDS,
    iss: "the-curated-pin",
    aud: "web",
  });
  const refresh = await signJwt({
    type: "refresh",
    sub: user.id,
    sid: sessionId,
    tokenVersion: user.tokenVersion,
    nonce: randomToken(18),
    iat: now,
    exp: now + REFRESH_SECONDS,
    iss: "the-curated-pin",
    aud: "web",
  });
  return { access, refresh, refreshExpiresAt: new Date((now + REFRESH_SECONDS) * 1000).toISOString() };
}

export function authIsConfigured(): boolean {
  return jwtIsConfigured();
}

export async function getCsrfToken(): Promise<string> {
  return (await cookies()).get(CSRF_COOKIE)?.value ?? "";
}

export async function issueAuthSession(user: UserWithPassword, request: Request): Promise<SafeUser> {
  const sessionId = crypto.randomUUID();
  const csrf = randomToken(24);
  const tokens = await createTokens(user, sessionId, csrf);
  await createRefreshSession({
    id: sessionId,
    userId: user.id,
    tokenHash: await sha256(tokens.refresh),
    ipHash: await clientIpHash(request),
    userAgentHash: await sha256(request.headers.get("user-agent") ?? "unknown"),
    expiresAt: tokens.refreshExpiresAt,
  });
  await setSessionCookies(request, tokens.access, tokens.refresh, csrf);
  return publicUser(user);
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  if (!authIsConfigured()) return null;
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  const claims = await verifyJwt<AccessClaims>(token, "access");
  if (!claims) return null;
  const user = await findUserById(claims.sub);
  if (!user || user.status !== "active" || user.tokenVersion !== claims.tokenVersion) return null;
  return publicUser(user);
}

export async function refreshAuthSession(request: Request): Promise<SafeUser | null> {
  if (!authIsConfigured()) return null;
  const jar = await cookies();
  const currentToken = jar.get(REFRESH_COOKIE)?.value;
  if (!currentToken) return null;
  const claims = await verifyJwt<RefreshClaims>(currentToken, "refresh");
  if (!claims) return null;
  const user = await findUserById(claims.sub);
  if (!user || user.status !== "active" || user.tokenVersion !== claims.tokenVersion) return null;
  const csrf = randomToken(24);
  const next = await createTokens(user, claims.sid, csrf);
  const rotated = await rotateRefreshSession({
    id: claims.sid,
    userId: user.id,
    oldTokenHash: await sha256(currentToken),
    newTokenHash: await sha256(next.refresh),
    expiresAt: next.refreshExpiresAt,
  });
  if (!rotated) return null;
  await setSessionCookies(request, next.access, next.refresh, csrf);
  return publicUser(user);
}

export async function clearAuthSession(request: Request) {
  const jar = await cookies();
  const token = jar.get(REFRESH_COOKIE)?.value;
  if (token && authIsConfigured()) {
    const claims = await verifyJwt<RefreshClaims>(token, "refresh");
    if (claims) await revokeRefreshSession(claims.sid, await sha256(token));
  }
  const expired = { ...cookieBase(request), maxAge: 0 };
  jar.set(ACCESS_COOKIE, "", expired);
  jar.set(REFRESH_COOKIE, "", expired);
  jar.set(CSRF_COOKIE, "", { ...expired, httpOnly: false });
}

export function roleAtLeast(user: SafeUser, minimum: UserRole): boolean {
  return roleRank[user.role] >= roleRank[minimum];
}

export async function requireUser(returnTo: string): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (user) return user;
  redirect(`/login?returnTo=${encodeURIComponent(safeReturnTo(returnTo))}`);
}

export async function requireRole(minimum: UserRole, returnTo: string): Promise<SafeUser> {
  const user = await requireUser(returnTo);
  if (!roleAtLeast(user, minimum)) redirect("/account?denied=1");
  return user;
}

export function safeReturnTo(value: string | null | undefined, fallback = "/account"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  try {
    const url = new URL(value, "https://site.local");
    return url.origin === "https://site.local" ? `${url.pathname}${url.search}${url.hash}` : fallback;
  } catch {
    return fallback;
  }
}
