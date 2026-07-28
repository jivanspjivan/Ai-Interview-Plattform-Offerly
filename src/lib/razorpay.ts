import { createHmac, timingSafeEqual } from "node:crypto";

export function getRazorpayConfig() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay API keys are not configured.");
  }
  return { keyId, keySecret };
}

export function verifySignature(
  value: string,
  signature: string,
  secret: string,
) {
  const expected = createHmac("sha256", secret).update(value).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  return (
    expectedBuffer.length === signatureBuffer.length &&
    timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}

export async function createRazorpaySubscription({
  planId,
  userId,
  planTier,
}: {
  planId: string;
  userId: string;
  planTier: string;
}) {
  const { keyId, keySecret } = getRazorpayConfig();
  const response = await fetch("https://api.razorpay.com/v1/subscriptions", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      plan_id: planId,
      total_count: 120,
      quantity: 1,
      customer_notify: true,
      notes: { offerly_user_id: userId, offerly_plan_tier: planTier },
    }),
    cache: "no-store",
  });
  const data = (await response.json()) as {
    id?: string;
    status?: string;
    current_start?: number | null;
    current_end?: number | null;
    error?: { description?: string };
  };
  if (!response.ok || !data.id) {
    throw new Error(
      data.error?.description ?? "Razorpay could not create the subscription.",
    );
  }
  return data;
}
