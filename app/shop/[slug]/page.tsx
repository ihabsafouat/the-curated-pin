import type { Metadata } from "next";
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
  return {title:product.name,description:product.description,alternates:{canonical:path},robots:publicRobots(true),openGraph:{title:product.name,description:product.description,url:path,type:"website"},twitter:{card:"summary_large_image",title:product.name,description:product.description}};
}

export default async function ProductPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params; const product=getShopProduct(slug); if(!product)notFound();
  const checkout=productCheckoutUrl(product);
  const path=`/shop/${product.slug}`;
  const schema={"@context":"https://schema.org","@type":"Product","@id":`${absoluteUrl(path)}#product`,name:product.name,description:product.description,brand:{"@type":"Brand",name:SITE_NAME},category:"Printable birthday planner",offers:checkout?{"@type":"Offer",priceCurrency:product.currency,price:product.priceValue,availability:"https://schema.org/InStock",url:checkout}:undefined};
  return <main><SubHeader/><StructuredData data={schema}/><section className="productSalesHero shell"><div className="productSalesCopy"><small>{product.eyebrow}</small><h1>{product.name}</h1><p className="productSalesDek">{product.longDescription}</p><div className="productPriceRow"><b>{product.price}</b><span>{product.pages} printable pages · PDF</span></div>{checkout?<a className="primaryCta productCheckout" href={checkout} target="_blank" rel="noopener" data-analytics-kind="checkout" data-product-slug={product.slug} data-analytics-placement="product-hero">Get the planner →</a>:<div className="checkoutPending"><b>Checkout URL not connected yet.</b><span>Upload the included product PDF to Gumroad, Lemon Squeezy or Stripe, then set <code>{product.checkoutEnv}</code>.</span></div>}<Link className="secondaryCta" href={product.leadMagnet}>Try the free planner first →</Link></div><div className="plannerMockup" aria-label={`${product.name} printable workbook preview`}><span>THE CURATED PIN</span><strong>{product.shortName}</strong><i>{product.pages}<br/>PAGES</i><div>PLAN · DECIDE · CELEBRATE</div></div></section><section className="productDetails shell"><div><small>WHAT&apos;S INSIDE</small><h2>A practical system, not more inspiration to sort through.</h2></div><ul>{product.includes.map((item)=><li key={item}>✓ <span>{item}</span></li>)}</ul></section><section className="productBestFor shell"><div><small>GOOD FIT FOR</small><h2>Use it when...</h2></div><div>{product.bestFor.map((item,index)=><article key={item}><span>0{index+1}</span><p>{item}</p></article>)}</div></section><section className="productFaq shell"><ArticleFaq title="Before you buy" items={product.faqs}/></section><SubFooter/></main>;
}
