const required = ["DATABASE_URL", "JWT_SECRET", "RATE_LIMIT_SECRET", "EMAIL_PREFERENCE_SECRET", "EMAIL_CRON_SECRET", "APP_ORIGIN", "NEXT_PUBLIC_SITE_URL"];
const missing = required.filter((key) => !String(process.env[key] ?? "").trim());
if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);

for (const key of ["JWT_SECRET", "RATE_LIMIT_SECRET", "EMAIL_PREFERENCE_SECRET", "EMAIL_CRON_SECRET"]) {
  if (String(process.env[key]).length < 32) throw new Error(`${key} must be at least 32 characters.`);
}

if (process.env.CONVERSION_WEBHOOK_SECRET && String(process.env.CONVERSION_WEBHOOK_SECRET).length < 32) {
  throw new Error("CONVERSION_WEBHOOK_SECRET must be at least 32 characters when configured.");
}

for (const key of ["APP_ORIGIN", "NEXT_PUBLIC_SITE_URL"]) {
  const url = new URL(process.env[key]);
  if (!/^https?:$/.test(url.protocol)) throw new Error(`${key} must be an http(s) URL.`);
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") throw new Error(`${key} must use https in production.`);
}

if (!/^postgres(?:ql)?:\/\//.test(process.env.DATABASE_URL)) throw new Error("DATABASE_URL must be a PostgreSQL connection string.");

if (process.env.NODE_ENV === "production") {
  const productionRequired = ["NEXT_PUBLIC_TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY", "RESEND_API_KEY", "MAIL_FROM", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "CLOUDINARY_UPLOAD_PRESET"];
  const productionMissing = productionRequired.filter((key) => !String(process.env[key] ?? "").trim());
  if (productionMissing.length) throw new Error(`Production security/account recovery requires: ${productionMissing.join(", ")}`);
}


const cloudinaryKeys = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "CLOUDINARY_UPLOAD_PRESET"];
const cloudinaryConfigured = cloudinaryKeys.filter((key) => String(process.env[key] ?? "").trim());
if (cloudinaryConfigured.length > 0 && cloudinaryConfigured.length < cloudinaryKeys.length) {
  throw new Error(`Cloudinary media configuration is incomplete. Configure all of: ${cloudinaryKeys.join(", ")}`);
}
if (process.env.CLOUDINARY_API_SECRET && String(process.env.CLOUDINARY_API_SECRET).length < 16) {
  throw new Error("CLOUDINARY_API_SECRET looks invalid or too short.");
}

if (process.env.AI_FEATURES_ENABLED === "true") {
  const daily = Number(process.env.AI_DAILY_REQUEST_LIMIT ?? 0);
  if (!Number.isInteger(daily) || daily < 1) throw new Error("AI_DAILY_REQUEST_LIMIT must be a positive integer when AI_FEATURES_ENABLED=true.");
}

process.stdout.write("Environment configuration looks valid.\n");
