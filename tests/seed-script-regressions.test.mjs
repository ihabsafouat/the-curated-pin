import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { links } from "../seo/birthday-plan.mjs";

const birthdaySeeder = await readFile(new URL("../scripts/seed-birthday-seo.mjs", import.meta.url), "utf8");
const launchSeeder = await readFile(new URL("../scripts/seed-launch-content.mjs", import.meta.url), "utf8");

test("birthday SEO seeder combines duplicate internal-link identities", () => {
  const identities = links.map((link) => JSON.stringify([link.source, link.target, link.anchor]));
  assert.ok(new Set(identities).size < identities.length, "the birthday plan includes overlapping internal-link recommendations");
  assert.match(birthdaySeeder, /const uniqueLinks = new Map\(\)/);
  assert.match(birthdaySeeder, /for \(const link of uniqueLinks\.values\(\)\)/);
  assert.match(birthdaySeeder, /semantic: Math\.max\(existing\.semantic, link\.semantic\)/);
});

test("draft-only launch seeder does not infer conflicting PostgreSQL parameter types", () => {
  assert.match(launchSeeder, /const requested = "draft"/);
  assert.match(launchSeeder, /published_at=NULL WHERE id=\$1/);
  assert.match(launchSeeder, /TRUE,NULL\) RETURNING id/);
  assert.doesNotMatch(launchSeeder, /CASE WHEN \$10/);
});
