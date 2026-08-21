import type { Category, LeadMagnet, ManagedArticle } from "./types";
import { launchArticles } from "../launch/birthday-launch-content.mjs";

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
] satisfies Array<Omit<Category, "status" | "socialImage" | "seoIndex" | "createdAt" | "updatedAt">>;

export const fallbackCategories: Category[] = categoryDefinitions.map((category) => ({
  ...category,
  status: "active",
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

export const fallbackLaunchArticles: ManagedArticle[] = (launchArticles as BundledLaunchArticle[]).map((article, index) => {
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

export function fallbackLeadMagnetForContext(context: { articleSlug?: string; categoryPath?: string }): LeadMagnet {
  const teenSlugs = new Set(["teen-birthday-party-ideas", "13th-birthday-party-ideas", "18th-birthday-party-ideas"]);
  if (teenSlugs.has(context.articleSlug ?? "") || context.categoryPath?.startsWith("celebrations/birthday-parties/teen-birthdays")) {
    return fallbackLeadMagnets[1];
  }
  return fallbackLeadMagnets[0];
}
