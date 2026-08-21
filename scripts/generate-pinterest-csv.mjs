import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import manifest from "../launch/launch-manifest.json" with { type: "json" };

function argument(name) {
  return process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3);
}

const siteValue = argument("site") || process.env.NEXT_PUBLIC_SITE_URL || "";
const output = argument("out") || "launch/pinterest-bulk-upload.csv";
const startValue = argument("start") || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const timeValue = argument("time") || "15:00:00";

if (!siteValue) throw new Error("Pass --site=https://your-public-domain or configure NEXT_PUBLIC_SITE_URL.");
const site = new URL(siteValue);
if (site.protocol !== "https:" || site.hostname === "localhost") {
  throw new Error("Pinterest requires a publicly reachable HTTPS site URL.");
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(startValue) || Number.isNaN(Date.parse(`${startValue}T00:00:00Z`))) {
  throw new Error("--start must use YYYY-MM-DD.");
}
if (!/^\d{2}:\d{2}:\d{2}$/.test(timeValue)) throw new Error("--time must use HH:MM:SS in UTC.");

function addDays(date, days) {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const headers = ["Title", "Media URL", "Pinterest board", "Thumbnail", "Description", "Link", "Publish date", "Keywords"];
const rows = [];

for (let variant = 0; variant < 3; variant += 1) {
  for (let articleIndex = 0; articleIndex < manifest.articles.length; articleIndex += 1) {
    const article = manifest.articles[articleIndex];
    const pinNumber = variant + 1;
    const publishDate = addDays(startValue, articleIndex + variant * 14);
    const link = new URL(`/article/${article.slug}`, site);
    link.searchParams.set("utm_source", "pinterest");
    link.searchParams.set("utm_medium", "organic");
    link.searchParams.set("utm_campaign", "birthday_launch");
    link.searchParams.set("utm_content", `${article.slug}_pin${pinNumber}`);
    const description = `${article.seoTitle}. Practical planning notes for real budgets, spaces and age groups. Save this ${article.keyword} guide for later.`;
    const keywords = [...new Set([article.keyword, article.category.toLowerCase(), article.board.toLowerCase()])].join(", ");
    rows.push([
      article.pins[variant],
      new URL(`/pinterest/${article.slug}-pin-${pinNumber}.png`, site).toString(),
      article.board,
      "",
      description,
      link.toString(),
      `${publishDate}T${timeValue}`,
      keywords,
    ]);
  }
}

const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
const absoluteOutput = path.resolve(output);
await mkdir(path.dirname(absoluteOutput), { recursive: true });
await writeFile(absoluteOutput, `\uFEFF${csv}`, "utf8");
process.stdout.write(`Created ${rows.length} scheduled Pins at ${absoluteOutput}\n`);
