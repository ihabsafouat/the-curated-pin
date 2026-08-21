"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

const STORAGE_KEY = "tcp:analytics-consent";

function configureConsent(mode: "granted" | "denied") {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || ((...args: unknown[]) => window.dataLayer?.push(args));
  window.gtag("consent", "default", {
    analytics_storage: mode,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

function loadGA4(measurementId: string) {
  if (!measurementId || document.querySelector(`script[data-ga-id="${measurementId}"]`)) return;
  window.gtag?.("consent", "update", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  window.gtag?.("js", new Date());
  window.gtag?.("config", measurementId, { allow_google_signals: false, send_page_view: false });
  window.gtag?.("event", "page_view", { page_location: window.location.href, page_title: document.title });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  script.dataset.gaId = measurementId;
  document.head.appendChild(script);
}

function loadClarity(projectId: string) {
  if (!projectId || document.querySelector(`script[data-clarity-id="${projectId}"]`)) return;
  const queue = ((...args: unknown[]) => { (queue as unknown as { q?: unknown[] }).q = (queue as unknown as { q?: unknown[] }).q || []; (queue as unknown as { q: unknown[] }).q.push(args); }) as (...args: unknown[]) => void;
  window.clarity = window.clarity || queue;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${encodeURIComponent(projectId)}`;
  script.dataset.clarityId = projectId;
  document.head.appendChild(script);
}

export default function AnalyticsConsent({ measurementId, clarityId }: { measurementId?: string; clarityId?: string }) {
  const [choice, setChoice] = useState<"loading" | "accepted" | "declined" | "unset">("loading");
  useEffect(() => {
    configureConsent("denied");
    const frame = window.requestAnimationFrame(() => {
      if (!measurementId && !clarityId) { setChoice("declined"); return; }
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "accepted") { setChoice("accepted"); if (measurementId) loadGA4(measurementId); if (clarityId) loadClarity(clarityId); }
      else if (stored === "declined") setChoice("declined");
      else setChoice("unset");
    });
    return () => window.cancelAnimationFrame(frame);
  }, [measurementId, clarityId]);
  const decide = (next: "accepted" | "declined") => {
    localStorage.setItem(STORAGE_KEY, next); setChoice(next);
    if (next === "accepted") { if (measurementId) loadGA4(measurementId); if (clarityId) loadClarity(clarityId); }
    else { configureConsent("denied"); window.gtag?.("consent", "update", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" }); }
  };
  if (choice !== "unset") return null;
  return <aside className="consentBanner" aria-label="Analytics preferences"><div><b>Your privacy, your choice</b><p>With permission, GA4 and Microsoft Clarity help us understand which guides and layouts are useful. They stay off until you accept. <Link href="/privacy">Privacy details</Link></p></div><div><button type="button" className="consentDecline" onClick={() => decide("declined")}>Decline</button><button type="button" className="consentAccept" onClick={() => decide("accepted")}>Accept analytics</button></div></aside>;
}
