export const planCatalog = {
  basic: {
    id: "basic",
    name: "Basic",
    price: 0,
    monthlySessionLimit: 3,
    monthlyFeedbackLimit: 3,
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 199,
    monthlySessionLimit: null,
    monthlyFeedbackLimit: null,
  },
  premium_plus: {
    id: "premium_plus",
    name: "Premium Plus",
    price: 399,
    monthlySessionLimit: null,
    monthlyFeedbackLimit: null,
  },
} as const;

export type PlanTier = keyof typeof planCatalog;

export function isPaidPlan(value: unknown): value is Exclude<PlanTier, "basic"> {
  return value === "premium" || value === "premium_plus";
}

export function getRazorpayPlanId(plan: Exclude<PlanTier, "basic">) {
  return plan === "premium"
    ? process.env.RAZORPAY_PREMIUM_PLAN_ID
    : process.env.RAZORPAY_PREMIUM_PLUS_PLAN_ID;
}

export function getPlanTierByRazorpayPlanId(planId: string | null | undefined) {
  if (!planId) return null;
  if (planId === process.env.RAZORPAY_PREMIUM_PLAN_ID) return "premium" as const;
  if (planId === process.env.RAZORPAY_PREMIUM_PLUS_PLAN_ID) {
    return "premium_plus" as const;
  }
  return null;
}

export function getPlanChangeTiming(
  currentPlan: Exclude<PlanTier, "basic">,
  nextPlan: Exclude<PlanTier, "basic">,
) {
  return planCatalog[nextPlan].price > planCatalog[currentPlan].price
    ? ("now" as const)
    : ("cycle_end" as const);
}
