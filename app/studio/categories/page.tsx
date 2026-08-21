import { notFound } from "next/navigation";
import { getAdminCategories, getCategoryTree } from "../../../db/categories";
import type { CategoryTreeNode } from "../../../db/types";
import { requireAdmin } from "../../admin-auth";
import { getCsrfToken, roleAtLeast } from "../../security/auth";
import AdminHeader from "../components/AdminHeader";
import MediaUrlField from "../components/MediaUrlField";
import { listMediaAssets } from "../../../db/media";

export const dynamic = "force-dynamic";

function flattenTree(nodes: CategoryTreeNode[], depth = 0): { category: CategoryTreeNode; depth: number }[] {
  return nodes.flatMap((category) => [
    { category, depth },
    ...flattenTree(category.children, depth + 1),
  ]);
}

export default async function CategoriesAdminPage() {
  const user = await requireAdmin("/studio/categories");
  if (!roleAtLeast(user, "editor")) notFound();
  const [tree, allCategories, csrf, media] = await Promise.all([
    getCategoryTree({ includeInactive: true }),
    getAdminCategories(),
    getCsrfToken(),
    listMediaAssets({ status: "active", limit: 180 }),
  ]);
  const rows = flattenTree(tree);

  return <main className="admin"><AdminHeader email={user.email} role={user.role}/><div className="adminShell">
    <header className="dashboardTitle"><div><small>TAXONOMY</small><h1>Organize the publication.</h1><p>Categories are hierarchical and database-driven. Inactive verticals stay out of the public site until you are ready.</p></div></header>

    <section className="taxonomyLayout">
      <article className="editorCard taxonomyCreate"><h2>Create category</h2><p className="helper">Create a new section without changing application code. Slugs become permanent URL segments, so keep them short and stable.</p>
        <form action="/api/admin/categories" method="post"><input type="hidden" name="_csrf" value={csrf}/>
          <div className="field"><label>Name</label><input name="name" required placeholder="Birthday Activities"/></div>
          <div className="field"><label>Slug</label><input name="slug" placeholder="birthday-activities" pattern="[a-z0-9-]+"/></div>
          <div className="field"><label>Parent</label><select name="parentId" defaultValue=""><option value="">Top-level category</option>{rows.map(({ category, depth }) => <option key={category.id} value={category.id}>{"— ".repeat(depth)}{category.name} · /{category.path}</option>)}</select></div>
          <div className="field"><label>Intro</label><textarea name="intro" rows={4} placeholder="What readers will find in this section."/></div>
          <div className="fieldGrid"><div className="field"><label>Color</label><input name="color" type="color" defaultValue="#e8e4db"/></div><div className="field"><label>Mark</label><input name="mark" defaultValue="•" maxLength={16}/></div></div>
          <div className="fieldGrid"><div className="field"><label>Status</label><select name="status" defaultValue="active"><option value="active">Active</option><option value="inactive">Inactive</option></select></div><div className="field"><label>Sort order</label><input name="sortOrder" type="number" min="0" defaultValue="100"/></div></div>
          <section className="taxonomySeo"><h3>Search & social</h3><div className="field"><label>SEO title</label><input name="seoTitle" maxLength={180} placeholder="Defaults to category name + Guides"/></div><div className="field"><label>Meta description</label><textarea name="seoDescription" rows={3} maxLength={180} placeholder="Defaults to the category intro"/></div><MediaUrlField label="Social image" name="socialImage" media={media} mode="social" placeholder="Optional; choose a 1200×630 crop"/><label className="taxonomyCheck"><input type="checkbox" name="seoIndex" defaultChecked/> Allow indexing when the category has published content</label></section><label className="taxonomyCheck"><input type="checkbox" name="showInNav"/> Show this category in main navigation</label>
          <button className="primaryAdminButton" type="submit">Create category</button>
        </form>
      </article>

      <section className="taxonomyList"><div className="managerHead"><div><small>CATEGORY TREE</small><h2>{allCategories.length} categories</h2><p>Changing a slug or parent updates descendant paths and article category paths together.</p></div></div>
        {rows.map(({ category, depth }) => <details className="taxonomyRow" key={category.id} open={category.path === "celebrations/birthday-parties"}>
          <summary><span className="taxonomyDepth" style={{ paddingLeft: `${depth * 20}px` }}>{category.mark}</span><div><b>{category.name}</b><small>/{category.path}</small></div><span className={`taxonomyStatus ${category.status}`}>{category.status}</span><span>{category.showInNav ? "NAV" : ""}</span></summary>
          <form action={`/api/admin/categories/${category.id}`} method="post" className="taxonomyEdit"><input type="hidden" name="_csrf" value={csrf}/>
            <div className="fieldGrid"><div className="field"><label>Name</label><input name="name" defaultValue={category.name} required/></div><div className="field"><label>Slug</label><input name="slug" defaultValue={category.slug} required pattern="[a-z0-9-]+"/></div></div>
            <div className="field"><label>Parent</label><select name="parentId" defaultValue={category.parentId ?? ""}><option value="">Top-level category</option>{rows.filter((row) => row.category.id !== category.id && !row.category.path.startsWith(`${category.path}/`)).map(({ category: option, depth: optionDepth }) => <option key={option.id} value={option.id}>{"— ".repeat(optionDepth)}{option.name} · /{option.path}</option>)}</select></div>
            <div className="field"><label>Intro</label><textarea name="intro" rows={3} defaultValue={category.intro}/></div>
            <div className="taxonomyInline"><div className="field"><label>Color</label><input name="color" type="color" defaultValue={category.color}/></div><div className="field"><label>Mark</label><input name="mark" defaultValue={category.mark} maxLength={16}/></div><div className="field"><label>Status</label><select name="status" defaultValue={category.status}><option value="active">Active</option><option value="inactive">Inactive</option></select></div><div className="field"><label>Sort</label><input name="sortOrder" type="number" min="0" defaultValue={category.sortOrder}/></div></div>
            <div className="fieldGrid"><div className="field"><label>SEO title</label><input name="seoTitle" defaultValue={category.seoTitle} maxLength={180}/></div><MediaUrlField label="Social image" name="socialImage" initialValue={category.socialImage} media={media} mode="social"/></div><div className="field"><label>Meta description</label><textarea name="seoDescription" rows={3} maxLength={180} defaultValue={category.seoDescription}/></div><label className="taxonomyCheck"><input type="checkbox" name="seoIndex" defaultChecked={category.seoIndex}/> Allow indexing when this category has published content</label><label className="taxonomyCheck"><input type="checkbox" name="showInNav" defaultChecked={category.showInNav}/> Show in main navigation</label>
            <div className="taxonomyActions"><span>Current path: /category/{category.path}</span><button className="primaryAdminButton" type="submit">Save category</button></div>
          </form>
        </details>)}
      </section>
    </section>
  </div></main>;
}
