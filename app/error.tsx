"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Route error", error);
  }, [error]);

  return (
    <main className="error-state" role="main" aria-labelledby="route-error-title">
      <p className="eyebrow">Something went wrong</p>
      <h1 id="route-error-title">This page hit an unexpected problem.</h1>
      <p>Nothing you submitted should need to be repeated yet. Try the page again, or return to the homepage.</p>
      <div className="error-state__actions">
        <button type="button" className="button" onClick={() => reset()}>Try again</button>
        <Link className="button button--ghost" href="/">Go home</Link>
      </div>
    </main>
  );
}
