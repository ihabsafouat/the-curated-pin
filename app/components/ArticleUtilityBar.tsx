"use client";

import { useState } from "react";
import { sendAnalyticsEvent } from "./analytics-client";

export default function ArticleUtilityBar({ slug, title, canonicalUrl, imageUrl }: { slug:string; title:string; canonicalUrl:string; imageUrl:string }) {
  const [copied,setCopied]=useState(false);
  const track=(channel:string)=>sendAnalyticsEvent({eventType:"share_click",articleSlug:slug,linkKind:"share",placement:"article-utility",targetUrl:canonicalUrl,targetLabel:title,metadata:{channel}});

  async function share(){
    if(navigator.share){
      try{await navigator.share({title,url:canonicalUrl});track("native");return;}catch{}
    }
    try{await navigator.clipboard.writeText(canonicalUrl);setCopied(true);track("copy-fallback");window.setTimeout(()=>setCopied(false),1800);}catch{}
  }
  async function copy(){
    try{await navigator.clipboard.writeText(canonicalUrl);setCopied(true);track("copy");window.setTimeout(()=>setCopied(false),1800);}catch{}
  }
  const pinUrl=`https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(canonicalUrl)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(title)}`;

  return <div className="articleUtilityBar shell" aria-label="Article actions">
    <div><span className="articleUtilityLabel">KEEP THIS GUIDE HANDY</span><a href="#save-guide">Save for later</a></div>
    <div className="articleUtilityActions">
      <button type="button" onClick={share}>↗ <span>Share</span></button>
      <a href={pinUrl} target="_blank" rel="noopener noreferrer" onClick={()=>track("pinterest")}>P <span>Pin</span></a>
      <button type="button" onClick={copy}>⧉ <span>{copied?"Copied":"Copy link"}</span></button>
    </div>
  </div>;
}
