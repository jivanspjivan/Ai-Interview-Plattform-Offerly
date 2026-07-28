import { describe, expect, it } from "vitest";
import {
  normalizeSubscriptionStatus,
  shouldApplyWebhookEvent,
} from "@/app/api/webhooks/razorpay/route";

describe("Razorpay webhook ordering", () => {
  it("accepts known lifecycle statuses", () => {
    expect(normalizeSubscriptionStatus("active")).toBe("active");
    expect(normalizeSubscriptionStatus("cancelled")).toBe("cancelled");
  });

  it("maps unknown statuses to pending without granting access", () => {
    expect(normalizeSubscriptionStatus("future_status")).toBe("pending");
    expect(normalizeSubscriptionStatus(undefined)).toBe("pending");
  });

  it("rejects older events and accepts equal or newer events", () => {
    const lastEventAt = "2026-07-28T10:00:00.000Z";
    const timestamp = Date.parse(lastEventAt) / 1000;

    expect(shouldApplyWebhookEvent(lastEventAt, timestamp - 1)).toBe(false);
    expect(shouldApplyWebhookEvent(lastEventAt, timestamp)).toBe(true);
    expect(shouldApplyWebhookEvent(lastEventAt, timestamp + 1)).toBe(true);
  });

  it("accepts events when ordering metadata is unavailable", () => {
    expect(shouldApplyWebhookEvent(null, 123)).toBe(true);
    expect(
      shouldApplyWebhookEvent("2026-07-28T10:00:00.000Z", undefined),
    ).toBe(true);
  });
});
