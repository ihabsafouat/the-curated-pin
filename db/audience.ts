import { databaseIsConfigured, execute, queryOne, queryRows } from "./client";
import { fallbackLeadMagnet, fallbackLeadMagnetForContext, fallbackLeadMagnets } from "./fallback-content";
import type {
  AudienceDashboard,
  AudienceInterest,
  AudienceSignupInput,
  AudienceSubscriber,
  EmailSequenceSummary,
  LeadMagnet,
  LeadMagnetResourceSection,
} from "./types";

function dateString(value: string | Date | null | undefined) {
  if (!value) return "";
  return value instanceof Date ? value.toISOString() : String(value);
}

function jsonResource(value: unknown): LeadMagnetResourceSection[] {
  if (Array.isArray(value)) return value as LeadMagnetResourceSection[];
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

type LeadMagnetRow = {
  id: number | string;
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  cta_label: string;
  interest_key: string | null;
  asset_url: string;
  resource_json: unknown;
  email_subject: string;
  email_intro: string;
  status: "draft" | "active" | "retired";
  seo_index: boolean;
};

function rowToLeadMagnet(row: LeadMagnetRow): LeadMagnet {
  return {
    id: Number(row.id),
    slug: row.slug,
    name: row.name,
    eyebrow: row.eyebrow,
    description: row.description,
    ctaLabel: row.cta_label,
    interestKey: row.interest_key,
    assetUrl: row.asset_url,
    resource: jsonResource(row.resource_json),
    emailSubject: row.email_subject,
    emailIntro: row.email_intro,
    status: row.status,
    seoIndex: Boolean(row.seo_index),
  };
}

const LEAD_MAGNET_SELECT = `SELECT id,slug,name,eyebrow,description,cta_label,interest_key,asset_url,resource_json,email_subject,email_intro,status,seo_index FROM lead_magnets`;

export async function getLeadMagnetBySlug(slug: string, includeInactive = false): Promise<LeadMagnet | null> {
  if (!databaseIsConfigured() && !includeInactive) return fallbackLeadMagnet(slug);
  try {
    const row = await queryOne<LeadMagnetRow>(`${LEAD_MAGNET_SELECT} WHERE slug = ? ${includeInactive ? "" : "AND status = 'active'"} LIMIT 1`, [slug]);
    return row ? rowToLeadMagnet(row) : null;
  } catch (error) {
    if (includeInactive) throw error;
    console.error(`Unable to load lead magnet ${slug}; using bundled resource.`, error);
    return fallbackLeadMagnet(slug);
  }
}

export async function getActiveLeadMagnets(): Promise<LeadMagnet[]> {
  if (!databaseIsConfigured()) return fallbackLeadMagnets;
  try {
    const rows = await queryRows<LeadMagnetRow>(`${LEAD_MAGNET_SELECT} WHERE status = 'active' ORDER BY updated_at DESC, id DESC`);
    return rows.map(rowToLeadMagnet);
  } catch (error) {
    console.error("Unable to load lead magnets; using bundled resources.", error);
    return fallbackLeadMagnets;
  }
}

export async function getLeadMagnetForContext(context: { articleSlug?: string; categoryPath?: string }): Promise<LeadMagnet | null> {
  if (!databaseIsConfigured()) return fallbackLeadMagnetForContext(context);
  const articleSlug = context.articleSlug?.trim() || "";
  const categoryPath = context.categoryPath?.trim() || "";
  try {
    const row = await queryOne<LeadMagnetRow & { match_priority: number }>(
      `SELECT lm.id,lm.slug,lm.name,lm.eyebrow,lm.description,lm.cta_label,lm.interest_key,lm.asset_url,lm.resource_json,lm.email_subject,lm.email_intro,lm.status,lm.seo_index,
       (CASE WHEN t.target_type='article' THEN 3000 WHEN t.target_type='category' THEN 2000 ELSE 1000 END) + t.priority + LENGTH(t.target_key) AS match_priority
     FROM lead_magnets lm JOIN lead_magnet_targets t ON t.lead_magnet_id = lm.id
     WHERE lm.status='active' AND (
       (t.target_type='article' AND ? <> '' AND t.target_key = ?) OR
       (t.target_type='category' AND ? <> '' AND (? = t.target_key OR ? LIKE t.target_key || '/%')) OR
       (t.target_type='global' AND ? <> '' AND (? = t.target_key OR ? LIKE t.target_key || '/%'))
     )
     ORDER BY match_priority DESC LIMIT 1`,
      [articleSlug, articleSlug, categoryPath, categoryPath, categoryPath, categoryPath, categoryPath, categoryPath],
    );
    return row ? rowToLeadMagnet(row) : null;
  } catch (error) {
    console.error("Unable to load a contextual lead magnet; using the bundled resource.", error);
    return fallbackLeadMagnetForContext(context);
  }
}

export async function getAudienceInterests(activeOnly = true): Promise<AudienceInterest[]> {
  const rows = await queryRows<{
    interest_key: string; parent_key: string | null; name: string; description: string; status: "active" | "inactive"; sort_order: number | string;
  }>(`SELECT interest_key,parent_key,name,description,status,sort_order FROM audience_interests ${activeOnly ? "WHERE status='active'" : ""} ORDER BY sort_order,name`);
  return rows.map((row) => ({ interestKey: row.interest_key, parentKey: row.parent_key, name: row.name, description: row.description, status: row.status, sortOrder: Number(row.sort_order) }));
}

async function interestLineage(interestKey: string): Promise<string[]> {
  const rows = await queryRows<{ interest_key: string }>(
    `WITH RECURSIVE lineage AS (
       SELECT interest_key,parent_key FROM audience_interests WHERE interest_key=? AND status='active'
       UNION ALL
       SELECT i.interest_key,i.parent_key FROM audience_interests i JOIN lineage l ON i.interest_key=l.parent_key WHERE i.status='active'
     ) SELECT interest_key FROM lineage`,
    [interestKey],
  );
  return rows.map((row) => row.interest_key);
}

export async function subscribeAudience(input: AudienceSignupInput): Promise<{ subscriber: AudienceSubscriber; leadMagnet: LeadMagnet | null }> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const magnet = input.leadMagnetSlug ? await getLeadMagnetBySlug(input.leadMagnetSlug) : null;
  const requestedInterest = magnet?.interestKey || input.interestKey || "general";
  const now = new Date().toISOString();

  if (!databaseIsConfigured()) {
    return {
      subscriber: {
        id: -1,
        email: normalizedEmail,
        firstName: (input.firstName || "").trim().slice(0, 80),
        status: "subscribed",
        source: input.source.slice(0, 80),
        lastSource: input.source.slice(0, 80),
        primaryInterest: requestedInterest,
        leadMagnetSlug: magnet?.slug || null,
        createdAt: now,
        updatedAt: now,
        interests: [requestedInterest],
      },
      leadMagnet: magnet,
    };
  }

  try {
    const lineage = await interestLineage(requestedInterest);
    const validInterest = lineage[0] || "general";
    const row = await queryOne<{
      id: number | string; email: string; first_name: string; status: "subscribed" | "unsubscribed"; source: string; last_source: string; primary_interest: string | null; lead_magnet_slug: string | null; created_at: string | Date; updated_at: string | Date;
    }>(
      `INSERT INTO newsletter_subscribers
        (email,first_name,status,source,last_source,primary_interest,lead_magnet_slug,last_article_slug,last_category_path,utm_source,utm_medium,utm_campaign,utm_content,utm_term,consent_at,consent_version,updated_at,unsubscribed_at)
       VALUES (?,?,'subscribed',?,?,?,?,?,?,?,?,?,?,?,?,?,?,NULL)
       ON CONFLICT(email) DO UPDATE SET
         first_name=CASE WHEN excluded.first_name<>'' THEN excluded.first_name ELSE newsletter_subscribers.first_name END,
         status='subscribed',last_source=excluded.last_source,primary_interest=excluded.primary_interest,
         lead_magnet_slug=COALESCE(excluded.lead_magnet_slug,newsletter_subscribers.lead_magnet_slug),
         last_article_slug=COALESCE(excluded.last_article_slug,newsletter_subscribers.last_article_slug),
         last_category_path=COALESCE(excluded.last_category_path,newsletter_subscribers.last_category_path),
         utm_source=COALESCE(excluded.utm_source,newsletter_subscribers.utm_source),utm_medium=COALESCE(excluded.utm_medium,newsletter_subscribers.utm_medium),
         utm_campaign=COALESCE(excluded.utm_campaign,newsletter_subscribers.utm_campaign),utm_content=COALESCE(excluded.utm_content,newsletter_subscribers.utm_content),utm_term=COALESCE(excluded.utm_term,newsletter_subscribers.utm_term),
         consent_at=excluded.consent_at,consent_version=excluded.consent_version,updated_at=excluded.updated_at,unsubscribed_at=NULL
       RETURNING id,email,first_name,status,source,last_source,primary_interest,lead_magnet_slug,created_at,updated_at`,
      [
        normalizedEmail,
        (input.firstName || "").trim().slice(0, 80),
        input.source.slice(0, 80),
        input.source.slice(0, 80),
        validInterest,
        magnet?.slug || null,
        input.articleSlug || null,
        input.categoryPath || null,
        input.utmSource || null,
        input.utmMedium || null,
        input.utmCampaign || null,
        input.utmContent || null,
        input.utmTerm || null,
        now,
        input.consentVersion || "email-v1",
        now,
      ],
    );
    if (!row) throw new Error("Could not create newsletter subscriber.");

    const interestKeys = lineage.length ? lineage : ["general"];
    for (const interestKey of interestKeys) {
      await execute(
        `INSERT INTO newsletter_subscriber_interests (subscriber_id,interest_key,source) VALUES (?,?,?) ON CONFLICT(subscriber_id,interest_key) DO NOTHING`,
        [row.id, interestKey, magnet ? `lead:${magnet.slug}` : input.source.slice(0, 80)],
      );
    }

    let sequence: { id: number | string; delay_hours: number | string | null; interest_key: string } | null = null;
    for (const interestKey of interestKeys) {
      sequence = await queryOne<{ id: number | string; delay_hours: number | string | null; interest_key: string }>(
        `SELECT s.id,s.interest_key,st.delay_hours FROM email_sequences s
         JOIN email_sequence_steps st ON st.sequence_id=s.id AND st.step_number=1
         WHERE s.status='active' AND s.interest_key=? LIMIT 1`,
        [interestKey],
      );
      if (sequence) break;
    }

    if (sequence) {
      for (const interestKey of interestKeys) {
        if (interestKey === sequence.interest_key) continue;
        await execute(
          `UPDATE subscriber_sequence_enrollments e SET status='cancelled',updated_at=CURRENT_TIMESTAMP
           FROM email_sequences s WHERE e.sequence_id=s.id AND e.subscriber_id=? AND e.status='active' AND s.interest_key=?`,
          [row.id, interestKey],
        );
      }
      const nextSendAt = new Date(Date.now() + Number(sequence.delay_hours || 24) * 60 * 60 * 1000).toISOString();
      await execute(
        `INSERT INTO subscriber_sequence_enrollments (subscriber_id,sequence_id,current_step,next_send_at,status)
         VALUES (?,?,0,?,'active')
         ON CONFLICT(subscriber_id,sequence_id) DO UPDATE SET status='active',next_send_at=CASE WHEN subscriber_sequence_enrollments.status IN ('completed','cancelled') THEN excluded.next_send_at ELSE subscriber_sequence_enrollments.next_send_at END,updated_at=CURRENT_TIMESTAMP`,
        [row.id, sequence.id, nextSendAt],
      );
    }

    return {
      subscriber: {
        id: Number(row.id), email: row.email, firstName: row.first_name, status: row.status, source: row.source, lastSource: row.last_source,
        primaryInterest: row.primary_interest, leadMagnetSlug: row.lead_magnet_slug, createdAt: dateString(row.created_at), updatedAt: dateString(row.updated_at), interests: interestKeys,
      },
      leadMagnet: magnet,
    };
  } catch (error) {
    console.warn("Audience subscription DB operation failed; falling back to memory response.", error);
    return {
      subscriber: {
        id: -1,
        email: normalizedEmail,
        firstName: (input.firstName || "").trim().slice(0, 80),
        status: "subscribed",
        source: input.source.slice(0, 80),
        lastSource: input.source.slice(0, 80),
        primaryInterest: requestedInterest,
        leadMagnetSlug: magnet?.slug || null,
        createdAt: now,
        updatedAt: now,
        interests: [requestedInterest],
      },
      leadMagnet: magnet,
    };
  }
}

