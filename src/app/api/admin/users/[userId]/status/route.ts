import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/auth";
import { enforceRateLimit, parseJsonBody, sameOriginError } from "@/lib/api-security";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const supabase = await createClient();
  const { data: { user: adminUser } } = await supabase.auth.getUser();
  if (!adminUser || !isAdminEmail(adminUser.email)) {
    return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  }
  const limited = await enforceRateLimit(request, {
    action: "admin-user-status", limit: 30, windowSeconds: 600, userId: adminUser.id,
  });
  if (limited) return limited;
  const parsed = await parseJsonBody<{ suspended?: boolean }>(request, 1024);
  if ("response" in parsed) return parsed.response;
  if (typeof parsed.data.suspended !== "boolean") {
    return NextResponse.json({ error: "A suspension state is required." }, { status: 400 });
  }
  const { userId } = await params;
  if (userId === adminUser.id) {
    return NextResponse.json({ error: "You cannot suspend your own account." }, { status: 400 });
  }
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: parsed.data.suspended ? "876000h" : "none",
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await admin.from("profiles").update({ is_suspended: parsed.data.suspended }).eq("id", userId);
  await admin.from("admin_audit_logs").insert({
    admin_user_id: adminUser.id,
    target_user_id: userId,
    action: parsed.data.suspended ? "user.suspended" : "user.restored",
    detail: {},
  });
  return NextResponse.json({ updated: true });
}
