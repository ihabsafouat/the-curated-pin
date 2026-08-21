"use client";

import { useMemo, useRef, useState } from "react";
import type { MediaAsset } from "../../../db/media";
import { mediaVariantUrls, type MediaVariant } from "../../media/cloudinary";

type Mode = "original" | MediaVariant;

export default function MediaPickerField({
  label,
  value,
  onChange,
  media,
  mode = "original",
  altValue,
  onAltChange,
  placeholder = "https://…",
  required = false,
  name,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  media: MediaAsset[];
  mode?: Mode;
  altValue?: string;
  onAltChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  name?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return media;
    return media.filter((asset) => [asset.originalFilename, asset.altText, asset.caption, asset.credit, asset.tags.join(" ")].join(" ").toLowerCase().includes(q));
  }, [media, query]);

  function choose(asset: MediaAsset) {
    const variants = mediaVariantUrls(asset.secureUrl);
    const selected = mode === "original" ? variants.original : variants[mode];
    onChange(selected);
    if (onAltChange && asset.altText) onAltChange(asset.altText);
    dialog.current?.close();
  }

  return <div className="field mediaPickerField">
    <label>{label}</label>
    <div className="mediaPickerInput">
      <input name={name} type="url" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required}/>
      <button type="button" onClick={() => dialog.current?.showModal()}>Choose media</button>
    </div>
    <dialog ref={dialog} className="mediaPickerDialog" onClick={(event) => { if (event.target === dialog.current) dialog.current?.close(); }}>
      <header><div><small>MEDIA LIBRARY</small><h3>Choose an image</h3><p>{mode === "social" ? "1200×630 social crop" : mode === "pinterest" ? "1000×1500 Pinterest crop" : "Original asset; delivery is optimized automatically."}</p></div><button type="button" onClick={() => dialog.current?.close()} aria-label="Close media picker">×</button></header>
      <div className="mediaPickerSearch"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search filename, alt text, credit or tag…"/></div>
      <div className="mediaPickerGrid">{filtered.map((asset) => <button type="button" key={asset.id} onClick={() => choose(asset)} title={asset.altText}><img src={mediaVariantUrls(asset.secureUrl).thumb} alt=""/><span><b>{asset.altText}</b><small>{asset.width}×{asset.height} · {asset.format.toUpperCase()}</small></span></button>)}{!filtered.length && <p className="mediaPickerEmpty">No matching active media.</p>}</div>
      <footer><a href="/studio/media" target="_blank" rel="noopener noreferrer">Open full media library ↗</a></footer>
    </dialog>
    {altValue !== undefined && onAltChange && <div className="mediaPickerAlt"><label>Image alt text</label><input value={altValue} onChange={(event) => onAltChange(event.target.value)} maxLength={320}/></div>}
  </div>;
}
