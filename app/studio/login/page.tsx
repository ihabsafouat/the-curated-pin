import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default function StudioLogin(){redirect("/login?returnTo=%2Fstudio");}
