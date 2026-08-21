import { listAuditLogs } from "../../../db/auth";
import { requireRole } from "../../security/auth";
import AdminHeader from "../components/AdminHeader";

export const dynamic = "force-dynamic";

export default async function SecurityEventsPage() {
  const admin = await requireRole("admin", "/studio/security");
  const logs = await listAuditLogs(250);
  return <main className="admin"><AdminHeader email={admin.email} role={admin.role}/><div className="adminShell"><header className="dashboardTitle"><div><small>SECURITY EVENTS</small><h1>Authentication and privileged changes.</h1><p>Audit records help investigate account lockouts, password resets, permission changes and publishing actions. IP values are stored only as hashes.</p></div></header><section className="securityLog">{logs.length ? logs.map(log => <article key={log.id}><div><b>{log.action}</b><span>{new Date(log.createdAt).toLocaleString("en")}</span></div><div><span>{log.targetType}{log.targetId ? ` · ${log.targetId}` : ""}</span><code>{Object.keys(log.metadata).length ? JSON.stringify(log.metadata) : "{}"}</code></div></article>) : <div className="analyticsEmpty">Security events will appear here.</div>}</section></div></main>;
}
