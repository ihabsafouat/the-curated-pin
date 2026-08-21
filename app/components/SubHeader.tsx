import Link from "next/link";
import { getPublicNavigationCategories } from "../../db/categories";
import AccountLink from "./AccountLink";

export default async function SubHeader() {
  const nav = await getPublicNavigationCategories();
  return <header className="subHeader"><div className="shell subTop"><Link className="brand" href="/"><span className="brandmark"><i/><i/><i/></span><span>The Curated Pin</span></Link><nav>{nav.map((category) => <Link href={`/category/${category.path}`} key={category.id}>{category.name}</Link>)}<Link href="/shop">Shop</Link><Link href="/case-studies">Field Notes</Link><Link href="/saved">♡ Saved</Link></nav><div className="subActions"><Link className="subSearch" href="/search" aria-label="Search">⌕</Link><AccountLink compact/></div></div></header>;
}
