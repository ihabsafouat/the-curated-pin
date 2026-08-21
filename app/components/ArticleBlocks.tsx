import type { ArticleBlock } from "../content";
import ArticleGallery from "./ArticleGallery";
import ArticleFaq from "./ArticleFaq";
import MediaImage from "./MediaImage";

export function blockAnchorId(block: ArticleBlock, index: number) {
  const source = block.type === "heading" ? block.text : `${block.type}-${index + 1}`;
  const slug = source
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
  return `${slug || block.type}-${index + 1}`;
}

function OptionalImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  if (!src) return null;
  return <MediaImage src={src} alt={alt || ""} className={className} loading="lazy" decoding="async" sizes="(max-width: 620px) 100vw, 720px"/>;
}

function ExternalLink({ href, children, className = "", merchant = "", productSlug = "", placement = "" }: { href: string; children: React.ReactNode; className?: string; merchant?: string; productSlug?: string; placement?: string }) {
  return <a href={href} target="_blank" rel="nofollow sponsored noopener" className={className} data-analytics-kind="affiliate" data-merchant={merchant || undefined} data-product-slug={productSlug || undefined} data-analytics-placement={placement || undefined}>{children}</a>;
}

function siteSlug(url: string, prefix: string) {
  if (!url.startsWith(prefix)) return "";
  return url.slice(prefix.length).split(/[?#/]/)[0] || "";
}

export function articleHasAffiliateBlocks(blocks: ArticleBlock[]) {
  return blocks.some((block) => block.type === "affiliate_product");
}

export function getArticleHeadings(blocks: ArticleBlock[]) {
  return blocks.flatMap((block, index) => block.type === "heading" && block.level === 2
    ? [{ id: blockAnchorId(block, index), text: block.text }]
    : []);
}

export function getFaqItems(blocks: ArticleBlock[]) {
  return blocks.flatMap((block) => block.type === "faq" ? block.items : []);
}

export default function ArticleBlocks({ blocks, startIndex = 0, ideaStart = 0 }: { blocks: ArticleBlock[]; startIndex?: number; ideaStart?: number }) {
  let ideaOrdinal=ideaStart;
  return <div className="richArticleBlocks">{blocks.map((block, index) => {
    const globalIndex=startIndex+index;
    const anchorId = blockAnchorId(block, globalIndex);
    const ideaNumber=block.type==="idea" ? ++ideaOrdinal : 0;
    switch (block.type) {
      case "paragraph":
        return <p className="richParagraph" key={block.id}>{block.text}</p>;
      case "heading":
        return block.level === 2
          ? <h2 id={anchorId} className="richHeading richH2" key={block.id}>{block.text}</h2>
          : <h3 id={anchorId} className="richHeading richH3" key={block.id}>{block.text}</h3>;
      case "image":
        return <figure className="richImage" key={block.id}><MediaImage src={block.url} alt={block.alt} loading="lazy" decoding="async" sizes="(max-width: 800px) 100vw, 760px"/>{block.caption && <figcaption>{block.caption}</figcaption>}</figure>;
      case "gallery":
        return <ArticleGallery key={block.id} title={block.title} images={block.images}/>;
      case "idea":
        return <section className="ideaBlock" key={block.id}><OptionalImage src={block.image} alt={block.imageAlt}/><div><div className="ideaEyebrow"><small>{block.eyebrow || "IDEA"}</small><span aria-label={`Idea ${ideaNumber}`}>{String(ideaNumber).padStart(2,"0")}</span></div><h3>{block.title}</h3><p>{block.body}</p>{(block.budget || block.bestFor || block.setting) && <dl>{block.budget && <><dt>Budget</dt><dd>{block.budget}</dd></>}{block.bestFor && <><dt>Best for</dt><dd>{block.bestFor}</dd></>}{block.setting && <><dt>Setting</dt><dd>{block.setting}</dd></>}</dl>}</div></section>;
      case "checklist":
        return <section className="listBlock checklistBlock" key={block.id}><h3>{block.title}</h3><ul>{block.items.map((item, itemIndex) => <li key={`${block.id}-${itemIndex}`}><span aria-hidden="true">✓</span>{item}</li>)}</ul></section>;
      case "bullets":
        return <section className="listBlock" key={block.id}>{block.title && <h3>{block.title}</h3>}<ul>{block.items.map((item, itemIndex) => <li key={`${block.id}-${itemIndex}`}>{item}</li>)}</ul></section>;
      case "table":
        return <section className="tableBlock" key={block.id}>{block.title && <h3>{block.title}</h3>}<p className="tableHint" aria-hidden="true">Swipe to compare →</p><div className="tableScroll" role="region" aria-label={block.title || "Comparison table"} tabIndex={0}><table><thead><tr>{block.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{block.rows.map((row, rowIndex) => <tr key={`${block.id}-${rowIndex}`}>{block.headers.map((header, cellIndex) => <td data-label={header} key={`${block.id}-${rowIndex}-${cellIndex}`}>{row[cellIndex] || ""}</td>)}</tr>)}</tbody></table></div></section>;
      case "comparison":
        return <section className="comparisonBlock" key={block.id}><h3>{block.title}</h3><div><article><b>{block.leftTitle}</b><ul>{block.leftItems.map((item, itemIndex) => <li key={`${block.id}-l-${itemIndex}`}>{item}</li>)}</ul></article><article><b>{block.rightTitle}</b><ul>{block.rightItems.map((item, itemIndex) => <li key={`${block.id}-r-${itemIndex}`}>{item}</li>)}</ul></article></div></section>;
      case "tip":
        return <aside className="tipBlock" key={block.id}><small>{block.label || "CURATED TIP"}</small>{block.title && <h3>{block.title}</h3>}<p>{block.body}</p></aside>;
      case "pros_cons":
        return <section className="prosConsBlock" key={block.id}><h3>{block.title}</h3><div><article><b>Good fit when</b><ul>{block.pros.map((item, itemIndex) => <li key={`${block.id}-p-${itemIndex}`}>{item}</li>)}</ul></article><article><b>Think twice when</b><ul>{block.cons.map((item, itemIndex) => <li key={`${block.id}-c-${itemIndex}`}>{item}</li>)}</ul></article></div></section>;
      case "affiliate_product":
        return <aside className="affiliateProductBlock" key={block.id} data-analytics-impression="true" data-analytics-kind="affiliate" data-analytics-placement={`block:${block.id}`} data-merchant={block.merchant} data-product-slug={siteSlug(block.url,"/shop/") || undefined} data-analytics-label={block.name}><OptionalImage src={block.image} alt={block.imageAlt}/><div><small>EDITOR&apos;S SHOPPING PICK · {block.merchant}{block.network ? ` · ${block.network}` : ""}</small><h3>{block.name}</h3><p>{block.description}</p>{block.priceNote && <span className="affiliatePriceNote">{block.priceNote}</span>}<p className="inlineDisclosure">Paid link · We may earn a commission if you purchase, at no extra cost to you.</p><ExternalLink href={block.url} merchant={block.merchant} productSlug={siteSlug(block.url,"/shop/")} placement={`block:${block.id}`}>{block.cta} ↗</ExternalLink></div></aside>;
      case "lead_magnet":
        return <aside className="leadMagnetBlock" key={block.id} data-analytics-impression="true" data-analytics-kind="lead_magnet" data-analytics-placement={`block:${block.id}`} data-lead-magnet={siteSlug(block.url,"/free/") || undefined} data-analytics-label={block.title}><small>{block.eyebrow || "FREE DOWNLOAD"}</small><h3>{block.title}</h3><p>{block.body}</p><a href={block.url} data-analytics-kind="lead_magnet" data-lead-magnet={siteSlug(block.url,"/free/") || undefined} data-analytics-placement={`block:${block.id}`}>{block.cta} →</a></aside>;
      case "product_cta":
        return <aside className="productCtaBlock" key={block.id} data-analytics-impression="true" data-analytics-kind="product" data-analytics-placement={`block:${block.id}`} data-product-slug={siteSlug(block.url,"/shop/") || undefined} data-analytics-label={block.title}><OptionalImage src={block.image} alt={block.imageAlt}/><div><small>{block.eyebrow || "THE CURATED PIN SHOP"}</small><h3>{block.title}</h3><p>{block.body}</p>{block.price && <b>{block.price}</b>}<a href={block.url} data-analytics-kind="product" data-product-slug={siteSlug(block.url,"/shop/") || undefined} data-analytics-placement={`block:${block.id}`}>{block.cta} →</a></div></aside>;
      case "internal_link":
        return <aside className="richInternalLink" key={block.id}><small>{block.eyebrow || "KEEP PLANNING"}</small><h3>{block.title}</h3>{block.body && <p>{block.body}</p>}<a href={block.url} data-analytics-kind="internal" data-analytics-placement={`block:${block.id}`}>{block.anchor} →</a></aside>;
      case "faq":
        return <ArticleFaq key={block.id} title={block.title} items={block.items}/>;
      case "pinterest_asset":
        return <aside className="pinterestAssetBlock" key={block.id}><MediaImage src={block.image} alt={block.imageAlt} loading="lazy" decoding="async" variant="pinterest"/><div><small>SAVE-WORTHY IDEA</small><h3>{block.title}</h3><b>{block.pinTitle}</b><p>{block.pinDescription}</p></div></aside>;
      case "quote":
        return <blockquote className="quoteBlock" key={block.id}><p>“{block.text}”</p>{block.attribution && <cite>{block.attribution}</cite>}</blockquote>;
      case "divider":
        return <hr className="richDivider" key={block.id}/>;
    }
  })}</div>;
}
