import { NextResponse } from "next/server";
import { verifySignature } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json, SubscriptionRow } from "@/types/database";

type RazorpaySubscriptionEntity = {
  id?: string;
  status?: string;
  current_start?: number | null;
  current_end?: number | null;
  ended_at?: number | null;
  notes?: Record<string, string>;
  plan_id?: string;
};

type RazorpayWebhook = {
  event?: string;
  created_at?: number;
  payload?: {
    subscription?: { entity?: RazorpaySubscriptionEntity };
  };
};

const allowedStatuses = new Set<SubscriptionRow["status"]>([
  "created",
  "authenticated",
  "active",
  "pending",
  "halted",
  "cancelled",
  "completed",
  "expired",
]);

export async function POST(request: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const eventId = request.headers.get("x-razorpay-event-id") ?? "";
  const rawBody = await request.text();

  if (
    !webhookSecret ||
    !signature ||
    !eventId ||
    !verifySignature(rawBody, signature, webhookSecret)
  ) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as RazorpayWebhook;
  const admin = createAdminClient();
  const { data: processed } = await admin
    .from("billing_events")
    .select("event_id")
    .eq("event_id", eventId)
    .maybeSingle();
  if (processed) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const entity = event.payload?.subscription?.entity;
  if (entity?.id) {
    const status = allowedStatuses.has(
      entity.status as SubscriptionRow["status"],
    )
      ? (entity.status as SubscriptionRow["status"])
      : "pending";
    const update = {
      status,
      razorpay_plan_id: entity.plan_id ?? null,
      current_period_start: entity.current_start
        ? new Date(entity.current_start * 1000).toISOString()
        : null,
      current_period_end: entity.current_end
        ? new Date(entity.current_end * 1000).toISOString()
        : null,
      last_event_at: event.created_at
        ? new Date(event.created_at * 1000).toISOString()
        : new Date().toISOString(),
      cancel_at_period_end: status === "cancelled",
    };
    const { data: existing } = await admin
      .from("subscriptions")
      .select("id, last_event_at")
      .eq("razorpay_subscription_id", entity.id)
      .maybeSingle();
    if (existing) {
      const isNewer =
        !existing.last_event_at ||
        !event.created_at ||
        event.created_at * 1000 >= new Date(existing.last_event_at).getTime();
      if (isNewer) {
        const { error: updateError } = await admin
          .from("subscriptions")
          .update(update)
          .eq("id", existing.id);
        if (updateError) {
          console.error("Unable to update Razorpay subscription", updateError);
          return NextResponse.json(
            { error: "Unable to process webhook." },
            { status: 500 },
          );
        }
      }
    } else {
      const userId = entity.notes?.offerly_user_id;
      const planTier = entity.notes?.offerly_plan_tier;
      if (
        userId &&
        (planTier === "premium" || planTier === "premium_plus")
      ) {
        const { error: upsertError } = await admin.from("subscriptions").upsert(
          {
            ...update,
            user_id: userId,
            plan_tier: planTier,
            razorpay_subscription_id: entity.id,
          },
          { onConflict: "user_id" },
        );
        if (upsertError) {
          console.error("Unable to create Razorpay subscription", upsertError);
          return NextResponse.json(
            { error: "Unable to process webhook." },
            { status: 500 },
          );
        }
      }
    }
  }

  const { error: eventError } = await admin.from("billing_events").insert({
    event_id: eventId,
    event_type: event.event ?? "unknown",
    payload: JSON.parse(rawBody) as Json,
  });
  if (eventError) {
    if (eventError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("Unable to record Razorpay webhook event", eventError);
    return NextResponse.json(
      { error: "Unable to process webhook." },
      { status: 500 },
    );
  }
  return NextResponse.json({ received: true });
}
