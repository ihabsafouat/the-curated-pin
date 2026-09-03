import { verticalArticles } from "../launch/vertical-launch-content.mjs";
const releaseArticles=verticalArticles;

const hubs=[
  {key:"category:crochet",path:"crafts/crochet",title:"Crochet Ideas and Patterns",cluster:"crochet",keyword:"crochet ideas",scope:"Crochet ideas, beginner patterns, flowers, bags, blankets, tools and yarn."},
];
const hubForPath=()=>hubs[0];

export const pages=[
  ...hubs.map((hub,index)=>({key:hub.key,entityType:"category",categoryPath:hub.path,title:hub.title,role:"hub",cluster:hub.cluster,keyword:hub.keyword,intent:"informational",scope:hub.scope,status:"published",priority:10+index,backlinkPriority:4,notes:"Live topical hub; qualitative keyword validation completed September 2026."})),
  ...releaseArticles.map((article,index)=>({key:`article:${article.slug}`,entityType:"article",categoryPath:article.categoryPath,slug:article.slug,title:article.title,role:index%5===0?"pillar":"supporting",cluster:hubForPath(article.categoryPath).cluster,keyword:article.primaryKeyword,intent:"informational",scope:`Owns ${article.primaryKeyword}; supports ${article.secondaryKeywords.join(", ")}.`,status:"published",priority:20+index,backlinkPriority:index%5===0?5:3,notes:"Search and Pinterest SERP validation; no fabricated volume or difficulty metrics."})),
];

export const keywords=releaseArticles.flatMap((article)=>[
  {page:`article:${article.slug}`,keyword:article.primaryKeyword,role:"primary",source:"Manual Google/Pinterest SERP validation · Sep 2026"},
  ...article.secondaryKeywords.map((keyword)=>({page:`article:${article.slug}`,keyword,role:"secondary",source:"Manual Google/Pinterest SERP validation · Sep 2026"})),
]);

const bySlug=new Map(releaseArticles.map((article)=>[article.slug,article]));
export const links=[];
for(const article of releaseArticles){
  const hub=hubForPath(article.categoryPath);
  links.push({source:hub.key,target:`article:${article.slug}`,anchor:article.primaryKeyword,type:"child",placement:"hub",semantic:96,weight:1.5,required:true,rationale:"Hub-to-article crawl path and topical distribution."});
  links.push({source:`article:${article.slug}`,target:hub.key,anchor:`More ${hub.title.toLowerCase()} guides`,type:"parent",placement:"related",semantic:94,weight:1.2,required:true,rationale:"Article-to-hub reinforcement."});
  for(const item of article.blocks.filter((entry)=>entry.type==="internal_link")){
    const slug=item.url.replace(/^\/article\//,"");
    if(bySlug.has(slug)) links.push({source:`article:${article.slug}`,target:`article:${slug}`,anchor:item.anchor,type:"contextual",placement:"body",semantic:92,weight:1.35,required:true,rationale:"Explicit next-step link inside the same topical ecosystem."});
  }
}

export const backlinkAssets=[
  {page:"article:crochet-blanket-size-chart-yarn-estimator",name:"Gauge-based blanket yarn estimator worksheet",type:"data worksheet",angle:"A more defensible alternative to generic skein tables because it uses the maker's washed swatch.",audience:"Crochet teachers, yarn shops, pattern roundups and maker newsletters",priority:10},
  {page:"article:beginner-crochet-stitches-guide",name:"Eight-stitch learning-order chart",type:"printable reference",angle:"A classroom-friendly sequence focused on stitch control and straight edges.",audience:"Libraries, community classes, craft educators and beginner resource pages",priority:20},
  {page:"article:crochet-flower-bouquet-pattern",name:"Crochet bouquet composition map",type:"visual template",angle:"A reusable odd-number flower, height and negative-space planning framework.",audience:"Wedding DIY publishers, floral craft roundups and yarn communities",priority:30},
];
