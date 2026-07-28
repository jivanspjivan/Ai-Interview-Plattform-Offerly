import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  parseJsonBody,
  sameOriginError,
} from "@/lib/api-security";
import { deliverQueuedEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/admin";

const genericResponse = {
  sent: true,
  message: "If an account exists for that email, a password-reset link is on its way.",
};

export async function POST(request: Request) {
  const originError = sameOriginError(request);
  if (originError) return originError;

  const rateLimitError = await enforceRateLimit(request, {
    action: "forgot-password",
    limit: 5,
    windowSeconds: 15 * 60,
  });
  if (rateLimitError) return rateLimitError;

  const parsedBody = await parseJsonBody<{ email?: unknown }>(request, 4 * 1024);
  if ("response" in parsedBody) return parsedBody.response;

  const email = typeof parsedBody.data.email === "string"
    ? parsedBody.data.email.trim().toLowerCase()
    : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin)
      .replace(/\/$/, "");
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=/update-password`,
      },
    });

    if (error || !data.properties?.action_link) {
      // Keep account existence private: callers always receive the same response.
      return NextResponse.json(genericResponse);
    }

    await deliverQueuedEmail({
      recipient: email,
      subject: "Reset your Offerly password",
      template: "password_reset",
      payload: { actionLink: data.properties.action_link },
    });
  } catch (error) {
    logger.error("Password recovery email could not be sent.", {
      source_file: "src/app/api/auth/forgot-password/route.ts",
      source_function: "POST",
      event_key: "auth.password_recovery_failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }

  return NextResponse.json(genericResponse);
}
