import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import {
  enforceRateLimit,
  parseJsonBody,
  sameOriginError,
} from "@/lib/api-security";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRazorpayConfig } from "@/lib/razorpay";
import { getTraceId, logContext, logger } from "@/lib/logger";

const terminalStatuses = new Set(["inactive", "cancelled", "completed", "expired"]);

export async function DELETE(request: Request) {
  const traceId = getTraceId(request);
  const originError = sameOriginError(request);
  if (originError) return originError;
  const user = await requireUser();
  const rateLimitError = await enforceRateLimit(request, {
    action: "account-delete",
    limit: 3,
    windowSeconds: 60 * 60,
    userId: user.id,
  });
  if (rateLimitError) return rateLimitError;

  const parsedBody = await parseJsonBody<{ confirmation?: unknown }>(
    request,
    4 * 1024,
  );
  if ("response" in parsedBody) return parsedBody.response;
  const confirmation =
    typeof parsedBody.data.confirmation === "string"
      ? parsedBody.data.confirmation.trim().toLowerCase()
      : "";
  if (!user.email || confirmation !== user.email.toLowerCase()) {
    return NextResponse.json(
      { error: "Enter your account email exactly to confirm deletion." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: subscription, error: subscriptionError } = await admin
    .from("subscriptions")
    .select("razorpay_subscription_id, status")
    .eq("user_id", user.id)
    .maybeSingle();
  if (subscriptionError) {
    return NextResponse.json(
      { error: "Your billing status could not be verified." },
      { status: 503 },
    );
  }

  if (
    subscription?.razorpay_subscription_id &&
    !terminalStatuses.has(subscription.status)
  ) {
    try {
      const { keyId, keySecret } = getRazorpayConfig();
      const cancellation = await fetch(
        `https://api.razorpay.com/v1/subscriptions/${subscription.razorpay_subscription_id}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cancel_at_cycle_end: false }),
          cache: "no-store",
        },
      );
      if (!cancellation.ok) {
        logger.error(
          "Account deletion stopped because subscription cancellation failed.",
          logContext({
            file: "src/app/api/account/route.ts",
            function: "DELETE",
            traceId,
            key: "account.delete_billing_failed",
            providerStatus: cancellation.status,
            subscriptionStatus: subscription.status,
          }),
        );
        return NextResponse.json(
          {
            error:
              "Your subscription could not be stopped, so the account was not deleted.",
          },
          { status: 502 },
        );
      }
    } catch (error) {
      logger.error(
        "Account deletion could not verify or stop recurring billing.",
        logContext({
          file: "src/app/api/account/route.ts",
          function: "DELETE",
          traceId,
          key: "account.delete_billing_exception",
          error,
        }),
      );
      return NextResponse.json(
        {
          error:
            "Billing is unavailable, so the account was not deleted. Please try again.",
        },
        { status: 503 },
      );
    }
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    logger.error(
      "Supabase failed to delete the authenticated account.",
      logContext({
        file: "src/app/api/account/route.ts",
        function: "DELETE",
        traceId,
        key: "account.delete_failed",
        error: deleteError,
      }),
    );
    return NextResponse.json(
      { error: "Your account could not be deleted." },
      { status: 500 },
    );
  }
  logger.info(
    "User account and cascading records were deleted.",
    logContext({
      file: "src/app/api/account/route.ts",
      function: "DELETE",
      traceId,
      key: "account.deleted",
    }),
  );
  return NextResponse.json({ deleted: true });
}
