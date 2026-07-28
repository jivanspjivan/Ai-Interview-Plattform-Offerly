import { describe, expect, it } from "vitest";
import { currentMonthStart, resolvePlanTier } from "@/lib/entitlements";

describe("subscription entitlements", () => {
  it("grants a paid tier only to active subscriptions", () => {
    expect(resolvePlanTier({ plan_tier: "premium", status: "active" })).toBe(
      "premium",
    );
    expect(
      resolvePlanTier({ plan_tier: "premium_plus", status: "active" }),
    ).toBe("premium_plus");
  });

  it.each(["created", "authenticated", "pending", "halted", "cancelled"] as const)(
    "keeps a %s subscription on Basic",
    (status) => {
      expect(resolvePlanTier({ plan_tier: "premium", status })).toBe("basic");
    },
  );

  it("uses Basic when no subscription exists", () => {
    expect(resolvePlanTier(null)).toBe("basic");
    expect(resolvePlanTier(undefined)).toBe("basic");
  });

  it("calculates the calendar month boundary in UTC", () => {
    expect(currentMonthStart(new Date("2026-07-28T23:45:00+05:30"))).toBe(
      "2026-07-01T00:00:00.000Z",
    );
  });
});
