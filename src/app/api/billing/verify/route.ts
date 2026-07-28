import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getRazorpayConfig, verifySignature } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  enforceRateLimit,
  parseJsonBody,
  sameOriginError,
} from "@/lib/api-security";

export async function POST(request: Request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const user = await requireUser();
  const rateLimitError = await enforceRateLimit(request, {
    action: "billing-verify",
    limit: 15,
    windowSeconds: 10 * 60,
    userId: user.id,
  });
  if (rateLimitError) return rateLimitError;
  const parsedBody = await parseJsonBody<Record<string, unknown>>(request, 8 * 1024);
  if ("response" in parsedBody) return parsedBody.response;
  const body = parsedBody.data;
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
