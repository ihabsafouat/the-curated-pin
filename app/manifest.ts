import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Curated Pin",
    short_name: "Curated Pin",
    description: "Practical guides for celebrations, creative projects and ideas worth saving.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f2ea",
    theme_color: "#264135",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
