import { getRuntimeValue } from "../runtime-env";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] ?? char));
}

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<boolean> {
  const apiKey = getRuntimeValue("RESEND_API_KEY");
  const from = getRuntimeValue("MAIL_FROM");
  const replyTo = getRuntimeValue("MAIL_REPLY_TO");
  if (!apiKey || !from) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json", "user-agent": "the-curated-pin/1.0" },
    body: JSON.stringify({
      from,
      ...(replyTo ? { reply_to: replyTo } : {}),
      to: [email],
      subject: "Reset your The Curated Pin password",
      html: `<p>We received a request to reset your password.</p><p><a href="${escapeHtml(resetUrl)}">Reset your password</a></p><p>This link expires in 30 minutes and can be used once. If you did not request it, you can ignore this email.</p>`,
    }),
  });
  return response.ok;
}

export type AudienceEmailResult = { ok: boolean; id: string; error: string };

async function sendAudienceEmailMessage(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  unsubscribeUrl: string;
  idempotencyKey?: string;
}): Promise<AudienceEmailResult> {
  const apiKey = getRuntimeValue("RESEND_API_KEY");
  const from = getRuntimeValue("MAIL_FROM");
  const replyTo = getRuntimeValue("MAIL_REPLY_TO");
  if (!apiKey || !from) return { ok: false, id: "", error: "email_not_configured" };
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        "user-agent": "the-curated-pin/1.0",
        ...(input.idempotencyKey ? { "Idempotency-Key": input.idempotencyKey.slice(0, 250) } : {}),
      },
      body: JSON.stringify({
        from,
        ...(replyTo ? { reply_to: replyTo } : {}),
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        headers: {
          "List-Unsubscribe": `<${input.unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      }),
    });
    const payload = await response.json().catch(() => ({})) as { id?: string; message?: string };
    return response.ok ? { ok: true, id: payload.id || "", error: "" } : { ok: false, id: "", error: String(payload.message || `resend_${response.status}`).slice(0, 500) };
  } catch (error) {
    return { ok: false, id: "", error: error instanceof Error ? error.message.slice(0, 500) : "email_send_failed" };
  }
}

function audienceEmailShell(content: string, preferencesUrl: string) {
  return `<div style="font-family:Inter,Arial,sans-serif;max-width:620px;margin:auto;color:#1b2621;line-height:1.65"><div style="padding:28px 0;border-bottom:1px solid #e8e3d9"><strong style="font-family:Georgia,serif;font-size:22px">The Curated Pin</strong></div><div style="padding:32px 0">${content}</div><div style="border-top:1px solid #e8e3d9;padding:20px 0;color:#69736e;font-size:12px">You received this because you asked for a Curated Pin resource or joined The Sunday Save. <a href="${escapeHtml(preferencesUrl)}">Manage your email preferences</a>.</div></div>`;
}

export async function sendLeadMagnetEmail(input: {
  email: string;
  firstName: string;
  subject: string;
  intro: string;
  accessUrl: string;
  preferencesUrl: string;
  unsubscribeUrl: string;
  magnetName: string;
  idempotencyKey: string;
}) {
  const greeting = input.firstName ? `<p>Hi ${escapeHtml(input.firstName)},</p>` : "";
  const content = `${greeting}<p>${escapeHtml(input.intro)}</p><p><a style="display:inline-block;background:#183d32;color:#fff;text-decoration:none;padding:13px 18px;border-radius:999px" href="${escapeHtml(input.accessUrl)}">Open ${escapeHtml(input.magnetName)} →</a></p><p style="color:#69736e;font-size:13px">You can print the resource or save it as a PDF from your browser.</p>`;
  const text = `${input.firstName ? `Hi ${input.firstName},\n\n` : ""}${input.intro}\n\nOpen ${input.magnetName}: ${input.accessUrl}\n\nManage email preferences: ${input.preferencesUrl}`;
  return sendAudienceEmailMessage({ to: input.email, subject: input.subject, html: audienceEmailShell(content, input.preferencesUrl), text, unsubscribeUrl: input.unsubscribeUrl, idempotencyKey: input.idempotencyKey });
}

export async function sendSequenceEmail(input: {
  email: string;
  firstName: string;
  subject: string;
  preheader: string;
  bodyText: string;
  ctaLabel: string;
  ctaUrl: string;
  preferencesUrl: string;
  unsubscribeUrl: string;
  idempotencyKey: string;
}) {
  const greeting = input.firstName ? `<p>Hi ${escapeHtml(input.firstName)},</p>` : "";
  const cta = input.ctaLabel && input.ctaUrl ? `<p><a style="display:inline-block;background:#183d32;color:#fff;text-decoration:none;padding:13px 18px;border-radius:999px" href="${escapeHtml(input.ctaUrl)}">${escapeHtml(input.ctaLabel)} →</a></p>` : "";
  const content = `${input.preheader ? `<p style="color:#9a5a4b;font-size:12px;text-transform:uppercase;letter-spacing:.08em">${escapeHtml(input.preheader)}</p>` : ""}${greeting}<p>${escapeHtml(input.bodyText).replaceAll("\n", "<br/>")}</p>${cta}`;
  const text = `${input.firstName ? `Hi ${input.firstName},\n\n` : ""}${input.bodyText}${input.ctaUrl ? `\n\n${input.ctaLabel}: ${input.ctaUrl}` : ""}\n\nManage preferences: ${input.preferencesUrl}`;
  return sendAudienceEmailMessage({ to: input.email, subject: input.subject, html: audienceEmailShell(content, input.preferencesUrl), text, unsubscribeUrl: input.unsubscribeUrl, idempotencyKey: input.idempotencyKey });
}