export async function getSubscriberForPreferences(id: number, email: string): Promise<AudienceSubscriber | null> {
  const row = await queryOne<{
    id: number | string; email: string; first_name: string; status: "subscribed" | "unsubscribed"; source: string; last_source: string; primary_interest: string | null; lead_magnet_slug: string | null; created_at: string | Date; updated_at: string | Date;
  }>(`SELECT id,email,first_name,status,source,last_source,primary_interest,lead_magnet_slug,created_at,updated_at FROM newsletter_subscribers WHERE id=? AND email=? LIMIT 1`, [id, email]);
  if (!row) return null;
  const interests = await queryRows<{ interest_key: string }>(`SELECT interest_key FROM newsletter_subscriber_interests WHERE subscriber_id=? ORDER BY interest_key`, [id]);
  return { id: Number(row.id), email: row.email, firstName: row.first_name, status: row.status, source: row.source, lastSource: row.last_source, primaryInterest: row.primary_interest, leadMagnetSlug: row.lead_magnet_slug, createdAt: dateString(row.created_at), updatedAt: dateString(row.updated_at), interests: interests.map((item) => item.interest_key) };
}

export async function updateSubscriberPreferences(id: number, email: string, interestKeys: string[], unsubscribe: boolean) {
  const subscriber = await getSubscriberForPreferences(id, email);
  if (!subscriber) return false;
  if (unsubscribe) {
    await execute(`UPDATE newsletter_subscribers SET status='unsubscribed',unsubscribed_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`, [id]);
    await execute(`UPDATE subscriber_sequence_enrollments SET status='cancelled',updated_at=CURRENT_TIMESTAMP WHERE subscriber_id=? AND status='active'`, [id]);
    return true;
  }
  const active = await getAudienceInterests(true);
  const allowed = new Set(active.map((item) => item.interestKey));
  const selected = [...new Set(interestKeys.filter((key) => allowed.has(key) && key !== "general"))];
  const expanded = new Set<string>(["general"]);
  for (const key of selected) {
    for (const lineageKey of await interestLineage(key)) expanded.add(lineageKey);
  }
  await execute(`DELETE FROM newsletter_subscriber_interests WHERE subscriber_id=?`, [id]);
  for (const key of expanded) {
    await execute(`INSERT INTO newsletter_subscriber_interests (subscriber_id,interest_key,source) VALUES (?,?,'preferences') ON CONFLICT(subscriber_id,interest_key) DO NOTHING`, [id, key]);
  }
  await execute(`UPDATE newsletter_subscribers SET status='subscribed',unsubscribed_at=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=?`, [id]);
  return true;
}

