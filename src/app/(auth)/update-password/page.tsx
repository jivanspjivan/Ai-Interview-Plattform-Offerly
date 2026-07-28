import type { Metadata } from "next";
import Link from "next/link";
import { PasswordForm } from "@/components/password-form";
import styles from "../auth.module.css";

export const metadata: Metadata = {
  title: "Choose new password | Offerly",
  description: "Set a new password for your Offerly account.",
};

export default function UpdatePasswordPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Account navigation">
        <Link className={styles.brand} href="/">
          <span aria-hidden="true">✦</span>
          offerly
        </Link>
        <Link className={styles.plansLink} href="/">
          Home
        </Link>
      </nav>
      <PasswordForm mode="update" />
    </main>
  );
}
