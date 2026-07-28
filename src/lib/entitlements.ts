import { planCatalog, type PlanTier } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

export async function getEntitlements(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan_tier, status")
    .eq("user_id", userId)
    .maybeSingle();
  const active = subscription?.status === "active";
  const tier: PlanTier = active ? subscription.plan_tier : "basic";
  return { tier, ...planCatalog[tier] };
}

export function currentMonthStart() {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString();
}