export async function getNewsletterSubscribersDetailed() {
  const rows = await queryRows<{
    id: number | string; email: string; first_name: string; status: string; source: string; last_source: string; primary_interest: string | null; lead_magnet_slug: string | null; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; created_at: string | Date; consent_at: string | Date | null; interests: string | null;
  }>(`SELECT s.id,s.email,s.first_name,s.status,s.source,s.last_source,s.primary_interest,s.lead_magnet_slug,s.utm_source,s.utm_medium,s.utm_campaign,s.created_at,s.consent_at,
      STRING_AGG(si.interest_key, ',' ORDER BY si.interest_key) AS interests
      FROM newsletter_subscribers s LEFT JOIN newsletter_subscriber_interests si ON si.subscriber_id=s.id
      GROUP BY s.id ORDER BY s.created_at DESC`);
  return rows.map((row) => ({ ...row, id: Number(row.id), created_at: dateString(row.created_at), consent_at: dateString(row.consent_at), interests: row.interests || "" }));
}

export async function getAudienceDashboard(): Promise<AudienceDashboard> {
  const [statusRows, interestRows, magnetRows, sequenceRows] = await Promise.all([
    queryRows<{ status: string; count: number | string }>(`SELECT status,COUNT(*) AS count FROM newsletter_subscribers GROUP BY status`),
    queryRows<{ interest_key: string; name: string; subscribers: number | string }>(`SELECT i.interest_key,i.name,COUNT(DISTINCT si.subscriber_id) AS subscribers FROM audience_interests i LEFT JOIN newsletter_subscriber_interests si ON si.interest_key=i.interest_key WHERE i.status='active' GROUP BY i.interest_key,i.name,i.sort_order ORDER BY i.sort_order`),
    queryRows<LeadMagnetRow & { subscribers: number | string }>(`SELECT lm.id,lm.slug,lm.name,lm.eyebrow,lm.description,lm.cta_label,lm.interest_key,lm.asset_url,lm.resource_json,lm.email_subject,lm.email_intro,lm.status,lm.seo_index,COUNT(DISTINCT s.id) AS subscribers FROM lead_magnets lm LEFT JOIN newsletter_subscribers s ON s.lead_magnet_slug=lm.slug GROUP BY lm.id ORDER BY lm.updated_at DESC`),
    queryRows<{ id: number | string; slug: string; name: string; interest_key: string | null; status: EmailSequenceSummary["status"]; steps: number | string; active_enrollments: number | string }>(`SELECT s.id,s.slug,s.name,s.interest_key,s.status,COUNT(DISTINCT st.id) AS steps,COUNT(DISTINCT CASE WHEN e.status='active' THEN e.id END) AS active_enrollments FROM email_sequences s LEFT JOIN email_sequence_steps st ON st.sequence_id=s.id LEFT JOIN subscriber_sequence_enrollments e ON e.sequence_id=s.id GROUP BY s.id ORDER BY s.id`),
  ]);
  const statusMap = Object.fromEntries(statusRows.map((row) => [row.status, Number(row.count)]));
  return {
    subscribers: Number(statusMap.subscribed || 0),
    unsubscribed: Number(statusMap.unsubscribed || 0),
    interests: interestRows.map((row) => ({ interestKey: row.interest_key, name: row.name, subscribers: Number(row.subscribers) })),
    magnets: magnetRows.map((row) => ({ ...rowToLeadMagnet(row), subscribers: Number(row.subscribers) })),
    sequences: sequenceRows.map((row) => ({ id: Number(row.id), slug: row.slug, name: row.name, interestKey: row.interest_key, status: row.status, steps: Number(row.steps), activeEnrollments: Number(row.active_enrollments) })),
  };
}

