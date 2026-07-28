import { planCatalog, type PlanTier } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import type { SubscriptionRow } from "@/types/database";

export function resolvePlanTier(
  subscription:
    | Pick<SubscriptionRow, "plan_tier" | "status">
    | null
    | undefined,
): PlanTier {
  return subscription?.status === "active" ? subscription.plan_tier : "basic";
}

export async function getEntitlements(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan_tier, status")
    .eq("user_id", userId)
    .maybeSingle();
  const tier = resolvePlanTier(subscription);
  return { tier, ...planCatalog[tier] };
}

export function currentMonthStart(now = new Date()) {
  const date = new Date(now);
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString();
}
