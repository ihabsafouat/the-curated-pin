"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { sendAnalyticsEvent } from "./analytics-client";

function articleSlug(path: string) {
  return path.startsWith("/article/") ? path.split("/").filter(Boolean)[1] : undefined;
}

function slugFromTarget(url: URL, prefix: string) {
  if (url.origin !== window.location.origin || !url.pathname.startsWith(prefix)) return undefined;
  return url.pathname.slice(prefix.length).split("/")[0] || undefined;
}

export default function EngagementTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  useEffect(() => {
    const path = pathname || window.location.pathname;
    if (path.startsWith("/studio") || path.startsWith("/account") || path.startsWith("/email/") || path.startsWith("/login") || path.startsWith("/register") || path.startsWith("/forgot-password") || path.startsWith("/reset-password")) return;
    const slug = articleSlug(path);
    const params = new URLSearchParams(searchKey || window.location.search);
    sendAnalyticsEvent({ eventType:"page_view", articleSlug:slug });
    if (path === "/search") {
      const query = params.get("q")?.trim();
      if (query) sendAnalyticsEvent({ eventType:"search", searchQuery:query });
    }
    if (path.startsWith("/free/")) {
      const leadMagnetSlug = path.split("/").filter(Boolean)[1];
      if (leadMagnetSlug) sendAnalyticsEvent({ eventType:"lead_magnet_access", leadMagnetSlug });
    }

    let engagedSent = false;
    let maxDepth = 0;
    const markEngaged = (seconds:number, depth:number) => {
      if (engagedSent || !slug) return;
      engagedSent = true;
      sendAnalyticsEvent({ eventType:"content_engaged", articleSlug:slug, engagementSeconds:seconds, scrollDepth:depth });
    };
    const started = Date.now();
    const timer = window.setTimeout(() => markEngaged(45,maxDepth),45_000);
    const onScroll = () => {
      const available = Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
      maxDepth = Math.max(maxDepth,Math.min(100,Math.round((window.scrollY/available)*100)));
      if (maxDepth >= 75 && Date.now()-started >= 10_000) markEngaged(Math.round((Date.now()-started)/1000),maxDepth);
    };
    window.addEventListener("scroll",onScroll,{passive:true});

    const seen = new WeakSet<Element>();
    const observer = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || seen.has(entry.target)) continue;
        seen.add(entry.target);
        const el = entry.target as HTMLElement;
        sendAnalyticsEvent({
          eventType:"cta_impression", articleSlug:slug,
          linkKind:el.dataset.analyticsKind || undefined, placement:el.dataset.analyticsPlacement || undefined,
          leadMagnetSlug:el.dataset.leadMagnet || undefined, productSlug:el.dataset.productSlug || undefined, merchant:el.dataset.merchant || undefined,
          targetLabel:el.dataset.analyticsLabel || undefined,
        });
      }
    },{threshold:0.45}) : null;
    const observeImpressions = (root: ParentNode) => root.querySelectorAll?.("[data-analytics-impression]").forEach((el)=>observer?.observe(el));
    observeImpressions(document);
    const mutationObserver = observer ? new MutationObserver((records) => {
      for (const record of records) for (const node of Array.from(record.addedNodes)) if (node instanceof Element) {
        if (node.matches("[data-analytics-impression]")) observer.observe(node);
        observeImpressions(node);
      }
    }) : null;
    mutationObserver?.observe(document.body,{childList:true,subtree:true});

    const onFocus = (event: FocusEvent) => {
      const form = (event.target as HTMLElement | null)?.closest("form[data-analytics-form]") as HTMLFormElement | null;
      if (!form || form.dataset.analyticsStarted === "1") return;
      form.dataset.analyticsStarted = "1";
      sendAnalyticsEvent({ eventType:"form_start", articleSlug:slug, linkKind:form.dataset.analyticsKind || "form", placement:form.dataset.analyticsPlacement || undefined, leadMagnetSlug:form.dataset.leadMagnet || undefined });
    };
    document.addEventListener("focusin",onFocus,true);

    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest("a") as HTMLAnchorElement | null;
      if (!link?.href) return;
      let url:URL; try { url=new URL(link.href,window.location.href); } catch { return; }
      const kind = link.dataset.analyticsKind || "";
      const common = { articleSlug:slug,targetUrl:url.origin===window.location.origin?url.pathname+url.search:url.href,targetLabel:link.dataset.analyticsLabel || link.textContent?.trim().slice(0,160) || "Link",placement:link.dataset.analyticsPlacement || undefined };
      if (kind === "affiliate") sendAnalyticsEvent({eventType:"affiliate_click",...common,linkKind:"affiliate",merchant:link.dataset.merchant||undefined,productSlug:link.dataset.productSlug||undefined});
      else if (kind === "product") sendAnalyticsEvent({eventType:"product_click",...common,linkKind:"product",productSlug:link.dataset.productSlug || slugFromTarget(url,"/shop/")});
      else if (kind === "checkout") sendAnalyticsEvent({eventType:"checkout_click",...common,linkKind:"checkout",productSlug:link.dataset.productSlug||undefined});
      else if (kind === "lead_magnet") sendAnalyticsEvent({eventType:"cta_click",...common,linkKind:"lead_magnet",leadMagnetSlug:link.dataset.leadMagnet || slugFromTarget(url,"/free/")});
      else if (kind === "internal") sendAnalyticsEvent({eventType:"internal_link_click",...common,linkKind:"internal"});
      else if (url.origin !== window.location.origin) sendAnalyticsEvent({eventType:"outbound_click",...common,linkKind:"external"});
    };
    document.addEventListener("click",onClick,{capture:true});
    return () => { window.clearTimeout(timer); window.removeEventListener("scroll",onScroll); mutationObserver?.disconnect(); observer?.disconnect(); document.removeEventListener("focusin",onFocus,true); document.removeEventListener("click",onClick,{capture:true}); };
  },[pathname,searchKey]);
  return null;
}
