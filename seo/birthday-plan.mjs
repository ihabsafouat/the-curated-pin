const categoryBase = "celebrations/birthday-parties";

export const pages = [
  { key:"cat:birthday-parties", entityType:"category", categoryPath:categoryBase, title:"Birthday Party Planning Hub", role:"hub", cluster:"birthday-core", keyword:"birthday party planning", intent:"informational", scope:"Navigation and planning hub for the birthday silo. It explains the planning journey and routes readers to ideas by age, themes, games, food, decorations and tools without competing with the broad ideas listicle.", status:"planned", priority:1, backlinkPriority:5 },
  { key:"article:birthday-party-ideas", entityType:"article", slug:"birthday-party-ideas", title:"Birthday Party Ideas", role:"pillar", cluster:"birthday-core", keyword:"birthday party ideas", intent:"informational", scope:"Broad inspiration pillar. Covers a curated selection of party concepts and routes specific age, theme, game, food and setup intents to their dedicated pages.", status:"planned", priority:2, volume:368000, kd:22, cpc:1.29, backlinkPriority:5 },
  { key:"cat:by-age", entityType:"category", categoryPath:`${categoryBase}/by-age`, title:"Birthday Ideas by Age", role:"thematic", cluster:"age", keyword:"birthday ideas by age", intent:"informational", scope:"Age-navigation hub only. It should compare age bands and route readers to dedicated age pages rather than duplicate their idea lists.", status:"planned", priority:3, backlinkPriority:4 },
  { key:"cat:teen-birthdays", entityType:"category", categoryPath:`${categoryBase}/teen-birthdays`, title:"Teen Birthday Planning Hub", role:"thematic", cluster:"teen", keyword:"teen birthday party planning", intent:"informational", scope:"Teen-specific planning hub. Routes to the teen ideas pillar, individual teen ages, games and sleepover content without trying to rank for the exact teen birthday party ideas query.", status:"planned", priority:4, backlinkPriority:4 },
  { key:"article:teen-birthday-party-ideas", entityType:"article", slug:"teen-birthday-party-ideas", title:"Teen Birthday Party Ideas", role:"pillar", cluster:"teen", keyword:"teen birthday party ideas", intent:"informational", scope:"Primary teen inspiration page. Owns generic teen-party idea variants; age-specific queries such as 13th, 16th and 18th are excluded and belong to their own pages.", status:"planned", priority:5, volume:4400, kd:14, cpc:1.03, backlinkPriority:4 },
  { key:"article:13th-birthday-party-ideas", entityType:"article", slug:"13th-birthday-party-ideas", title:"13th Birthday Party Ideas", role:"supporting", cluster:"teen", keyword:"13th birthday party ideas", intent:"informational", scope:"Only the 13th-birthday intent: age-appropriate themes, activities, guest-size and at-home/outdoor options. It links upward to the teen pillar.", status:"planned", priority:6, volume:3600, kd:17, cpc:0.52, backlinkPriority:2 },
  { key:"article:18th-birthday-party-ideas", entityType:"article", slug:"18th-birthday-party-ideas", title:"18th Birthday Party Ideas", role:"supporting", cluster:"teen", keyword:"18th birthday party ideas", intent:"informational", scope:"Only the 18th-birthday milestone intent. Avoid generic teen lists unless they are contextual links back to the teen pillar.", status:"planned", priority:7, volume:4400, kd:16, cpc:0.59, backlinkPriority:3 },
  { key:"article:birthday-party-ideas-for-girls", entityType:"article", slug:"birthday-party-ideas-for-girls", title:"Birthday Party Ideas for Girls", role:"supporting", cluster:"age", keyword:"birthday party ideas for girls", intent:"informational", scope:"Broad girl-oriented birthday ideas across ages. Do not optimize it for teen-girl or first-birthday-girl queries when a dedicated page owns those intents.", status:"planned", priority:8, volume:2400, kd:12, cpc:0, backlinkPriority:2 },
  { key:"article:birthday-party-ideas-for-boys", entityType:"article", slug:"birthday-party-ideas-for-boys", title:"Birthday Party Ideas for Boys", role:"supporting", cluster:"age", keyword:"birthday party ideas for boys", intent:"informational", scope:"Broad boy-oriented birthday ideas across ages. Specific first-birthday or age modifiers belong to dedicated pages.", status:"planned", priority:9, volume:1600, kd:22, backlinkPriority:2 },
  { key:"article:11-year-old-birthday-party-ideas", entityType:"article", slug:"11-year-old-birthday-party-ideas", title:"Birthday Party Ideas for 11 Year Olds", role:"supporting", cluster:"age", keyword:"ideas for 11 year olds birthday", intent:"informational", scope:"The 11-year-old age intent. Activities and themes should be tailored to pre-teens rather than copied from the generic kids page.", status:"planned", priority:10, volume:1600, kd:14, backlinkPriority:1 },
  { key:"article:12-year-old-birthday-party-ideas", entityType:"article", slug:"12-year-old-birthday-party-ideas", title:"12 Year Old Birthday Party Ideas", role:"supporting", cluster:"age", keyword:"12 year birthday ideas", intent:"informational", scope:"The 12-year-old age intent. It bridges pre-teen and teen content and should link naturally to the teen hub without duplicating the teen pillar.", status:"planned", priority:11, volume:1600, kd:19, backlinkPriority:1 },
  { key:"article:16th-birthday-party-ideas", entityType:"article", slug:"16th-birthday-party-ideas", title:"16th Birthday Party Ideas", role:"supporting", cluster:"teen", keyword:"16th birthday party ideas", intent:"informational", scope:"Sweet-16 and general 16th-birthday intent. Validate volume and difficulty before publication.", status:"research", priority:12, backlinkPriority:2 },
  { key:"cat:first-birthdays", entityType:"category", categoryPath:`${categoryBase}/first-birthdays`, title:"First Birthday Planning Hub", role:"thematic", cluster:"first", keyword:"first birthday themes", intent:"informational", scope:"First-birthday thematic hub. It can own the broad themes query while dedicated pages cover idea lists and gender-specific theme variants.", status:"planned", priority:13, volume:5400, kd:23, backlinkPriority:4 },
  { key:"article:1st-birthday-party-ideas", entityType:"article", slug:"1st-birthday-party-ideas", title:"1st Birthday Party Ideas", role:"pillar", cluster:"first", keyword:"1st birthday party ideas", intent:"informational", scope:"First-birthday idea list. It focuses on activities, setup and celebration formats; theme-only intent remains with the first-birthday hub.", status:"planned", priority:14, volume:3600, kd:20, cpc:0.47, backlinkPriority:3 },
  { key:"article:first-birthday-themes-for-girls", entityType:"article", slug:"first-birthday-themes-for-girls", title:"First Birthday Themes for Girls", role:"supporting", cluster:"first", keyword:"first birthday themes for girls", intent:"informational", scope:"Girl-specific first-birthday theme variants. Link to the first-birthday hub for the full theme taxonomy.", status:"planned", priority:15, volume:2900, kd:26, backlinkPriority:1 },
  { key:"article:first-birthday-themes-for-boys", entityType:"article", slug:"first-birthday-themes-for-boys", title:"First Birthday Themes for Boys", role:"supporting", cluster:"first", keyword:"first birthday themes boy", intent:"informational", scope:"Boy-specific first-birthday theme variants. Link to the first-birthday hub for broad theme coverage.", status:"planned", priority:16, volume:2900, kd:27, backlinkPriority:1 },
  { key:"cat:party-themes", entityType:"category", categoryPath:`${categoryBase}/party-themes`, title:"Birthday Party Themes", role:"thematic", cluster:"themes", keyword:"birthday party themes", intent:"informational", scope:"Theme hub that organizes themes by age, mood, season and setting. Theme-specific articles will sit below it later; it must not copy the broad birthday ideas pillar.", status:"planned", priority:17, volume:5400, kd:21, backlinkPriority:4 },
  { key:"cat:party-games", entityType:"category", categoryPath:`${categoryBase}/party-games`, title:"Birthday Party Games", role:"thematic", cluster:"games", keyword:"birthday party games", intent:"informational", scope:"Game-selection hub by age, group size, indoor/outdoor space and energy level. Supporting game pages own narrower intents.", status:"planned", priority:18, volume:3600, kd:24, backlinkPriority:5 },
  { key:"article:party-games-for-kindergarteners", entityType:"article", slug:"party-games-for-kindergarteners", title:"Party Games for Kindergarteners", role:"supporting", cluster:"games", keyword:"party games for kindergarteners", intent:"informational", scope:"Games specifically suitable for kindergarten-age children; safety, attention span and group management differentiate it from the generic kids game page.", status:"planned", priority:19, volume:2900, kd:20, backlinkPriority:2 },
  { key:"article:large-group-party-games", entityType:"article", slug:"large-group-party-games", title:"Large Group Party Games", role:"supporting", cluster:"games", keyword:"large group games", intent:"informational", scope:"Games optimized for large groups. Owns group-size intent rather than age intent.", status:"planned", priority:20, volume:2400, kd:17, cpc:0.22, backlinkPriority:3 },
  { key:"article:party-games-for-kids", entityType:"article", slug:"party-games-for-kids", title:"Party Games for Kids", role:"supporting", cluster:"games", keyword:"party games for kids", intent:"informational", scope:"General kids game list spanning multiple age bands. It should link out to kindergarten and teen game pages instead of reproducing their full lists.", status:"planned", priority:21, volume:2400, kd:24, backlinkPriority:2 },
  { key:"article:backyard-party-games", entityType:"article", slug:"backyard-party-games", title:"Backyard Party Games", role:"supporting", cluster:"games", keyword:"backyard games", intent:"informational", scope:"Outdoor/backyard setting intent. It can cross-link to outdoor birthday ideas because the semantic bridge is the setting, not merely the word party.", status:"planned", priority:22, volume:1900, kd:19, backlinkPriority:2 },
  { key:"article:teen-birthday-party-games", entityType:"article", slug:"teen-birthday-party-games", title:"Teen Birthday Party Games", role:"supporting", cluster:"teen", keyword:"teen birthday party games", intent:"informational", scope:"Teen-specific games only. Validate metrics before publishing; link to both the teen pillar and party-games hub.", status:"research", priority:23, backlinkPriority:2 },
  { key:"article:teen-sleepover-party-ideas", entityType:"article", slug:"teen-sleepover-party-ideas", title:"Teen Sleepover Party Ideas", role:"supporting", cluster:"teen", keyword:"teen sleepover party ideas", intent:"informational", scope:"Sleepover-specific teen intent: activities, setup, food and timing. It should not become another generic teen party list.", status:"research", priority:24, backlinkPriority:2 },
  { key:"cat:party-food", entityType:"category", categoryPath:`${categoryBase}/party-food`, title:"Birthday Party Food Ideas", role:"thematic", cluster:"food", keyword:"birthday party food ideas", intent:"informational", scope:"Food hub organized by serving style, budget, age and party format. Supporting pages own budget and quantity-specific searches.", status:"planned", priority:25, volume:2400, kd:29, backlinkPriority:4 },
  { key:"article:inexpensive-party-food", entityType:"article", slug:"inexpensive-party-food", title:"Inexpensive Party Food Ideas", role:"supporting", cluster:"food", keyword:"inexpensive party food", intent:"informational", scope:"Budget-specific food intent. Keep cost-saving tactics central and link to the broad party-food hub for other menus.", status:"planned", priority:26, volume:1000, kd:29, backlinkPriority:2 },
  { key:"cat:decorations", entityType:"category", categoryPath:`${categoryBase}/decorations`, title:"Birthday Party Decorations", role:"thematic", cluster:"decor", keyword:"birthday party decorations", intent:"mixed", scope:"Decoration hub covering balloons, tablescapes, signs and setup. It supports affiliate pages but must remain editorial rather than a thin shopping category.", status:"research", priority:27, backlinkPriority:4 },
  { key:"article:balloon-decorating-ideas-for-birthday-party", entityType:"article", slug:"balloon-decorating-ideas-for-birthday-party", title:"Balloon Decorating Ideas for Birthday Parties", role:"money", cluster:"decor", keyword:"balloon decorating ideas for birthday party", intent:"mixed", scope:"Balloon-decoration inspiration with quantities, setup difficulty and product recommendations. Strong bridge between visual Pinterest traffic and affiliate intent.", status:"planned", priority:28, volume:3600, kd:24, backlinkPriority:3 },
  { key:"cat:printables-planners", entityType:"category", categoryPath:`${categoryBase}/printables-planners`, title:"Birthday Printables & Planners", role:"utility", cluster:"conversion", keyword:"birthday party planner", intent:"mixed", scope:"Conversion/support hub for planning resources and lead magnets. It should not compete with inspiration pages; its purpose is planning and downloadable utility.", status:"research", priority:29, backlinkPriority:3 },
  { key:"article:birthday-party-checklist", entityType:"article", slug:"birthday-party-checklist", title:"Birthday Party Planning Checklist", role:"utility", cluster:"conversion", keyword:"birthday party checklist", intent:"informational", scope:"Checklist intent only: timeline and tasks from planning through cleanup. Validate keyword metrics before indexation.", status:"research", priority:30, backlinkPriority:5 },
  { key:"article:birthday-party-budget-planner", entityType:"article", slug:"birthday-party-budget-planner", title:"Birthday Party Budget Planner", role:"utility", cluster:"conversion", keyword:"birthday party budget planner", intent:"informational", scope:"Budgeting intent and lead-magnet support. It should be a genuinely useful planning tool rather than a thin sales page.", status:"research", priority:31, backlinkPriority:4 },
  { key:"article:birthday-party-favors", entityType:"article", slug:"birthday-party-favors", title:"Birthday Party Favor Ideas", role:"money", cluster:"decor", keyword:"birthday party favors", intent:"commercial", scope:"Favor ideas with practical filters such as age, budget and waste. Affiliate recommendations should be secondary to useful selection guidance.", status:"research", priority:32, backlinkPriority:2 },
  { key:"article:birthday-party-ideas-at-home", entityType:"article", slug:"birthday-party-ideas-at-home", title:"Birthday Party Ideas at Home", role:"supporting", cluster:"birthday-core", keyword:"birthday party ideas at home", intent:"informational", scope:"At-home setting intent. It owns constraints such as space, setup and cleanup; generic ideas are linked back to the main pillar.", status:"research", priority:33, backlinkPriority:2 },
  { key:"article:outdoor-birthday-party-ideas", entityType:"article", slug:"outdoor-birthday-party-ideas", title:"Outdoor Birthday Party Ideas", role:"supporting", cluster:"birthday-core", keyword:"outdoor birthday party ideas", intent:"informational", scope:"Outdoor setting intent including weather backup, space and activities. Links naturally to backyard games.", status:"research", priority:34, backlinkPriority:2 },
  { key:"article:cheap-birthday-party-ideas", entityType:"article", slug:"cheap-birthday-party-ideas", title:"Budget-Friendly Birthday Party Ideas", role:"supporting", cluster:"birthday-core", keyword:"cheap birthday party ideas", intent:"informational", scope:"Budget-constrained birthday ideas. Keep the page about full-party formats; inexpensive food has its own page.", status:"research", priority:35, backlinkPriority:3 },
  { key:"article:adult-birthday-party-ideas", entityType:"article", slug:"adult-birthday-party-ideas", title:"Adult Birthday Party Ideas", role:"pillar", cluster:"adult", keyword:"adult birthday party ideas", intent:"informational", scope:"Adult birthday inspiration pillar. It is distinct from milestone-age pages such as 40th and 50th birthdays.", status:"planned", priority:36, volume:3600, kd:22, cpc:1.51, backlinkPriority:3 },
  { key:"article:40th-birthday-party-ideas", entityType:"article", slug:"40th-birthday-party-ideas", title:"40th Birthday Party Ideas", role:"supporting", cluster:"adult", keyword:"40th birthday party ideas", intent:"informational", scope:"40th-birthday milestone intent. Link to the adult pillar; do not duplicate the full adult idea set.", status:"planned", priority:37, volume:4400, kd:24, cpc:0.75, backlinkPriority:2 },
  { key:"article:50th-birthday-party-ideas", entityType:"article", slug:"50th-birthday-party-ideas", title:"50th Birthday Party Ideas", role:"supporting", cluster:"adult", keyword:"50th birthday party ideas", intent:"informational", scope:"50th-birthday milestone intent. Link to the adult pillar; emphasize milestone-specific formats and details.", status:"planned", priority:38, volume:6600, kd:29, cpc:0.56, backlinkPriority:2 },
  { key:"article:21st-birthday-party-ideas", entityType:"article", slug:"21st-birthday-party-ideas", title:"21st Birthday Party Ideas", role:"supporting", cluster:"adult", keyword:"21st birthday party ideas", intent:"informational", scope:"21st-birthday milestone intent. Validate metrics before publication and keep alcohol references responsible/non-central so the page remains broadly useful.", status:"research", priority:39, backlinkPriority:2 },
];

