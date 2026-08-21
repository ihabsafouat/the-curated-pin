import { notFound } from "next/navigation";
import { getFunnelAnalyticsDashboard } from "../../../db/analytics";
import { requireAdmin } from "../../admin-auth";
import { roleAtLeast } from "../../security/auth";
import AdminHeader from "../components/AdminHeader";

export const dynamic = "force-dynamic";

function percent(value:number){return `${value.toFixed(value>=10?0:1)}%`;}
function money(value:number,currency="USD"){return new Intl.NumberFormat("en-US",{style:"currency",currency,maximumFractionDigits:2}).format(value);}

export default async function AnalyticsStudioPage({searchParams}:{searchParams:Promise<{days?:string}>}){
  const user=await requireAdmin("/studio/analytics");
  if(!roleAtLeast(user,"editor"))notFound();
  const params=await searchParams;
  const requested=Number(params.days||30);
  const days=[7,30,90,365].includes(requested)?requested:30;
  const data=await getFunnelAnalyticsDashboard(days);
  const signupRate=data.totals.views?data.totals.signups/data.totals.views*100:0;
  const engagedRate=data.totals.views?data.totals.engaged/data.totals.views*100:0;
  const affiliateCtr=data.totals.views?data.totals.affiliateClicks/data.totals.views*100:0;
  return <main className="admin"><AdminHeader email={user.email} role={user.role}/><div className="adminShell">
    <header className="dashboardTitle"><div><small>FUNNEL ANALYTICS</small><h1>Traffic is useful only when it moves the business.</h1><p>First-party events connect acquisition, content engagement, lead magnets, email signups, affiliate clicks, owned-product intent and confirmed commerce conversions.</p></div><nav className="analyticsRange" aria-label="Analytics date range">{[7,30,90,365].map(value=><a key={value} className={value===days?"active":""} href={`/studio/analytics?days=${value}`}>{value===365?"1 year":`${value} days`}</a>)}</nav></header>

    <section className="metricGrid analyticsMetricGrid">
      <article><span>Article/page views</span><strong>{data.totals.views.toLocaleString()}</strong><small>{percent(engagedRate)} engaged</small></article>
      <article><span>Email signups</span><strong>{data.totals.signups.toLocaleString()}</strong><small>{percent(signupRate)} of views</small></article>
      <article><span>Affiliate clicks</span><strong>{data.totals.affiliateClicks.toLocaleString()}</strong><small>{percent(affiliateCtr)} of views</small></article>
      <article><span>Owned-product clicks</span><strong>{data.totals.productClicks.toLocaleString()}</strong><small>{data.totals.checkoutClicks.toLocaleString()} checkout clicks</small></article>
      <article><span>Confirmed purchases</span><strong>{data.totals.purchases.toLocaleString()}</strong><small>Server-side webhook</small></article>
      <article><span>Revenue</span><strong>{data.totals.multiCurrency?"Multi-currency":money(data.totals.revenue,data.totals.revenueCurrency||"USD")}</strong><small>Confirmed conversions only</small></article>
    </section>

    <section className="dashboardGrid analyticsTopGrid">
      <article className="dashboardPanel"><div className="panelHead"><div><small>EMAIL FUNNEL</small><h2>Article → subscriber</h2></div><span>{days} days</span></div><div className="funnelSteps">{data.funnel.map((step,index)=><div key={step.key}><span><b>{index+1}</b>{step.label}</span><strong>{step.count.toLocaleString()}</strong><small>{step.fromPreviousPct===null?"Entry point":`${percent(step.fromPreviousPct)} from previous`} · {step.fromViewsPct===null?"100% of views":`${percent(step.fromViewsPct)} of views`}</small></div>)}</div></article>
      <article className="dashboardPanel"><div className="panelHead"><div><small>COMMERCIAL SIGNALS</small><h2>Monetization intent</h2></div><span>First party</span></div><div className="commercialSignalGrid"><div><b>{data.totals.affiliateClicks}</b><span>Affiliate clicks</span></div><div><b>{data.totals.productClicks}</b><span>Product clicks</span></div><div><b>{data.totals.checkoutClicks}</b><span>Checkout clicks</span></div><div><b>{data.totals.purchases}</b><span>Purchases</span></div></div><p className="analyticsNote">A purchase only appears after a trusted server-to-server conversion webhook. Browser clicks are intent signals, not revenue claims.</p></article>
    </section>

    <section className="articleManager analyticsTableSection"><div className="managerHead"><div><small>CONTENT ECONOMICS</small><h2>Which articles create business value?</h2><p>Sort mentally by conversion, not only pageviews. A smaller page with a high signup or affiliate rate can deserve more promotion than a high-traffic page that does nothing.</p></div></div><div className="analyticsDataTable"><div className="analyticsDataHead"><span>Article</span><span>Views</span><span>Engaged</span><span>Signups</span><span>Signup rate</span><span>Affiliate</span><span>Product</span></div>{data.articles.length?data.articles.map(row=><div className="analyticsDataRow" key={row.slug}><a href={`/article/${row.slug}`} target="_blank">{row.title}<small>/{row.slug}</small></a><span>{row.views}</span><span>{row.engaged}</span><span>{row.signups}</span><strong>{percent(row.signupRate)}</strong><span>{row.affiliateClicks}</span><span>{row.productClicks}</span></div>):<div className="analyticsEmpty">Article conversion data will appear after traffic arrives.</div>}</div></section>

    <section className="dashboardGrid analyticsDetailGrid">
      <article className="dashboardPanel"><div className="panelHead"><div><small>ACQUISITION</small><h2>Sources that convert</h2></div><span>UTM + referral</span></div>{data.sources.length?<div className="analyticsMiniTable">{data.sources.map(row=><div key={`${row.source}:${row.medium}`}><span><b>{row.source}</b><small>{row.medium||"unattributed"}</small></span><span>{row.views} views</span><span>{row.signups} leads</span><span>{row.affiliateClicks} affiliate</span><strong>{row.purchases?data.totals.multiCurrency?`${row.purchases} purchases`:`${row.purchases} · ${money(row.revenue,data.totals.revenueCurrency||"USD")}`:"—"}</strong></div>)}</div>:<div className="analyticsEmpty">Campaign/source data will appear here.</div>}</article>
      <article className="dashboardPanel"><div className="panelHead"><div><small>LEAD MAGNETS</small><h2>Offer conversion</h2></div><span>Impression → signup</span></div>{data.leadMagnets.length?<div className="analyticsMiniTable">{data.leadMagnets.map(row=><div key={row.slug}><span><b>{row.name}</b><small>{row.slug}</small></span><span>{row.impressions} seen</span><span>{row.clicks} clicked</span><span>{row.signups} signups</span><strong>{percent(row.signupRate)}</strong></div>)}</div>:<div className="analyticsEmpty">Lead-magnet events will appear here.</div>}</article>
      <article className="dashboardPanel"><div className="panelHead"><div><small>AFFILIATE</small><h2>Merchant click share</h2></div><span>Clicks</span></div>{data.affiliates.length?<div className="rankList compact">{data.affiliates.map((row,index)=><div key={row.merchant}><b>{String(index+1).padStart(2,"0")}</b><span>{row.merchant}</span><strong>{row.clicks}</strong></div>)}</div>:<div className="analyticsEmpty">Affiliate merchant clicks will appear here.</div>}</article>
      <article className="dashboardPanel"><div className="panelHead"><div><small>OWNED PRODUCTS</small><h2>Product intent + revenue</h2></div><span>Confirmed</span></div>{data.products.length?<div className="analyticsMiniTable">{data.products.map(row=><div key={row.slug}><span><b>{row.slug}</b></span><span>{row.clicks} clicks</span><span>{row.checkoutClicks} checkout</span><span>{row.purchases} sales</span><strong>{data.totals.multiCurrency?(row.purchases?`${row.purchases} sales`:"—"):money(row.revenue,data.totals.revenueCurrency||"USD")}</strong></div>)}</div>:<div className="analyticsEmpty">Owned-product activity will appear after product pages launch.</div>}</article>
    </section>
  </div></main>;
}
