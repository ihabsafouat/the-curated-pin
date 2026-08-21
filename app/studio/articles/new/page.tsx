import { requireAdmin } from "../../../admin-auth";
import AdminHeader from "../../components/AdminHeader";
import ArticleForm from "../../components/ArticleForm";
import { getCsrfToken } from "../../../security/auth";
import { getAdminCategories } from "../../../../db/categories";
import { listMediaAssets } from "../../../../db/media";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const user = await requireAdmin("/studio/articles/new");
  const [csrf, categories, media] = await Promise.all([getCsrfToken(), getAdminCategories(), listMediaAssets({ status: "active", limit: 120 })]);
  return <main className="admin"><AdminHeader email={user.email} role={user.role}/><div className="adminShell"><ArticleForm csrf={csrf} role={user.role} categories={categories} media={media}/></div></main>;
}