export const keywords = [
  { page:"article:birthday-party-ideas", keyword:"birthday party ideas", role:"primary", volume:368000, kd:22, cpc:1.29 },
  { page:"article:birthday-party-ideas", keyword:"teen birthday party ideas", role:"excluded", notes:"Owned by the teen pillar." },
  { page:"article:birthday-party-ideas", keyword:"1st birthday party ideas", role:"excluded", notes:"Owned by the first-birthday pillar." },
  { page:"article:birthday-party-ideas", keyword:"birthday party games", role:"excluded", notes:"Owned by the party-games thematic hub." },
  { page:"article:birthday-party-ideas", keyword:"birthday party themes", role:"excluded", notes:"Owned by the party-themes thematic hub." },
  { page:"article:teen-birthday-party-ideas", keyword:"teen birthday party ideas", role:"primary", volume:4400, kd:14, cpc:1.03 },
  { page:"article:teen-birthday-party-ideas", keyword:"birthday party ideas for teenagers", role:"secondary", volume:2400, kd:13, cpc:1.03 },
  { page:"article:teen-birthday-party-ideas", keyword:"birthday ideas for teens", role:"secondary", volume:1900, kd:18 },
  { page:"article:teen-birthday-party-ideas", keyword:"13th birthday party ideas", role:"excluded", notes:"Owned by the 13th-birthday page." },
  { page:"article:teen-birthday-party-ideas", keyword:"18th birthday party ideas", role:"excluded", notes:"Owned by the 18th-birthday page." },
  { page:"article:13th-birthday-party-ideas", keyword:"13th birthday party ideas", role:"primary", volume:3600, kd:17, cpc:0.52 },
  { page:"article:18th-birthday-party-ideas", keyword:"18th birthday party ideas", role:"primary", volume:4400, kd:16, cpc:0.59 },
  { page:"article:birthday-party-ideas-for-girls", keyword:"birthday party ideas for girls", role:"primary", volume:2400, kd:12, cpc:0 },
  { page:"article:birthday-party-ideas-for-boys", keyword:"birthday party ideas for boys", role:"primary", volume:1600, kd:22 },
  { page:"article:11-year-old-birthday-party-ideas", keyword:"ideas for 11 year olds birthday", role:"primary", volume:1600, kd:14 },
  { page:"article:12-year-old-birthday-party-ideas", keyword:"12 year birthday ideas", role:"primary", volume:1600, kd:19 },
  { page:"cat:first-birthdays", keyword:"first birthday themes", role:"primary", volume:5400, kd:23 },
  { page:"cat:first-birthdays", keyword:"birthday themes for first birthday", role:"secondary", volume:4400, kd:16 },
  { page:"article:1st-birthday-party-ideas", keyword:"1st birthday party ideas", role:"primary", volume:3600, kd:20, cpc:0.47 },
  { page:"article:first-birthday-themes-for-girls", keyword:"first birthday themes for girls", role:"primary", volume:2900, kd:26 },
  { page:"article:first-birthday-themes-for-boys", keyword:"first birthday themes boy", role:"primary", volume:2900, kd:27 },
  { page:"cat:party-themes", keyword:"birthday party themes", role:"primary", volume:5400, kd:21 },
  { page:"cat:party-games", keyword:"birthday party games", role:"primary", volume:3600, kd:24 },
  { page:"cat:party-games", keyword:"birthday celebration game", role:"secondary", volume:3600, kd:18 },
  { page:"article:party-games-for-kindergarteners", keyword:"party games for kindergarteners", role:"primary", volume:2900, kd:20 },
  { page:"article:large-group-party-games", keyword:"large group games", role:"primary", volume:2400, kd:17, cpc:0.22 },
  { page:"article:party-games-for-kids", keyword:"party games for kids", role:"primary", volume:2400, kd:24 },
  { page:"article:backyard-party-games", keyword:"backyard games", role:"primary", volume:1900, kd:19 },
  { page:"cat:party-food", keyword:"birthday party food ideas", role:"primary", volume:2400, kd:29 },
  { page:"article:inexpensive-party-food", keyword:"inexpensive party food", role:"primary", volume:1000, kd:29 },
  { page:"article:balloon-decorating-ideas-for-birthday-party", keyword:"balloon decorating ideas for birthday party", role:"primary", volume:3600, kd:24 },
  { page:"article:adult-birthday-party-ideas", keyword:"adult birthday party ideas", role:"primary", volume:3600, kd:22, cpc:1.51 },
  { page:"article:40th-birthday-party-ideas", keyword:"40th birthday party ideas", role:"primary", volume:4400, kd:24, cpc:0.75 },
  { page:"article:50th-birthday-party-ideas", keyword:"50th birthday party ideas", role:"primary", volume:6600, kd:29, cpc:0.56 },
];

