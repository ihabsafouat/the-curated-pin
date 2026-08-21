const base = String(process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_ORIGIN || "").replace(/\/$/, "");
const secret = process.env.EMAIL_CRON_SECRET;
if (!base || !secret) throw new Error("NEXT_PUBLIC_SITE_URL/APP_ORIGIN and EMAIL_CRON_SECRET are required.");
const response = await fetch(`${base}/api/cron/email-sequences`, { method: "POST", headers: { authorization: `Bearer ${secret}` } });
const text = await response.text();
if (!response.ok) throw new Error(`Dispatch failed (${response.status}): ${text}`);
console.log(text);
