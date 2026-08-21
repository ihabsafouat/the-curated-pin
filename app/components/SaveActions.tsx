"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

type SaveKind = "favorite" | "read_later";
const keys: Record<SaveKind, string> = { favorite: "tcp:favorites", read_later: "tcp:read-later" };

function useStoredRaw(key: string) {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      window.addEventListener("tcp:saved", onChange);
      return () => { window.removeEventListener("storage", onChange); window.removeEventListener("tcp:saved", onChange); };
    },
    () => localStorage.getItem(key) || "[]",
    () => "[]",
  );
}

function csrfToken() {
  return document.cookie.split("; ").find((item) => item.startsWith("tcp_csrf="))?.split("=").slice(1).join("=") ?? "";
}

export default function SaveActions({ slug, signedIn }: { slug: string; signedIn: boolean }) {
  const favoriteRaw = useStoredRaw(keys.favorite);
  const readLaterRaw = useStoredRaw(keys.read_later);
  const localFavorites = (() => { try { return JSON.parse(favoriteRaw) as string[]; } catch { return []; } })();
  const localReadLater = (() => { try { return JSON.parse(readLaterRaw) as string[]; } catch { return []; } })();
  const [remote, setRemote] = useState<{ favorites: string[]; readLater: string[] } | null>(null);

  useEffect(() => {
    if (!signedIn) return;
    fetch("/api/saves", { credentials: "same-origin" })
      .then(async (response): Promise<{ favorites?: string[]; readLater?: string[] } | null> => response.ok ? await response.json() : null)
      .then((body) => {
        if (body) {
          setRemote({ favorites: body.favorites ?? [], readLater: body.readLater ?? [] });
        }
      });
  }, [signedIn]);

  const favorites = remote?.favorites ?? localFavorites;
  const readLater = remote?.readLater ?? localReadLater;
  const ready = !signedIn || remote !== null;

  async function toggle(kind: SaveKind) {
    const current = kind === "favorite" ? favorites : readLater;
    const exists = current.includes(slug);
    const next = exists ? current.filter((item) => item !== slug) : [...current, slug];
    if (signedIn) setRemote({ favorites: kind === "favorite" ? next : favorites, readLater: kind === "read_later" ? next : readLater });
    localStorage.setItem(keys[kind], JSON.stringify(next));
    window.dispatchEvent(new Event("tcp:saved"));
    if (signedIn) {
      const response = await fetch("/api/saves", {
        method: "POST",
        headers: { "content-type": "application/json", "x-csrf-token": csrfToken() },
        body: JSON.stringify({ slug, kind, saved: !exists }),
      }).catch(() => null);
      if (!response?.ok) {
        setRemote({ favorites: kind === "favorite" ? current : favorites, readLater: kind === "read_later" ? current : readLater });
      }
    } else if (!exists) {
      fetch("/api/track", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventType: kind, articleSlug: slug }), keepalive: true }).catch(() => {});
    }
  }

  const favorite = favorites.includes(slug);
  const later = readLater.includes(slug);
  return <div className="saveActions" aria-label="Save options">
    <button type="button" disabled={!ready} className={favorite ? "active" : ""} onClick={() => toggle("favorite")} aria-pressed={favorite}><span>♡</span>{favorite ? "Favorited" : "Add to favorites"}</button>
    <button type="button" disabled={!ready} className={later ? "active" : ""} onClick={() => toggle("read_later")} aria-pressed={later}><span>⌑</span>{later ? "Saved for later" : "Read later"}</button>
    <Link href="/saved">View saved →</Link>{!signedIn && <Link className="saveSignIn" href={`/login?returnTo=${encodeURIComponent(`/article/${slug}`)}`}>Log in to sync</Link>}
  </div>;
}
