import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Support | Offerly",
  description: "Contact Offerly support and report account, interview, or billing issues.",
};

export default function SupportPage() {
  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@offerly.app";

  return (
    <LegalPage
      eyebrow="Help and contact"
      title="Offerly Support"
      description="Send enough diagnostic context for us to find the failure quickly—without sharing passwords or payment credentials."
    >
      <section>
        <h2>Contact</h2>
        <p>
          Email <a href={`mailto:${supportEmail}`}>{supportEmail}</a>. Include the page,
          approximate time, what you expected, what happened, browser/device, and the
          trace ID returned with the failed request when available.
        </p>
      </section>
      <section>
        <h2>Billing requests</h2>
        <p>
          Include the account email, charge date, amount, plan, and Razorpay payment or
          subscription identifier. Do not send complete card numbers, CVV, PIN, UPI PIN,
          OTP, passwords, cookies, API keys, or authentication tokens.
        </p>
      </section>
      <section>
        <h2>Privacy and account requests</h2>
        <p>
          Name, email, password, session deletion, subscription cancellation, and
          permanent account deletion are available from the authenticated dashboard.
          Contact support if you cannot access the account or need another privacy request.
        </p>
      </section>
      <section>
        <h2>Security reports</h2>
        <p>
          For a suspected vulnerability, use the subject “Security report” and provide
          reproducible steps without accessing another person&apos;s data, disrupting the
          service, or publishing sensitive details before remediation.
        </p>
      </section>
    </LegalPage>
  );
}
