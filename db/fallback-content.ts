import type { Category, LeadMagnet, ManagedArticle } from "./types";
import { launchArticles } from "../launch/birthday-launch-content.mjs";
import { growthArticles } from "../launch/birthday-growth-content.mjs";
import { verticalArticles } from "../launch/vertical-launch-content.mjs";

const FALLBACK_DATE = "2026-08-21T00:00:00.000Z";

type BundledLaunchArticle = {
  slug: string;
  categoryPath: string;
  title: string;
  dek: string;
  readTime: string;
  seoTitle: string;
  seoDescription: string;
  image: string;
  imageAlt: string;
  socialImage: string;
  blocks: ManagedArticle["blocks"];
};

const categoryDefinitions = [
  {
    id: -1,
    parentId: null,
    name: "Celebrations",
    slug: "celebrations",
    path: "celebrations",
    intro: "Useful planning ideas for birthdays, parties and milestones worth celebrating.",
    color: "#eadfd2",
    mark: "✦",
    showInNav: true,
    sortOrder: 10,
    seoTitle: "Celebration Ideas",
    seoDescription: "Practical planning ideas for birthdays, parties and milestones.",
  },
  {
    id: -2,
    parentId: -1,
    name: "Birthday Parties",
    slug: "birthday-parties",
    path: "celebrations/birthday-parties",
    intro: "Birthday ideas organized by age, setting, budget and the experience guests will actually have.",
    color: "#f0dfd1",
    mark: "01",
    showInNav: false,
    sortOrder: 10,
    seoTitle: "Birthday Party Ideas and Planning Guides",
    seoDescription: "Explore practical birthday party ideas, games and planning guides for every age and budget.",
  },
  {
    id: -3,
    parentId: -2,
    name: "Teen Birthdays",
    slug: "teen-birthdays",
    path: "celebrations/birthday-parties/teen-birthdays",
    intro: "Low-pressure teen party ideas built around activities, food, friends and realistic social flow.",
    color: "#e8d9e6",
    mark: "13+",
    showInNav: false,
    sortOrder: 20,
    seoTitle: "Teen Birthday Party Ideas",
    seoDescription: "Teen birthday ideas for small groups, sleepovers, active parties and milestone celebrations.",
  },
  {
    id: -4,
    parentId: -2,
    name: "Birthday Ideas by Age",
    slug: "by-age",
    path: "celebrations/birthday-parties/by-age",
    intro: "Age-aware birthday ideas that start with interests, energy level and guest dynamics.",
    color: "#e7e4cf",
    mark: "AGE",
    showInNav: false,
    sortOrder: 30,
    seoTitle: "Birthday Party Ideas by Age",
    seoDescription: "Find birthday party ideas by age, from first birthdays to tweens and teens.",
  },
  {
    id: -5,
    parentId: -2,
    name: "First Birthdays",
    slug: "first-birthdays",
    path: "celebrations/birthday-parties/first-birthdays",
    intro: "Simple first birthday ideas that prioritize timing, comfort, family and meaningful photos.",
    color: "#dfe9dc",
    mark: "1",
    showInNav: false,
    sortOrder: 40,
    seoTitle: "First Birthday Party Ideas",
    seoDescription: "Practical first birthday party ideas for a simple, comfortable and memorable celebration.",
  },
  {
    id: -6,
    parentId: -2,
    name: "Party Games",
    slug: "party-games",
    path: "celebrations/birthday-parties/party-games",
    intro: "Party games chosen for the group size, age, available space and amount of setup.",
    color: "#d9e6e1",
    mark: "PLAY",
    showInNav: false,
    sortOrder: 50,
    seoTitle: "Party Games for Kids and Groups",
    seoDescription: "Browse practical party games for kids, kindergarteners and large groups.",
  },
  {
    id: -24,
    parentId: -1,
    name: "Weddings",
    slug: "weddings",
    path: "celebrations/weddings",
    intro: "Wedding stationery, reception and planning guides designed to turn saved inspiration into a coherent guest experience.",
    color: "#eadfd8",
    mark: "♡",
    showInNav: true,
    sortOrder: 20,
    seoTitle: "Wedding Planning, Stationery and Reception Guides",
    seoDescription: "Plan wedding newspapers, signage, reception activities and coordinated stationery with practical guides and editable resources.",
  },
  ...[
    [-25,"Wedding Stationery","wedding-stationery","Wedding newspapers, invitations, welcome signs, menus and coordinated print guidance.","#eadfd8","✦",10],
    [-26,"Wedding Reception","reception","Reception activities, table details and guest-experience planning.","#e6ddd3","◇",20],
    [-27,"Wedding Planning","planning","Practical checklists, production schedules and decision guides for a coherent wedding day.","#e8e0d8","✓",30],
  ].map(([id,name,slug,intro,color,mark,sortOrder]) => ({
    id: id as number,
    parentId: -24,
    name: name as string,
    slug: slug as string,
    path: `celebrations/weddings/${slug}`,
    intro: intro as string,
    color: color as string,
    mark: mark as string,
    showInNav: false,
    sortOrder: sortOrder as number,
    seoTitle: `${name} Guides`,
    seoDescription: intro as string,
  })),
  // ── Crafts / Crochet vertical ──
  {
    id: -17,
    parentId: null,
    name: "Crafts",
    slug: "crafts",
    path: "crafts",
    intro: "Patterns, projects and practical guides for making things by hand.",
    color: "#dce5dc",
    mark: "✂",
    showInNav: false,
    sortOrder: 20,
    seoTitle: "Craft Projects and Guides",
    seoDescription: "Useful patterns, project plans and practical guidance for handmade work.",
  },
  {
    id: -18,
    parentId: -17,
    name: "Crochet",
    slug: "crochet",
    path: "crafts/crochet",
    intro: "Crochet ideas, free patterns, beginner projects and practical guides built around things readers can actually finish.",
    color: "#dfe6d6",
    mark: "🧶",
    showInNav: true,
    sortOrder: 20,
    seoTitle: "Crochet Ideas and Easy Patterns for Beginners",
    seoDescription: "Explore crochet ideas, beginner patterns, flowers, bags and blankets with materials, measurements and practical finishing guidance.",
  },
  ...[
    [-19,"Crochet Flowers","flowers","Flower and bouquet patterns with clear assembly and finishing guidance.","#eadeda","🌸",10],
    [-20,"Crochet Blankets","blankets","Blanket sizing, yarn estimates, stitch planning and finishing guidance.","#e7dfcf","▦",20],
    [-21,"Crochet Bags","bags","Structured crochet bag projects with lining, strap and durability notes.","#ddd9ce","◫",30],
    [-22,"Beginner Crochet","beginner","Beginner-friendly stitches, patterns and skill-building projects.","#dfe7dc","01",40],
    [-23,"Tools & Yarn","tools-yarn","Crochet hooks, yarn labels, gauge and practical buying guidance.","#d9e1df","↗",50],
  ].map(([id,name,slug,intro,color,mark,sortOrder]) => ({
    id: id as number,
    parentId: -18,
    name: name as string,
    slug: slug as string,
    path: `crafts/crochet/${slug}`,
    intro: intro as string,
    color: color as string,
    mark: mark as string,
    showInNav: false,
    sortOrder: sortOrder as number,
    seoTitle: `${name} Guides`,
    seoDescription: intro as string,
  })),
  // ── Style vertical ──
  {
    id: -7,
    parentId: null,
    name: "Style",
    slug: "style",
    path: "style",
    intro: "Focused personal-style edits, useful guides and wearable inspiration.",
    color: "#e6dce1",
    mark: "◇",
    showInNav: false,
    sortOrder: 30,
    seoTitle: "Style Guides",
    seoDescription: "Practical style guides, wearable inspiration and curated edits.",
  },
  {
    id: -8,
    parentId: -7,
    name: "Nails",
    slug: "nails",
    path: "style/nails",
    intro: "Wearable nail ideas, seasonal edits and practical design inspiration.",
    color: "#ead4da",
    mark: "💅",
    showInNav: true,
    sortOrder: 10,
    seoTitle: "Nail Ideas and Guides",
    seoDescription: "Wearable nail ideas, seasonal edits and practical design guides.",
  },
  {
    id: -9,
    parentId: -8,
    name: "Nail Art",
    slug: "nail-art",
    path: "style/nails/nail-art",
    intro: "Creative nail art ideas, tutorials and design inspiration for every skill level.",
    color: "#ebd0d8",
    mark: "✦",
    showInNav: false,
    sortOrder: 10,
    seoTitle: "Nail Art Ideas and Tutorials",
    seoDescription: "Creative nail art ideas, tutorials and design inspiration.",
  },
  {
    id: -10,
    parentId: -8,
    name: "Nail Care & Tips",
    slug: "nail-care-tips",
    path: "style/nails/nail-care-tips",
    intro: "Practical nail care routines, product recommendations and maintenance guides.",
    color: "#e8d5dc",
    mark: "✧",
    showInNav: false,
    sortOrder: 20,
    seoTitle: "Nail Care Tips and Routines",
    seoDescription: "Practical nail care routines, product picks and maintenance guides.",
  },
  {
    id: -11,
    parentId: -7,
    name: "Jewelry",
    slug: "jewelry",
    path: "style/jewelry",
    intro: "Curated jewelry guides, styling ideas and practical buying advice.",
    color: "#e6ddd5",
    mark: "💎",
    showInNav: true,
    sortOrder: 15,
    seoTitle: "Jewelry Guides and Styling Ideas",
    seoDescription: "Curated jewelry guides, styling ideas and buying advice.",
  },
  {
    id: -12,
    parentId: -11,
    name: "Rings",
    slug: "rings",
    path: "style/jewelry/rings",
    intro: "Ring guides covering styles, sizing, stacking ideas and buying recommendations.",
    color: "#e8dbd2",
    mark: "◯",
    showInNav: false,
    sortOrder: 10,
    seoTitle: "Ring Guides and Styling Ideas",
    seoDescription: "Ring guides covering styles, sizing, stacking ideas and buying recommendations.",
  },
  {
    id: -13,
    parentId: -11,
    name: "Necklaces",
    slug: "necklaces",
    path: "style/jewelry/necklaces",
    intro: "Necklace styling guides, layering ideas and curated picks for every occasion.",
    color: "#e4dcd6",
    mark: "◇",
    showInNav: false,
    sortOrder: 20,
    seoTitle: "Necklace Guides and Layering Ideas",
    seoDescription: "Necklace styling guides, layering ideas and curated picks.",
  },
  {
    id: -14,
    parentId: -11,
    name: "Bracelets",
    slug: "bracelets",
    path: "style/jewelry/bracelets",
    intro: "Bracelet guides from everyday styles to stacking ideas and gift picks.",
    color: "#e2ddd8",
    mark: "○",
    showInNav: false,
    sortOrder: 30,
    seoTitle: "Bracelet Guides and Styling Ideas",
    seoDescription: "Bracelet guides from everyday styles to stacking ideas and gift picks.",
  },
  {
    id: -15,
    parentId: -11,
    name: "Earrings",
    slug: "earrings",
    path: "style/jewelry/earrings",
    intro: "Earring styling guides, face-shape advice and curated seasonal edits.",
    color: "#e7d9d4",
    mark: "✧",
    showInNav: false,
    sortOrder: 40,
    seoTitle: "Earring Guides and Styling Advice",
    seoDescription: "Earring styling guides, face-shape advice and curated seasonal edits.",
  },
  {
    id: -16,
    parentId: -11,
    name: "Styling & Layering Guides",
    slug: "styling-layering",
    path: "style/jewelry/styling-layering",
    intro: "Practical guides for mixing, layering and styling jewelry with intent.",
    color: "#e5ddd0",
    mark: "▤",
    showInNav: false,
    sortOrder: 50,
    seoTitle: "Jewelry Styling and Layering Guides",
    seoDescription: "Practical guides for mixing, layering and styling jewelry.",
  },
] satisfies Array<Omit<Category, "status" | "socialImage" | "seoIndex" | "createdAt" | "updatedAt">>;