export async function updateEmailSequenceStatus(id: number, status: EmailSequenceSummary["status"]) {
  return (await execute(`UPDATE email_sequences SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`, [status, id])) > 0;
}

export type DueSequenceEmail = {
  enrollmentId: number;
  subscriberId: number;
  email: string;
  firstName: string;
  sequenceId: number;
  stepId: number;
  stepNumber: number;
  delayHours: number;
  subject: string;
  preheader: string;
  bodyText: string;
  ctaLabel: string;
  ctaUrl: string;
};

type DueSequenceEmailRow = {
  enrollment_id: number | string;
  subscriber_id: number | string;
  email: string;
  first_name: string;
  sequence_id: number | string;
  step_id: number | string;
  step_number: number | string;
  delay_hours: number | string;
  subject: string;
  preheader: string;
  body_text: string;
  cta_label: string;
  cta_url: string;
};

export async function getDueSequenceEmails(limit = 50): Promise<DueSequenceEmail[]> {
  const rows = await queryRows<DueSequenceEmailRow>(`SELECT e.id AS enrollment_id,e.subscriber_id,ns.email,ns.first_name,e.sequence_id,st.id AS step_id,st.step_number,st.delay_hours,st.subject,st.preheader,st.body_text,st.cta_label,st.cta_url
    FROM subscriber_sequence_enrollments e
    JOIN newsletter_subscribers ns ON ns.id=e.subscriber_id AND ns.status='subscribed'
    JOIN email_sequences s ON s.id=e.sequence_id AND s.status='active'
    JOIN email_sequence_steps st ON st.sequence_id=e.sequence_id AND st.step_number=e.current_step+1
    WHERE e.status='active' AND e.next_send_at IS NOT NULL AND e.next_send_at<=CURRENT_TIMESTAMP
    ORDER BY e.next_send_at ASC LIMIT ?`, [Math.max(1, Math.min(limit, 100))]);
  return rows.map((row) => ({ enrollmentId:Number(row.enrollment_id),subscriberId:Number(row.subscriber_id),email:row.email,firstName:row.first_name,sequenceId:Number(row.sequence_id),stepId:Number(row.step_id),stepNumber:Number(row.step_number),delayHours:Number(row.delay_hours),subject:row.subject,preheader:row.preheader,bodyText:row.body_text,ctaLabel:row.cta_label,ctaUrl:row.cta_url }));
}

