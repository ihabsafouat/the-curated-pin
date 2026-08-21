import SubHeader from "../components/SubHeader";
import SubFooter from "../components/SubFooter";
import SavedLibrary from "../components/SavedLibrary";
import { getPublishedArticles } from "../../db/data";
import { getCurrentUser } from "../security/auth";
import { privateRobots } from "../seo";

export const dynamic = "force-dynamic";
export const metadata = { title: 'Saved Guides', description: 'Your private favorites and read-later library on The Curated Pin.', alternates: { canonical: '/saved' }, robots: privateRobots(true) };

export default async function SavedPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [articles,user,params] = await Promise.all([getPublishedArticles(),getCurrentUser(),searchParams]);
  const initialTab = params.tab === "read_later" ? "read_later" : "favorite";
  return <main><SubHeader/><section className="savedPage shell"><small>YOUR CURATED LIST</small><h1>Saved for you</h1><p>{user ? "Your favorites and read-later guides stay synced across your signed-in devices." : "Favorites and read-later guides stay here on this device. Log in to sync them."}</p><SavedLibrary articles={articles.map(({slug,title,category,image,dek,readTime}) => ({slug,title,category,image,dek,readTime}))} signedIn={Boolean(user)} initialTab={initialTab}/></section><SubFooter/></main>;
}
