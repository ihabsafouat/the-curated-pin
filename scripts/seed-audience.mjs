import pg from "pg";

const databaseUrl = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_MIGRATION_URL or DATABASE_URL is required.");
const client = new pg.Client({ connectionString: databaseUrl });

const interests = [
  ["general", null, "The Sunday Save", "General publication updates and the weekly edit.", "active", 0],
  ["birthday-parties", "general", "Birthday Parties", "Birthday planning, themes, games, food, decor and printables.", "active", 10],
  ["teen-birthdays", "birthday-parties", "Teen Birthdays", "Teen party ideas, activities, themes and planning.", "active", 20],
  ["first-birthdays", "birthday-parties", "First Birthdays", "First birthday planning, themes and practical checklists.", "active", 30],
  ["party-games", "birthday-parties", "Party Games", "Age-appropriate party games and group activities.", "active", 40],
  ["party-themes", "birthday-parties", "Party Themes", "Birthday themes and ways to execute them.", "active", 50],
  ["party-food", "birthday-parties", "Party Food", "Menus, quantities, snacks and budget-friendly party food.", "active", 60],
  ["crochet", "general", "Crochet", "Future crochet guides and tools.", "inactive", 100],
  ["sewing", "general", "Sewing", "Future sewing guides and projects.", "inactive", 110],
];

const quickStartResource = [
  { title: "Party snapshot", fields: ["Celebration date", "Age", "Guest count", "Location", "Theme / vibe"] },
  { title: "Budget map", checklist: ["Venue", "Food & drinks", "Cake / dessert", "Decorations", "Activities / games", "Favors", "Contingency"] },
  { title: "Guest & RSVP tracker", fields: ["Guest name", "Invited", "RSVP", "Dietary notes", "Contact"] },
  { title: "Food & drinks", checklist: ["Main food", "Snacks", "Drinks", "Cake / dessert", "Serving supplies", "Dietary alternatives"] },
  { title: "Games & activities", fields: ["Main activity", "Backup activity", "Setup needed", "Prizes / supplies"] },
  { title: "Shopping list", checklist: ["Decor", "Tableware", "Food", "Games", "Favors", "Last-minute items"] },
  { title: "Party-day timeline", fields: ["Setup starts", "Guests arrive", "Food", "Main activity", "Cake", "Photos", "Wrap-up"] },
];

const teenResource = [
  { title: "Choose the vibe first", fields: ["Guest age", "Guest count", "Indoor / outdoor", "High-energy / relaxed", "Budget range"] },
  { title: "Teen-friendly theme filter", checklist: ["Feels age-appropriate", "Has one main activity", "Easy photo moment", "Food matches the vibe", "Doesn't require forced participation"] },
  { title: "Activity planner", fields: ["Main activity", "Backup activity", "Free-time option", "Materials", "Estimated duration"] },
  { title: "Food plan", checklist: ["Easy main food", "Grab-and-go snacks", "Drinks", "Dessert", "Late-night / movie snack"] },
  { title: "Sleepover / movie-night add-on", checklist: ["Sleeping setup", "Projector / screen", "Blankets", "Charging area", "Breakfast plan"] },
  { title: "Party timeline", fields: ["Arrival", "Icebreaker", "Main activity", "Food", "Free time", "Cake", "Photos", "Pickup / sleepover"] },
];

const magnets = [
  {
    slug: "birthday-party-quick-start-kit",
    name: "Birthday Party Quick-Start Kit",
    eyebrow: "FREE PARTY PLANNER",
    description: "A practical printable with the checklist, guest list, budget map, food plan, games plan, shopping list and party-day timeline in one place.",
    cta: "Get the free planning kit",
    interest: "birthday-parties",
    asset: "/downloads/birthday-party-quick-start-kit.pdf",
    subject: "Your Birthday Party Quick-Start Kit ✦",
    intro: "Your planning kit is ready. Use it to turn a pile of saved ideas into one clear party plan.",
    resource: quickStartResource,
  },
  {
    slug: "teen-birthday-party-planning-kit",
    name: "Teen Birthday Party Planning Kit",
    eyebrow: "FREE TEEN PARTY KIT",
    description: "A focused printable for teen birthdays: vibe selector, activity planner, food plan, sleepover/movie-night add-on and a realistic party timeline.",
    cta: "Send me the teen party kit",
    interest: "teen-birthdays",
    asset: "/downloads/teen-birthday-party-planning-kit.pdf",
    subject: "Your Teen Birthday Party Planning Kit ✦",
    intro: "Here is the teen-party planner. Start with the vibe and main activity, then build food and timing around those decisions.",
    resource: teenResource,
  },
];

const targets = [
  ["birthday-party-quick-start-kit", "global", "celebrations/birthday-parties", 20],
  ["birthday-party-quick-start-kit", "category", "celebrations/birthday-parties", 50],
  ["teen-birthday-party-planning-kit", "category", "celebrations/birthday-parties/teen-birthdays", 100],
  ["teen-birthday-party-planning-kit", "article", "teen-birthday-party-ideas", 120],
  ["teen-birthday-party-planning-kit", "article", "13th-birthday-party-ideas", 110],
  ["teen-birthday-party-planning-kit", "article", "18th-birthday-party-ideas", 110],
];

