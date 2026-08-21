import Link from "next/link";
import { getCurrentUser } from "../security/auth";

export default async function AccountLink({ compact = false }: { compact?: boolean }) {
  const user = await getCurrentUser();
  if (!user) return <Link className={compact ? "navAccount compact" : "navAccount"} href="/login">Log in</Link>;
  return <Link className={compact ? "navAccount compact" : "navAccount"} href="/account">Hi, {user.name.split(" ")[0]}</Link>;
}
