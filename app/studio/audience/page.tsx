import { notFound } from "next/navigation";
import { getAudienceDashboard } from "../../../db/audience";
import { requireAdmin } from "../../admin-auth";
import { getCsrfToken, roleAtLeast } from "../../security/auth";
import AdminHeader from "../components/AdminHeader";

export const dynamic = "force-dynamic";

export default async function AudienceStudioPage() {
  const user = await requireAdmin("/studio/audience");
  if (!roleAtLeast(user, "editor")) notFound();
  const [audience, csrf] = await Promise.all([getAudienceDashboard(), getCsrfToken()]);
  return <main className="admin"><AdminHeader email={user.email} role={user.role}/><div className="adminShell"><header className="dashboardTitle"><div><small>AUDIENCE ENGINE</small><h1>Segments, lead magnets and nurture.</h1><p>One email list, segmented by the problem a reader actually asked us to solve. Lead magnets collect intent; sequences nurture it without mixing unrelated verticals.</p></div><a className="primaryAdminButton" href="/api/admin/subscribers/export">Export audience CSV</a></header>
    <section className="metricGrid"><article><span>Subscribed</span><strong>{audience.subscribers.toLocaleString()}</strong></article><article><span>Unsubscribed</span><strong>{audience.unsubscribed.toLocaleString()}</strong></article><article><span>Active lead magnets</span><strong>{audience.magnets.filter(item=>item.status==="active").length}</strong></article><article><span>Active sequences</span><strong>{audience.sequences.filter(item=>item.status==="active").length}</strong></article></section>
    <section className="dashboardGrid audienceStudioGrid"><article className="dashboardPanel"><div className="panelHead"><div><small>SEGMENTS</small><h2>Subscriber interests</h2></div><span>Intent tags</span></div><div className="rankList compact">{audience.interests.map((item,index)=><div key={item.interestKey}><b>0{index+1}</b><span>{item.name}<small>{item.interestKey}</small></span><strong>{item.subscribers}</strong></div>)}</div></article>
      <article className="dashboardPanel"><div className="panelHead"><div><small>LEAD MAGNETS</small><h2>Acquisition offers</h2></div><span>Contextual</span></div><div className="audienceMagnetList">{audience.magnets.map((magnet)=><div key={magnet.slug}><div><b>{magnet.name}</b><small>{magnet.interestKey || "general"} · {magnet.status}</small></div><strong>{magnet.subscribers} signups</strong><span><a href={`/free/${magnet.slug}`} target="_blank">Landing ↗</a><a href={`/free/${magnet.slug}/print`} target="_blank">Printable ↗</a></span></div>)}</div></article>
    </section>
    <section className="articleManager audienceSequences"><div className="managerHead"><div><small>AUTOMATION</small><h2>Welcome sequences</h2><p>Netlify runs due emails hourly. Pause a sequence before changing its editorial links or offer.</p></div></div><div className="sequenceTable"><div className="sequenceHead"><span>Sequence</span><span>Interest</span><span>Steps</span><span>Enrollments</span><span>Status</span></div>{audience.sequences.map((sequence)=><div className="sequenceRow" key={sequence.id}><div><b>{sequence.name}</b><small>{sequence.slug}</small></div><span>{sequence.interestKey || "general"}</span><span>{sequence.steps}</span><span>{sequence.activeEnrollments}</span><form action={`/api/admin/audience/sequences/${sequence.id}`} method="post"><input type="hidden" name="_csrf" value={csrf}/><select name="status" defaultValue={sequence.status}><option value="active">Active</option><option value="paused">Paused</option><option value="draft">Draft</option><option value="retired">Retired</option></select><button type="submit">Save</button></form></div>)}</div></section>
  </div></main>;
}
