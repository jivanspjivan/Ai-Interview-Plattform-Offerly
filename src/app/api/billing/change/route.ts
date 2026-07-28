import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import {
  getPlanChangeTiming,
  getRazorpayPlanId,
  isPaidPlan,
  planCatalog,
} from "@/lib/plans";
import { getRazorpayConfig } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  enforceRateLimit,
  parseJsonBody,
  sameOriginError,
} from "@/lib/api-security";
import { getTraceId, logContext, logger } from "@/lib/logger";

export async function POST(request: Request) {
  const traceId = getTraceId(request);
  const originError = sameOriginError(request);
  if (originError) return originError;
  const user = await requireUser();
  const rateLimitError = await enforceRateLimit(request, {
    action: "billing-change",
    limit: 5,
    windowSeconds: 10 * 60,
    userId: user.id,
  });
  if (rateLimitError) return rateLimitError;

  const parsedBody = await parseJsonBody<{ plan?: unknown }>(request, 4 * 1024);
  if ("response" in parsedBody) return parsedBody.response;
  if (!isPaidPlan(parsedBody.data.plan)) {
    return NextResponse.json({ error: "Choose a valid paid plan." }, { status: 400 });
  }
  const nextPlan = parsedBody.data.plan;
  const nextPlanId = getRazorpayPlanId(nextPlan);
  if (!nextPlanId) {
    return NextResponse.json({ error: "This Razorpay plan is not configured." }, { status: 503 });
  }

  const admin = createAdminClient();
  const { data: subscription } = await admin
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (
    !subscription?.razorpay_subscription_id ||
    (subscription.status !== "active" &&
      subscription.status !== "authenticated")
  ) {
    return NextResponse.json(
      { error: "Only an active subscription can change plans." },
      { status: 409 },
    );
  }
  if (subscription.cancel_at_period_end) {
    return NextResponse.json(
      { error: "A cancellation is already scheduled for this subscription." },
      { status: 409 },
    );
  }
  if (subscription.plan_tier === nextPlan) {
    return NextResponse.json({ error: "This is already your current plan." }, { status: 409 });
  }
  if (subscription.scheduled_plan_tier) {
    return NextResponse.json(
      { error: "A plan change is already scheduled." },
      { status: 409 },
    );
  }
  if (!isPaidPlan(subscription.plan_tier)) {
    return NextResponse.json(
      { error: "The current paid plan could not be identified." },
      { status: 409 },
    );
  }

  const timing = getPlanChangeTiming(subscription.plan_tier, nextPlan);
  const { keyId, keySecret } = getRazorpayConfig();
  const response = await fetch(
    `https://api.razorpay.com/v1/subscriptions/${subscription.razorpay_subscription_id}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: nextPlanId,
        quantity: 1,
        schedule_change_at: timing,
        customer_notify: true,
      }),
      cache: "no-store",
    },
  );
  const result = (await response.json()) as {
    change_scheduled_at?: number | null;
    error?: { description?: string };
  };
  if (!response.ok) {
    logger.error(
      "Razorpay rejected a subscription plan change.",
      logContext({
        file: "src/app/api/billing/change/route.ts",
        function: "POST",
        traceId,
        key: "billing.plan_change_provider_failed",
        providerStatus: response.status,
        nextPlan,
        timing,
      }),
    );
    return NextResponse.json(
      {
        error:
          result.error?.description ??
          "Razorpay could not update this subscription.",
      },
      { status: 502 },
    );
  }

  const scheduledChangeAt =
    timing === "cycle_end"
      ? result.change_scheduled_at
        ? new Date(result.change_scheduled_at * 1000).toISOString()
        : subscription.current_period_end
      : new Date().toISOString();
  const { error: updateError } = await admin
    .from("subscriptions")
    .update({
      scheduled_plan_tier: nextPlan,
      scheduled_change_at: scheduledChangeAt,
    })
    .eq("id", subscription.id);
  if (updateError) {
    logger.error(
      "Razorpay accepted a plan change but local persistence failed.",
      logContext({
        file: "src/app/api/billing/change/route.ts",
        function: "POST",
        traceId,
        key: "billing.plan_change_persistence_failed",
        nextPlan,
        timing,
        error: updateError,
      }),
    );
    return NextResponse.json(
      {
        error:
          "Razorpay accepted the change, but local status is awaiting synchronization.",
      },
      { status: 502 },
    );
  }

  logger.info(
    "Subscription plan change accepted.",
    logContext({
      file: "src/app/api/billing/change/route.ts",
      function: "POST",
      traceId,
      key: "billing.plan_change_accepted",
      nextPlan,
      timing,
    }),
  );
  return NextResponse.json({
    changed: true,
    timing,
    planName: planCatalog[nextPlan].name,
  });
}
