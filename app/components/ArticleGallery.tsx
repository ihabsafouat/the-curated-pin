"use client";

import { useRef, useState } from "react";
import type { ArticleImage } from "../content";
import MediaImage from "./MediaImage";

export default function ArticleGallery({ title, images }: { title:string; images:ArticleImage[] }) {
  const dialog=useRef<HTMLDialogElement>(null);
  const [active,setActive]=useState(0);
  const open=(index:number)=>{setActive(index);dialog.current?.showModal();};
  const close=()=>dialog.current?.close();
  const move=(direction:number)=>setActive((value)=>(value+direction+images.length)%images.length);
  if(!images.length)return null;
  const image=images[active];
  return <section className="richGallery">
    {title&&<h3>{title}</h3>}
    <div>{images.map((item,index)=><figure key={`${item.url}-${index}`}><button type="button" className="galleryOpen" onClick={()=>open(index)} aria-label={`Open image ${index+1} of ${images.length}`}><MediaImage src={item.url} alt={item.alt} loading="lazy" decoding="async" sizes="(max-width: 620px) 100vw, 380px"/></button>{item.caption&&<figcaption>{item.caption}</figcaption>}</figure>)}</div>
    <dialog ref={dialog} className="articleLightbox" onClick={(event)=>{if(event.target===dialog.current)close();}}>
      <button type="button" className="lightboxClose" onClick={close} aria-label="Close image viewer">×</button>
      {images.length>1&&<button type="button" className="lightboxPrev" onClick={()=>move(-1)} aria-label="Previous image">←</button>}
      <figure><MediaImage src={image.url} alt={image.alt} sizes="90vw"/>{image.caption&&<figcaption>{image.caption}</figcaption>}<small>{active+1} / {images.length}</small></figure>
      {images.length>1&&<button type="button" className="lightboxNext" onClick={()=>move(1)} aria-label="Next image">→</button>}
    </dialog>
  </section>;
}
