import { fromBase64Url, hmacSha256, toBase64Url, verifyHmacSha256 } from "./crypto";
import { getRuntimeValue } from "../runtime-env";

const decoder = new TextDecoder();

type PreferencePayload = { id: number; email: string; issuedAt: number };

function secret() {
  const value = getRuntimeValue("EMAIL_PREFERENCE_SECRET");
  if (!value || value.length < 32) {
    if (getRuntimeValue("NODE_ENV") === "production") throw new Error("EMAIL_PREFERENCE_SECRET must be configured with at least 32 characters.");
    return "development-email-preference-secret-at-least-32-chars-long";
  }
  return value;
}

export async function createPreferenceToken(id: number, email: string) {
  const payload = JSON.stringify({ id, email: email.trim().toLowerCase(), issuedAt: Date.now() } satisfies PreferencePayload);
  const encoded = toBase64Url(payload);
  const signature = toBase64Url(await hmacSha256(encoded, secret()));
  return `${encoded}.${signature}`;
}

export async function readPreferenceToken(token: string): Promise<PreferencePayload | null> {
  const [encoded, signatureText, ...rest] = token.split(".");
  if (!encoded || !signatureText || rest.length) return null;
  try {
    const signature = fromBase64Url(signatureText);
    if (!await verifyHmacSha256(encoded, signature, secret())) return null;
    const payload = JSON.parse(decoder.decode(fromBase64Url(encoded))) as Partial<PreferencePayload>;
    if (!Number.isInteger(payload.id) || typeof payload.email !== "string" || typeof payload.issuedAt !== "number") return null;
    // Preference/unsubscribe links intentionally do not expire; old audience emails must keep a working opt-out path.
    return { id: Number(payload.id), email: payload.email.trim().toLowerCase(), issuedAt: payload.issuedAt };
  } catch {
    return null;
  }
}
