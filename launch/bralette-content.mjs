const slug="crochet-bralette-pattern";
const title="How To Crochet A Stylish Bralette Top: The Perfect Handmade Summer Project";
const dek="Create a beautiful handmade crochet bralette with this easy wearable pattern. Perfect for summer outfits, festivals, and crochet lovers who want stylish DIY clothing.";
const base="/article-media/crochet/bralette-";
const images=Array.from({length:10},(_,i)=>({url:`${base}${i+1}.png`,alt:"Woman wearing a handmade crochet bralette top with modern summer fashion style",caption:"Balcony Bralette crochet project reference."}));
const text=[
["Why Crochet Clothing Is Becoming So Popular","Handmade crochet fashion lets makers create unique pieces that cannot be found in ordinary stores. Crochet tops, bralettes and summer garments are ideal slow-fashion projects."],
["Meet The Balcony Bralette Crochet Pattern","The Balcony Bralette is an easy crochet wearable with a comfortable fit, clean texture and adjustable sizing. It works for summer outfits, layering and casual looks."],
["Pattern Details","The pattern uses Paintbox Yarns Cotton 4 Ply with 3mm and 3.5mm crochet hooks. Its supportive under-bust band is designed for a comfortable fit with minimal stretch, and the size range covers a wide range of chest measurements."],
["Materials Needed For This Crochet Top","Gather cotton yarn, 3mm and 3.5mm crochet hooks, scissors and a large-eyed needle. Cotton yarn keeps the finished top lightweight and comfortable in warm weather."],
["A Perfect Summer Crochet Project","Wear this bralette with high-waisted jeans, skirts or shorts, or use it as a layering piece for beach days, festivals and vacations."],
["Customize Your Handmade Crochet Bralette","Experiment with yarn colours, add details or make matching accessories to create a personalized handmade wardrobe."],
];
const blocks=[]; let n=0; const add=(type,x)=>blocks.push({id:`${slug}-${++n}`,type,...x});
add('paragraph',{text:"Crochet fashion has become one of the most creative ways to express personal style. Instead of buying another basic summer top, create something unique with your own hands. This Balcony Bralette combines comfort, simplicity and modern handmade fashion."});
text.forEach(([heading,body],i)=>{add('heading',{level:2,text:heading});add('paragraph',{text:body});if(i<images.length)add('image',{url:images[i].url,alt:images[i].alt,caption:images[i].caption});});
add('bullets',{title:'Why you will love this pattern',items:['Wearable handmade fashion piece','Beginner-friendly crochet clothing project','Perfect for summer wardrobes','Customizable colours','A great introduction to crochet garments']});
add('table',{title:'Pattern preview',headers:['Detail','Information'],rows:[['Difficulty','Easy'],['Yarn','Paintbox Yarns Cotton 4 Ply'],['Hooks','3mm and 3.5mm'],['Finished size','Chest sizes from 63 cm to 124 cm depending on size selected'],['Best for','Summer outfits, beach vacations and festival fashion']]});
add('faq',{title:'Frequently asked questions',items:[['Is this crochet bralette pattern beginner friendly?','Yes. It is classified as easy and suits crocheters making their first wearable garment.'],['What yarn should I use?','Paintbox Yarns Cotton 4 Ply is recommended for lightweight summer clothing.'],['Can I customize the colour?','Yes. Changing colours is an easy way to make the design your own.'],['What sizes are included?','The pattern includes multiple sizes covering approximately 81 cm to 147 cm chest measurements.']]});
add('lead_magnet',{eyebrow:'FREE CROCHET PATTERN',title:'Get the complete crochet bralette PDF',body:'Enter your email to receive the full pattern and discover more wearable crochet designs.',cta:'Send me the pattern',url:`/free/${slug}`});
export const braletteArticles=[{slug,categoryPath:'crafts/crochet',title,dek,readTime:'10 min read',seoTitle:'Crochet Bralette Pattern | Easy Handmade Summer Top DIY',seoDescription:dek,image:images[0].url,imageAlt:images[0].alt,socialImage:images[0].url,primaryKeyword:'crochet bralette pattern',secondaryKeywords:['crochet summer top pattern','DIY crochet top','crochet clothing pattern','crochet crop top pattern','beginner crochet wearable'],blocks}];
