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
    action: "account-profile",
    limit: 10,
    windowSeconds: 10 * 60,
    userId: user.id,
  });
  if (rateLimitError) return rateLimitError;

  const parsedBody = await parseJsonBody<{ fullName?: unknown }>(request, 4 * 1024);
  if ("response" in parsedBody) return parsedBody.response;
  const fullName =
    typeof parsedBody.data.fullName === "string"
      ? parsedBody.data.fullName.trim()
      : "";
  if (fullName.length < 2 || fullName.length > 80) {
    return NextResponse.json(
      { error: "Your full name must contain between 2 and 80 characters." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id);
  if (profileError) {
    return NextResponse.json({ error: "Your profile could not be updated." }, { status: 500 });
  }
  const { error: authError } = await supabase.auth.updateUser({
    data: { ...user.user_metadata, full_name: fullName },
  });
  if (authError) {
    return NextResponse.json(
      { error: "Your profile was saved, but account metadata is still synchronizing." },
      { status: 502 },
    );
  }
  return NextResponse.json({ updated: true, fullName });
}
