import { constantTimeEqual, fromBase64Url, randomToken, toBase64Url } from "./crypto";

const encoder = new TextEncoder();
const ITERATIONS = 600_000;
const HASH_BYTES = 32;

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const material = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
    material,
    HASH_BYTES * 8,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = fromBase64Url(randomToken(16));
  const hash = await derive(password, salt, ITERATIONS);
  return `pbkdf2_sha256$${ITERATIONS}$${toBase64Url(salt)}$${toBase64Url(hash)}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [algorithm, iterationsRaw, saltRaw, hashRaw] = encoded.split("$");
  const iterations = Number(iterationsRaw);
  if (
    algorithm !== "pbkdf2_sha256" ||
    !Number.isInteger(iterations) ||
    iterations < 100_000 ||
    iterations > 1_000_000 ||
    !saltRaw ||
    !hashRaw
  ) {
    return false;
  }
  const expected = fromBase64Url(hashRaw);
  const actual = await derive(password, fromBase64Url(saltRaw), iterations);
  return constantTimeEqual(actual, expected);
}
