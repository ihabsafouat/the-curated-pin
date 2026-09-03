import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const netlify = await readFile(new URL("../netlify.toml", import.meta.url), "utf8");
const envExample = await readFile(new URL("../.env.example", import.meta.url), "utf8");

test("uses the standard Next.js lifecycle", () => {
  assert.equal(pkg.scripts.dev, "next dev");
  assert.equal(pkg.scripts.build, "next build");
  assert.equal(pkg.scripts.start, "next start");
  for (const dependency of ["vinext", "wrangler", "@cloudflare/vite-plugin"]) {
    assert.equal(pkg.dependencies?.[dependency] ?? pkg.devDependencies?.[dependency], undefined);
  }
});

test("Netlify is configured for the Next.js build output", () => {
  assert.match(netlify, /command = "npm run deploy:prepare && npm run build"/);
  assert.match(netlify, /publish = "\.next"/);
});

test("PostgreSQL/Neon deployment variables are documented", () => {
  for (const key of ["DATABASE_URL", "JWT_SECRET", "RATE_LIMIT_SECRET", "APP_ORIGIN", "NEXT_PUBLIC_SITE_URL"]) {
    assert.match(envExample, new RegExp(`^${key}=`, "m"));
  }
});

test("security headers were preserved after removing the Worker wrapper", async () => {
  const nextConfig = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");
  for (const header of [
    "Content-Security-Policy",
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Cross-Origin-Opener-Policy",
  ]) {
    assert.match(nextConfig, new RegExp(header));
  }
  assert.match(nextConfig, /poweredByHeader:\s*false/);
});
