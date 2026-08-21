import Link from "next/link";
import LogoutButton from "../../components/LogoutButton";
import type { UserRole } from "../../../db/types";

export default function AdminHeader({ email, role }: { email: string; role: UserRole }) {
  const canManageTaxonomy = role === "editor" || role === "admin";
  return <header className="adminHeader"><a href="/studio" className="adminBrand"><span>The Curated Pin</span><b>{role}</b></a><nav><a href="/studio">Dashboard</a><Link href="/studio/articles/new">New article</Link><Link href="/studio/media">Media</Link>{canManageTaxonomy && <><Link href="/studio/categories">Categories</Link><Link href="/studio/seo-map">SEO map</Link><Link href="/studio/feedback">Feedback</Link><Link href="/studio/audience">Audience</Link><Link href="/studio/analytics">Analytics</Link></>}{role === "admin" && <><Link href="/studio/users">Roles</Link><Link href="/studio/security">Security</Link></>}<a href="/" target="_blank">View site ↗</a></nav><div className="adminAccount"><span>{email}</span><LogoutButton/></div></header>;
}
