"use client";

import { useEffect, useState } from "react";

function preferredTheme() {
  const saved = localStorage.getItem("tcp:theme");
  if (saved === "dark" || saved === "light") return saved;
  // The publication's art direction is light-first. Dark mode remains an
  // explicit reader choice instead of silently inheriting an OS preference.
  return "light";
}

export default function ExperienceLayer() {
  const [theme,setTheme]=useState<"light"|"dark">("light");
  const [progress,setProgress]=useState(0);
  const [topVisible,setTopVisible]=useState(false);

  useEffect(()=>{
    const next=preferredTheme();
    const themeFrame=window.requestAnimationFrame(()=>setTheme(next));
    document.documentElement.dataset.theme=next;
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled=false;
    let cleanupMotion=()=>{};

    if(!reduced){
      void Promise.all([import("lenis"),import("animejs")]).then(([lenisModule,anime])=>{
        if(cancelled)return;
        const Lenis=lenisModule.default;
        const lenis=new Lenis({autoRaf:true,duration:0.9,smoothWheel:true});
        const revealSelector=".heroTitle > *, .featured, .launchFeature, .sectionHead, .storyGrid > article, .categoryGrid > a, .shop > *, .fieldNotesGrid > *, .faqIntro, .faqList, .articleTitle > *, .articleHero, .articleBody > *";
        const elements=Array.from(document.querySelectorAll<HTMLElement>(revealSelector));
        elements.forEach(el=>{el.style.opacity="0";el.style.transform="translateY(18px)";});
        const observer=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;const el=entry.target as HTMLElement;anime.animate(el,{opacity:1,y:0,duration:650,ease:"outExpo"});observer.unobserve(el);});},{rootMargin:"0px 0px -8% 0px",threshold:0.08});
        elements.forEach(el=>observer.observe(el));
        cleanupMotion=()=>{observer.disconnect();lenis.destroy();};
      }).catch(()=>{});
    }

    let raf=0;
    const onScroll=()=>{
      if(raf)return;
      raf=window.requestAnimationFrame(()=>{
        raf=0;
        const article=document.querySelector<HTMLElement>("article.articlePage");
        if(article){
          const start=article.offsetTop;
          const end=Math.max(start+1,article.offsetTop+article.offsetHeight-window.innerHeight);
          setProgress(Math.max(0,Math.min(100,((window.scrollY-start)/(end-start))*100)));
        }else{
          const max=document.documentElement.scrollHeight-window.innerHeight;
          setProgress(max>0?Math.min(100,(window.scrollY/max)*100):0);
        }
        setTopVisible(window.scrollY>720);
      });
    };
    onScroll();
    window.addEventListener("scroll",onScroll,{passive:true});
    return()=>{cancelled=true;cleanupMotion();window.removeEventListener("scroll",onScroll);window.cancelAnimationFrame(themeFrame);if(raf)window.cancelAnimationFrame(raf);};
  },[]);

  const toggle=()=>{const next=theme==="dark"?"light":"dark";setTheme(next);document.documentElement.dataset.theme=next;localStorage.setItem("tcp:theme",next);};
  return <><div className="scrollProgress" aria-hidden="true"><i style={{width:`${progress}%`}}/></div><div className="floatingUtilities"><button type="button" className="themeToggle" onClick={toggle} aria-label={`Switch to ${theme==="dark"?"light":"dark"} mode`}>{theme==="dark"?"☀":"◐"}</button><a className="floatingContact" href="/contact" aria-label="Contact The Curated Pin">✉</a>{topVisible&&<button type="button" className="backToTop" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} aria-label="Back to top">↑</button>}</div></>;
}
