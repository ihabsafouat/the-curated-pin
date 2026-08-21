import type { Metadata } from "next";
import { absoluteUrl, DEFAULT_SOCIAL_IMAGE, SITE_NAME } from "./site";

export const EDITORIAL_AUTHOR_NAME = "The Curated Pin Editorial Team";
export const EDITORIAL_AUTHOR_PATH = "/authors/the-curated-pin-editors";

export function cleanDescription(value: string, fallback: string) {
  const compact = (value || fallback).replace(/\s+/g, " ").trim();
  return compact.length <= 180 ? compact : `${compact.slice(0, 177).trimEnd()}…`;
}

export function sameSiteCanonical(path: string, fallback: string) {
  const candidate = path.trim();
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) return fallback;
  return candidate.split("#", 1)[0].split("?", 1)[0] || fallback;
}

export function socialImage(value?: string) {
  const candidate = value?.trim();
  if (!candidate) return DEFAULT_SOCIAL_IMAGE;
  return candidate.startsWith("/") ? absoluteUrl(candidate) : candidate;
}

export function publicRobots(index = true): Metadata["robots"] {
  return {
    index,
    follow: true,
    googleBot: {
      index,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  };
}

export function privateRobots(follow = true): Metadata["robots"] {
  return { index: false, follow, nocache: true, googleBot: { index: false, follow } };
}

export function staticPageMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string;
  index?: boolean;
}): Metadata {
  const description = cleanDescription(input.description, input.title);
  const image = socialImage(input.image);
  return {
    title: input.title,
    description,
    alternates: { canonical: input.path },
    robots: publicRobots(input.index !== false),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: `${input.title} | ${SITE_NAME}`,
      description,
      url: input.path,
      images: [{ url: image, alt: input.title }],
    },
    twitter: { card: "summary_large_image", title: input.title, description, images: [image] },
  };
}
