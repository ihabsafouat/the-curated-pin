import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm from "../components/AuthForm";
import { authIsConfigured, getCurrentUser, safeReturnTo } from "../security/auth";
import { privateRobots } from "../seo";

export const dynamic = "force-dynamic";
export const metadata = { title: 'Create a Reader Account', description: 'Create a free The Curated Pin account to sync favorites and read-later guides.', alternates: { canonical: '/register' }, robots: privateRobots(true) };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const params = await searchParams;
  const returnTo = safeReturnTo(params.returnTo);
  if (await getCurrentUser()) redirect(returnTo);
  return <main className="authPage register"><Link className="brand authBrand" href="/"><span className="brandmark"><i/><i/><i/></span><span>The Curated Pin</span></Link><section className="authCard"><div className="authIntro"><small>SAVE WHAT MATTERS</small><h1>Your ideas,<br/><em>waiting for you.</em></h1><p>Create a free reader account to keep favorites and read-later guides together on every device.</p><div><span>✓ Synced favorites</span><span>✓ A calm read-later library</span><span>✓ No paid membership required</span></div></div><div className="authPanel"><small>CREATE ACCOUNT</small><h2>Join The Curated Pin</h2>{authIsConfigured() ? <AuthForm mode="register" returnTo={returnTo}/> : <p className="authError">Registration is being configured. Please return shortly.</p>}<Link className="backSite" href="/">← Continue reading</Link></div></section></main>;
}