const sequences = [
  {
    slug: "birthday-party-welcome",
    name: "Birthday Party Welcome Sequence",
    interest: "birthday-parties",
    status: "active",
    steps: [
      [1, 24, "Pick the party before you buy the party", "One decision makes everything else easier.", "Before buying decor, choose the party's main idea: who it is for, the setting, the guest count and one main activity. That keeps the budget from spreading across ten unrelated ideas.", "Explore party themes", "/category/celebrations/birthday-parties/party-themes"],
      [2, 48, "The easiest way to avoid awkward party downtime", "Plan one anchor activity and one backup.", "A strong party rarely needs a minute-by-minute program. It needs one anchor activity, food at the right moment and a simple backup for unexpected downtime.", "Browse party games", "/category/celebrations/birthday-parties/party-games"],
      [3, 72, "Party food: plan quantities before recipes", "Guest count first, menu second.", "Start with how many people you are feeding and when they will eat. Then choose a simple menu. This prevents both overspending and the panic of running out.", "Plan party food", "/category/celebrations/birthday-parties/party-food"],
      [4, 72, "Keep this planner open while you build the party", "Your free planning kit is reusable.", "Return to the Quick-Start Kit whenever the plan changes. A single source of truth for budget, guests, food and activities is much easier than scattered notes and saved Pins.", "Open the printable kit", "/downloads/birthday-party-quick-start-kit.pdf"],
    ],
  },
  {
    slug: "teen-birthday-welcome",
    name: "Teen Birthday Welcome Sequence",
    interest: "teen-birthdays",
    status: "active",
    steps: [
      [1, 24, "The teen-party rule that prevents the cringe factor", "Build around an activity, not forced entertainment.", "For teen parties, choose a main activity people can opt into naturally: movie night, spa setup, outdoor games, a food experience or a creative project. The theme should support the activity rather than become the activity.", "Explore teen birthday ideas", "/category/celebrations/birthday-parties/teen-birthdays"],
      [2, 48, "Guest count changes almost everything", "Small-group and large-group teen parties need different plans.", "A party for six close friends can lean into one longer activity. A party for twenty needs flexible stations, easy food and space for people to move between groups.", "Open the teen planning hub", "/category/celebrations/birthday-parties/teen-birthdays"],
      [3, 72, "Use this 3-part teen party timeline", "Arrival → anchor activity → flexible hangout.", "Give arrivals a low-pressure activity, place the main activity in the middle, then leave room for food, photos and unstructured time. That structure feels organized without feeling over-managed.", "Open your printable", "/downloads/teen-birthday-party-planning-kit.pdf"],
    ],
  },
];

await client.connect();
try {
  await client.query("BEGIN");
  for (const [key, parent, name, description, status, sort] of interests) {
    await client.query(`INSERT INTO audience_interests (interest_key,parent_key,name,description,status,sort_order)
      VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT(interest_key) DO UPDATE SET parent_key=excluded.parent_key,name=excluded.name,description=excluded.description,status=excluded.status,sort_order=excluded.sort_order,updated_at=CURRENT_TIMESTAMP`,
      [key,parent,name,description,status,sort]);
  }
  for (const magnet of magnets) {
    await client.query(`INSERT INTO lead_magnets (slug,name,eyebrow,description,cta_label,interest_key,asset_url,resource_json,email_subject,email_intro,status,seo_index)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10,'active',FALSE)
      ON CONFLICT(slug) DO UPDATE SET name=excluded.name,eyebrow=excluded.eyebrow,description=excluded.description,cta_label=excluded.cta_label,interest_key=excluded.interest_key,resource_json=excluded.resource_json,email_subject=excluded.email_subject,email_intro=excluded.email_intro,status='active',updated_at=CURRENT_TIMESTAMP`,
      [magnet.slug,magnet.name,magnet.eyebrow,magnet.description,magnet.cta,magnet.interest,magnet.asset || "",JSON.stringify(magnet.resource),magnet.subject,magnet.intro]);
  }
  for (const [slug,type,key,priority] of targets) {
    await client.query(`INSERT INTO lead_magnet_targets (lead_magnet_id,target_type,target_key,priority)
      SELECT id,$2,$3,$4 FROM lead_magnets WHERE slug=$1
      ON CONFLICT(lead_magnet_id,target_type,target_key) DO UPDATE SET priority=excluded.priority`, [slug,type,key,priority]);
  }
  for (const sequence of sequences) {
    const row = await client.query(`INSERT INTO email_sequences (slug,name,interest_key,status) VALUES ($1,$2,$3,$4)
      ON CONFLICT(slug) DO UPDATE SET name=excluded.name,interest_key=excluded.interest_key,status=excluded.status,updated_at=CURRENT_TIMESTAMP RETURNING id`,
      [sequence.slug,sequence.name,sequence.interest,sequence.status]);
    const sequenceId = row.rows[0].id;
    for (const [number,delay,subject,preheader,body,ctaLabel,ctaUrl] of sequence.steps) {
      await client.query(`INSERT INTO email_sequence_steps (sequence_id,step_number,delay_hours,subject,preheader,body_text,cta_label,cta_url)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        ON CONFLICT(sequence_id,step_number) DO UPDATE SET delay_hours=excluded.delay_hours,subject=excluded.subject,preheader=excluded.preheader,body_text=excluded.body_text,cta_label=excluded.cta_label,cta_url=excluded.cta_url`,
        [sequenceId,number,delay,subject,preheader,body,ctaLabel,ctaUrl]);
    }
  }
  await client.query("COMMIT");
  console.log(`Seeded ${interests.length} interests, ${magnets.length} lead magnets and ${sequences.length} welcome sequences.`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
