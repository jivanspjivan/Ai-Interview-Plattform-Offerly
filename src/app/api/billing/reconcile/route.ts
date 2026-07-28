import { NextResponse } from "next/server";
import { enforceRateLimit, sameOriginError } from "@/lib/api-security";
import { getRazorpaySubscription } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";
import { normalizeSubscriptionStatus } from "@/app/api/webhooks/razorpay/route";

export async function POST(request: Request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const limited = await enforceRateLimit(request, {
    action: "billing-reconcile", limit: 6, windowSeconds: 600, userId: user.id,
  });
  if (limited) return limited;
  const { data: subscription } = await supabase
    .from("subscriptions").select("*").eq("user_id", user.id).maybeSingle();
  if (!subscription?.razorpay_subscription_id) {
    return NextResponse.json({ error: "No paid subscription was found." }, { status: 404 });
  }
  try {
    const remote = await getRazorpaySubscription(subscription.razorpay_subscription_id);
    await supabase.from("subscriptions").update({
      status: normalizeSubscriptionStatus(remote.status as string | undefined),
      current_period_start: typeof remote.current_start === "number"
        ? new Date(remote.current_start * 1000).toISOString() : null,
      current_period_end: typeof remote.current_end === "number"
        ? new Date(remote.current_end * 1000).toISOString() : null,
      cancel_at_period_end: remote.cancel_at_cycle_end === true,
      scheduled_change_at: typeof remote.change_scheduled_at === "number"
        ? new Date(remote.change_scheduled_at * 1000).toISOString() : null,
      ...(remote.has_scheduled_changes === false
        ? { scheduled_plan_tier: null, scheduled_change_at: null } : {}),
      last_event_at: new Date().toISOString(),
    }).eq("user_id", user.id);
    return NextResponse.json({ reconciled: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Billing status could not be refreshed." },
      { status: 502 },
    );
  }
}
