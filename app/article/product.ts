export type DedicatedArticleProduct = {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  url: string;
  kind: "lead_magnet" | "product";
  slug?: string;
};

const CROCHET_VERTICAL_PRODUCTS: Record<string, { eyebrow: string; title: string; body: string; cta: string }> = {
  "easy-crochet-flowers-for-beginners": {
    eyebrow: "FREE CROCHET PATTERN",
    title: "Get the complete crochet flower pattern PDF",
    body: "Enter your email to receive the printable 5-petal flower pattern, yarn guide, and beginner variations.",
    cta: "Send me the pattern",
  },
  "crochet-flower-bouquet-pattern": {
    eyebrow: "FREE CROCHET GUIDE",
    title: "Get the complete crochet bouquet pattern PDF",
    body: "Enter your email to receive the step-by-step bouquet assembly guide, stem methods, and flower ratios.",
    cta: "Send me the guide",
  },
  "crochet-flower-bag-pattern": {
    eyebrow: "FREE CROCHET PATTERN",
    title: "Get the complete crochet flower bag pattern PDF",
    body: "Enter your email to receive the printable tote pattern, lining instructions, and low-stretch strap guide.",
    cta: "Send me the pattern",
  },
  "crochet-blanket-size-chart-yarn-estimator": {
    eyebrow: "FREE CROCHET TOOLKIT",
    title: "Get the blanket size chart & yarn estimator PDF",
    body: "Enter your email to receive the complete blanket sizing reference, gauge calculator, and yardage worksheets.",
    cta: "Send me the chart",
  },
  "beginner-crochet-stitches-guide": {
    eyebrow: "FREE CROCHET GUIDE",
    title: "Get the 8 beginner crochet stitches guide PDF",
    body: "Enter your email to receive the printable stitch roadmap, visual tension checks, and swatch goal cards.",
    cta: "Send me the guide",
  },
  "easy-crochet-baby-blanket-pattern": {
    eyebrow: "FREE CROCHET PATTERN",
    title: "Get the easy crochet baby blanket pattern PDF",
    body: "Enter your email to receive the printable double-crochet blanket pattern, exact stitch counts, and safe border guide.",
    cta: "Send me the pattern",
  },
  "easy-crochet-tote-bag-pattern": {
    eyebrow: "FREE CROCHET PATTERN",
    title: "Get the easy crochet tote bag pattern PDF",
    body: "Enter your email to receive the printable two-panel tote pattern, strap reinforcement notes, and lining checklist.",
    cta: "Send me the pattern",
  },
  "easy-crochet-patterns-for-beginners": {
    eyebrow: "FREE CROCHET GUIDE",
    title: "Get the beginner crochet patterns collection PDF",
    body: "Enter your email to receive the printable collection of easy starter projects with yarn and gauge recommendations.",
    cta: "Send me the guide",
  },
  "crochet-ideas-for-beginners": {
    eyebrow: "FREE CROCHET GUIDE",
    title: "Get the beginner crochet project checklist PDF",
    body: "Enter your email to receive the printable guide to project difficulty, yarn requirements, and quick-win patterns.",
    cta: "Send me the guide",
  },
  "crochet-ghost-pattern": {
    eyebrow: "FREE CROCHET PATTERN",
    title: "Download the complete printable Crochet Ghost Amigurumi PDF",
    body: "Ready to make this friendly Halloween ghost? Download the complete printable Crochet Ghost Amigurumi PDF with the full materials list, stitch instructions, assembly guidance, and photo references.",
    cta: "Download the Crochet Ghost PDF",
  },
};

