import { describe, expect, it } from "vitest";
import {
  exceedsContentLength,
  getClientAddress,
  parseJsonBody,
  rateLimitIdentifier,
  validateSameOrigin,
} from "@/lib/api-security";

describe("API request security", () => {
  it("prefers the platform-provided real client address", () => {
    const request = new Request("https://offerly.test/api/feedback", {
      headers: {
        "x-real-ip": "203.0.113.5",
        "x-forwarded-for": "198.51.100.2, 10.0.0.1",
      },
    });
    expect(getClientAddress(request)).toBe("203.0.113.5");
  });

  it("uses the first forwarded address as a fallback", () => {
    const request = new Request("https://offerly.test/api/feedback", {
      headers: { "x-forwarded-for": "198.51.100.2, 10.0.0.1" },
    });
    expect(getClientAddress(request)).toBe("198.51.100.2");
  });

  it("hashes identifiers and separates user and IP subjects", () => {
    const request = new Request("https://offerly.test/api/feedback", {
      headers: { "x-real-ip": "203.0.113.5" },
    });
    const ipHash = rateLimitIdentifier(request);
    const userHash = rateLimitIdentifier(request, "user-123");
    expect(ipHash).toMatch(/^[a-f0-9]{64}$/);
    expect(userHash).toMatch(/^[a-f0-9]{64}$/);
    expect(userHash).not.toBe(ipHash);
  });

  it("allows same-origin and non-browser requests", () => {
    expect(
      validateSameOrigin(
        new Request("https://offerly.test/api/sessions", {
          headers: { origin: "https://offerly.test" },
        }),
      ),
    ).toBe(true);
    expect(
      validateSameOrigin(new Request("https://offerly.test/api/sessions")),
    ).toBe(true);
  });

  it("uses proxy-forwarded origin details on hosted deployments", () => {
    expect(
      validateSameOrigin(
        new Request("http://internal-service:10000/api/auth/forgot-password", {
          headers: {
            origin: "https://offerly.test",
            host: "internal-service:10000",
            "x-forwarded-host": "offerly.test",
            "x-forwarded-proto": "https",
          },
        }),
      ),
    ).toBe(true);
  });

  it("rejects cross-site and malformed origins", () => {
    expect(
      validateSameOrigin(
        new Request("https://offerly.test/api/sessions", {
          headers: {
            origin: "https://attacker.test",
            "sec-fetch-site": "cross-site",
          },
        }),
      ),
    ).toBe(false);
    expect(
      validateSameOrigin(
        new Request("https://offerly.test/api/sessions", {
          headers: { origin: "not a url" },
        }),
      ),
    ).toBe(false);
  });

  it("rejects invalid and oversized declared bodies", () => {
    expect(
      exceedsContentLength(
        new Request("https://offerly.test/api/feedback", {
          headers: { "content-length": "20000" },
        }),
        16_384,
      ),
    ).toBe(true);
    expect(
      exceedsContentLength(
        new Request("https://offerly.test/api/feedback", {
          headers: { "content-length": "invalid" },
        }),
        16_384,
      ),
    ).toBe(true);
  });

  it("parses bounded JSON and rejects chunked oversized content", async () => {
    const valid = await parseJsonBody<{ answer: string }>(
      new Request("https://offerly.test/api/feedback", {
        method: "POST",
        body: JSON.stringify({ answer: "hello" }),
      }),
      100,
    );
    expect("data" in valid).toBe(true);
    if (valid.data) expect(valid.data.answer).toBe("hello");

    const oversized = await parseJsonBody(
      new Request("https://offerly.test/api/feedback", {
        method: "POST",
        body: JSON.stringify({ answer: "x".repeat(200) }),
      }),
      100,
    );
    expect("response" in oversized).toBe(true);
    if (oversized.response) expect(oversized.response.status).toBe(413);
  });
});
