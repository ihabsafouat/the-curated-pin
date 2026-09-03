export type ArticleSection = {
  heading: string;
  body: string;
};

export type ArticleImage = {
  url: string;
  alt: string;
  caption?: string;
};

export type ArticleBlock =
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "heading"; level: 2 | 3; text: string }
  | { id: string; type: "image"; url: string; alt: string; caption: string }
  | { id: string; type: "gallery"; title: string; images: ArticleImage[] }
  | { id: string; type: "idea"; eyebrow: string; title: string; body: string; image: string; imageAlt: string; budget: string; bestFor: string; setting: string }
  | { id: string; type: "checklist"; title: string; items: string[] }
  | { id: string; type: "bullets"; title: string; items: string[] }
  | { id: string; type: "table"; title: string; headers: string[]; rows: string[][] }
  | { id: string; type: "comparison"; title: string; leftTitle: string; leftItems: string[]; rightTitle: string; rightItems: string[] }
  | { id: string; type: "tip"; label: string; title: string; body: string }
  | { id: string; type: "pros_cons"; title: string; pros: string[]; cons: string[] }
  | { id: string; type: "affiliate_product"; merchant: string; network: string; name: string; description: string; url: string; image: string; imageAlt: string; cta: string; priceNote: string }
  | { id: string; type: "lead_magnet"; eyebrow: string; title: string; body: string; cta: string; url: string }
  | { id: string; type: "product_cta"; eyebrow: string; title: string; body: string; cta: string; url: string; price: string; image: string; imageAlt: string }
  | { id: string; type: "internal_link"; eyebrow: string; title: string; body: string; anchor: string; url: string }
  | { id: string; type: "source_list"; title: string; items: Array<{ label: string; publisher: string; url: string }> }
  | { id: string; type: "faq"; title: string; items: Array<{ question: string; answer: string }> }
  | { id: string; type: "pinterest_asset"; title: string; image: string; imageAlt: string; pinTitle: string; pinDescription: string }
  | { id: string; type: "quote"; text: string; attribution: string }
  | { id: string; type: "divider" };

export type Article = {
  slug: string;
  title: string;
  dek: string;
  image: string;
  readTime: string;
  sections: ArticleSection[];
  blocks: ArticleBlock[];
};

export function legacySectionsToBlocks(sections: ArticleSection[]): ArticleBlock[] {
  return sections.flatMap((section, index) => [
    { id: `legacy-heading-${index + 1}`, type: "heading" as const, level: 2 as const, text: section.heading },
    { id: `legacy-paragraph-${index + 1}`, type: "paragraph" as const, text: section.body },
  ]);
}

export function blocksToLegacySections(blocks: ArticleBlock[]): ArticleSection[] {
  const sections: ArticleSection[] = [];
  let current: ArticleSection | null = null;
  for (const block of blocks) {
    if (block.type === "heading" && block.level === 2) {
      if (current) sections.push(current);
      current = { heading: block.text, body: "" };
      continue;
    }
    if (block.type === "paragraph" && current && !current.body) current.body = block.text;
  }
  if (current) sections.push(current);
  return sections.filter((section) => section.heading.trim() && section.body.trim());
}