const links = [];
const add = (source, target, anchor, type, placement="body", semantic=90, weight=1, rationale="") => links.push({source,target,anchor,type,placement,semantic,weight,required:true,rationale});

// Core authority flow: the navigation hub and broad pillar reinforce one another.
add("cat:birthday-parties", "article:birthday-party-ideas", "birthday party ideas", "child", "hub", 100, 2.20, "Primary editorial path from the planning hub into the broad ideas pillar.");
add("article:birthday-party-ideas", "cat:birthday-parties", "birthday party planning hub", "parent", "body", 100, 1.10, "Keeps broad inspiration connected to the practical planning hub.");

const thematicHubs = ["cat:by-age","cat:teen-birthdays","cat:first-birthdays","cat:party-themes","cat:party-games","cat:party-food","cat:decorations","cat:printables-planners"];
const pillarAnchorByHub = {
  "cat:by-age": "birthday party ideas by age",
  "cat:teen-birthdays": "birthday ideas beyond the teen years",
  "cat:first-birthdays": "more birthday party ideas",
  "cat:party-themes": "birthday ideas and themes",
  "cat:party-games": "birthday party ideas and activities",
  "cat:party-food": "complete birthday party ideas",
  "cat:decorations": "birthday setup and party ideas",
  "cat:printables-planners": "birthday party planning ideas",
};
for (const hub of thematicHubs) {
  add("cat:birthday-parties", hub, pages.find(p=>p.key===hub).title.toLowerCase(), "child", "hub", 95, 1.45, "Top-level silo navigation.");
  add(hub, "cat:birthday-parties", "birthday party planning", "parent", "hub", 96, 1.15, "Returns thematic authority to the birthday hub.");
  add(hub, "article:birthday-party-ideas", pillarAnchorByHub[hub], "contextual", "hub", 88, 1.35, "Feeds authority into the broad traffic pillar with an anchor that reflects the source page context.");
}

