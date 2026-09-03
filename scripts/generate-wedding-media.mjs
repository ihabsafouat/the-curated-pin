import { mkdir, writeFile, unlink } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { weddingArticles } from "../launch/wedding-launch-content.mjs";

const escape=(value)=>value.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
function lines(title,max=27){
  const words=title.replace(/:.*$/," ").trim().split(/\s+/);const result=[];let row="";
  for(const word of words){const next=row?`${row} ${word}`:word;if(next.length>max&&row){result.push(row);row=word;}else row=next;}
  if(row) result.push(row);return result.slice(0,4);
}
function svg(article){
  const w=1600,h=900,x=130,titleLines=lines(article.title);const base=380,size=83;
  const petals=[[1320,135],[1450,260],[1360,420],[1205,335],[1185,175]];
  const glass=petals.map(([cx,cy],index)=>`<path d="M${cx} ${cy-82} C${cx+84} ${cy-34},${cx+84} ${cy+38},${cx} ${cy+85} C${cx-82} ${cy+38},${cx-82} ${cy-34},${cx} ${cy-82}Z" fill="${index%2?'#c98d82':'#e4b7a7'}" stroke="#7b263d" stroke-width="8" opacity=".78"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#f3ecdf"/><rect x="38" y="38" width="${w-76}" height="${h-76}" rx="8" fill="none" stroke="#7b263d" stroke-width="3"/><rect x="58" y="58" width="${w-116}" height="${h-116}" rx="4" fill="none" stroke="#c99b5e" stroke-width="2"/><circle cx="1320" cy="255" r="230" fill="#fff8eb" stroke="#c99b5e" stroke-width="7"/>${glass}<circle cx="1320" cy="255" r="60" fill="#c99b5e" stroke="#7b263d" stroke-width="8"/><path d="M1180 520 C1270 610,1390 640,1510 740" fill="none" stroke="#526b54" stroke-width="16"/><path d="M1260 595 C1190 560,1135 575,1085 640 C1160 672,1228 650,1260 595Z" fill="#809076"/><path d="M1370 645 C1435 600,1500 610,1545 682 C1475 710,1405 692,1370 645Z" fill="#809076"/><text x="${x}" y="150" font-family="Arial,sans-serif" font-size="28" letter-spacing="6" font-weight="700" fill="#7b263d">THE CURATED PIN · WEDDING EDIT</text><text x="${x}" y="218" font-family="Georgia,serif" font-size="32" font-style="italic" fill="#8a695c">Practical planning for a beautifully coherent day</text>${titleLines.map((line,i)=>`<text x="${x}" y="${base+i*size*1.03}" font-family="Georgia,serif" font-size="${size}" font-weight="600" fill="#382b2d">${escape(line)}</text>`).join("")}<line x1="${x}" y1="760" x2="${x+430}" y2="760" stroke="#c99b5e" stroke-width="8"/><text x="${x}" y="820" font-family="Arial,sans-serif" font-size="28" letter-spacing="3" fill="#7b263d">CHECKLISTS · WORDING · PRINT GUIDES</text></svg>`;
}

await mkdir("public/wedding-media",{recursive:true});
for(const article of weddingArticles){
  const temp=`public/wedding-media/${article.slug}.svg`;const output=`public/wedding-media/${article.slug}.png`;
  await writeFile(temp,svg(article));
  const result=spawnSync("ffmpeg",["-hide_banner","-loglevel","error","-y","-i",temp,"-frames:v","1",output],{stdio:"inherit"});
  if(result.status!==0) throw new Error(`Unable to render ${output}`);
  await unlink(temp);
}
process.stdout.write(`Generated ${weddingArticles.length} wedding article heroes.\n`);
