import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import manifest from "../launch/launch-manifest.json" with { type: "json" };
import { growthArticles } from "../launch/birthday-growth-content.mjs";
import { crochetArticles } from "../launch/vertical-launch-content.mjs";

const siteValue = process.argv.find((value) => value.startsWith("--site="))?.slice(7)
  || process.env.NEXT_PUBLIC_SITE_URL
  || "https://the-curated-pin.netlify.app";
const startDate = process.argv.find((value) => value.startsWith("--start="))?.slice(8) || "2026-09-04";
const site = new URL(siteValue);
if (site.protocol !== "https:" || site.hostname === "localhost") throw new Error("Use a public HTTPS site URL.");
if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || Number.isNaN(Date.parse(`${startDate}T00:00:00Z`))) throw new Error("Use --start=YYYY-MM-DD.");

const csvHeaders = ["Title", "Media URL", "Pinterest board", "Thumbnail", "Description", "Link", "Publish date", "Keywords"];
const pinDir = "public/pinterest/bulk";
const releaseDir = "launch/pinterest-release";
const escapeXml = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const csvCell = (value) => /[",\r\n]/.test(String(value ?? "")) ? `"${String(value ?? "").replaceAll('"', '""')}"` : String(value ?? "");
const compact = (value) => String(value).replace(/\s+/g, " ").trim();

function splitLines(title, max = 18) {
  const words = compact(title).split(" ");
  const result = [];
  let row = "";
  for (const word of words) {
    const next = row ? `${row} ${word}` : word;
    if (next.length > max && row) { result.push(row); row = word; } else row = next;
  }
  if (row) result.push(row);
  return result;
}

function fittedHeadline(title) {
  for (const fontSize of [76, 70, 64, 58, 52, 48]) {
    const max = Math.max(14, Math.floor(810 / (fontSize * 0.56)));
    const lines = splitLines(title, max);
    if (lines.length <= 5) return { lines, fontSize };
  }
  return { lines: splitLines(title, 30).slice(0, 5), fontSize: 44 };
}

function birthdayBoard(path) {
  if (path.endsWith("teen-birthdays")) return "Teen Birthday Party Ideas";
  if (path.endsWith("first-birthdays")) return "First Birthday Party Ideas";
  if (path.endsWith("party-games")) return "Birthday Party Games";
  if (path.endsWith("by-age")) return "Birthday Ideas by Age";
  return "Birthday Party Ideas";
}

function crochetBoard(path) {
  if (path.endsWith("flowers")) return "Crochet Flowers";
  if (path.endsWith("blankets")) return "Crochet Blankets";
  if (path.endsWith("bags")) return "Crochet Bags";
  if (path.endsWith("beginner")) return "Crochet for Beginners";
  return "Crochet Ideas";
}

function keywordFromTitle(title) {
  return compact(title.replace(/^\d+\s+/, "").replace(/:.*$/, "").replace(/\bthat\b.*$/i, "")).toLowerCase();
}

const outboundStrategy = {
  "16th-birthday-party-ideas": { pins: ["Sweet 16 Signature Board + Memory Jar Setup", "Sweet 16 Keepsake Station: Supplies + Prompts", "Copy This Sweet 16 Welcome-Table Idea"], benefit: "the exact signature-board setup, memory-jar prompts, supply notes and a realistic party checklist" },
  "18th-birthday-party-ideas": { pins: ["18th Birthday Memory Jar: Setup + Prompt Ideas", "A Meaningful 18th Birthday Keepsake Guests Can Make", "Copy This Easy 18th Birthday Memory Table"], benefit: "memory-jar prompts, a simple keepsake-table setup, budget notes and milestone-party ideas" },
  "teen-sleepover-party-ideas": { pins: ["Cozy Teen Sleepover Setup + Simple Timeline", "Teen Sleepover Checklist: Beds, Snacks + Breakfast", "Copy This Cozy Birthday Sleepover Plan"], benefit: "sleep-station ideas, an evening-to-breakfast timeline, snack baskets and a practical host checklist" },
  "backyard-party-games": { pins: ["12 Backyard Party Games + Easy Setup Notes", "Backyard Birthday Games: Supplies, Stations + Rules", "Copy This 3-Station Backyard Game Plan"], benefit: "12 low-prep games, supply notes, station layouts, mixed-age options and weather backups" },
  "teen-birthday-party-games": { pins: ["12 Teen Party Games They Will Actually Play", "Teen Birthday Games: Prompts, Teams + Setup", "Low-Pressure Teen Party Games for Real Groups"], benefit: "12 non-cringe games, prompt ideas, team setup and a choose-the-right-game checklist" },
  "first-birthday-themes-for-girls": { pins: ["12 Sweet First Birthday Themes + Simple Setups", "One Sweet Garden: First Birthday Plan", "First Birthday Themes: Colors, Decor + Checklist"], benefit: "12 themes, simple color palettes, baby-safe setup notes and a realistic planning checklist" },
  "first-birthday-themes-for-boys": { pins: ["12 First Birthday Themes Beyond Basic Blue", "Teddy Bear First Birthday: Simple Setup Plan", "First Birthday Themes: Colors, Decor + Checklist"], benefit: "12 themes, attainable decor plans, baby-safe setup notes and a realistic planning checklist" },
  "crochet-flower-bouquet-pattern": { pins: ["Crochet Flower Bouquet: Ratio + Assembly Map", "Crochet Bouquet Pattern: Stems, Leaves + Layout", "Make a Balanced Crochet Flower Bouquet"], benefit: "flower ratios, three stem heights, leaf placement, color plans and the full assembly sequence" },
  "easy-crochet-baby-blanket-pattern": { pins: ["Easy Crochet Baby Blanket: Size + Yarn Guide", "Beginner Baby Blanket: Gauge, Rows + Border", "Crochet a Baby Blanket That Finishes Flat"], benefit: "materials, gauge math, finished measurements, row planning, border notes and troubleshooting" },
  "easy-crochet-flowers-for-beginners": { pins: ["Free 5-Petal Crochet Flower: Exact Stitch Repeat", "Easy Crochet Flower: Materials + Finishing", "Make This Beginner Crochet Flower"], benefit: "the complete five-petal stitch sequence, materials, finishing steps and three easy variations" },
  "crochet-blanket-size-chart-yarn-estimator": { pins: ["Crochet Blanket Size Chart + Yarn Estimator", "Blanket Sizes: Starting Chain, Yarn + Border Math", "Plan Your Crochet Blanket Before You Start"], benefit: "finished-size targets, gauge math, starting-chain guidance, yarn estimates and border planning" },
};

function titleVariants(article, channel) {
  const strategy = outboundStrategy[article.slug];
  if (strategy) return strategy.pins;
  if (article.pins?.length === 3) return article.pins;
  const keyword = article.primaryKeyword || article.keyword || keywordFromTitle(article.title);
  const cleanTitle = compact(article.pinTitle || article.title).replace(/:.*/, "");
  if (channel === "crochet") return [
    cleanTitle,
    `Save This ${keyword.replace(/\b\w/g, (letter) => letter.toUpperCase())}`,
    `${keyword.replace(/\b\w/g, (letter) => letter.toUpperCase())}: Start Here`,
  ];
  return [
    cleanTitle,
    `${keyword.replace(/\b\w/g, (letter) => letter.toUpperCase())} Worth Saving`,
    `Planning a Birthday? Try These Ideas`,
  ];
}

const birthdayLaunch = manifest.articles.map((article) => ({
  ...article,
  channel: "birthday",
  pins: titleVariants(article, "birthday"),
  benefit: outboundStrategy[article.slug]?.benefit || `the full ${article.keyword} list, budget notes, setup details and a practical planning checklist`,
}));
const birthdayGrowth = growthArticles.map((article) => ({
  ...article,
  channel: "birthday",
  keyword: keywordFromTitle(article.title),
  board: birthdayBoard(article.categoryPath),
  pins: titleVariants(article, "birthday"),
  benefit: outboundStrategy[article.slug]?.benefit || "the complete idea list, realistic budget and setup notes, plus a practical planning checklist",
}));
const crochet = crochetArticles.map((article) => ({
  ...article,
  channel: "crochet",
  keyword: article.primaryKeyword,
  board: crochetBoard(article.categoryPath),
  pins: titleVariants(article, "crochet"),
  benefit: outboundStrategy[article.slug]?.benefit || "materials, measurements, step-by-step guidance, finishing notes and troubleshooting",
}));

const palettes = {
  birthday: [
    { bg: "#f6e8ec", ink: "#432a38", accent: "#d35f83", label: "BIRTHDAY IDEAS" },
    { bg: "#fff4df", ink: "#3d3025", accent: "#dc8b3d", label: "SAVE FOR THE PARTY" },
    { bg: "#e9e3f4", ink: "#302942", accent: "#8469b8", label: "THE CURATED PIN" },
  ],
  crochet: [
    { bg: "#e5eddf", ink: "#203b32", accent: "#d47d61", label: "CROCHET GUIDE" },
    { bg: "#f6e9dc", ink: "#3c3028", accent: "#b1684f", label: "MAKE + SAVE" },
    { bg: "#dfe9ec", ink: "#263a41", accent: "#567f8e", label: "BEGINNER FRIENDLY" },
  ],
};

function pinSvg(entry, variant, heroData = "") {
  const palette = palettes[entry.channel][variant];
  const { lines, fontSize } = fittedHeadline(entry.pins[variant]);
  const lineHeight = Math.round(fontSize * 1.12);
  const headlineStart = heroData ? (variant === 1 ? 940 : 905) : 600;
  const headlineEnd = headlineStart + (lines.length - 1) * lineHeight;
  const ctaY = heroData ? Math.min(1360, headlineEnd + 165) : Math.min(1330, headlineEnd + 205);
  if (heroData) {
    const imageH = variant === 1 ? 820 : 1500;
    const panelY = variant === 1 ? 760 : 730;
    const panelOpacity = variant === 1 ? ".97" : ".94";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1500" viewBox="0 0 1000 1500"><defs><linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".58" stop-color="#000" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></linearGradient></defs><image href="${heroData}" x="0" y="0" width="1000" height="${imageH}" preserveAspectRatio="xMidYMid slice"/><rect width="1000" height="1500" fill="url(#shade)"/><rect x="0" y="${panelY}" width="1000" height="${1500-panelY}" fill="${palette.ink}" opacity="${panelOpacity}"/><rect x="70" y="70" rx="28" width="430" height="58" fill="${palette.bg}"/><text x="100" y="108" font-family="Arial,sans-serif" font-size="23" letter-spacing="3" font-weight="700" fill="${palette.ink}">${entry.channel === "crochet" ? "FREE CROCHET GUIDE" : "COPY THE FULL GUIDE"}</text>${lines.map((line,index)=>`<text x="72" y="${headlineStart + index * lineHeight}" font-family="Georgia,serif" font-size="${fontSize}" font-weight="700" fill="#fff7f1">${escapeXml(line)}</text>`).join("")}<line x1="72" y1="${headlineEnd + 75}" x2="360" y2="${headlineEnd + 75}" stroke="${palette.accent}" stroke-width="10"/><text x="72" y="${ctaY}" font-family="Arial,sans-serif" font-size="29" font-weight="700" fill="#fff7f1">OPEN FOR THE STEPS + CHECKLIST →</text><text x="72" y="1430" font-family="Georgia,serif" font-size="30" fill="#fff7f1">The Curated Pin</text></svg>`;
  }
  const motif = entry.channel === "crochet"
    ? `<g fill="none" stroke="${palette.accent}" stroke-width="12" opacity=".9"><circle cx="770" cy="330" r="112"/><circle cx="690" cy="330" r="112"/><circle cx="730" cy="245" r="112"/><circle cx="730" cy="415" r="112"/><path d="M730 510c110 170-95 250 55 420"/></g>`
    : `<g fill="none" stroke="${palette.accent}" stroke-width="12" opacity=".9"><path d="M665 255c0-78 112-82 112 9 0-91 112-87 112-9 0 104-112 170-112 170s-112-66-112-170z"/><path d="M680 840c95-105 176-105 270 0"/><circle cx="810" cy="760" r="26" fill="${palette.accent}"/></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1500" viewBox="0 0 1000 1500"><rect width="1000" height="1500" fill="${palette.bg}"/><circle cx="880" cy="100" r="330" fill="#fff" opacity=".35"/><path d="M0 1250C260 1100 535 1440 1000 1180V1500H0Z" fill="${palette.ink}" opacity=".08"/>${motif}<text x="82" y="145" font-family="Arial,sans-serif" font-size="25" letter-spacing="5" font-weight="700" fill="${palette.ink}">${palette.label}</text>${lines.map((line,index)=>`<text x="82" y="${headlineStart + index * lineHeight}" font-family="Georgia,serif" font-size="${fontSize}" font-weight="700" fill="${palette.ink}">${escapeXml(line)}</text>`).join("")}<line x1="82" y1="${headlineEnd + 90}" x2="355" y2="${headlineEnd + 90}" stroke="${palette.accent}" stroke-width="10"/><text x="82" y="${ctaY}" font-family="Arial,sans-serif" font-size="28" font-weight="700" fill="${palette.ink}">${entry.channel === "crochet" ? "OPEN FOR MATERIALS + STEPS →" : "OPEN FOR SETUP + CHECKLIST →"}</text><text x="82" y="1400" font-family="Georgia,serif" font-size="33" fill="${palette.ink}">The Curated Pin</text></svg>`;
}

await mkdir(pinDir, { recursive: true });
await mkdir(releaseDir, { recursive: true });
const planRows = [];
const birthdayEntries = [...birthdayLaunch, ...birthdayGrowth];
const priorities = ["teen-sleepover-party-ideas","16th-birthday-party-ideas","18th-birthday-party-ideas","backyard-party-games","teen-birthday-party-games","first-birthday-themes-for-girls","first-birthday-themes-for-boys"];
const orderEntries = (entries) => [...entries].sort((a,b) => {
  const ai = priorities.indexOf(a.slug), bi = priorities.indexOf(b.slug);
  return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
});
function interleave(birthdayRows, crochetRows) {
  const rows=[];
  while (birthdayRows.length || crochetRows.length) {
    rows.push(...birthdayRows.splice(0,3));
    if (crochetRows.length) rows.push(crochetRows.shift());
  }
  return rows;
}
const heroSlugs = new Set(["teen-sleepover-party-ideas","16th-birthday-party-ideas","18th-birthday-party-ideas","backyard-party-games","crochet-flower-bouquet-pattern","easy-crochet-baby-blanket-pattern"]);
const entryRows=[];
for (let variant = 0; variant < 3; variant += 1) {
  const birthdayVariant=[];
  const crochetVariant=[];
  for (const entry of [...orderEntries(birthdayEntries), ...orderEntries(crochet)]) {
    const pinNumber = variant + 1;
    const fileName = `${entry.slug}-pin-${pinNumber}.png`;
    const temp = `${pinDir}/${entry.slug}-pin-${pinNumber}.svg`;
    let heroData="";
    if (heroSlugs.has(entry.slug)) {
      const bytes=await readFile(`public/pinterest/heroes/${entry.slug}.png`);
      heroData=`data:image/png;base64,${bytes.toString("base64")}`;
    }
    await writeFile(temp, pinSvg(entry, variant, heroData));
    const result = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", temp, "-frames:v", "1", `${pinDir}/${fileName}`], { stdio: "inherit" });
    if (result.status !== 0) throw new Error(`Unable to render ${fileName}`);
    await unlink(temp);

    const link = new URL(`/article/${entry.slug}`, site);
    link.searchParams.set("utm_source", "pinterest");
    link.searchParams.set("utm_medium", "organic");
    link.searchParams.set("utm_campaign", "pinterest_outbound_test_sep2026");
    link.searchParams.set("utm_content", `${entry.slug}_v${pinNumber}_${heroData ? "photo_result" : "utility_static"}`);
    const row={
      channel: entry.channel,
      slug: entry.slug,
      variant: pinNumber,
      title: entry.pins[variant],
      mediaUrl: new URL(`/pinterest/bulk/${fileName}`, site).toString(),
      board: entry.board,
      thumbnail: "",
      description: compact(`${entry.pins[variant]}. Open the full guide for ${entry.benefit}. Then save it to your planning board.`).slice(0, 500),
      link: link.toString(),
      publishDate: "",
      keywords: [...new Set([entry.keyword, entry.board.toLowerCase(), entry.channel === "crochet" ? "crochet patterns" : "birthday party planning"])].join(", "),
      format: heroData ? "photo_result" : "utility_static",
    };
    (entry.channel === "crochet" ? crochetVariant : birthdayVariant).push(row);
  }
  entryRows.push(...interleave(birthdayVariant,crochetVariant));
}

const times=["00:10","00:58","01:46","02:35","03:22","04:11","05:03","05:51","06:39","07:28","08:16","09:04","09:53","10:41","11:29","12:18","13:06","13:54","14:43","15:31","16:19","17:08","17:56","18:44","19:33","20:21","21:09","21:58","22:46","23:34"];
function addDays(date, days){const value=new Date(`${date}T00:00:00Z`);value.setUTCDate(value.getUTCDate()+days);return value.toISOString().slice(0,10);}
entryRows.forEach((row,index)=>{
  const day=Math.floor(index/30);
  const slot=index%30;
  row.publishDate=`${addDays(startDate,day)}T${times[slot]}:00`;
  planRows.push(row);
});

function writeCsv(fileName, rows) {
  const values = rows.map((row) => [row.title,row.mediaUrl,row.board,row.thumbnail,row.description,row.link,row.publishDate,row.keywords]);
  return writeFile(`${releaseDir}/${fileName}`, `\uFEFF${[csvHeaders,...values].map((row)=>row.map(csvCell).join(",")).join("\r\n")}\r\n`);
}

await Promise.all([
  writeCsv("pinterest-bulk-crochet.csv", planRows.filter((row) => row.channel === "crochet")),
  writeCsv("pinterest-bulk-birthday.csv", planRows.filter((row) => row.channel === "birthday")),
  writeCsv("pinterest-bulk-all.csv", planRows),
  writeFile(`${releaseDir}/pinterest-pin-plan.json`, `${JSON.stringify(planRows, null, 2)}\n`),
]);
process.stdout.write(`Generated ${planRows.length} Pinterest rows and images at 30 per day: ${crochet.length * 3} Crochet + ${(birthdayLaunch.length + birthdayGrowth.length) * 3} Birthday.\n`);
