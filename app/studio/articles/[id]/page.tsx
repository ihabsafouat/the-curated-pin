import { notFound } from "next/navigation";
import { requireAdmin } from "../../../admin-auth";
import { getAdminArticleById } from "../../../../db/data";
import { getAdminCategories } from "../../../../db/categories";
import { listMediaAssets } from "../../../../db/media";
import AdminHeader from "../../components/AdminHeader";
import ArticleForm from "../../components/ArticleForm";
import { getCsrfToken, roleAtLeast } from "../../../security/auth";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAdmin(`/studio/articles/${id}`);
  const [article, categories, csrf, media] = await Promise.all([getAdminArticleById(Number(id)), getAdminCategories(), getCsrfToken(), listMediaAssets({ status: "active", limit: 120 })]);
  if (!article || (!roleAtLeast(user, "editor") && article.authorId !== user.id)) notFound();
  return <main className="admin"><AdminHeader email={user.email} role={user.role}/><div className="adminShell"><ArticleForm article={article} csrf={csrf} role={user.role} categories={categories} media={media}/></div></main>;
}
