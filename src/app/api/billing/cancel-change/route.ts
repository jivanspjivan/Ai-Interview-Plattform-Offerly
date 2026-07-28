import { NextResponse } from "next/server";
import { enforceRateLimit, sameOriginError } from "@/lib/api-security";
import { cancelRazorpayScheduledChange } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const limited = await enforceRateLimit(request, {
    action: "billing-cancel-change", limit: 5, windowSeconds: 600, userId: user.id,
  });
  if (limited) return limited;
  const { data: subscription } = await supabase
    .from("subscriptions").select("*").eq("user_id", user.id).maybeSingle();
  if (!subscription?.razorpay_subscription_id || !subscription.scheduled_plan_tier) {
    return NextResponse.json({ error: "No scheduled plan change was found." }, { status: 404 });
  }
  try {
    await cancelRazorpayScheduledChange(subscription.razorpay_subscription_id);
    await supabase.from("subscriptions").update({
      scheduled_plan_tier: null, scheduled_change_at: null,
    }).eq("user_id", user.id);
    return NextResponse.json({ cancelled: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "The scheduled change could not be cancelled." },
      { status: 502 },
    );
  }
}
