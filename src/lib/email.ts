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
  const messages: Record<string, string> = {
    interview_completed: `Your interview practice report is ready. You can review your answers and feedback in Offerly.`,
    billing_attention: `Your subscription payment needs attention. Open Billing in Offerly to refresh its status or update payment details.`,
    welcome: `Your Offerly account is ready. Start a focused interview practice session whenever you are ready.`,
  };
  return `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#22342a"><h1>Hi ${name},</h1><p>${messages[template] ?? "There is an update to your Offerly account."}</p><p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/dashboard">Open Offerly</a></p></div>`;
}

export async function deliverQueuedEmail(email: {
  recipient: string;
  subject: string;
  template: string;
  payload: Record<string, unknown>;
}) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    throw new Error("Email delivery is not configured.");
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [email.recipient],
      subject: email.subject,
      html: emailHtml(email.template, email.payload),
    }),
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}.`);
}
