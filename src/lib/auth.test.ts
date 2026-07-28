import { afterEach, describe, expect, it } from "vitest";
import { isAdminEmail } from "@/lib/auth";

const originalAdminEmails = process.env.ADMIN_EMAILS;

afterEach(() => {
  process.env.ADMIN_EMAILS = originalAdminEmails;
});

describe("admin authorization", () => {
  it("matches configured emails without case or whitespace sensitivity", () => {
    process.env.ADMIN_EMAILS = " owner@example.com,ADMIN@offerly.test ";
    expect(isAdminEmail("admin@offerly.test")).toBe(true);
    expect(isAdminEmail("OWNER@EXAMPLE.COM")).toBe(true);
  });

  it("rejects unlisted and missing emails", () => {
    process.env.ADMIN_EMAILS = "admin@offerly.test";
    expect(isAdminEmail("user@offerly.test")).toBe(false);
    expect(isAdminEmail(null)).toBe(false);
  });

  it("denies every email when the allowlist is not configured", () => {
    delete process.env.ADMIN_EMAILS;
    expect(isAdminEmail("admin@offerly.test")).toBe(false);
  });
});
