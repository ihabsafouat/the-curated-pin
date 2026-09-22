import type { Metadata } from "next";
import Link from "next/link";
import { productCheckoutUrl } from "./catalog";
import SubHeader from "../components/SubHeader";
import SubFooter from "../components/SubFooter";
import { shopProducts } from "./catalog";
import { staticPageMetadata } from "../seo";

export const metadata: Metadata = staticPageMetadata({
  title: "The Curated Pin Shop",
  description: "Printable celebration planners and original amigurumi crochet patterns built around practical, finished projects.",
  path: "/shop",
});

export default function ShopIndex() {
  return <main><SubHeader/><section className="shopPageHero shell"><small>THE CURATED PIN SHOP</small><h1>Planning tools that turn<br/><em>saved ideas into decisions.</em></h1><p>Practical celebration planners and original amigurumi crochet patterns—designed to turn inspiration into finished projects.</p></section><section className="shopProductGrid shell">{shopProducts.map((product,index)=><article className="shopProductCard" key={product.slug}><Link className="shopProductCardImage" href={`/shop/${product.slug}`} aria-label={`View ${product.name}`}><img src={product.coverImage} alt={`${product.name} cover`} /></Link><span>0{index+1}</span><small>{product.eyebrow}</small><h2><Link href={`/shop/${product.slug}`}>{product.name}</Link></h2><p>{product.description}</p><div><b>{product.price}</b><i>{product.category === "crochet" ? `${product.pages} page PDF pattern` : `${product.pages} pages printable`}</i></div><div className="shopCardActions"><Link className="shopDetailsButton" href={`/shop/${product.slug}`}>Details →</Link><a className="downloadButton shopDownloadButton" href={product.isFree ? (product.freeDownloadUrl || `/free/${product.slug}`) : (productCheckoutUrl(product) || `/shop/${product.slug}`)} target={product.isFree ? undefined : (productCheckoutUrl(product) ? "_blank" : undefined)} rel={product.isFree ? undefined : (productCheckoutUrl(product) ? "noopener" : undefined)} aria-label={`Get ${product.name}`} data-analytics-kind={product.isFree ? "lead_magnet" : "checkout"} data-product-slug={product.slug}>{product.isFree ? "Free Download" : (product.category === "crochet" ? `Get Pattern (${product.price})` : `Get Planner (${product.price})`)}</a></div></article>)}</section><SubFooter/></main>;
}
