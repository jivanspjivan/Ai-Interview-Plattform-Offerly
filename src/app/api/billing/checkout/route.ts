import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import {
  getRazorpayPlanId,
  isPaidPlan,
  planCatalog,
} from "@/lib/plans";
import { createRazorpaySubscription, getRazorpayConfig } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const user = await requireUser();
  const body = (await request.json()) as { plan?: unknown };
  if (!isPaidPlan(body.plan)) {
    return NextResponse.json({ error: "Choose a valid paid plan." }, { status: 400 });
  }

  const planId = getRazorpayPlanId(body.plan);
  if (!planId) {
    return NextResponse.json({ error: "This Razorpay plan is not configured." }, { status: 503 });
  }

  try {
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("subscriptions")
      .select("status, razorpay_subscription_id, plan_tier")
      .eq("user_id", user.id)
      .maybeSingle();
    if (
      existing?.razorpay_subscription_id &&
      ["created", "authenticated", "active", "pending"].includes(existing.status)
    ) {
      if (
        existing.plan_tier === body.plan &&
        existing.status !== "active"
      ) {
        const { keyId } = getRazorpayConfig();
        return NextResponse.json({
          keyId,
          subscriptionId: existing.razorpay_subscription_id,
          planName: planCatalog[body.plan].name,
          email: user.email,
          name:
            typeof user.user_metadata.full_name === "string"
              ? user.user_metadata.full_name
              : "",
        });
      }
      return NextResponse.json(
        { error: "You already have a current subscription." },
        { status: 409 },
      );
    }

    const subscription = await createRazorpaySubscription({
      planId,
      userId: user.id,
      planTier: body.plan,
    });
    await admin.from("subscriptions").upsert(
      {
        user_id: user.id,
        plan_tier: body.plan,
        status: "created",
        razorpay_subscription_id: subscription.id,
        razorpay_plan_id: planId,
        current_period_start: subscription.current_start
          ? new Date(subscription.current_start * 1000).toISOString()
          : null,
        current_period_end: subscription.current_end
          ? new Date(subscription.current_end * 1000).toISOString()
          : null,
      },
      { onConflict: "user_id" },
    );
    const { keyId } = getRazorpayConfig();
    return NextResponse.json({
      keyId,
      subscriptionId: subscription.id,
      planName: planCatalog[body.plan].name,
      email: user.email,
      name:
        typeof user.user_metadata.full_name === "string"
          ? user.user_metadata.full_name
          : "",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Checkout could not be started.",
      },
      { status: 502 },
    );
  }
}
