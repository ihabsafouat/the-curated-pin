"use client";

import { useEffect, useState } from "react";

export type GuideHeading = { id: string; text: string };

export default function ArticleGuideNav({ headings, categoryPath, categoryName }: { headings: GuideHeading[]; categoryPath: string; categoryName: string }) {
  const [active,setActive]=useState(headings[0]?.id || "");

  useEffect(()=>{
    if(!headings.length || !("IntersectionObserver" in window)) return;
    const nodes=headings.map((heading)=>document.getElementById(heading.id)).filter(Boolean) as HTMLElement[];
    const observer=new IntersectionObserver((entries)=>{
      const visible=entries.filter((entry)=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
      if(visible[0]?.target.id) setActive(visible[0].target.id);
    },{rootMargin:"-18% 0px -68% 0px",threshold:[0,1]});
    nodes.forEach((node)=>observer.observe(node));
    const onScroll=()=>{
      const passed=nodes.filter((node)=>node.getBoundingClientRect().top<=window.innerHeight*.24);
      if(passed.length) setActive(passed[passed.length-1].id);
    };
    window.addEventListener("scroll",onScroll,{passive:true});
    onScroll();
    return()=>{observer.disconnect();window.removeEventListener("scroll",onScroll);};
  },[headings]);

  return <nav className="articleGuideNav" aria-label="In this guide">
    <div className="articleGuideNavHead"><b>IN THIS GUIDE</b><span>{headings.length} sections</span></div>
    <div className="articleGuideLinks">
      {headings.map((heading,index)=><a href={`#${heading.id}`} key={heading.id} className={active===heading.id?"active":""} aria-current={active===heading.id?"location":undefined}><span>{String(index+1).padStart(2,"0")}</span>{heading.text}</a>)}
    </div>
    <a className="articleGuideMore" href={`/category/${categoryPath}`}>More {categoryName} guides <span>→</span></a>
  </nav>;
}
