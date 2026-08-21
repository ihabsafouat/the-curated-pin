import { notFound } from "next/navigation";
import { getSeoMapSummary } from "../../../db/seo";
import { requireAdmin } from "../../admin-auth";
import { roleAtLeast } from "../../security/auth";
import AdminHeader from "../components/AdminHeader";

export const dynamic = "force-dynamic";

function formatMetric(value: number | null, suffix = "") {
  if (value === null) return "—";
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}${suffix}`;
}

export default async function SeoMapPage() {
  const user = await requireAdmin("/studio/seo-map");
  if (!roleAtLeast(user, "editor")) notFound();
  const summary = await getSeoMapSummary();
  const clusters = [...new Set(summary.pages.map((page) => page.clusterKey))];
  const liveCount = summary.pages.filter((page) => page.isLive).length;
  const validatedCount = summary.pages.filter((page) => page.targetVolume !== null && page.targetKd !== null).length;

  return <main className="admin"><AdminHeader email={user.email} role={user.role}/><div className="adminShell">
    <header className="dashboardTitle"><div><small>SEO AUTHORITY ARCHITECTURE</small><h1>Birthday silo map.</h1><p>This is the editorial source of truth for keyword ownership, thematic boundaries, internal authority flow and linkable assets. PageRank here is a planning simulation—not a Google ranking score.</p></div></header>

    <section className="metricGrid seoMetricGrid">
      <article><span>Planned SEO nodes</span><strong>{summary.pages.length}</strong></article>
      <article><span>Validated targets</span><strong>{validatedCount}</strong></article>
      <article><span>Required internal links</span><strong>{summary.links.filter((link) => link.required).length}</strong></article>
      <article><span>Live planned pages</span><strong>{liveCount}</strong></article>
    </section>

    <section className="seoAuthorityGrid">
      <article className="dashboardPanel"><div className="panelHead"><div><small>LINK EQUITY MODEL</small><h2>Highest authority targets</h2></div><span>Weighted simulation</span></div>
        <div className="seoRankList">{summary.topAuthorityPages.slice(0,12).map((page, index) => <div key={page.pageKey}><b>{String(index + 1).padStart(2,"0")}</b><span><strong>{page.title}</strong><small>{page.pageRole} · {page.clusterKey} · {page.incomingLinks} in / {page.outgoingLinks} out</small></span><em>{page.simulatedPageRank.toFixed(4)}</em></div>)}</div>
      </article>
      <article className="dashboardPanel"><div className="panelHead"><div><small>QUALITY CONTROL</small><h2>Cannibalization & semantic drift</h2></div><span>{summary.cannibalizationRisks.length + summary.semanticDriftLinks.length} flags</span></div>
        <div className="seoQualityBox"><strong>{summary.cannibalizationRisks.length ? "Review keyword ownership" : "Keyword ownership is clean"}</strong><p>{summary.cannibalizationRisks.length ? `${summary.cannibalizationRisks.length} pair(s) have overlapping active keyword claims.` : "No exact duplicate active keyword ownership or high-overlap same-cluster claim was detected."}</p></div>
        <div className="seoQualityBox"><strong>{summary.semanticDriftLinks.length ? "Review internal links" : "No semantic sliding below threshold"}</strong><p>{summary.semanticDriftLinks.length ? `${summary.semanticDriftLinks.length} required link(s) fall below the 65/100 semantic floor.` : "Every required editorial link is at least 65/100 semantically related; cross-cluster bridges remain sparse."}</p></div>
        {summary.cannibalizationRisks.slice(0,4).map((risk) => <div className="seoWarning" key={`${risk.pageA}-${risk.pageB}-${risk.keywordA}`}><b>{risk.severity}</b><span>{risk.pageA} ↔ {risk.pageB}</span><small>{risk.keywordA} / {risk.keywordB}</small><p>{risk.reason}</p></div>)}
      </article>
    </section>

    <section className="seoPlanSection"><div className="managerHead"><div><small>SEMANTIC STUDY</small><h2>Page ownership by cluster</h2><p>Each page gets one primary intent. The scope tells editors what belongs on the page—and what should be linked instead of duplicated.</p></div></div>
      {clusters.map((cluster) => <details className="seoCluster" key={cluster} open={["birthday-core","teen","games"].includes(cluster)}><summary><b>{cluster.replaceAll("-"," ")}</b><span>{summary.pages.filter((page) => page.clusterKey === cluster).length} pages</span></summary><div className="seoPlanTable"><div className="seoPlanHead"><span>Page / role</span><span>Primary keyword</span><span>Demand</span><span>KD</span><span>PR</span><span>Status</span></div>{summary.pages.filter((page) => page.clusterKey === cluster).map((page) => { const authority = summary.topAuthorityPages.find((item) => item.pageKey === page.pageKey); return <div className="seoPlanRow" key={page.pageKey}><div><b>{page.title}</b><small>{page.pageRole} · {page.entityType}{page.url ? ` · ${page.url}` : ""}</small><p>{page.semanticScope}</p></div><span>{page.primaryKeyword}</span><span>{formatMetric(page.targetVolume)}</span><span>{formatMetric(page.targetKd)}</span><span>{authority?.simulatedPageRank.toFixed(4) ?? "0"}</span><span className={`seoPlanStatus ${page.status}`}>{page.status}</span></div>})}</div></details>)}
    </section>

    <section className="seoAuthorityGrid seoBottomGrid">
      <article className="dashboardPanel"><div className="panelHead"><div><small>NET LINKING</small><h2>Strongest planned links</h2></div><span>Semantic ≥ 70</span></div><div className="seoLinkList">{summary.links.filter((link) => link.required).sort((a,b)=>b.weight-a.weight).slice(0,18).map((link) => <div key={link.id}><span><b>{link.sourceTitle}</b><i>→</i><b>{link.targetTitle}</b></span><small>“{link.anchorText}” · semantic {link.semanticScore}/100 · weight {link.weight.toFixed(2)}</small></div>)}</div></article>
      <article className="dashboardPanel"><div className="panelHead"><div><small>BACKLINKING</small><h2>Earned-link assets</h2></div><span>No link schemes</span></div><div className="seoAssetList">{summary.backlinkAssets.map((asset) => <div key={asset.id}><b>{asset.assetName}</b><small>{asset.pageTitle} · {asset.assetType}</small><p>{asset.outreachAngle}</p><span>Potential publishers: {asset.targetAudience}</span></div>)}</div></article>
    </section>
  </div></main>;
}
