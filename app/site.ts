export const SITE_NAME = "The Curated Pin";
const configuredSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").trim();
export const SITE_URL = (/^https?:\/\//i.test(configuredSiteUrl) ? configuredSiteUrl : `https://${configuredSiteUrl}`).replace(/\/$/, "");
export const DEFAULT_SOCIAL_IMAGE = "/default-social.png";

export const faqs = [
  {
    question: "What does The Curated Pin publish?",
    answer: "The Curated Pin organizes useful, visual ideas into focused Birthday and Crochet collections, with each guide built around a clear planning or making task.",
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
