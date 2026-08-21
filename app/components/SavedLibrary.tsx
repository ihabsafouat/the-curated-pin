"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import MediaImage from "./MediaImage";

type Item = { slug: string; title: string; category: string; image: string; dek: string; readTime: string };
type Tab = "favorite" | "read_later";

function stored(key: string) {
  try { return JSON.parse(localStorage.getItem(key) || "[]") as string[]; } catch { return []; }
}

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

export default function SavedLibrary({ articles, signedIn, initialTab }: { articles: Item[]; signedIn: boolean; initialTab: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const favoriteRaw = useStoredRaw("tcp:favorites");
  const readLaterRaw = useStoredRaw("tcp:read-later");
  const localFavorites = (() => { try { return JSON.parse(favoriteRaw) as string[]; } catch { return stored("tcp:favorites"); } })();
  const localReadLater = (() => { try { return JSON.parse(readLaterRaw) as string[]; } catch { return stored("tcp:read-later"); } })();
  const [remote, setRemote] = useState<{ favorites: string[]; readLater: string[] } | null>(null);
  useEffect(() => {
    if (!signedIn) return;
    fetch("/api/saves", { credentials: "same-origin" })
      .then(async (response): Promise<{ favorites?: string[]; readLater?: string[] } | null> => response.ok ? await response.json() : null)
      .then((body) => {
        if (body) setRemote({ favorites: body.favorites ?? [], readLater: body.readLater ?? [] });
      });
  }, [signedIn]);
  const favorites = remote?.favorites ?? localFavorites;
  const readLater = remote?.readLater ?? localReadLater;
  const ready = !signedIn || remote !== null;
  const selected = tab === "favorite" ? favorites : readLater;
  const items = articles.filter((article) => selected.includes(article.slug));
  return <div>
    <div className="savedTabs"><button className={tab === "favorite" ? "active" : ""} onClick={() => setTab("favorite")}>Favorites <span>{favorites.length}</span></button><button className={tab === "read_later" ? "active" : ""} onClick={() => setTab("read_later")}>Read later <span>{readLater.length}</span></button></div>
    {!ready ? <div className="emptySaved"><p>Loading your saved guides…</p></div> : items.length ? <div className="savedGrid">{items.map((item) => <a href={`/article/${item.slug}`} key={item.slug}><MediaImage src={item.image} alt={`Preview for ${item.title}`} variant="card" loading="lazy" decoding="async" sizes="(max-width: 650px) 115px, 240px"/><div><small>{item.category} · {item.readTime}</small><h2>{item.title}</h2><p>{item.dek}</p><b>Read guide →</b></div></a>)}</div> : <div className="emptySaved"><span>♡</span><h2>Nothing saved here yet.</h2><p>Use the save buttons on any guide and it will wait for you here{signedIn ? " on every device" : " on this device"}.</p><Link href="/">Browse the latest edit →</Link>{!signedIn && <p><Link href="/login?returnTo=%2Fsaved">Log in to sync your list →</Link></p>}</div>}
  </div>;
}
