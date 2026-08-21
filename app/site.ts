export const SITE_NAME = "The Curated Pin";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const DEFAULT_SOCIAL_IMAGE = "/default-social.png";

export const faqs = [
  {
    question: "What does The Curated Pin publish?",
    answer: "The Curated Pin organizes useful, visual ideas into focused editorial collections. We are launching with celebrations and birthday parties, then expanding into crafts such as crochet and sewing as those libraries are ready.",
  },
  {
    question: "How do you choose products and recommendations?",
    answer: "We look for usefulness, clarity, fit with the guide and reasonable value. A product is never included only because a commission may be available.",
  },
  {
    question: "Do you use affiliate links?",
    answer: "Yes, some clearly labeled links may earn us a commission at no extra cost to you. Editorial recommendations remain independent from that commission.",
  },
  {
    question: "Do I need an account to read or save an article?",
    answer: "Reading is always open. You can save on one device without an account; a free reader account lets you sync favorites and read-later guides across devices.",
  },
  {
    question: "How often is The Sunday Save sent?",
    answer: "Once a week. It contains a small selection of useful ideas and a featured guide, with an unsubscribe link in every email.",
  },
];

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
