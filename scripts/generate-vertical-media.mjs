import { mkdir, writeFile, unlink } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { verticalArticles } from "../launch/vertical-launch-content.mjs";

const escape=(value)=>value.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
function lines(title,max=24){
  const words=title.replace(/:.*$/," ").trim().split(/\s+/);const result=[];let row="";
  for(const word of words){const next=row?`${row} ${word}`:word;if(next.length>max&&row){result.push(row);row=word;}else row=next;}
  if(row) result.push(row);return result.slice(0,4);
}
function palette(path){
  if(path.startsWith("crafts")) return {bg:"#e4eadb",deep:"#203c34",accent:"#d9856b",kind:"CROCHET GUIDE"};
  if(path.startsWith("style/nails")) return {bg:"#f0dfe4",deep:"#3f2834",accent:"#b75669",kind:"NAIL EDIT"};
  return {bg:"#e9e0d5",deep:"#2d3330",accent:"#b48a4a",kind:"JEWELRY GUIDE"};
}
function art(kind,w,h,accent){
  if(kind==="CROCHET GUIDE") return `<g fill="none" stroke="${accent}" stroke-width="${w/120}" opacity=".85"><circle cx="${w*.78}" cy="${h*.31}" r="${w*.105}"/><circle cx="${w*.71}" cy="${h*.31}" r="${w*.105}"/><circle cx="${w*.745}" cy="${h*.24}" r="${w*.105}"/><circle cx="${w*.745}" cy="${h*.38}" r="${w*.105}"/><path d="M${w*.745} ${h*.45} C${w*.8} ${h*.56},${w*.65} ${h*.62},${w*.78} ${h*.75}"/><path d="M${w*.78} ${h*.75} C${w*.83} ${h*.82},${w*.72} ${h*.88},${w*.67} ${h*.83}"/></g>`;
  if(kind==="NAIL EDIT") return `<g fill="none" stroke="${accent}" stroke-width="${w/130}"><rect x="${w*.65}" y="${h*.17}" width="${w*.12}" height="${h*.34}" rx="${w*.06}"/><rect x="${w*.79}" y="${h*.28}" width="${w*.12}" height="${h*.34}" rx="${w*.06}"/><path d="M${w*.62} ${h*.7}l${w*.06} ${-h*.03} ${w*.03} ${-h*.07} ${w*.03} ${h*.07} ${w*.07} ${h*.03}-${w*.07} ${h*.03}-${w*.03} ${h*.07}-${w*.03} ${-h*.07}z" fill="${accent}" stroke="none"/></g>`;
  return `<g fill="none" stroke="${accent}" stroke-width="${w/120}"><circle cx="${w*.73}" cy="${h*.35}" r="${w*.11}"/><circle cx="${w*.82}" cy="${h*.43}" r="${w*.11}"/><path d="M${w*.67} ${h*.68}c${w*.08}-${h*.1} ${w*.16}-${h*.1} ${w*.24} 0"/><circle cx="${w*.79}" cy="${h*.63}" r="${w*.018}" fill="${accent}"/></g>`;
}
function svg(article,w,h,pin=false){
  const c=palette(article.categoryPath);const titleLines=lines(article.title,pin?20:25);const x=w*.085;const base=pin?h*.36:h*.43;const size=pin?w*.068:w*.055;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${c.bg}"/><circle cx="${w*.88}" cy="${h*.08}" r="${w*.32}" fill="#fff" opacity=".28"/><path d="M0 ${h*.83} C${w*.32} ${h*.7},${w*.58} ${h*.98},${w} ${h*.78}V${h}H0Z" fill="${c.deep}" opacity=".08"/>${art(c.kind,w,h,c.accent)}<text x="${x}" y="${h*.13}" font-family="Arial,sans-serif" font-size="${w*.019}" letter-spacing="${w*.003}" font-weight="700" fill="${c.deep}">${c.kind} · THE CURATED PIN</text>${titleLines.map((line,i)=>`<text x="${x}" y="${base+i*size*1.08}" font-family="Georgia,serif" font-size="${size}" font-weight="600" fill="${c.deep}">${escape(line)}</text>`).join("")}<line x1="${x}" y1="${h*.78}" x2="${x+w*.25}" y2="${h*.78}" stroke="${c.accent}" stroke-width="${w*.004}"/><text x="${x}" y="${h*.84}" font-family="Arial,sans-serif" font-size="${w*.021}" fill="${c.deep}">PRACTICAL · VISUAL · SAVE-WORTHY</text></svg>`;
}
await mkdir("public/vertical-media",{recursive:true});await mkdir("public/pinterest/verticals",{recursive:true});
for(const article of verticalArticles){
  for(const target of [{dir:"public/vertical-media",w:1600,h:900,pin:false},{dir:"public/pinterest/verticals",w:1000,h:1500,pin:true}]){
    const temp=`${target.dir}/${article.slug}.svg`;const output=`${target.dir}/${article.slug}.png`;
    await writeFile(temp,svg(article,target.w,target.h,target.pin));
    const result=spawnSync("ffmpeg",["-hide_banner","-loglevel","error","-y","-i",temp,"-frames:v","1",output],{stdio:"inherit"});
    if(result.status!==0) throw new Error(`Unable to render ${output}`);
    await unlink(temp);
  }
}
process.stdout.write(`Generated ${verticalArticles.length*2} launch images.\n`);
