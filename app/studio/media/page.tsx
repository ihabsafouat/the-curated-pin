import Link from "next/link";
import { requireAdmin } from "../../admin-auth";
import { getCsrfToken } from "../../security/auth";
import { listMediaAssets, type MediaAssetStatus } from "../../../db/media";
import { mediaVariantUrls } from "../../media/cloudinary";
import AdminHeader from "../components/AdminHeader";
import MediaUploadPanel from "../components/MediaUploadPanel";
import MediaAssetActions from "../components/MediaAssetActions";

export const dynamic = "force-dynamic";

function bytes(value: number) {
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

export default async function MediaLibraryPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const user = await requireAdmin("/studio/media");
  const params = await searchParams;
  const q = String(params.q ?? "").trim();
  const status: MediaAssetStatus | "all" = params.status === "archived" ? "archived" : params.status === "all" ? "all" : "active";
  const [csrf, assets] = await Promise.all([getCsrfToken(), listMediaAssets({ q, status, limit: 180 })]);

  return <main className="admin"><AdminHeader email={user.email} role={user.role}/><div className="adminShell mediaLibraryShell">
    <header className="dashboardTitle"><div><small>MEDIA SYSTEM</small><h1>One master image, every channel.</h1><p>Upload once, then use responsive web delivery, 1200×630 social crops and 1000×1500 Pinterest crops from the same verified asset.</p></div><Link className="primaryAdminButton" href="/studio/articles/new">+ New article</Link></header>
    <MediaUploadPanel csrf={csrf}/>
    <section className="mediaLibraryToolbar">
      <form method="get"><input name="q" defaultValue={q} placeholder="Search media…"/><input type="hidden" name="status" value={status}/><button>Search</button></form>
      <nav><Link className={status === "active" ? "active" : ""} href={`/studio/media${q ? `?q=${encodeURIComponent(q)}&` : "?"}status=active`}>Active</Link><Link className={status === "archived" ? "active" : ""} href={`/studio/media${q ? `?q=${encodeURIComponent(q)}&` : "?"}status=archived`}>Archived</Link><Link className={status === "all" ? "active" : ""} href={`/studio/media${q ? `?q=${encodeURIComponent(q)}&` : "?"}status=all`}>All</Link></nav>
    </section>
    <section className="mediaLibraryGrid">{assets.map((asset) => {
      const variants = mediaVariantUrls(asset.secureUrl);
      return <article className={`mediaAssetCard ${asset.status}`} key={asset.id}>
        <div className="mediaAssetPreview"><img src={variants.card} alt=""/><span>{asset.status}</span></div>
        <div className="mediaAssetMeta"><b>{asset.altText}</b><small>{asset.width}×{asset.height} · {asset.format.toUpperCase()} · {bytes(asset.bytes)} · {asset.usageCount} page use{asset.usageCount === 1 ? "" : "s"}</small><code>{asset.publicId}</code></div>
        <MediaAssetActions secureUrl={asset.secureUrl}/>
        <form className="mediaAssetForm" action={`/api/admin/media/${asset.id}`} method="post"><input type="hidden" name="_csrf" value={csrf}/>
          <label>Alt text<input name="altText" defaultValue={asset.altText} required maxLength={320}/></label>
          <label>Caption<textarea name="caption" defaultValue={asset.caption} rows={2} maxLength={500}/></label>
          <div><label>Credit<input name="credit" defaultValue={asset.credit} maxLength={240} placeholder="Photographer / source"/></label><label>License note<input name="licenseNote" defaultValue={asset.licenseNote} maxLength={240} placeholder="Owned · licensed · commissioned…"/></label></div>
          <label>Tags<input name="tags" defaultValue={asset.tags.join(", ")} placeholder="birthday, teen, outdoor"/></label>
          <div className="mediaAssetFooter"><label>Status<select name="status" defaultValue={asset.status}><option value="active">Active</option><option value="archived">Archived</option></select></label><button type="submit">Save metadata</button></div>
        </form>
      </article>;
    })}{!assets.length && <div className="analyticsEmpty mediaEmpty">No media matched this view.</div>}</section>
  </div></main>;
}
