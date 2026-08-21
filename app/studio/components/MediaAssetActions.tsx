"use client";

import { useState } from "react";
import { mediaVariantUrls } from "../../media/cloudinary";

export default function MediaAssetActions({ secureUrl }: { secureUrl: string }) {
  const [copied, setCopied] = useState("");
  const variants = mediaVariantUrls(secureUrl);
  async function copy(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1200);
  }
  return <div className="mediaCopyActions">
    <button type="button" onClick={() => copy("original", variants.original)}>{copied === "original" ? "Copied" : "Original"}</button>
    <button type="button" onClick={() => copy("social", variants.social)}>{copied === "social" ? "Copied" : "Social 1200×630"}</button>
    <button type="button" onClick={() => copy("pinterest", variants.pinterest)}>{copied === "pinterest" ? "Copied" : "Pinterest 2:3"}</button>
  </div>;
}
