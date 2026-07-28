import { NextResponse } from "next/server";
import { verifySignature } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json, SubscriptionRow } from "@/types/database";
import { exceedsContentLength } from "@/lib/api-security";
import { getPlanTierByRazorpayPlanId } from "@/lib/plans";

type RazorpaySubscriptionEntity = {
  id?: string;
  status?: string;
  current_start?: number | null;
  current_end?: number | null;
  ended_at?: number | null;
  notes?: Record<string, string>;
  plan_id?: string;
  has_scheduled_changes?: boolean;
  change_scheduled_at?: number | null;
  cancel_at_cycle_end?: boolean;
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

export function normalizeSubscriptionStatus(
  status: string | undefined,
): SubscriptionRow["status"] {
  return allowedStatuses.has(status as SubscriptionRow["status"])
    ? (status as SubscriptionRow["status"])
    : "pending";
}

export function shouldApplyWebhookEvent(
  lastEventAt: string | null,
  eventCreatedAt: number | undefined,
) {
  return (
    !lastEventAt ||
    !eventCreatedAt ||
    eventCreatedAt * 1000 >= new Date(lastEventAt).getTime()
  );
}

export async function POST(request: Request) {
  if (exceedsContentLength(request, 256 * 1024)) {
    return NextResponse.json({ error: "Webhook body is too large." }, { status: 413 });
  }
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const eventId = request.headers.get("x-razorpay-event-id") ?? "";
  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > 256 * 1024) {
    return NextResponse.json({ error: "Webhook body is too large." }, { status: 413 });
  }

  if (
    !webhookSecret ||
    !signature ||
    !eventId ||
    !verifySignature(rawBody, signature, webhookSecret)
  ) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let event: RazorpayWebhook;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhook;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }
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
    const status = normalizeSubscriptionStatus(entity.status);
    const effectivePlanTier = getPlanTierByRazorpayPlanId(entity.plan_id);
    const update = {
      status,
      ...(effectivePlanTier ? { plan_tier: effectivePlanTier } : {}),
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
      ...(typeof entity.cancel_at_cycle_end === "boolean"
        ? { cancel_at_period_end: entity.cancel_at_cycle_end }
        : status === "cancelled"
          ? { cancel_at_period_end: false }
          : {}),
      ...(entity.has_scheduled_changes === false
        ? { scheduled_plan_tier: null, scheduled_change_at: null }
        : entity.has_scheduled_changes === true
          ? {
            scheduled_change_at: entity.change_scheduled_at
              ? new Date(entity.change_scheduled_at * 1000).toISOString()
              : null,
            }
          : {}),
    };
    const { data: existing } = await admin
      .from("subscriptions")
      .select("id, last_event_at")
      .eq("razorpay_subscription_id", entity.id)
      .maybeSingle();
    if (existing) {
      const isNewer = shouldApplyWebhookEvent(
        existing.last_event_at,
        event.created_at,
      );
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
        const { data: profile } = await admin
          .from("profiles")
          .select("id")
          .eq("id", userId)
          .maybeSingle();
        if (!profile) {
          const { error: deletedUserEventError } = await admin
            .from("billing_events")
            .insert({
              event_id: eventId,
              event_type: event.event ?? "unknown",
              payload: JSON.parse(rawBody) as Json,
            });
          if (
            deletedUserEventError &&
            deletedUserEventError.code !== "23505"
          ) {
            return NextResponse.json(
              { error: "Unable to process webhook." },
              { status: 500 },
            );
          }
          return NextResponse.json({ received: true, userDeleted: true });
        }
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
