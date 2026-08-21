import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm from "../components/AuthForm";
import { authIsConfigured, getCurrentUser, safeReturnTo } from "../security/auth";
import { privateRobots } from "../seo";

export const dynamic = "force-dynamic";
export const metadata = { title: 'Log In', description: 'Log in to keep favorite stories and read-later guides synced across your devices.', alternates: { canonical: '/login' }, robots: privateRobots(true) };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ returnTo?: string; registered?: string }> }) {
  const params = await searchParams;
  const returnTo = safeReturnTo(params.returnTo);
  if (await getCurrentUser()) redirect(returnTo);
  return <main className="authPage"><Link className="brand authBrand" href="/"><span className="brandmark"><i/><i/><i/></span><span>The Curated Pin</span></Link><section className="authCard"><div className="authIntro"><small>WELCOME BACK</small><h1>Return to your<br/><em>curated corner.</em></h1><p>Pick up where you left off and keep the ideas you love within easy reach.</p><div><span>✓ Favorites synced across devices</span><span>✓ One calm read-later library</span><span>✓ Your saved guides, ready anytime</span></div></div><div className="authPanel"><small>ACCOUNT ACCESS</small><h2>Log in</h2>{params.registered && <p className="formSuccess">Registration received. Sign in below, or use password reset if the email was already registered.</p>}{authIsConfigured() ? <AuthForm mode="login" returnTo={returnTo}/> : <p className="authError">Account access is being configured. Please return shortly.</p>}<Link className="backSite" href="/">← Continue reading</Link></div></section></main>;
}