const CROCHET_SHOP_PRODUCTS: Record<string, { eyebrow: string; title: string; body: string; cta: string; url: string; slug: string }> = {
  "crochet-pumpkin-pattern": {
    eyebrow: "THE CURATED PIN SHOP",
    title: "Get Pips the Pumpkin Crochet Pattern PDF",
    body: "Download the complete printable amigurumi tutorial with materials list, row-by-row instructions, and photo guides.",
    cta: "Get the pattern ($5.99)",
    url: "/shop/pips-the-pumpkin",
    slug: "pips-the-pumpkin",
  },
  "crochet-bat-amigurumi-pattern": {
    eyebrow: "THE CURATED PIN SHOP",
    title: "Get Oscar the Little Bat Crochet Pattern PDF",
    body: "Download the complete printable amigurumi bat tutorial with wing construction, facial embroidery, and assembly guide.",
    cta: "Get the pattern ($5.99)",
    url: "/shop/oscar-the-little-bat",
    slug: "oscar-the-little-bat",
  },
  "crochet-ghost-pattern": {
    eyebrow: "THE CURATED PIN SHOP",
    title: "Get the Amigurumi Ghost Crochet Pattern PDF",
    body: "Download the complete printable witch-hat ghost pattern with stitch instructions, assembly guidance, and photo references.",
    cta: "Get the pattern ($5.99)",
    url: "/shop/amigurumi-ghost-crochet",
    slug: "amigurumi-ghost-crochet",
  },
  "crochet-dinosaur-amigurumi-pattern": {
    eyebrow: "THE CURATED PIN SHOP",
    title: "Get Bernard the Dinosaur Crochet Pattern PDF",
    body: "Download the complete printable amigurumi dinosaur pattern with 4-leg standing balance, dorsal spikes, and tail guide.",
    cta: "Get the pattern ($5.99)",
    url: "/shop/bernard-amigurumi-dino",
    slug: "bernard-amigurumi-dino",
  },
  "halloween-crochet-plushie-collection": {
    eyebrow: "THE CURATED PIN SHOP",
    title: "Get the 4-in-1 Halloween Crochet Pattern Bundle",
    body: "Get all four complete Halloween amigurumi patterns together: Bernard the Dino, Boo the Ghost, Oscar the Bat, and Pips the Pumpkin.",
    cta: "Get the bundle ($19)",
    url: "/shop/halloween-crochet-bundle",
    slug: "halloween-crochet-bundle",
  },
  "easy-crochet-baby-blanket-pattern": {
    eyebrow: "THE CURATED PIN SHOP",
    title: "Get the Rainbow Ripple Baby Blanket Crochet Pattern PDF",
    body: "Ready to start your blanket? Download the complete printable PDF pattern with chevron ripple stitch counts, color sequencing, and safe border finishing.",
    cta: "Get the pattern ($5.99)",
    url: "https://isafouat.gumroad.com/l/RainbowRippleBabyBlanket",
    slug: "rainbow-ripple-baby-blanket",
  },
  "crochet-blanket-size-chart-yarn-estimator": {
    eyebrow: "THE CURATED PIN SHOP",
    title: "Get the Rainbow Ripple Baby Blanket Crochet Pattern PDF",
    body: "Turn your sizing worksheet into a finished heirloom. Download the complete printable chevron ripple pattern with color sequence and yardage guide.",
    cta: "Get the pattern ($5.99)",
    url: "https://isafouat.gumroad.com/l/RainbowRippleBabyBlanket",
    slug: "rainbow-ripple-baby-blanket",
  },
};

