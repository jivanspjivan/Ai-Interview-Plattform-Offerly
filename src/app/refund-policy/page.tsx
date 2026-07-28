import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Refund and Cancellation Policy | Offerly",
  description: "Offerly subscription cancellation, downgrade, and refund rules.",
};

export default function RefundPolicyPage() {
  return (
    <LegalPage
      eyebrow="Subscriptions"
      title="Refund and Cancellation Policy"
      description="This policy explains when subscription changes take effect and how to request help with an incorrect or failed payment."
    >
      <section>
        <h2>1. Free plan</h2>
        <p>
          The Basic plan does not require payment. Its monthly usage limits reset
          according to the calendar-month logic shown in the billing dashboard.
        </p>
      </section>
      <section>
        <h2>2. Recurring subscriptions</h2>
        <p>
          Premium and Premium Plus are recurring plans processed by Razorpay. Prices,
          billing frequency, and the selected plan are shown before authorization.
          Charges continue until cancellation or subscription completion.
        </p>
      </section>
      <section>
        <h2>3. Cancellation</h2>
        <p>
          You can schedule cancellation from the billing dashboard. Access normally
          continues through the paid billing period and no further renewal should be
          collected after cancellation becomes effective. Deleting an account attempts
          to stop live recurring billing immediately before erasing user data.
        </p>
      </section>
      <section>
        <h2>4. Upgrades and downgrades</h2>
        <p>
          Premium-to-Premium Plus upgrades are requested immediately and Razorpay may
          charge a prorated difference. Premium Plus-to-Premium downgrades are scheduled
          for cycle end to avoid unexpected mid-cycle adjustments. The signed provider
          webhook determines the effective plan.
        </p>
      </section>
      <section>
        <h2>5. Refund eligibility</h2>
        <p>
          Routine cancellations and unused time are generally not refunded unless
          required by applicable law. We will review requests involving duplicate
          charges, a successful charge without plan activation, an incorrect plan,
          or a service failure that prevented meaningful use.
        </p>
      </section>
      <section>
        <h2>6. Requesting a review</h2>
        <p>
          Contact <Link href="/support">Support</Link> promptly with the account email,
          payment date, amount, Razorpay payment or subscription identifier, and any
          Offerly trace ID shown with the error. Never send card numbers, CVV, PIN, OTP,
          passwords, or authentication tokens.
        </p>
        <p>
          Approved refunds are returned through the original payment channel. Bank and
          payment-network processing times may apply after the refund is initiated.
        </p>
      </section>
    </LegalPage>
  );
}
