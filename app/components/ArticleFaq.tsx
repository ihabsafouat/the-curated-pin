"use client";

import { useRef } from "react";

export default function ArticleFaq({ title, items }: { title:string; items:Array<{question:string;answer:string} | [string, string]> }) {
  const root=useRef<HTMLDivElement>(null);
  const setAll=(open:boolean)=>root.current?.querySelectorAll("details").forEach((detail)=>{detail.open=open;});
  const normalized = (items || []).map((item) =>
    Array.isArray(item) ? { question: item[0], answer: item[1] } : item
  );
  return <section className="faqBlock">
    <div className="faqBlockHeader"><div>{title&&<h3>{title}</h3>}<small>Quick answers to common questions</small></div>{normalized.length>1&&<div><button type="button" onClick={()=>setAll(true)}>Expand all</button><button type="button" onClick={()=>setAll(false)}>Collapse</button></div>}</div>
    <div ref={root}>{normalized.map((item,itemIndex)=><details key={`${item.question}-${itemIndex}`}><summary>{item.question}<span aria-hidden="true">＋</span></summary><p>{item.answer}</p></details>)}</div>
  </section>;
}
