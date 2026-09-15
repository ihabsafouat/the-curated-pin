import type { Metadata } from "next";
import Link from "next/link";
import { productCheckoutUrl } from "./catalog";
import SubHeader from "../components/SubHeader";
import SubFooter from "../components/SubFooter";
import { shopProducts } from "./catalog";
import { staticPageMetadata } from "../seo";

export const metadata: Metadata = staticPageMetadata({
  title: "The Curated Pin Shop",
  description: "Printable birthday-planning tools built around the same practical decisions as our editorial guides.",
  path: "/shop",
});

export default function ShopIndex() {
  return <main><SubHeader/><section className="shopPageHero shell"><small>THE CURATED PIN SHOP</small><h1>Planning tools that turn<br/><em>saved ideas into decisions.</em></h1><p>Our first products are printable birthday workbooks. They complement the free editorial guides instead of replacing them.</p></section><section className="shopProductGrid shell">{shopProducts.map((product,index)=><article className="shopProductCard" key={product.slug}><Link className="shopProductCardImage" href={`/shop/${product.slug}`} aria-label={`View ${product.name}`}><img src={product.coverImage} alt={`${product.name} cover`} /></Link><span>0{index+1}</span><small>{product.eyebrow}</small><h2><Link href={`/shop/${product.slug}`}>{product.name}</Link></h2><p>{product.description}</p><div><b>{product.price}</b><i>{product.pages} pages</i></div><div className="shopCardActions"><a className="downloadButton shopDownloadButton" href={productCheckoutUrl(product) || "#"} aria-label={`Download ${product.name}`} data-product-slug={product.slug}>Download</a></div></article>)}</section><SubFooter/></main>;
}