const clusterHub = {
  "teen":"cat:teen-birthdays", "first":"cat:first-birthdays", "games":"cat:party-games", "food":"cat:party-food", "decor":"cat:decorations", "conversion":"cat:printables-planners", "age":"cat:by-age", "adult":"cat:by-age", "themes":"cat:party-themes", "birthday-core":"cat:birthday-parties"
};
for (const page of pages.filter(p=>p.entityType==="article" && p.key!=="article:birthday-party-ideas")) {
  const hub = clusterHub[page.cluster];
  if (hub) {
    add(hub, page.key, page.keyword, "child", "hub", 94, page.role==="pillar"?1.55:1.20, "Thematic hub distributes relevance and internal authority to its owned intent.");
    add(page.key, hub, pages.find(p=>p.key===hub).title.toLowerCase(), "parent", "body", 95, 1.15, "Supporting page returns authority to its semantic hub.");
  }
  const pillarAnchor = {
    teen: "more birthday party ideas",
    first: "birthday party ideas for every age",
    games: "birthday party ideas and activities",
    food: "complete birthday party ideas",
    decor: "birthday decoration and party ideas",
    conversion: "birthday party planning ideas",
    age: "birthday party ideas by age",
    adult: "birthday ideas for every milestone",
    themes: "birthday party ideas and themes",
    "birthday-core": "birthday party ideas",
  }[page.cluster] ?? "birthday party ideas";
  add(page.key, "article:birthday-party-ideas", pillarAnchor, "contextual", "related", page.cluster==="birthday-core"?96:82, page.role==="pillar"?1.30:1.05, "Every useful branch has a natural route back to the broad ideas pillar with source-aware anchor text.");
}

