import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import StructuredData from "../../components/StructuredData";
import SubHeader from "../../components/SubHeader";
import SubFooter from "../../components/SubFooter";
import ArticleFaq from "../../components/ArticleFaq";
import { absoluteUrl, SITE_NAME } from "../../site";
import { publicRobots } from "../../seo";
import { getShopProduct, productCheckoutUrl, shopProducts } from "../catalog";

export function generateStaticParams(){ return shopProducts.map((product)=>({slug:product.slug})); }

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params; const product=getShopProduct(slug); if(!product)return {robots:{index:false,follow:false}};
  const path=`/shop/${product.slug}`;
  return {title:product.name,description:product.description,alternates:{canonical:path},robots:publicRobots(true),openGraph:{title:product.name,description:product.description,url:path,type:"website",images:[{url:product.coverImage,width:1254,height:1254,alt:product.name}]},twitter:{card:"summary_large_image",title:product.name,description:product.description,images:[product.coverImage]}};
}

export default async function ProductPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params; const product=getShopProduct(slug); if(!product)notFound();
  const checkout=productCheckoutUrl(product);
  const path=`/shop/${product.slug}`;
  const schema={"@context":"https://schema.org","@type":"Product","@id":`${absoluteUrl(path)}#product`,name:product.name,description:product.description,image:absoluteUrl(product.coverImage),brand:{"@type":"Brand",name:SITE_NAME},category:product.category==="crochet"?"Crochet pattern PDF":"Printable birthday planner",offers:product.isFree?{"@type":"Offer",priceCurrency:"USD",price:0,availability:"https://schema.org/InStock",url:absoluteUrl(product.freeDownloadUrl||path)}:checkout?{"@type":"Offer",priceCurrency:product.currency,price:product.priceValue,availability:"https://schema.org/InStock",url:checkout}:undefined};
  return <main><SubHeader/><StructuredData data={schema}/><section className="productSalesHero shell"><div className="productSalesCopy"><small>{product.eyebrow}</small><h1>{product.name}</h1><p className="productSalesDek">{product.longDescription}</p><div className="productPriceRow"><b>{product.price}</b><span>{product.category === "crochet" ? `${product.pages} page digital PDF pattern` : `${product.pages} printable pages · PDF`}</span></div>{product.isFree ? <Link className="primaryCta productCheckout" href={product.freeDownloadUrl || `/free/${product.slug}`} data-analytics-kind="free-download" data-product-slug={product.slug} data-analytics-placement="product-hero">{product.ctaLabel || "Get the free pattern PDF →"}</Link> : checkout ? <a className="primaryCta productCheckout" href={checkout} target="_blank" rel="noopener" data-analytics-kind="checkout" data-product-slug={product.slug} data-analytics-placement="product-hero">{product.ctaLabel || (product.category === "crochet" ? "Get the pattern →" : "Get the planner →")}</a> : <div className="checkoutPending"><b>Checkout URL not connected yet.</b><span>Upload the included product PDF to Gumroad, then set <code>{product.checkoutEnv}</code>.</span></div>}{product.leadMagnet && <Link className="secondaryCta" href={product.leadMagnet}>{product.category === "crochet" ? "Browse crochet projects →" : "Try the free planner first →"}</Link>}</div><div className="plannerMockup productCover" aria-label={`${product.name} printable workbook cover`}><Image src={product.coverImage} alt={`${product.name} - premium printable workbook cover`} fill sizes="(max-width: 800px) 90vw, 42vw" priority/></div></section><section className="productDetails shell"><div><small>WHAT&apos;S INSIDE</small><h2>{product.category === "crochet" ? "Everything you need to finish the project." : "A practical system, not more inspiration to sort through."}</h2></div><ul>{product.includes.map((item)=><li key={item}>✓ <span>{item}</span></li>)}</ul></section><section className="productBestFor shell"><div><small>GOOD FIT FOR</small><h2>Use it when...</h2></div><div>{product.bestFor.map((item,index)=><article key={item}><span>0{index+1}</span><p>{item}</p></article>)}</div></section><section className="productFaq shell"><ArticleFaq title="Before you buy" items={product.faqs}/></section><SubFooter/></main>;
}
