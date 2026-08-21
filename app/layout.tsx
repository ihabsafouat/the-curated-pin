import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import EngagementTracker from "./components/EngagementTracker";
import { NewsletterPopup } from "./components/NewsletterSignup";
import AnalyticsConsent from "./components/AnalyticsConsent";
import MobileCta from "./components/MobileCta";
import ExperienceLayer from "./components/ExperienceLayer";
import { DEFAULT_SOCIAL_IMAGE, SITE_NAME, SITE_URL } from "./site";
import { getRuntimeValue } from "./runtime-env";
import { publicRobots } from "./seo";

const sans = Inter({ variable: "--font-sans", subsets: ["latin"], display: "swap" });
const display = Playfair_Display({ variable: "--font-display", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: { default: "The Curated Pin | Ideas Worth Saving", template: "%s | The Curated Pin" },
  description: "Practical, reader-first guides for celebrations, birthday planning and creative projects—carefully organized and worth saving.",
  robots: publicRobots(true),
  formatDetection: { telephone: false, address: false, email: false },
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "The Curated Pin | Ideas Worth Saving",
    description: "Practical guides for celebrations, birthday planning and creative projects—carefully edited and worth saving.",
    images: [{ url: DEFAULT_SOCIAL_IMAGE, width: 1200, height: 630, alt: "The Curated Pin — ideas worth saving" }],
  },
  twitter: { card: "summary_large_image", title: "The Curated Pin | Ideas Worth Saving", description: "Practical, reader-first guides for celebrations and creative projects.", images: [DEFAULT_SOCIAL_IMAGE] },
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body className={`${sans.variable} ${display.variable}`}><ExperienceLayer/><Suspense fallback={null}><EngagementTracker/></Suspense>{children}<NewsletterPopup/><MobileCta/><AnalyticsConsent measurementId={getRuntimeValue("NEXT_PUBLIC_GA_ID")} clarityId={getRuntimeValue("NEXT_PUBLIC_CLARITY_ID")}/></body></html>;
}
