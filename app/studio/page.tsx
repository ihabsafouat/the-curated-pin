import { requireAdmin } from "../admin-auth";
import Link from "next/link";
import { getAdminArticles, getAnalyticsSummary } from "../../db/data";
import AdminHeader from "./components/AdminHeader";
import DeleteArticleButton from "./components/DeleteArticleButton";
import { getCsrfToken, roleAtLeast } from "../security/auth";
import MediaImage from "../components/MediaImage";

export const dynamic = "force-dynamic";

function EmptyRow({ label }: { label: string }) { return <div className="analyticsEmpty">{label}</div>; }

export default async function AdminDashboard() {
  const user = await requireAdmin("/studio");
  const [articles, analytics] = await Promise.all([getAdminArticles(), getAnalyticsSummary()]);
  const csrf = await getCsrfToken();
  const canModerate = roleAtLeast(user, "editor");
  const visibleArticles = canModerate ? articles : articles.filter((article) => article.authorId === user.id);
  const cards = [["Article views", analytics.totals.views], ["Outbound clicks", analytics.totals.clicks], ["Reader saves", analytics.totals.saves], ["Email subscribers", analytics.totals.subscribers]];
  return <main className="admin"><AdminHeader email={user.email} role={user.role}/><div className="adminShell"><header className="dashboardTitle"><div><small>EDITORIAL OVERVIEW</small><h1>Good evening. Here&apos;s what readers are doing.</h1><p>Use the signals to decide what to publish, refresh and promote on Pinterest next.</p></div><Link className="primaryAdminButton" href="/studio/articles/new">+ New article</Link></header>
    <section className="metricGrid">{cards.map(([label,value]) => <article key={label}><span>{label}</span><strong>{Number(value).toLocaleString()}</strong></article>)}</section>
    <section className="dashboardGrid"><article className="dashboardPanel"><div className="panelHead"><div><small>CONTENT</small><h2>Most visited articles</h2></div><span>All time</span></div>{analytics.topArticles.length ? <div className="rankList">{analytics.topArticles.map((row,i) => <div key={row.slug}><b>0{i+1}</b><a href={`/article/${row.slug}`} target="_blank">{row.title}</a><strong>{row.views.toLocaleString()} views</strong></div>)}</div> : <EmptyRow label="Article views will appear here once readers arrive."/>}</article>
      <article className="dashboardPanel"><div className="panelHead"><div><small>MONETIZATION</small><h2>Most clicked links</h2></div><span>Outbound</span></div>{analytics.topLinks.length ? <div className="rankList compact">{analytics.topLinks.map((row,i) => <div key={`${row.url}-${i}`}><b>0{i+1}</b><span title={row.url}>{row.label}</span><strong>{row.clicks} clicks</strong></div>)}</div> : <EmptyRow label="Affiliate and Gumroad clicks will appear here."/>}</article>
      <article className="dashboardPanel"><div className="panelHead"><div><small>ACQUISITION</small><h2>Traffic sources</h2></div><span>UTM aware</span></div>{analytics.topSources.length ? <div className="miniBars">{analytics.topSources.map((row) => { const max = Math.max(...analytics.topSources.map(r=>r.views),1); return <div key={row.source}><span>{row.source}</span><i><b style={{width:`${Math.max(8,row.views/max*100)}%`}}/></i><strong>{row.views}</strong></div>})}</div> : <EmptyRow label="Pinterest and other referral sources will appear here."/>}</article>
      <article className="dashboardPanel"><div className="panelHead"><div><small>READER INTENT</small><h2>What people search</h2></div><span>On site</span></div>{analytics.topSearches.length ? <div className="rankList compact">{analytics.topSearches.map((row,i) => <div key={row.query}><b>0{i+1}</b><span>“{row.query}”</span><strong>{row.searches}</strong></div>)}</div> : <EmptyRow label="Popular on-site searches will appear here."/>}</article>
    </section>
    <section className="articleManager"><div className="managerHead"><div><small>LIBRARY</small><h2>Articles</h2><p>{canModerate ? `${analytics.totals.published} published · ${analytics.totals.drafts} drafts` : `${visibleArticles.length} assigned to you`}</p></div><div>{canModerate && <a href="/api/admin/subscribers/export">Export email list</a>}<Link className="primaryAdminButton" href="/studio/articles/new">+ Create</Link></div></div><div className="articleTable"><div className="articleTableHead"><span>Article</span><span>Status</span><span>Category</span><span>Updated</span><span>Actions</span></div>{visibleArticles.map((article) => <div className="articleTableRow" key={article.id}><div><MediaImage src={article.image} alt={`Thumbnail for ${article.title}`} variant="thumb" loading="lazy" decoding="async"/><span><b>{article.title}</b><small>/{article.slug}</small></span></div><span><i className={`statusDot ${article.status}`}/>{article.status}</span><span>{article.category}</span><span>{new Date(article.updatedAt).toLocaleDateString("en",{month:"short",day:"numeric",year:"numeric"})}</span><span><a href={`/studio/articles/${article.id}`}>Edit</a>{article.status === "published" && <a href={`/article/${article.slug}`} target="_blank">View</a>}{canModerate && <DeleteArticleButton id={article.id} title={article.title} csrf={csrf}/>}</span></div>)}</div></section>
  </div></main>;
}
