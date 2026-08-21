import type { Metadata } from "next";
import Link from "next/link";
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
  return <main><SubHeader/><section className="shopPageHero shell"><small>THE CURATED PIN SHOP</small><h1>Planning tools that turn<br/><em>saved ideas into decisions.</em></h1><p>Our first products are printable birthday workbooks. They complement the free editorial guides instead of replacing them.</p></section><section className="shopProductGrid shell">{shopProducts.map((product,index)=><Link className="shopProductCard" href={`/shop/${product.slug}`} key={product.slug}><span>0{index+1}</span><small>{product.eyebrow}</small><h2>{product.name}</h2><p>{product.description}</p><div><b>{product.price}</b><i>{product.pages} pages</i></div><strong>View the planner →</strong></Link>)}</section><SubFooter/></main>;
}
