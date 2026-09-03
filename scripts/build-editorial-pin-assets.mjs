import { mkdir, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(projectRoot, "public", "pinterest", "editorial", "pins");
const run = promisify(execFile);

const source = (relativePath) => path.join(projectRoot, "public", "pinterest", relativePath);

const birthdayHome = "editorial/source/generic-birthday-at-home.png";
const teenHangout = "editorial/source/teen-birthday-hangout.png";
const partyGames = "editorial/source/relatable-party-games.png";
const crochetFlowers = "editorial/source/crochet-flower-bouquet-natural.png";
const crochetProjects = "editorial/source/beginner-crochet-projects.png";
const crochetTote = "editorial/source/crochet-tote-natural.png";

const mappings = {
  "teen-sleepover-party-ideas": ["growth-teen-sleepover-party-ideas.png", teenHangout, "heroes/teen-sleepover-party-ideas.png"],
  "16th-birthday-party-ideas": ["growth-16th-birthday-party-ideas.png", "heroes/16th-birthday-party-ideas.png", teenHangout],
  "18th-birthday-party-ideas": ["heroes/18th-birthday-party-ideas.png", "heroes/16th-birthday-party-ideas.png", "growth-adult-birthday-party-ideas.png"],
  "easy-crochet-flowers-for-beginners": [crochetFlowers, crochetProjects, crochetTote],
  "backyard-party-games": ["growth-backyard-party-games.png", partyGames, "heroes/backyard-party-games.png"],
  "teen-birthday-party-games": ["growth-teen-birthday-party-games.png", partyGames, teenHangout],
  "first-birthday-themes-for-girls": ["growth-first-birthday-themes-for-girls.png", birthdayHome, "growth-balloon-decorating-ideas-for-birthday-party.png"],
  "crochet-flower-bouquet-pattern": [crochetFlowers, crochetProjects, crochetTote],
  "first-birthday-themes-for-boys": ["growth-first-birthday-themes-for-boys.png", birthdayHome, "growth-backyard-party-games.png"],
  "birthday-party-ideas": [birthdayHome, "growth-birthday-party-ideas-at-home.png", "growth-balloon-decorating-ideas-for-birthday-party.png"],
  "teen-birthday-party-ideas": [teenHangout, "growth-teen-sleepover-party-ideas.png", "growth-teen-birthday-party-games.png"],
  "crochet-flower-bag-pattern": [crochetTote, crochetFlowers, crochetProjects],
  "13th-birthday-party-ideas": [teenHangout, "growth-teen-sleepover-party-ideas.png", "heroes/teen-sleepover-party-ideas.png"],
  "birthday-party-ideas-for-girls": [birthdayHome, "growth-first-birthday-themes-for-girls.png", "growth-balloon-decorating-ideas-for-birthday-party.png"],
  "birthday-party-ideas-for-boys": [partyGames, "growth-backyard-party-games.png", birthdayHome],
  "crochet-blanket-size-chart-yarn-estimator": ["heroes/easy-crochet-baby-blanket-pattern.png", crochetProjects, crochetTote],
  "11-year-old-birthday-party-ideas": [partyGames, "growth-backyard-party-games.png", "growth-teen-birthday-party-games.png"],
  "12-year-old-birthday-party-ideas": [teenHangout, partyGames, "growth-teen-birthday-party-games.png"],
  "1st-birthday-party-ideas": ["growth-first-birthday-themes-for-girls.png", "growth-first-birthday-themes-for-boys.png", birthdayHome],
  "beginner-crochet-stitches-guide": [crochetProjects, "heroes/easy-crochet-baby-blanket-pattern.png", crochetTote],
  "party-games-for-kindergarteners": [partyGames, "growth-backyard-party-games.png", birthdayHome],
  "large-group-party-games": [partyGames, "growth-teen-birthday-party-games.png", "growth-backyard-party-games.png"],
  "party-games-for-kids": [partyGames, "growth-backyard-party-games.png", "growth-teen-birthday-party-games.png"],
  "easy-crochet-baby-blanket-pattern": ["heroes/easy-crochet-baby-blanket-pattern.png", crochetProjects, crochetTote],
  "inexpensive-party-food": ["growth-inexpensive-party-food.png", birthdayHome, "growth-birthday-party-ideas-at-home.png"],
  "balloon-decorating-ideas-for-birthday-party": ["growth-balloon-decorating-ideas-for-birthday-party.png", birthdayHome, "growth-first-birthday-themes-for-girls.png"],
  "birthday-party-ideas-at-home": ["growth-birthday-party-ideas-at-home.png", birthdayHome, "growth-teen-sleepover-party-ideas.png"],
  "easy-crochet-tote-bag-pattern": [crochetTote, crochetProjects, crochetFlowers],
  "adult-birthday-party-ideas": ["growth-adult-birthday-party-ideas.png", "growth-40th-birthday-party-ideas.png", "growth-50th-birthday-party-ideas.png"],
  "40th-birthday-party-ideas": ["growth-40th-birthday-party-ideas.png", "growth-adult-birthday-party-ideas.png", "growth-50th-birthday-party-ideas.png"],
  "50th-birthday-party-ideas": ["growth-50th-birthday-party-ideas.png", "growth-adult-birthday-party-ideas.png", "growth-40th-birthday-party-ideas.png"],
  "easy-crochet-patterns-for-beginners": [crochetProjects, crochetTote, "heroes/easy-crochet-baby-blanket-pattern.png"],
  "crochet-ideas-for-beginners": [crochetProjects, crochetFlowers, crochetTote],
};

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
const manifest = [];

for (const [slug, variants] of Object.entries(mappings)) {
  if (variants.length !== 3) throw new Error(`${slug} must have exactly three image variants`);
  for (const [index, relativeSource] of variants.entries()) {
    const variant = index + 1;
    const fileName = `${slug}-pin-${variant}.jpg`;
    await run("convert", [source(relativeSource), "-strip", "-interlace", "Plane", "-quality", "86", path.join(outputDir, fileName)]);
    manifest.push({ slug, variant, source: relativeSource, fileName, style: "natural-iphone-photo" });
  }
}

await writeFile(
  path.join(projectRoot, "public", "pinterest", "editorial", "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

console.log(`Built ${manifest.length} natural editorial Pin assets for ${Object.keys(mappings).length} articles.`);