export async function completeSequenceDelivery(item: DueSequenceEmail, status: "sent" | "failed", providerMessageId = "", errorMessage = "") {
  await execute(`INSERT INTO email_delivery_logs (subscriber_id,sequence_id,step_id,message_type,provider_message_id,status,error_message) VALUES (?,?,?,'sequence',?,?,?)`, [item.subscriberId,item.sequenceId,item.stepId,providerMessageId || null,status,errorMessage.slice(0,500)]);
  if (status === "failed") {
    await execute(`UPDATE subscriber_sequence_enrollments SET failure_count=failure_count+1,status=CASE WHEN failure_count+1>=3 THEN 'cancelled' ELSE status END,next_send_at=CASE WHEN failure_count+1>=3 THEN NULL ELSE CURRENT_TIMESTAMP + INTERVAL '6 hours' END,updated_at=CURRENT_TIMESTAMP WHERE id=?`, [item.enrollmentId]);
    return;
  }
  const next = await queryOne<{ delay_hours: number | string }>(`SELECT delay_hours FROM email_sequence_steps WHERE sequence_id=? AND step_number=? LIMIT 1`, [item.sequenceId,item.stepNumber+1]);
  if (!next) {
    await execute(`UPDATE subscriber_sequence_enrollments SET current_step=?,failure_count=0,next_send_at=NULL,status='completed',completed_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`, [item.stepNumber,item.enrollmentId]);
  } else {
    const nextSendAt = new Date(Date.now() + Number(next.delay_hours) * 60 * 60 * 1000).toISOString();
    await execute(`UPDATE subscriber_sequence_enrollments SET current_step=?,failure_count=0,next_send_at=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`, [item.stepNumber,nextSendAt,item.enrollmentId]);
  }
}

export async function logLeadMagnetDelivery(subscriberId: number, status: "sent" | "skipped" | "failed", providerMessageId = "", errorMessage = "") {
  if (!databaseIsConfigured()) return;
  try {
    await execute(`INSERT INTO email_delivery_logs (subscriber_id,message_type,provider_message_id,status,error_message) VALUES (?,'lead_magnet',?,?,?)`, [subscriberId,providerMessageId || null,status,errorMessage.slice(0,500)]);
  } catch (error) {
    console.warn("Could not log lead magnet delivery", error);
  }
}
