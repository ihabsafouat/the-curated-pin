"use client";

import { useEffect, useRef } from "react";

function SearchIcon(){return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>}

export default function HeaderSearch(){
  const input=useRef<HTMLInputElement>(null);
  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{
      if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){event.preventDefault();input.current?.focus();}
      if(event.key==="Escape"&&document.activeElement===input.current)input.current?.blur();
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[]);
  return <form className="search" action="/search" role="search"><SearchIcon/><input ref={input} name="q" aria-label="Search articles" placeholder="Search birthday ideas, games & guides"/><kbd>⌘ K</kbd></form>;
}
