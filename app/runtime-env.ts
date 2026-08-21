export type RuntimeEnvKey =
  | "APP_ORIGIN"
  | "DATABASE_URL"
  | "JWT_SECRET"
  | "RATE_LIMIT_SECRET"
  | "NODE_ENV"
  | "NEXT_PUBLIC_GA_ID"
  | "NEXT_PUBLIC_SITE_URL"
  | "NEXT_PUBLIC_CLARITY_ID"
  | "NEXT_PUBLIC_TURNSTILE_SITE_KEY"
  | "TURNSTILE_SECRET_KEY"
  | "RESEND_API_KEY"
  | "MAIL_FROM"
  | "EMAIL_PREFERENCE_SECRET"
  | "EMAIL_CRON_SECRET"
  | "CONVERSION_WEBHOOK_SECRET"
  | "AI_FEATURES_ENABLED"
  | "AI_DAILY_REQUEST_LIMIT"
  | "CLOUDINARY_CLOUD_NAME"
  | "CLOUDINARY_API_KEY"
  | "CLOUDINARY_API_SECRET"
  | "CLOUDINARY_UPLOAD_PRESET";

export function getRuntimeValue(key: RuntimeEnvKey): string | undefined {
  const value = process.env[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
