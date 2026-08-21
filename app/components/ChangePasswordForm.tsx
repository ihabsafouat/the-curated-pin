"use client";

import { FormEvent, useState } from "react";

export default function ChangePasswordForm({ csrf }: { csrf: string }) {
  const [state,setState]=useState<"idle"|"loading"|"done"|"error">("idle");
  const [message,setMessage]=useState("");
  const [visible,setVisible]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setState("loading");setMessage("");const form=new FormData(event.currentTarget);try{const response=await fetch("/api/auth/change-password",{method:"POST",headers:{"content-type":"application/json","x-csrf-token":csrf},body:JSON.stringify({currentPassword:String(form.get("currentPassword")??""),newPassword:String(form.get("newPassword")??"")})});const body=await response.json() as {error?:string};if(!response.ok)throw new Error(body.error||"Could not update password.");setState("done");setMessage("Password updated. Other sessions were signed out.");event.currentTarget.reset();}catch(error){setState("error");setMessage(error instanceof Error?error.message:"Please try again.");}}
  return <form className="changePasswordForm" onSubmit={submit}><h2>Security</h2><p>Changing your password revokes every existing refresh session and creates a fresh session for this device.</p><div className="field"><label htmlFor="current-password">Current password</label><input id="current-password" name="currentPassword" type="password" autoComplete="current-password" required/></div><div className="field"><label htmlFor="new-password">New password</label><div className="passwordField"><input id="new-password" name="newPassword" type={visible?"text":"password"} autoComplete="new-password" minLength={12} maxLength={128} required/><button type="button" onClick={()=>setVisible(v=>!v)}>{visible?"Hide":"Show"}</button></div></div>{message&&<p className={state==="error"?"authError":"formSuccess"} role="status">{message}</p>}<button className="secondaryCta" disabled={state==="loading"}>{state==="loading"?"Updating…":"Change password"}</button></form>;
}
