"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import TurnstileWidget from "./TurnstileWidget";

export default function AuthForm({ mode, returnTo }: { mode: "login" | "register"; returnTo: string }) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading"); setMessage("");
    const form = new FormData(event.currentTarget);
    const base = { email: String(form.get("email") ?? ""), password: String(form.get("password") ?? ""), turnstileToken: String(form.get("cf-turnstile-response") ?? "") };
    const payload = mode === "register" ? { ...base, name: String(form.get("name") ?? ""), acceptTerms: form.get("acceptTerms") === "on" } : base;
    try {
      const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error || "We couldn’t complete that request.");
      window.location.assign(mode === "register" ? `/login?registered=1&returnTo=${encodeURIComponent(returnTo)}` : returnTo);
    } catch (error) { setState("error"); setMessage(error instanceof Error ? error.message : "Please try again."); }
  }

  return <form className="authForm" onSubmit={submit} noValidate>
    {mode === "register" && <div className="field"><label htmlFor="auth-name">Your name</label><input id="auth-name" name="name" autoComplete="name" minLength={2} maxLength={80} required /></div>}
    <div className="field"><label htmlFor="auth-email">Email address</label><input id="auth-email" name="email" type="email" autoComplete="email" maxLength={254} required /></div>
    <div className="field"><div className="fieldLabelRow"><label htmlFor="auth-password">Password</label>{mode === "login" && <Link href="/forgot-password">Forgot password?</Link>}</div><div className="passwordField"><input id="auth-password" name="password" type={visible ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "register" ? 12 : 1} maxLength={128} required /><button type="button" onClick={() => setVisible((v) => !v)} aria-label={visible ? "Hide password" : "Show password"}>{visible ? "Hide" : "Show"}</button></div></div>
    {mode === "register" && <><p className="passwordHint">Use 12+ characters with upper- and lowercase letters, a number and a symbol.</p><label className="termsCheck"><input type="checkbox" name="acceptTerms" required/><span>I agree to the <Link href="/privacy">Privacy Policy</Link> and <Link href="/terms">Terms</Link>.</span></label></>}
    <TurnstileWidget action={mode}/>
    {state === "error" && <p className="authError" role="alert">{message}</p>}
    <button className="authSubmit" type="submit" disabled={state === "loading"}>{state === "loading" ? "Please wait…" : mode === "login" ? "Log in securely" : "Create my account"}</button>
    <p className="authSwitch">{mode === "login" ? <>New here? <Link href={`/register?returnTo=${encodeURIComponent(returnTo)}`}>Create an account</Link></> : <>Already have an account? <Link href={`/login?returnTo=${encodeURIComponent(returnTo)}`}>Log in</Link></>}</p>
  </form>;
}
