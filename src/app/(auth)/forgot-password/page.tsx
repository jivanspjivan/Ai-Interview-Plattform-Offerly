import type { Metadata } from "next";
import Link from "next/link";
import { PasswordForm } from "@/components/password-form";
import styles from "../auth.module.css";

export const metadata: Metadata = {
  title: "Reset password | Offerly",
  description: "Request a secure password reset for your Offerly account.",
};

export default function ForgotPasswordPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Account navigation">
        <Link className={styles.brand} href="/">
          <span aria-hidden="true">✦</span>
          offerly
        </Link>
        <Link className={styles.plansLink} href="/login">
          Back to login
        </Link>
      </nav>
      <PasswordForm mode="request" />
    </main>
  );
}