// High-semantic sibling and contextual bridges. These are deliberately sparse to prevent semantic drift.
[
  ["article:teen-birthday-party-ideas","article:13th-birthday-party-ideas","13th birthday party ideas",96],
  ["article:teen-birthday-party-ideas","article:18th-birthday-party-ideas","18th birthday party ideas",96],
  ["article:teen-birthday-party-ideas","article:16th-birthday-party-ideas","16th birthday party ideas",96],
  ["article:teen-birthday-party-ideas","article:teen-birthday-party-games","teen birthday party games",94],
  ["article:teen-birthday-party-ideas","article:teen-sleepover-party-ideas","teen sleepover party ideas",91],
  ["article:13th-birthday-party-ideas","article:teen-birthday-party-games","party games for teens",88],
  ["article:18th-birthday-party-ideas","article:teen-birthday-party-games","teen party games",86],
  ["article:1st-birthday-party-ideas","cat:first-birthdays","first birthday themes",95],
  ["cat:first-birthdays","article:first-birthday-themes-for-girls","first birthday themes for girls",98],
  ["cat:first-birthdays","article:first-birthday-themes-for-boys","first birthday themes for boys",98],
  ["article:party-games-for-kids","article:party-games-for-kindergarteners","party games for kindergarteners",90],
  ["article:party-games-for-kindergarteners","article:party-games-for-kids","party games for kids",88],
  ["article:backyard-party-games","article:outdoor-birthday-party-ideas","outdoor birthday party ideas",86],
  ["article:outdoor-birthday-party-ideas","article:backyard-party-games","backyard party games",90],
  ["article:cheap-birthday-party-ideas","article:inexpensive-party-food","inexpensive party food",84],
  ["article:birthday-party-ideas-at-home","article:party-games-for-kids","party games for kids",78],
  ["article:balloon-decorating-ideas-for-birthday-party","cat:party-themes","birthday party themes",76],
  ["article:adult-birthday-party-ideas","article:40th-birthday-party-ideas","40th birthday party ideas",96],
  ["article:adult-birthday-party-ideas","article:50th-birthday-party-ideas","50th birthday party ideas",96],
  ["article:40th-birthday-party-ideas","article:adult-birthday-party-ideas","adult birthday party ideas",94],
  ["article:50th-birthday-party-ideas","article:adult-birthday-party-ideas","adult birthday party ideas",94],
  ["article:birthday-party-checklist","article:birthday-party-budget-planner","birthday party budget planner",90],
  ["article:birthday-party-budget-planner","article:birthday-party-checklist","birthday party planning checklist",90],
].forEach(([s,t,a,score])=>add(s,t,a,"sibling","related",score,1.00,"Contextual bridge with a shared planning dimension; semantic score is high enough to avoid topic drift."));

