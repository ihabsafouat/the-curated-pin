import Link from "next/link";
import { ForgotPasswordForm } from "../components/PasswordResetForms";
import { privateRobots } from "../seo";
export const metadata = { title: "Reset Password", description: "Request a secure password reset link.", alternates: { canonical: "/forgot-password" }, robots: privateRobots(true) };
export default function ForgotPasswordPage(){return <main className="authPage"><Link className="brand authBrand" href="/"><span className="brandmark"><i/><i/><i/></span><span>The Curated Pin</span></Link><section className="authCard"><div className="authIntro"><small>ACCOUNT RECOVERY</small><h1>Find your way<br/><em>back in.</em></h1><p>We&apos;ll send a single-use reset link if the address belongs to an account.</p></div><div className="authPanel"><small>RESET PASSWORD</small><h2>Request a link</h2><ForgotPasswordForm/></div></section></main>}
