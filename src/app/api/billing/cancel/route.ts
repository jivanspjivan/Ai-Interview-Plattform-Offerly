import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getRazorpayConfig } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import { enforceRateLimit, sameOriginError } from "@/lib/api-security";

export async function POST(request: Request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const user = await requireUser();
  const rateLimitError = await enforceRateLimit(request, {
    action: "billing-cancel",
    limit: 5,
    windowSeconds: 10 * 60,
    userId: user.id,
  });
  if (rateLimitError) return rateLimitError;
  const admin = createAdminClient();
  const { data: subscription } = await admin
    .from("subscriptions")
    .select("id, razorpay_subscription_id, status")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!subscription?.razorpay_subscription_id) {
    return NextResponse.json({ error: "No paid subscription found." }, { status: 404 });
  }

  const { keyId, keySecret } = getRazorpayConfig();
  const response = await fetch(
    `https://api.razorpay.com/v1/subscriptions/${subscription.razorpay_subscription_id}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cancel_at_cycle_end: 1 }),
      cache: "no-store",
    },
  );
  if (!response.ok) {
    return NextResponse.json({ error: "Cancellation could not be scheduled." }, { status: 502 });
  }

  await admin
    .from("subscriptions")
    .update({ cancel_at_period_end: true })
    .eq("id", subscription.id);
  return NextResponse.json({ cancelled: true });
}
