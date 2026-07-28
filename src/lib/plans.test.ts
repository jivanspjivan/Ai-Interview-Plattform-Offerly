import { afterEach, describe, expect, it } from "vitest";
import {
  getRazorpayPlanId,
  getPlanChangeTiming,
  getPlanTierByRazorpayPlanId,
  isPaidPlan,
  planCatalog,
} from "@/lib/plans";

const originalPremiumId = process.env.RAZORPAY_PREMIUM_PLAN_ID;
const originalPremiumPlusId = process.env.RAZORPAY_PREMIUM_PLUS_PLAN_ID;

afterEach(() => {
  process.env.RAZORPAY_PREMIUM_PLAN_ID = originalPremiumId;
  process.env.RAZORPAY_PREMIUM_PLUS_PLAN_ID = originalPremiumPlusId;
});

describe("plan catalog", () => {
  it("limits Basic accounts and leaves paid plans unlimited", () => {
    expect(planCatalog.basic.monthlySessionLimit).toBe(3);
    expect(planCatalog.basic.monthlyFeedbackLimit).toBe(3);
    expect(planCatalog.premium.monthlySessionLimit).toBeNull();
    expect(planCatalog.premium_plus.monthlyFeedbackLimit).toBeNull();
  });

  it.each(["premium", "premium_plus"] as const)(
    "recognizes %s as a paid plan",
    (plan) => {
      expect(isPaidPlan(plan)).toBe(true);
    },
  );

  it.each(["basic", "premium-plus", "", null, undefined])(
    "rejects invalid paid-plan value %s",
    (plan) => {
      expect(isPaidPlan(plan)).toBe(false);
    },
  );

  it("maps paid tiers to their configured Razorpay plan IDs", () => {
    process.env.RAZORPAY_PREMIUM_PLAN_ID = "plan_premium";
    process.env.RAZORPAY_PREMIUM_PLUS_PLAN_ID = "plan_plus";

    expect(getRazorpayPlanId("premium")).toBe("plan_premium");
    expect(getRazorpayPlanId("premium_plus")).toBe("plan_plus");
    expect(getPlanTierByRazorpayPlanId("plan_premium")).toBe("premium");
    expect(getPlanTierByRazorpayPlanId("plan_plus")).toBe("premium_plus");
    expect(getPlanTierByRazorpayPlanId("unknown")).toBeNull();
  });

  it("applies upgrades now and schedules downgrades for cycle end", () => {
    expect(getPlanChangeTiming("premium", "premium_plus")).toBe("now");
    expect(getPlanChangeTiming("premium_plus", "premium")).toBe("cycle_end");
  });
});
