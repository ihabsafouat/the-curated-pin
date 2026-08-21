"use client";

import { FormEvent, useState } from "react";
import type { AudienceInterest } from "../../db/types";

export default function EmailPreferencesForm({ token, interests, selected, subscribed }: { token: string; interests: AudienceInterest[]; selected: string[]; subscribed: boolean }) {
  const [state,setState] = useState<"idle"|"loading"|"saved"|"unsubscribed"|"error">("idle");
  const send = async (form: HTMLFormElement, unsubscribe = false) => {
    setState("loading");
    const data = new FormData(form);
    const interestKeys = unsubscribe ? [] : data.getAll("interest").map(String);
    try {
      const response = await fetch("/api/newsletter/preferences", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({ token, interestKeys, unsubscribe }) });
      if (!response.ok) throw new Error("request failed");
      setState(unsubscribe ? "unsubscribed" : "saved");
    } catch { setState("error"); }
  };
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void send(event.currentTarget,false); };
  if (state === "unsubscribed") return <div className="preferenceResult"><h2>You&apos;re unsubscribed.</h2><p>We&apos;ve stopped the email sequences for this address. You can rejoin from any signup form later.</p></div>;
  const topical = interests.filter((interest) => interest.interestKey !== "general");
  return <form className="emailPreferencesForm" onSubmit={submit}><fieldset disabled={state==="loading"}><legend>Choose the topics you want</legend>{topical.map((interest)=><label key={interest.interestKey}><input type="checkbox" name="interest" value={interest.interestKey} defaultChecked={selected.includes(interest.interestKey)}/><span><b>{interest.name}</b><small>{interest.description}</small></span></label>)}</fieldset><button className="primaryCta" type="submit" disabled={state==="loading"}>{state==="loading"?"Saving…":"Save preferences"}</button>{subscribed && <button className="textDangerButton" type="button" onClick={(event)=>{ const form=event.currentTarget.form; if(form) void send(form,true); }}>Unsubscribe from all email</button>}{state==="saved" && <p className="formSuccess">Preferences saved.</p>}{state==="error" && <p className="formError">We couldn&apos;t update your preferences. Please open the most recent email link and try again.</p>}</form>;
}