const activeCategoryDefinitions = categoryDefinitions.filter((category) =>
  category.path === "celebrations"
  || category.path.startsWith("celebrations/birthday-parties")
  || category.path === "crafts"
  || category.path.startsWith("crafts/crochet"),
);
const primaryNavigationPaths = new Set(["celebrations/birthday-parties", "crafts/crochet"]);

export const fallbackCategories: Category[] = activeCategoryDefinitions.map((category) => ({
  ...category,
  status: "active",
  showInNav: primaryNavigationPaths.has(category.path),
  socialImage: "",
  seoIndex: true,
  createdAt: FALLBACK_DATE,
  updatedAt: FALLBACK_DATE,
}));

const categoryByPath = new Map(fallbackCategories.map((category) => [category.path, category]));

export function fallbackCategory(path: string): Category | null {
  return categoryByPath.get(path) ?? null;
}

export function fallbackCategoryChildren(parentId: number): Category[] {
  return fallbackCategories
    .filter((category) => category.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

const bundledArticles = [...launchArticles, ...growthArticles, ...verticalArticles] as BundledLaunchArticle[];

export const fallbackLaunchArticles: ManagedArticle[] = bundledArticles.map((article, index) => {
  const category = fallbackCategory(article.categoryPath);
  return {
    id: -(index + 1),
    authorId: null,
    categoryId: category?.id ?? -2,
    category: category?.name ?? "Birthday Parties",
    categoryPath: article.categoryPath,
    slug: article.slug,
    title: article.title,
    dek: article.dek,
    image: article.image,
    readTime: article.readTime,
    sections: [],
    blocks: article.blocks,
    status: "published",
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    affiliateUrl: "",
    affiliateLabel: "",
    imageAlt: article.imageAlt,
    socialImage: article.socialImage,
    canonicalPath: "",
    seoIndex: true,
    createdAt: FALLBACK_DATE,
    updatedAt: FALLBACK_DATE,
    publishedAt: FALLBACK_DATE,
  };
});

const quickStartResource: LeadMagnet["resource"] = [
  { title: "Party snapshot", fields: ["Celebration date", "Age", "Guest count", "Location", "Theme / vibe"] },
  { title: "Budget map", checklist: ["Venue", "Food & drinks", "Cake / dessert", "Decorations", "Activities / games", "Favors", "Contingency"] },
  { title: "Guest & RSVP tracker", fields: ["Guest name", "Invited", "RSVP", "Dietary notes", "Contact"] },
  { title: "Food & drinks", checklist: ["Main food", "Snacks", "Drinks", "Cake / dessert", "Serving supplies", "Dietary alternatives"] },
  { title: "Games & activities", fields: ["Main activity", "Backup activity", "Setup needed", "Prizes / supplies"] },
  { title: "Shopping list", checklist: ["Decor", "Tableware", "Food", "Games", "Favors", "Last-minute items"] },
  { title: "Party-day timeline", fields: ["Setup starts", "Guests arrive", "Food", "Main activity", "Cake", "Photos", "Wrap-up"] },
];

const teenResource: LeadMagnet["resource"] = [
  { title: "Choose the vibe first", fields: ["Guest age", "Guest count", "Indoor / outdoor", "High-energy / relaxed", "Budget range"] },
  { title: "Teen-friendly theme filter", checklist: ["Feels age-appropriate", "Has one main activity", "Easy photo moment", "Food matches the vibe", "Doesn't require forced participation"] },
  { title: "Activity planner", fields: ["Main activity", "Backup activity", "Free-time option", "Materials", "Estimated duration"] },
  { title: "Food plan", checklist: ["Easy main food", "Grab-and-go snacks", "Drinks", "Dessert", "Late-night / movie snack"] },
  { title: "Sleepover / movie-night add-on", checklist: ["Sleeping setup", "Projector / screen", "Blankets", "Charging area", "Breakfast plan"] },
  { title: "Party timeline", fields: ["Arrival", "Icebreaker", "Main activity", "Food", "Free time", "Cake", "Photos", "Pickup / sleepover"] },
];

export const fallbackLeadMagnets: LeadMagnet[] = [
  {
    id: -1,
    slug: "birthday-party-quick-start-kit",
    name: "Birthday Party Quick-Start Kit",
    eyebrow: "FREE PARTY PLANNER",
    description: "A practical printable with the checklist, guest list, budget map, food plan, games plan, shopping list and party-day timeline in one place.",
    ctaLabel: "Get the free planning kit",
    interestKey: "birthday-parties",
    assetUrl: "/downloads/birthday-party-quick-start-kit.pdf",
    resource: quickStartResource,
    emailSubject: "Your Birthday Party Quick-Start Kit",
    emailIntro: "Your planning kit is ready. Use it to turn saved ideas into one clear party plan.",
    status: "active",
    seoIndex: false,
  },
  {
    id: -2,
    slug: "teen-birthday-party-planning-kit",
    name: "Teen Birthday Party Planning Kit",
    eyebrow: "FREE TEEN PARTY KIT",
    description: "A focused printable for teen birthdays: vibe selector, activity planner, food plan, sleepover/movie-night add-on and a realistic party timeline.",
    ctaLabel: "Send me the teen party kit",
    interestKey: "teen-birthdays",
    assetUrl: "/downloads/teen-birthday-party-planning-kit.pdf",
    resource: teenResource,
    emailSubject: "Your Teen Birthday Party Planning Kit",
    emailIntro: "Start with the vibe and main activity, then build food and timing around those decisions.",
    status: "active",
    seoIndex: false,
  },
];

export function fallbackLeadMagnet(slug: string): LeadMagnet | null {
  return fallbackLeadMagnets.find((magnet) => magnet.slug === slug) ?? null;
}

export function fallbackLeadMagnetForContext(context: { articleSlug?: string; categoryPath?: string }): LeadMagnet | null {
  if (context.categoryPath && !context.categoryPath.startsWith("celebrations/birthday-parties")) return null;
  if (context.articleSlug && verticalArticles.some((article) => article.slug === context.articleSlug)) return null;
  const teenSlugs = new Set(["teen-birthday-party-ideas", "13th-birthday-party-ideas", "18th-birthday-party-ideas"]);
  if (teenSlugs.has(context.articleSlug ?? "") || context.categoryPath?.startsWith("celebrations/birthday-parties/teen-birthdays")) {
    return fallbackLeadMagnets[1];
  }
  return fallbackLeadMagnets[0];
}
