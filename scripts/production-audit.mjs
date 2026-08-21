import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const warnings = [];
const pass = [];
const check = (condition, ok, fail, severity = "error") => {
  if (condition) pass.push(ok);
  else (severity === "warning" ? warnings : errors).push(fail);
};

const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const packageJson = JSON.parse(read("package.json"));
const nextConfig = read("next.config.ts");
const netlify = read("netlify.toml");

check(packageJson.private === true, "package is private", "package.json must keep private=true");
check(packageJson.engines?.node, "Node engine pinned", "Pin a Node engine in package.json");
check(!fs.existsSync(path.join(root, ".env")), "no tracked .env file present", "A .env file exists in the package root; do not ship secrets");
check(fs.existsSync(path.join(root, ".env.example")), ".env.example exists", ".env.example is missing");
check(fs.existsSync(path.join(root, "app/global-error.tsx")), "global error UI exists", "app/global-error.tsx is missing");
check(fs.existsSync(path.join(root, "app/not-found.tsx")), "custom 404 exists", "app/not-found.tsx is missing");
check(fs.existsSync(path.join(root, "app/api/health/live/route.ts")), "liveness endpoint exists", "liveness endpoint is missing");
check(fs.existsSync(path.join(root, "app/api/health/ready/route.ts")), "readiness endpoint exists", "readiness endpoint is missing");
check(nextConfig.includes("Strict-Transport-Security"), "HSTS configured", "HSTS header is missing");
check(nextConfig.includes("Content-Security-Policy"), "CSP configured", "Content-Security-Policy is missing");
check(nextConfig.includes("X-Content-Type-Options"), "nosniff configured", "X-Content-Type-Options is missing");
check(!nextConfig.includes("api.cloudinary.com\"" ) || nextConfig.includes("connect-src"), "Cloudinary is limited to network destinations", "Review Cloudinary CSP destinations", "warning");
check(netlify.includes('schedule = "@hourly"'), "email scheduler configured", "Hourly email scheduler is missing", "warning");

if (process.env.NODE_ENV === "production") {
  const appOrigin = process.env.APP_ORIGIN ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  check(appOrigin.startsWith("https://"), "APP_ORIGIN uses HTTPS", "APP_ORIGIN must use HTTPS in production");
  check(siteUrl.startsWith("https://"), "NEXT_PUBLIC_SITE_URL uses HTTPS", "NEXT_PUBLIC_SITE_URL must use HTTPS in production");
  check(Boolean(process.env.DATABASE_URL), "DATABASE_URL configured", "DATABASE_URL is missing");
  if ((process.env.DATABASE_URL ?? "").includes("neon.tech")) {
    check((process.env.DATABASE_URL ?? "").includes("-pooler"), "Neon pooled runtime URL configured", "Use the Neon -pooler connection string for DATABASE_URL in serverless production");
  }
  for (const key of ["JWT_SECRET", "RATE_LIMIT_SECRET", "EMAIL_PREFERENCE_SECRET", "EMAIL_CRON_SECRET"]) {
    check((process.env[key] ?? "").length >= 32, `${key} length is acceptable`, `${key} must be at least 32 characters`);
  }
  check(Boolean(process.env.NEXT_PUBLIC_GA_ID), "GA4 configured", "GA4 is not configured", "warning");
  check(Boolean(process.env.NEXT_PUBLIC_CLARITY_ID), "Clarity configured", "Clarity is not configured", "warning");
}

for (const line of pass) console.log(`PASS  ${line}`);
for (const line of warnings) console.warn(`WARN  ${line}`);
for (const line of errors) console.error(`FAIL  ${line}`);
console.log(`\n${pass.length} passed, ${warnings.length} warnings, ${errors.length} failures`);
if (errors.length) process.exit(1);
