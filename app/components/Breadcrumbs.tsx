import Link from "next/link";
import StructuredData from "./StructuredData";
import { absoluteUrl } from "../site";

type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };
  return <><nav className="breadcrumbs shell" aria-label="Breadcrumb">{items.map((item, index) => <span key={`${item.label}-${index}`}>{index > 0 && <i aria-hidden="true">/</i>}{item.href ? <Link href={item.href}>{item.label}</Link> : <b aria-current="page">{item.label}</b>}</span>)}</nav><StructuredData data={schema}/></>;
}
