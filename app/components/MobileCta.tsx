"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MobileCta() {
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const path = window.location.pathname;
      const excluded = ["/studio", "/login", "/register", "/account", "/thank-you", "/forgot-password", "/reset-password"];
      setHidden(excluded.some((route) => path.startsWith(route)) || localStorage.getItem("tcp:newsletter-subscribed") === "1");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  if (hidden) return null;
  return <Link className="mobileStickyCta" href="/#newsletter"><span>Get useful ideas every Sunday</span><b>Join free →</b></Link>;
}
