import { listUsers } from "../../../db/auth";
import { getCsrfToken, requireRole } from "../../security/auth";
import AdminHeader from "../components/AdminHeader";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const admin = await requireRole("admin", "/studio/users");
  const [users, csrf] = await Promise.all([listUsers(), getCsrfToken()]);
  return <main className="admin"><AdminHeader email={admin.email} role={admin.role}/><div className="adminShell"><header className="dashboardTitle"><div><small>ACCESS CONTROL</small><h1>People and permissions.</h1><p>New registrations start as readers. Only an admin can grant publishing access.</p></div></header><section className="userManager"><div className="userTableHead"><span>Person</span><span>Joined</span><span>Status</span><span>Role</span></div>{users.map((user) => <div className="userTableRow" key={user.id}><div><b>{user.name}</b><span>{user.email}</span></div><span>{new Date(user.createdAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</span><span>{user.status}</span><form action={`/api/admin/users/${user.id}/role`} method="post"><input type="hidden" name="_csrf" value={csrf}/><select name="role" defaultValue={user.role} disabled={user.id === admin.id}><option value="reader">Reader</option><option value="author">Author</option><option value="editor">Editor</option><option value="admin">Admin</option></select><button type="submit" disabled={user.id === admin.id}>Update</button></form></div>)}</section><p className="roleGuide"><b>Reader</b> saves content · <b>Author</b> creates own drafts · <b>Editor</b> publishes and manages articles · <b>Admin</b> also manages people and roles.</p></div></main>;
}
