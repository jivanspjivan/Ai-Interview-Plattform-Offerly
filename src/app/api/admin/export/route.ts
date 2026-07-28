import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function csv(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  }
  const admin = createAdminClient();
  const [{ data: profiles }, { data: subscriptions }] = await Promise.all([
    admin.from("profiles").select("*").order("created_at", { ascending: false }),
    admin.from("subscriptions").select("*"),
  ]);
  const byUser = new Map((subscriptions ?? []).map((item) => [item.user_id, item]));
  const rows = [
    ["Name", "Email", "Joined", "Suspended", "Plan", "Subscription status"],
    ...(profiles ?? []).map((profile) => {
      const subscription = byUser.get(profile.id);
      return [profile.full_name, profile.email, profile.created_at,
        profile.is_suspended, subscription?.plan_tier ?? "basic",
        subscription?.status ?? "not_subscribed"];
    }),
  ].map((row) => row.map(csv).join(",")).join("\n");
  return new NextResponse(rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="offerly-users-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
