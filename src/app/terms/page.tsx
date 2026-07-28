import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service | Offerly",
  description: "The terms governing access to and use of Offerly.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Using Offerly"
      title="Terms of Service"
      description="These terms describe the rules for using Offerly’s interview-practice, AI-feedback, account, and subscription services."
    >
      <section>
        <h2>1. Acceptance and eligibility</h2>
        <p>
          By creating an account or using Offerly, you agree to these terms and the
          Privacy Policy. You must be at least 18 and legally able to enter this agreement.
        </p>
      </section>
      <section>
        <h2>2. Accounts</h2>
        <p>
          Provide accurate information, protect your credentials, and notify us if you
          believe the account has been compromised. You are responsible for activity
          performed through your account. Do not share or resell account access.
        </p>
      </section>
      <section>
        <h2>3. Interview and AI services</h2>
        <p>
          Offerly is a practice and educational tool. AI questions, transcripts,
          scores, and feedback may be incomplete or inaccurate and are not promises of
          employment, hiring outcomes, legal advice, or professional certification.
          Review feedback using your own judgment.
        </p>
      </section>
      <section>
        <h2>4. Acceptable use</h2>
        <ul>
          <li>Do not attack, probe, overload, bypass limits, scrape, or disrupt the service.</li>
          <li>Do not upload unlawful, harmful, infringing, deceptive, or malicious content.</li>
          <li>Do not submit confidential information you are not authorized to use.</li>
          <li>Do not reverse engineer or misuse the service except where law expressly permits it.</li>
        </ul>
      </section>
      <section>
        <h2>5. Your content</h2>
        <p>
          You retain rights in content you submit. You authorize Offerly and its
          providers to process that content only as needed to operate, secure, support,
          and improve the service. You confirm that you have the necessary rights to
          submit it.
        </p>
      </section>
      <section>
        <h2>6. Plans and payments</h2>
        <p>
          Paid plans renew according to the billing schedule shown at checkout.
          Upgrades may take effect immediately and may create a prorated charge.
          Downgrades are scheduled for cycle end. Cancellation stops future renewal
          according to the billing screen. See the <Link href="/refund-policy">Refund and Cancellation Policy</Link>.
        </p>
      </section>
      <section>
        <h2>7. Availability and termination</h2>
        <p>
          Features may change, be interrupted, or be discontinued. We may restrict or
          terminate access to protect users, comply with law, address non-payment, or
          stop abuse. You may stop using Offerly and delete your account at any time.
        </p>
      </section>
      <section>
        <h2>8. Disclaimers and responsibility</h2>
        <p>
          The service is provided on an “as available” basis to the extent permitted
          by law. Offerly is not responsible for hiring decisions, employer actions,
          internet failures, third-party provider outages, or losses caused by relying
          solely on automated feedback. Nothing in these terms excludes rights or
          liabilities that cannot legally be excluded.
        </p>
      </section>
      <section>
        <h2>9. Contact and changes</h2>
        <p>
          Questions or disputes should first be submitted through <Link href="/support">Support</Link>.
          We may update these terms, with material changes communicated appropriately.
        </p>
      </section>
    </LegalPage>
  );
}
