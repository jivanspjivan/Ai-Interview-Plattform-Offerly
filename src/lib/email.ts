import { createAdminClient } from "@/lib/supabase/admin";

export async function queueEmail({
  userId, recipient, template, subject, payload = {},
}: {
  userId?: string | null;
  recipient: string;
  template: string;
  subject: string;
  payload?: Record<string, string | number | boolean | null>;
}) {
  const admin = createAdminClient();
  return admin.from("email_outbox").insert({
    user_id: userId ?? null, recipient, template, subject, payload,
  });
}

function emailHtml(template: string, payload: Record<string, unknown>) {
  const name = typeof payload.name === "string" ? payload.name : "there";
  if (template === "password_reset") {
    const actionLink = typeof payload.actionLink === "string"
      ? payload.actionLink
      : "";
    if (!actionLink) throw new Error("Password reset email requires an action link.");
    return `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#22342a"><h1>Reset your Offerly password</h1><p>Use the secure link below to choose a new password.</p><p><a href="${actionLink}">Reset password</a></p><p>If you did not request this, you can safely ignore this email.</p></div>`;
  }
  const messages: Record<string, string> = {
    interview_completed: `Your interview practice report is ready. You can review your answers and feedback in Offerly.`,
    billing_attention: `Your subscription payment needs attention. Open Billing in Offerly to refresh its status or update payment details.`,
    welcome: `Your Offerly account is ready. Start a focused interview practice session whenever you are ready.`,
  };
  return `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#22342a"><h1>Hi ${name},</h1><p>${messages[template] ?? "There is an update to your Offerly account."}</p><p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/dashboard">Open Offerly</a></p></div>`;
}

type EmailProvider = "brevo" | "resend";

function emailProvider(): EmailProvider {
  const provider = (process.env.EMAIL_PROVIDER ?? "resend").toLowerCase();
  if (provider !== "brevo" && provider !== "resend") {
    throw new Error(`Unsupported email provider: ${provider}.`);
  }
  return provider;
}

function parseSender(value: string) {
  const match = value.match(/^\s*(.*?)\s*<([^<>]+)>\s*$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { name: "Offerly", email: value.trim() };
}

export async function deliverQueuedEmail(email: {
  recipient: string;
  subject: string;
  template: string;
  payload: Record<string, unknown>;
}) {
  const provider = emailProvider();
  const from = process.env.EMAIL_FROM;
  const apiKey = provider === "brevo"
    ? process.env.BREVO_API_KEY
    : process.env.RESEND_API_KEY;

  if (!apiKey || !from) {
    throw new Error("Email delivery is not configured.");
  }

  const html = emailHtml(email.template, email.payload);
  const isBrevo = provider === "brevo";
  const response = await fetch(
    isBrevo ? "https://api.brevo.com/v3/smtp/email" : "https://api.resend.com/emails",
    {
    method: "POST",
    headers: isBrevo ? {
      "api-key": apiKey,
      accept: "application/json",
      "Content-Type": "application/json",
    } : {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(isBrevo ? {
      sender: parseSender(from),
      to: [{ email: email.recipient }],
      subject: email.subject,
      htmlContent: html,
    } : {
      from,
      to: [email.recipient],
      subject: email.subject,
      html,
    }),
  });
  if (!response.ok) {
    throw new Error(`${provider} returned ${response.status}.`);
  }
}
