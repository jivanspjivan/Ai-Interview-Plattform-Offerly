import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { getRazorpayConfig, verifySignature } from "@/lib/razorpay";

const originalKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const originalKeySecret = process.env.RAZORPAY_KEY_SECRET;

afterEach(() => {
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = originalKeyId;
  process.env.RAZORPAY_KEY_SECRET = originalKeySecret;
});

describe("Razorpay security helpers", () => {
  it("accepts a valid HMAC signature", () => {
    const payload = "pay_123|sub_456";
    const secret = "test_secret";
    const signature = createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    expect(verifySignature(payload, signature, secret)).toBe(true);
  });

  it("rejects altered and malformed signatures without throwing", () => {
    expect(verifySignature("original", "0".repeat(64), "secret")).toBe(false);
    expect(verifySignature("original", "short", "secret")).toBe(false);
  });

  it("requires both API credentials", () => {
    delete process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
    expect(() => getRazorpayConfig()).toThrow(
      "Razorpay API keys are not configured.",
    );
  });
});
