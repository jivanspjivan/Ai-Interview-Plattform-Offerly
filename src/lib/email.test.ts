import { afterEach, describe, expect, it, vi } from "vitest";
import { deliverQueuedEmail } from "./email";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

const message = {
  recipient: "candidate@example.com",
  subject: "Your report is ready",
  template: "interview_completed",
  payload: { name: "Candidate" },
};

describe("deliverQueuedEmail", () => {
  it("sends through Brevo when selected", async () => {
    process.env.EMAIL_PROVIDER = "brevo";
    process.env.BREVO_API_KEY = "brevo-key";
    process.env.EMAIL_FROM = "Offerly <owner@gmail.com>";
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 201 }));

    await deliverQueuedEmail(message);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.brevo.com/v3/smtp/email",
      expect.objectContaining({
        headers: expect.objectContaining({ "api-key": "brevo-key" }),
        body: expect.stringContaining('"sender":{"name":"Offerly","email":"owner@gmail.com"}'),
      }),
    );
  });

  it("keeps Resend available behind the provider flag", async () => {
    process.env.EMAIL_PROVIDER = "resend";
    process.env.RESEND_API_KEY = "resend-key";
    process.env.EMAIL_FROM = "Offerly <notifications@example.com>";
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    await deliverQueuedEmail(message);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer resend-key" }),
        body: expect.stringContaining('"from":"Offerly <notifications@example.com>"'),
      }),
    );
  });

  it("rejects unsupported providers", async () => {
    process.env.EMAIL_PROVIDER = "unknown";

    await expect(deliverQueuedEmail(message))
      .rejects.toThrow("Unsupported email provider");
  });
});
