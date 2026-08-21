"use client";

import Link from "next/link";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main style={{ maxWidth: 720, margin: "10vh auto", padding: 24, fontFamily: "system-ui, sans-serif" }}>
          <p style={{ textTransform: "uppercase", letterSpacing: ".12em", fontSize: 12 }}>The Curated Pin</p>
          <h1>We couldn&apos;t load this page.</h1>
          <p>Please retry. If the problem continues, return to the homepage and try again shortly.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button type="button" onClick={() => reset()} style={{ padding: "10px 16px" }}>Try again</button>
            <Link href="/" style={{ padding: "10px 16px" }}>Go home</Link>
          </div>
        </main>
      </body>
    </html>
  );
}
