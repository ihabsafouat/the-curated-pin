"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import TurnstileWidget from "./TurnstileWidget";

function token(form: FormData) { return String(form.get("cf-turnstile-response") ?? ""); }

export function ForgotPasswordForm() {
  const [state, setState] = useState<"idle"|"loading"|"done"|"error">("idle");
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("loading"); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: String(form.get("email") ?? ""), turnstileToken: token(form) }) });
      const body = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(body.error || "Please try again.");
      setMessage(body.message || "If that email is registered, a reset link will be sent shortly."); setState("done");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Please try again."); setState("error"); }
  }
  return <form className="authForm" onSubmit={submit}><div className="field"><label htmlFor="reset-email">Email address</label><input id="reset-email" name="email" type="email" autoComplete="email" required/></div><TurnstileWidget action="forgot-password"/>{message && <p className={state === "error" ? "authError" : "formSuccess"} role="status">{message}</p>}<button className="authSubmit" disabled={state === "loading"}>{state === "loading" ? "Sending…" : "Send reset link"}</button><p className="authSwitch"><Link href="/login">Back to login</Link></p></form>;
}

export function ResetPasswordForm({ resetToken }: { resetToken: string }) {
  const [state, setState] = useState<"idle"|"loading"|"done"|"error">("idle");
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("loading"); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token: resetToken, password: String(form.get("password") ?? ""), turnstileToken: token(form) }) });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error || "Please try again.");
      setState("done"); setMessage("Password updated. You can log in with the new password.");
    } catch (error) { setState("error"); setMessage(error instanceof Error ? error.message : "Please try again."); }
  }
  return <form className="authForm" onSubmit={submit}><div className="field"><label htmlFor="reset-password">New password</label><div className="passwordField"><input id="reset-password" name="password" type={visible ? "text" : "password"} autoComplete="new-password" minLength={12} maxLength={128} required/><button type="button" onClick={() => setVisible((v) => !v)} aria-label={visible ? "Hide password" : "Show password"}>{visible ? "Hide" : "Show"}</button></div></div><p className="passwordHint">Use 12+ characters with upper- and lowercase letters, a number and a symbol.</p><TurnstileWidget action="reset-password"/>{message && <p className={state === "error" ? "authError" : "formSuccess"} role="status">{message}</p>}{state !== "done" ? <button className="authSubmit" disabled={state === "loading"}>{state === "loading" ? "Updating…" : "Set new password"}</button> : <Link className="authSubmit linkButton" href="/login">Continue to login</Link>}</form>;
}
