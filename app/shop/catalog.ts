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
  coverImage: string;
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
    shortName: "The Birthday Party Planner",
    price: "$12",
    priceValue: 12,
    currency: "USD",
    eyebrow: "THE CURATED PIN SHOP",
    description: "A beautifully designed 29-page printable birthday-party planning system with budget worksheets, guest tracking, menus, activities, timelines and calm day-of checklists.",
    longDescription: "From the first saved idea to the final thank-you note, this thoughtfully designed 29-page workbook turns a hundred scattered decisions into one clear, confidence-building plan. Built for real budgets, real homes and celebrations that feel every bit as good as they look.",
    pages: 29,
    coverImage: "/shop/ultimate-birthday-party-planner-cover.png",
    checkoutEnv: "CHECKOUT_URL_ULTIMATE_BIRTHDAY_PARTY_PLANNER",
    leadMagnet: "/free/birthday-party-quick-start-kit",
    includes: [
      "The signature one-page party brief and celebration priorities",
      "A clear category-by-category budget and reusable expense tracker",
      "Guest, RSVP, allergy and dietary-preference planning",
      "Venue comparisons, layout notes and practical logistics",
      "A considered visual-direction and decoration worksheet",
      "Guest-count-led menu, cake and serving plans",
      "An anchor activity, backup ideas and original games bank",
      "Shopping, orders, deliveries and favor checklists",
      "Four-week, seven-day and party-day timelines",
      "Weather, accessibility, thank-you and reflection pages",
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
    name: "The Teen Party Playbook + Games Pack",
    shortName: "The Teen Party Playbook",
    price: "$14",
    priceValue: 14,
    currency: "USD",
    eyebrow: "TEEN PARTY TOOLKIT",
    description: "A stylish 27-page Teen Birthday Planner + Games Pack with vibe boards, party blueprints, original printable photo prompts and genuinely low-pressure activities.",
    longDescription: "A better teen party starts with the right vibe, not a forced itinerary. This beautifully designed 27-page playbook brings together flexible planning pages, movie-night and sleepover blueprints, original printable games and photo challenges that guests can actually choose to enjoy.",
    pages: 27,
    coverImage: "/shop/teen-birthday-party-planner-cover.png",
    checkoutEnv: "CHECKOUT_URL_TEEN_BIRTHDAY_PARTY_PLANNER",
    leadMagnet: "/free/teen-birthday-party-planning-kit",
    includes: [
      "A teen-approved vibe selector and one-page party brief",
      "Guest-list, budget, boundaries and accessibility planning",
      "Movie-night, sleepover, spa and backyard party blueprints",
      "A creative-studio and karaoke-night planning page",
      "Snack-bar, playlist, lighting and flexible timeline planners",
      "A consent-first photo moment and scavenger hunt",
      "Original This-or-That and Would-You-Rather printable cards",
      "A friendly emoji challenge and conversation-starter deck",
      "An eight-player mini-tournament and challenge scoreboard",
      "Low-pressure one-minute games, setup notes and thank-yous",
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
