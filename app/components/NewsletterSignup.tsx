"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import TurnstileWidget from "./TurnstileWidget";
import { newsletterAttributionPayload, sendAnalyticsEvent } from "./analytics-client";

export type PublicLeadMagnet = {
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  ctaLabel: string;
  interestKey: string | null;
};

type SignupProps = {
  source: string;
  compact?: boolean;
  onSuccess?: () => void;
  magnet?: PublicLeadMagnet | null;
  interestKey?: string;
  articleSlug?: string;
  categoryPath?: string;
  showName?: boolean;
};

function SignupForm({ source, compact = false, onSuccess, magnet, interestKey, articleSlug, categoryPath, showName = false }: SignupProps) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const idSafe = useMemo(() => source.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 70), [source]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState("loading");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const firstName = String(form.get("firstName") || "");
    sendAnalyticsEvent({ eventType:"cta_click", articleSlug, categoryPath, leadMagnetSlug:magnet?.slug, linkKind:"lead_magnet", placement:source, targetLabel:magnet?.name || "Newsletter signup" });
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          firstName,
          source,
          interestKey: magnet?.interestKey || interestKey || "general",
          leadMagnetSlug: magnet?.slug || undefined,
          articleSlug,
          categoryPath,
          consent: form.get("consent") === "on",
          consentVersion: "email-v1",
          turnstileToken: String(form.get("cf-turnstile-response") || ""),
          ...newsletterAttributionPayload(),
        }),
      });
      if (!response.ok) throw new Error("signup failed");
      localStorage.setItem("tcp:newsletter-subscribed", "1");
      setState("done");
      onSuccess?.();
      const params = new URLSearchParams({ source });
      if (magnet?.slug) params.set("leadMagnet", magnet.slug);
      window.setTimeout(() => window.location.assign(`/thank-you?${params.toString()}`), 650);
    } catch {
      setState("error");
    }
  };
  if (state === "done") return <p className="formSuccess">{magnet ? "Your kit is ready ✦" : "You’re on the list. See you Sunday ✦"}</p>;
  return <form className={compact ? "popupForm audienceSignupForm" : "inlineNewsletterForm audienceSignupForm"} onSubmit={submit} data-analytics-form="newsletter" data-analytics-kind="lead_magnet" data-analytics-placement={source} data-lead-magnet={magnet?.slug || undefined}>
    {showName && <label htmlFor={`name-${idSafe}`}>First name <span>(optional)</span><input id={`name-${idSafe}`} name="firstName" type="text" autoComplete="given-name" maxLength={80} placeholder="Your first name"/></label>}
    <label htmlFor={`email-${idSafe}`}>Your email address</label>
    <div className="audienceEmailRow"><input id={`email-${idSafe}`} name="email" type="email" placeholder="you@example.com" required autoComplete="email"/><button type="submit" disabled={state === "loading"}>{state === "loading" ? "Sending…" : magnet ? `${magnet.ctaLabel} →` : "Join the list →"}</button></div>
    <label className="emailConsent"><input type="checkbox" name="consent" required/><span>{magnet ? `Send me the ${magnet.name} and relevant Curated Pin emails.` : "Send me The Sunday Save and relevant Curated Pin emails."} Unsubscribe anytime.</span></label>
    <TurnstileWidget action="newsletter"/>
    {state === "error" ? <small className="formError">That didn’t go through. Please check the form and try again.</small> : <small>We use your signup context to send the topic you asked for—not every topic on the site.</small>}
  </form>;
}

export function InlineNewsletter() {
  return <SignupForm source="footer" interestKey="general"/>;
}

export function LeadMagnetSignup({ magnet, source, articleSlug, categoryPath }: { magnet: PublicLeadMagnet; source: string; articleSlug?: string; categoryPath?: string; compact?: boolean }) {
  return <a className="downloadButton" href={`/free/${magnet.slug}`} data-analytics-kind="lead_magnet" data-lead-magnet={magnet.slug} data-analytics-placement={source} data-article-slug={articleSlug} data-category-path={categoryPath}>Download</a>;
}

export function ContextualLeadMagnet({ magnet, source, articleSlug, categoryPath }: { magnet: PublicLeadMagnet; source: string; articleSlug?: string; categoryPath?: string }) {
  return <aside className="contextualLeadMagnet" data-lead-magnet={magnet.slug} data-analytics-impression="true" data-analytics-kind="lead_magnet" data-analytics-placement={source} data-analytics-label={magnet.name}>
    <div><small>{magnet.eyebrow}</small><h3>{magnet.name}</h3><p>{magnet.description}</p><ul><li>Immediate browser access</li><li>Email delivery for later</li><li>Printable / save as PDF</li></ul></div>
    <LeadMagnetSignup magnet={magnet} source={source} articleSlug={articleSlug} categoryPath={categoryPath}/>
  </aside>;
}

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [magnet, setMagnet] = useState<PublicLeadMagnet | null>(null);
  const close = () => { localStorage.setItem("tcp:newsletter-dismissed", String(Date.now())); setOpen(false); };
  useEffect(() => {
    if (window.location.pathname.startsWith("/studio") || window.location.pathname.startsWith("/email/") || localStorage.getItem("tcp:newsletter-subscribed") === "1") return;
    const dismissedAt = Number(localStorage.getItem("tcp:newsletter-dismissed") || 0);
    if (Date.now() - dismissedAt < 1000 * 60 * 60 * 24 * 7) return;
    let shown = false;
    const show = async () => {
      if (shown) return;
      shown = true;
      try {
        const response = await fetch(`/api/lead-magnets/context?path=${encodeURIComponent(window.location.pathname)}`, { credentials: "same-origin" });
        if (response.ok) {
          const payload = await response.json() as { magnet?: PublicLeadMagnet | null };
          if (payload.magnet) setMagnet(payload.magnet);
        }
      } catch {}
      setOpen(true);
    };
    const timer = window.setTimeout(show, 11000);
    const onScroll = () => { if (window.scrollY > Math.max(520, document.documentElement.scrollHeight * 0.38)) void show(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.clearTimeout(timer); window.removeEventListener("scroll", onScroll); };
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  if (!open) return null;
  return <div className="popupBackdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}><section className="newsletterPopup" role="dialog" aria-modal="true" aria-labelledby="popup-title" data-analytics-impression="true" data-analytics-kind={magnet ? "lead_magnet" : "newsletter"} data-analytics-placement="popup" data-lead-magnet={magnet?.slug || undefined} data-analytics-label={magnet?.name || "The Sunday Save"}><button className="popupClose" type="button" onClick={close} aria-label="Close email offer">×</button>
    <small>{magnet?.eyebrow || "THE SUNDAY SAVE"}</small>
    <h2 id="popup-title">{magnet ? <>{magnet.name.split(" ").slice(0,-1).join(" ")}<br/><em>{magnet.name.split(" ").slice(-1)}</em></> : <>Save the good stuff.<br/><em>Skip the endless scroll.</em></>}</h2>
    <p>{magnet?.description || "A small edit of genuinely useful celebration and creative-project ideas — curated once a week."}</p>
    <SignupForm source={magnet ? `popup:${magnet.slug}` : "popup"} magnet={magnet} compact onSuccess={() => window.setTimeout(() => setOpen(false), 900)}/>
    <div className="popupProof"><span>✓ Context-aware</span><span>✓ Easy unsubscribe</span><span>✓ Reader-first picks</span></div>
  </section></div>;
}
