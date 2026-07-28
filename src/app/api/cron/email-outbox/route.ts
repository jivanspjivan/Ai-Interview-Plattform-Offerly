import { NextResponse } from "next/server";
import { deliverQueuedEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const admin = createAdminClient();
  const { data: jobs } = await admin.from("email_outbox").select("*")
    .eq("status", "pending").lt("attempts", 5)
    .order("created_at", { ascending: true }).limit(25);
  let sent = 0;
  let failed = 0;
  for (const job of jobs ?? []) {
    try {
      await deliverQueuedEmail({
        recipient: job.recipient, subject: job.subject,
        template: job.template, payload: job.payload as Record<string, unknown>,
      });
      await admin.from("email_outbox").update({
        status: "sent", sent_at: new Date().toISOString(),
        attempts: job.attempts + 1, last_error: null,
      }).eq("id", job.id);
      sent += 1;
    } catch (error) {
      const attempts = job.attempts + 1;
      const failureMessage = (error instanceof Error ? error.message : "Delivery failed").slice(0, 300);
      await admin.from("email_outbox").update({
        status: attempts >= 5 ? "failed" : "pending",
        attempts,
        last_error: failureMessage,
      }).eq("id", job.id);
      await admin.from("operational_events").insert({
        severity: attempts >= 5 ? "error" : "warn",
        event_key: "email.delivery_failed",
        trace_id: request.headers.get("x-request-id") ?? "email-worker",
        source_file: "src/app/api/cron/email-outbox/route.ts",
        source_function: "POST",
        message: failureMessage,
        metadata: { template: job.template, attempts },
      });
      failed += 1;
    }
  }
  return NextResponse.json({ processed: jobs?.length ?? 0, sent, failed });
}
