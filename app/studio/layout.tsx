import type { Metadata } from "next";

export const metadata: Metadata = { title: "Publisher Desk", description: "Protected publishing and analytics workspace.", robots: { index: false, follow: false, nocache: true } };

export default function AdminLayout({ children }: { children: React.ReactNode }) { return children; }
