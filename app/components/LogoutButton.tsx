"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  return <button className="accountLogout" type="button" disabled={loading} onClick={async () => {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.assign("/");
  }}>{loading ? "Signing out…" : "Sign out"}</button>;
}