// Conversion links only where the reader is naturally planning, not from every page.
for (const source of ["article:birthday-party-ideas","article:teen-birthday-party-ideas","article:1st-birthday-party-ideas","article:birthday-party-ideas-at-home","article:cheap-birthday-party-ideas"]) {
  add(source,"article:birthday-party-checklist","birthday party planning checklist","conversion","cta",82,0.85,"Useful next step after idea discovery; intentionally not sitewide.");
}

export { links };

export const backlinkAssets = [
  { page:"cat:birthday-parties", name:"Birthday Party Planning Timeline", type:"reference-guide", angle:"A genuinely useful planning timeline that venues, parent blogs and local party businesses can cite as a practical reference.", audience:"party venues; parenting publishers; event planners; local family sites", priority:1 },
  { page:"article:birthday-party-ideas", name:"Birthday Ideas Decision Matrix", type:"original-reference", angle:"A sortable/reference-style matrix by age, budget, group size, indoor/outdoor and preparation time. It adds original utility beyond a generic ideas list.", audience:"parenting blogs; lifestyle publishers; party planners", priority:2 },
  { page:"article:teen-birthday-party-ideas", name:"Teen Party Activity Picker", type:"interactive-tool", angle:"A simple decision tool or downloadable chart matching teen party formats to group size, budget and energy level.", audience:"parenting sites; teen lifestyle publishers; school/community resources", priority:3 },
  { page:"cat:party-games", name:"Party Game Selector by Age & Group Size", type:"reference-tool", angle:"A cite-worthy selector that solves a recurring planning problem and can earn editorial links without buying or exchanging links.", audience:"teachers; parent bloggers; camps; community centers; party venues", priority:4 },
  { page:"cat:party-food", name:"Party Food Quantity Chart", type:"reference-chart", angle:"Original serving-quantity guidance by guest count and food style, with transparent assumptions and update notes.", audience:"food publishers; parent sites; venues; caterers", priority:5 },
  { page:"cat:decorations", name:"Balloon Quantity & Decoration Budget Guide", type:"reference-guide", angle:"A practical quantity/budget reference that decoration vendors and party-planning articles can cite.", audience:"party decorators; venues; DIY publishers; balloon vendors", priority:6 },
  { page:"cat:first-birthdays", name:"First Birthday Planning Timeline", type:"downloadable-checklist", angle:"A concise milestone planning timeline designed for citation and sharing, not gated solely for SEO value.", audience:"parenting publishers; pediatric/family resource sites; photographers; venues", priority:7 },
];
