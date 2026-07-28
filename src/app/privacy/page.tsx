import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | Offerly",
  description: "How Offerly collects, uses, protects, and deletes personal data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy and data"
      title="Privacy Policy"
      description="This policy explains what Offerly processes when you create an account, practice interviews, request AI feedback, or manage a subscription."
    >
      <section>
        <h2>1. Information we collect</h2>
        <ul>
          <li>Account information such as name, email, authentication provider, and account dates.</li>
          <li>Interview configuration, recordings submitted for transcription, transcripts, answers, scores, and coaching feedback.</li>
          <li>Subscription identifiers, plan, status, and billing-cycle dates. Offerly does not receive complete card, PIN, CVV, or UPI credentials.</li>
          <li>Technical diagnostics such as trace IDs, event keys, response status, source function, limited error details, and rate-limit counters.</li>
        </ul>
      </section>
      <section>
        <h2>2. How we use information</h2>
        <p>
          We process information to authenticate users, provide interview practice,
          generate feedback, save progress, enforce plan limits, process billing,
          prevent abuse, troubleshoot failures, and maintain service security.
        </p>
        <p>We do not sell personal information or use interview answers for advertising.</p>
      </section>
      <section>
        <h2>3. Service providers</h2>
        <p>
          Offerly uses Supabase for authentication and application data, OpenAI for
          transcription and feedback, Razorpay for subscription payments, and the
          selected hosting provider for application delivery and operational logs.
          Each provider processes information under its own terms and privacy commitments.
        </p>
      </section>
      <section>
        <h2>4. AI and interview content</h2>
        <p>
          Audio selected for transcription and answer text selected for feedback are
          sent to the configured AI provider. Avoid including confidential employer
          information, government identifiers, financial credentials, health data, or
          another person&apos;s private information in an answer.
        </p>
      </section>
      <section>
        <h2>5. Retention and deletion</h2>
        <p>
          Saved interview data remains available while the account exists. You can
          delete individual sessions or permanently delete the account from Account
          settings. Account deletion removes associated profile, interview, feedback,
          and local billing records after recurring billing is stopped.
        </p>
        <p>
          Limited security, transaction, backup, or legal records may remain for the
          period required to prevent fraud, resolve disputes, comply with law, or
          complete provider reconciliation.
        </p>
      </section>
      <section>
        <h2>6. Security and logs</h2>
        <p>
          Offerly uses access controls, row-level database security, request limits,
          signed payment webhooks, transport security, and structured diagnostic logs.
          Logs have strict length limits and redact fields associated with passwords,
          tokens, cookies, signatures, email addresses, audio, and transcripts.
        </p>
      </section>
      <section>
        <h2>7. Your choices and rights</h2>
        <p>
          You may access your dashboard, correct your name or email, change your
          password, delete sessions, cancel billing, and delete your account. For
          another privacy request, contact us through the <Link href="/support">support page</Link>.
        </p>
      </section>
      <section>
        <h2>8. Children and policy changes</h2>
        <p>
          Offerly is intended for people aged 18 or older. We may revise this policy
          when the product, providers, or legal requirements change. Material changes
          will be presented through the service or an appropriate account notice.
        </p>
      </section>
    </LegalPage>
  );
}
