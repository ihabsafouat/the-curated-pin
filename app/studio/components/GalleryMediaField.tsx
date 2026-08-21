"use client";

import { useMemo, useRef, useState } from "react";
import type { ArticleImage } from "../../content";
import type { MediaAsset } from "../../../db/media";
import { mediaVariantUrls } from "../../media/cloudinary";

export default function GalleryMediaField({
  title,
  images,
  onTitleChange,
  onChange,
  media,
}: {
  title: string;
  images: ArticleImage[];
  onTitleChange: (value: string) => void;
  onChange: (images: ArticleImage[]) => void;
  media: MediaAsset[];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return media;
    return media.filter((asset) => [asset.originalFilename, asset.altText, asset.caption, asset.credit, asset.tags.join(" ")].join(" ").toLowerCase().includes(q));
  }, [media, query]);

  const visibleImages = images.filter((image) => image.url.trim());

  function update(index: number, patch: Partial<ArticleImage>) {
    onChange(visibleImages.map((image, imageIndex) => imageIndex === index ? { ...image, ...patch } : image));
  }

  function move(index: number, delta: number) {
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= visibleImages.length) return;
    const next = [...visibleImages];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next);
  }

  function add(asset: MediaAsset) {
    if (visibleImages.some((image) => image.url.includes(asset.publicId))) return;
    onChange([...visibleImages, {
      url: asset.secureUrl,
      alt: asset.altText,
      caption: asset.caption || undefined,
    }]);
  }

  return <div className="galleryMediaField">
    <div className="field"><label>Gallery title</label><input value={title} onChange={(event) => onTitleChange(event.target.value)}/></div>
    <div className="galleryMediaToolbar"><button type="button" className="softButton" onClick={() => dialog.current?.showModal()}>+ Add from media library</button><small>{visibleImages.length} image{visibleImages.length === 1 ? "" : "s"}</small></div>
    <div className="galleryMediaItems">{visibleImages.map((image, index) => <article key={`${image.url}-${index}`}>
      <img src={mediaVariantUrls(image.url).thumb} alt=""/>
      <div>
        <label>Alt text<input value={image.alt} onChange={(event) => update(index, { alt: event.target.value })} maxLength={320}/></label>
        <label>Caption<input value={image.caption ?? ""} onChange={(event) => update(index, { caption: event.target.value })} maxLength={500}/></label>
      </div>
      <div className="galleryMediaItemActions"><button type="button" onClick={() => move(index, -1)} disabled={index === 0}>↑</button><button type="button" onClick={() => move(index, 1)} disabled={index === visibleImages.length - 1}>↓</button><button type="button" className="dangerText" onClick={() => onChange(visibleImages.filter((_, imageIndex) => imageIndex !== index))}>Remove</button></div>
    </article>)}</div>
    {!visibleImages.length && <p className="helper">Choose images from the verified media library. Their stored alt text and caption are carried into the gallery and remain editable for this article.</p>}
    <dialog ref={dialog} className="mediaPickerDialog" onClick={(event) => { if (event.target === dialog.current) dialog.current?.close(); }}>
      <header><div><small>MEDIA LIBRARY</small><h3>Add gallery images</h3><p>Select as many verified editorial assets as this gallery needs.</p></div><button type="button" onClick={() => dialog.current?.close()} aria-label="Close media picker">×</button></header>
      <div className="mediaPickerSearch"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search filename, alt text, credit or tag…"/></div>
      <div className="mediaPickerGrid">{filtered.map((asset) => {
        const selected = visibleImages.some((image) => image.url.includes(asset.publicId));
        return <button type="button" key={asset.id} className={selected ? "selected" : ""} onClick={() => add(asset)} disabled={selected} title={asset.altText}><img src={mediaVariantUrls(asset.secureUrl).thumb} alt=""/><span><b>{asset.altText}</b><small>{selected ? "Already added" : `${asset.width}×${asset.height} · ${asset.format.toUpperCase()}`}</small></span></button>;
      })}{!filtered.length && <p className="mediaPickerEmpty">No matching active media.</p>}</div>
      <footer><button type="button" onClick={() => dialog.current?.close()}>Done</button><a href="/studio/media" target="_blank" rel="noopener noreferrer">Open full media library ↗</a></footer>
    </dialog>
  </div>;
}