export function getDedicatedArticleProduct(article: {
  slug: string;
  categoryPath?: string;
  title: string;
  blocks?: Array<{
    type: string;
    title?: string;
    body?: string;
    cta?: string;
    url?: string;
    eyebrow?: string;
    price?: string;
    [key: string]: unknown;
  }>;
}): DedicatedArticleProduct {
  // 1. Check if a curated paid shop product exists for this article
  if (CROCHET_SHOP_PRODUCTS[article.slug]) {
    const item = CROCHET_SHOP_PRODUCTS[article.slug];
    return {
      eyebrow: item.eyebrow,
      title: item.title,
      body: item.body,
      cta: item.cta,
      url: item.url,
      kind: "product",
      slug: item.slug,
    };
  }

  // 2. Check if a curated vertical crochet entry exists
  if (CROCHET_VERTICAL_PRODUCTS[article.slug]) {
    const item = CROCHET_VERTICAL_PRODUCTS[article.slug];
    return {
      eyebrow: item.eyebrow,
      title: item.title,
      body: item.body,
      cta: item.cta,
      url: `/free/${article.slug}`,
      kind: "lead_magnet",
      slug: article.slug,
    };
  }

  // 2. If the article contains an explicit lead_magnet block, reuse its curated copy & target
  const lmBlock = article.blocks?.find((b) => b.type === "lead_magnet");
  if (lmBlock && lmBlock.title && lmBlock.url) {
    const slugMatch = lmBlock.url.startsWith("/free/") ? lmBlock.url.slice("/free/".length).split(/[?#/]/)[0] : undefined;
    return {
      eyebrow: lmBlock.eyebrow || "FREE DOWNLOAD",
      title: lmBlock.title,
      body: lmBlock.body || "Enter your email to receive the complete printable resource and project notes.",
      cta: lmBlock.cta || "Send me the pattern",
      url: lmBlock.url,
      kind: "lead_magnet",
      slug: slugMatch || article.slug,
    };
  }

  // 3. If the article contains an explicit product_cta block, reuse its product copy
  const prodBlock = article.blocks?.find((b) => b.type === "product_cta");
  if (prodBlock && prodBlock.title && prodBlock.url) {
    const title = prodBlock.title.startsWith("Get ") ? prodBlock.title : `Get the ${prodBlock.title}`;
    const cta = prodBlock.price ? `${prodBlock.cta || "See the planner"} (${prodBlock.price})` : prodBlock.cta || "See the planner";
    const slugMatch = prodBlock.url.startsWith("/shop/") ? prodBlock.url.slice("/shop/".length).split(/[?#/]/)[0] : undefined;
    return {
      eyebrow: prodBlock.eyebrow || "THE CURATED PIN SHOP",
      title,
      body: prodBlock.body || "Turn this guide into an actionable plan with our beautifully designed printable workbook.",
      cta,
      url: prodBlock.url,
      kind: "product",
      slug: slugMatch,
    };
  }

  // 4. Fallback for any other crochet article
  if (article.categoryPath?.startsWith("crafts/crochet") || article.slug.includes("crochet")) {
    const cleanName = article.title
      .split(":")[0]
      .replace(/^(Free |Easy )/i, "")
      .replace(/for Beginners/i, "")
      .replace(/Pattern/i, "")
      .trim();
    const isGuide =
      article.slug.includes("stitches") ||
      article.slug.includes("chart") ||
      article.slug.includes("estimator") ||
      article.slug.includes("ideas");
    const eyebrow = isGuide ? "FREE CROCHET GUIDE" : "FREE CROCHET PATTERN";
    const title = `Get the complete ${cleanName.toLowerCase()} ${isGuide ? "guide" : "pattern"} PDF`;
    return {
      eyebrow,
      title,
      body: "Enter your email to receive the ad-free printable pattern, yarn recommendations, and project checklist.",
      cta: isGuide ? "Send me the guide" : "Send me the pattern",
      url: `/free/${article.slug}`,
      kind: "lead_magnet",
      slug: article.slug,
    };
  }

  // 5. Teen Birthday articles
  if (article.categoryPath?.includes("teen") || article.slug.includes("teen")) {
    return {
      eyebrow: "TEEN PARTY TOOLKIT",
      title: "Get The Teen Party Playbook + Games Pack",
      body: "A stylish 27-page printable planner with vibe boards, party blueprints, original photo prompts, and low-pressure activities.",
      cta: "See the playbook ($14)",
      url: "/shop/teen-birthday-party-planner",
      kind: "product",
      slug: "teen-birthday-party-planner",
    };
  }

  // 6. General Birthday / Celebrations articles
  return {
    eyebrow: "THE CURATED PIN SHOP",
    title: "Get the Ultimate Birthday Party Planner",
    body: "A beautifully designed 29-page printable planning system with budget worksheets, guest tracking, menus, activities, and calm timelines.",
    cta: "See the planner ($12)",
    url: "/shop/ultimate-birthday-party-planner",
    kind: "product",
    slug: "ultimate-birthday-party-planner",
  };
}
