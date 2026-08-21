import Link from "next/link";
import SubFooter from "../components/SubFooter";
import SubHeader from "../components/SubHeader";
import LogoutButton from "../components/LogoutButton";
import { getCsrfToken, requireUser, roleAtLeast } from "../security/auth";
import ChangePasswordForm from "../components/ChangePasswordForm";
import { privateRobots } from "../seo";

export const dynamic = "force-dynamic";
export const metadata = { title: 'Your Account', description: 'Manage your private The Curated Pin reader account.', alternates: { canonical: '/account' }, robots: privateRobots(false) };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser("/account");
  const csrf = await getCsrfToken();
  const params = await searchParams;
  return <main><SubHeader/><section className="accountPage shell"><small>YOUR CURATED CORNER</small><div className="accountHeading"><div><h1>Hello, {user.name.split(" ")[0]}.</h1><p>Your reader profile and private saved library.</p></div><span className={`roleBadge ${user.role}`}>{user.role}</span></div>{params.denied && <p className="accountNotice">That area requires a publisher role.</p>}<div className="accountGrid"><article><span>♡</span><h2>Favorites</h2><p>Keep your most useful stories together.</p><Link href="/saved?tab=favorite">Open favorites →</Link></article><article><span>⌑</span><h2>Read later</h2><p>Build a quiet queue for when you have time.</p><Link href="/saved?tab=read_later">Open read later →</Link></article>{roleAtLeast(user, "author") && <article className="publisherCard"><span>✦</span><h2>Publisher desk</h2><p>Create stories and review content performance.</p><Link href="/studio">Open dashboard →</Link></article>}</div><ChangePasswordForm csrf={csrf}/><div className="accountDetails"><div><b>{user.name}</b><span>{user.email}</span></div><LogoutButton/></div></section><SubFooter/></main>;
}
