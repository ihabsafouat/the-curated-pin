export type ShopProduct = {
  slug: string;
  name: string;
  shortName: string;
  price: string;
  priceValue: number;
  currency: "USD";
  eyebrow: string;
  description: string;
  longDescription: string;
  pages: number;
  checkoutEnv: string;
  leadMagnet: string;
  includes: string[];
  bestFor: string[];
  faqs: Array<{ question: string; answer: string }>;
};

export const shopProducts: ShopProduct[] = [
  {
    slug: "ultimate-birthday-party-planner",
    name: "Ultimate Birthday Party Planner",
    shortName: "Birthday Party Planner",
    price: "$12",
    priceValue: 12,
    currency: "USD",
    eyebrow: "THE CURATED PIN SHOP",
    description: "A reusable 29-page planning workbook for the budget, guests, theme, venue, food, activities, decor, shopping, setup and party-day timeline.",
    longDescription: "Built for the moment when saved ideas become real decisions. The workbook keeps the guest count, budget and main activity visible so decor and shopping do not take over the plan.",
    pages: 29,
    checkoutEnv: "CHECKOUT_URL_ULTIMATE_BIRTHDAY_PARTY_PLANNER",
    leadMagnet: "/free/birthday-party-quick-start-kit",
    includes: [
      "Party snapshot and priorities",
      "Budget overview + detailed budget tracker",
      "Guest list, RSVP and dietary tracker",
      "Theme, venue and decor planners",
      "Menu, serving quantity and dessert sheets",
      "Games and activity planner",
      "Shopping and setup task lists",
      "Party-day timeline and setup map",
      "Photo, gifts and thank-you trackers",
      "Weather backup, countdown and day-of checklists",
    ],
    bestFor: ["Parents planning kids or teen birthdays", "Adults planning milestone birthdays", "At-home or venue-based parties", "Anyone who wants one source of truth instead of scattered notes"],
    faqs: [
      { question: "Is this an editable Canva template?", answer: "No. The launch version is a clean printable PDF workbook designed for handwriting, tablet annotation or digital PDF markup." },
      { question: "Can I reuse it?", answer: "Yes, for your own personal birthday planning. Print or duplicate the file for future birthdays in your household. Resale or redistribution is not included." },
      { question: "Do I need every page?", answer: "No. The planner is modular. Use the pages that match the party you are actually planning." },
      { question: "Is this the same as the free Quick-Start Kit?", answer: "No. The free kit covers the essential planning decisions. This paid workbook adds detailed budget, venue, quantity, setup, countdown and follow-up pages." },
    ],
  },
  {
    slug: "teen-birthday-party-planner",
    name: "Teen Birthday Planner + Games Pack",
    shortName: "Teen Birthday Planner",
    price: "$14",
    priceValue: 14,
    currency: "USD",
    eyebrow: "TEEN PARTY TOOLKIT",
    description: "A 27-page teen-party workbook with planning sheets, activity selectors and original low-pressure printable games and photo challenges.",
    longDescription: "Designed around the way teen parties actually work: one anchor activity, flexible social time, easy food and optional games that do not depend on embarrassing anyone.",
    pages: 27,
    checkoutEnv: "CHECKOUT_URL_TEEN_BIRTHDAY_PARTY_PLANNER",
    leadMagnet: "/free/teen-birthday-party-planning-kit",
    includes: [
      "Teen party snapshot and vibe selector",
      "Guest, budget and anchor-activity planning",
      "Movie-night, sleepover, spa and backyard worksheets",
      "Food, playlist and party timeline planners",
      "Photo scavenger hunt",
      "This-or-That and Would-You-Rather sheets",
      "Emoji challenge builder",
      "Mini-tournament scoreboard",
      "One-minute challenge planner",
      "Photo prompts and conversation cards",
    ],
    bestFor: ["Ages roughly 13-18", "Sleepovers and movie nights", "Small or medium friend groups", "Parents and teens planning together"],
    faqs: [
      { question: "Are the games mandatory or highly structured?", answer: "No. They are optional tools for arrivals, downtime and groups that want an activity. The pack deliberately leaves room for unstructured hangout time." },
      { question: "Does it use copyrighted characters or branded themes?", answer: "No. The pack is original and brand-neutral, so it can work with many party styles." },
      { question: "Can the teen fill it out too?", answer: "Yes. The vibe, activity and playlist pages are especially useful to complete together." },
      { question: "What is different from the free Teen Planning Kit?", answer: "The paid pack adds detailed planning sheets plus original printable games, photo prompts, scoreboards and challenge pages." },
    ],
  },
];

export function getShopProduct(slug: string) {
  return shopProducts.find((product) => product.slug === slug) ?? null;
}

export function productCheckoutUrl(product: ShopProduct) {
  return (process.env[product.checkoutEnv] || "").trim();
}
