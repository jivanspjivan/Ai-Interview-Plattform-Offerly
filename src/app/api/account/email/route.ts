import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import {
  enforceRateLimit,
  parseJsonBody,
  sameOriginError,
} from "@/lib/api-security";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const user = await requireUser();
  const rateLimitError = await enforceRateLimit(request, {
    action: "account-email",
    limit: 3,
    windowSeconds: 60 * 60,
    userId: user.id,
  });
  if (rateLimitError) return rateLimitError;

  const parsedBody = await parseJsonBody<{ email?: unknown }>(request, 4 * 1024);
  if ("response" in parsedBody) return parsedBody.response;
  const email =
    typeof parsedBody.data.email === "string"
      ? parsedBody.data.email.trim().toLowerCase()
      : "";
  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (email === user.email?.toLowerCase()) {
    return NextResponse.json(
      { error: "This is already your account email." },
      { status: 409 },
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ email });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({
    updated: true,
    message: "Check your email to confirm the address change.",
  });
}
