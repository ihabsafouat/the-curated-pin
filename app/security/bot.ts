import { getRuntimeValue } from "../runtime-env";

export function turnstileIsConfigured() {
  return Boolean(getRuntimeValue("TURNSTILE_SECRET_KEY") && getRuntimeValue("NEXT_PUBLIC_TURNSTILE_SITE_KEY"));
}

export async function verifyTurnstile(token: string | undefined, request: Request): Promise<boolean> {
  const secret = getRuntimeValue("TURNSTILE_SECRET_KEY");
  const production = getRuntimeValue("NODE_ENV") === "production";
  // Development can run without external bot protection; production fails closed.
  if (!secret) return !production;
  if (!token || token.length > 2048) return false;
  const body = new URLSearchParams({ secret, response: token });
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (ip) body.set("remoteip", ip);
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body, signal: AbortSignal.timeout(5000), cache: "no-store" });
    if (!response.ok) return false;
    const result = await response.json() as { success?: boolean; hostname?: string; action?: string };
    if (result.success !== true) return false;
    const configuredOrigin = getRuntimeValue("APP_ORIGIN");
    if (production && configuredOrigin && result.hostname) {
      const expected = new URL(configuredOrigin).hostname;
      if (result.hostname !== expected) return false;
    }
    return true;
  } catch {
    return false;
  }
}
