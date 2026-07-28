import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getRazorpayConfig, verifySignature } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const user = await requireUser();
  const body = (await request.json()) as Record<string, unknown>;
  const paymentId =
    typeof body.razorpay_payment_id === "string"
      ? body.razorpay_payment_id
      : "";
  const subscriptionId =
    typeof body.razorpay_subscription_id === "string"
      ? body.razorpay_subscription_id
      : "";
  const signature =
    typeof body.razorpay_signature === "string"
      ? body.razorpay_signature
      : "";
  if (!paymentId || !subscriptionId || !signature) {
    return NextResponse.json({ error: "Incomplete payment response." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: subscription } = await admin
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("razorpay_subscription_id", subscriptionId)
    .maybeSingle();
  if (!subscription) {
    return NextResponse.json({ error: "Subscription not found." }, { status: 404 });
  }

  const { keySecret } = getRazorpayConfig();
  if (!verifySignature(`${paymentId}|${subscriptionId}`, signature, keySecret)) {
    return NextResponse.json({ error: "Payment signature is invalid." }, { status: 400 });
  }

  await admin
    .from("subscriptions")
    .update({ status: "authenticated" })
    .eq("id", subscription.id);
  return NextResponse.json({ verified: true });
}
