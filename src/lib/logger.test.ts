import { describe, expect, it } from "vitest";

import { getTraceId, logContext, sanitizeLogValue } from "@/lib/logger";

describe("structured logger helpers", () => {
  it("preserves a safe incoming trace ID", () => {
    const request = new Request("https://offerly.test/api/feedback", {
      headers: { "x-trace-id": "trace_12345678" },
    });
    expect(getTraceId(request)).toBe("trace_12345678");
  });

  it("replaces malformed trace IDs", () => {
    const request = new Request("https://offerly.test/api/feedback", {
      headers: { "x-trace-id": "bad trace id" },
    });
    expect(getTraceId(request)).toMatch(/^[a-f0-9-]{36}$/);
  });

  it("keeps required diagnostic context", () => {
    expect(
      logContext({
        file: "route.ts",
        function: "POST",
        traceId: "trace_12345678",
        key: "feedback.failed",
      }),
    ).toMatchObject({
      file: "route.ts",
      function: "POST",
      traceId: "trace_12345678",
      key: "feedback.failed",
    });
  });

  it("redacts sensitive fields and limits long metadata", () => {
    expect(
      sanitizeLogValue({
        password: "never-log-this",
        authorization: "Bearer private",
        transcript: "private interview answer",
        detail: "x".repeat(500),
      }),
    ).toEqual({
      password: "[redacted]",
      authorization: "[redacted]",
      transcript: "[redacted]",
      detail: `${"x".repeat(249)}…`,
    });
  });
});
