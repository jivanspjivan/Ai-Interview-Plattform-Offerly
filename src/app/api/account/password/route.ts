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
    action: "account-password",
    limit: 5,
    windowSeconds: 30 * 60,
    userId: user.id,
  });
  if (rateLimitError) return rateLimitError;

  const parsedBody = await parseJsonBody<{
    password?: unknown;
    confirmation?: unknown;
  }>(request, 4 * 1024);
  if ("response" in parsedBody) return parsedBody.response;
  const password =
    typeof parsedBody.data.password === "string" ? parsedBody.data.password : "";
  const confirmation =
    typeof parsedBody.data.confirmation === "string"
      ? parsedBody.data.confirmation
      : "";
  if (password.length < 8 || password.length > 128) {
    return NextResponse.json(
      { error: "Use a password between 8 and 128 characters." },
      { status: 400 },
    );
  }
  if (password !== confirmation) {
    return NextResponse.json({ error: "The passwords do not match." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ updated: true });
}
