import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import styles from "../auth.module.css";

export const metadata: Metadata = {
  title: "Create account | Offerly",
  description: "Create an Offerly account and start practicing.",
};

export default function RegisterPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Account navigation">
        <Link className={styles.brand} href="/">
          <span aria-hidden="true">✦</span>
          offerly
        </Link>
        <Link className={styles.plansLink} href="/plans">
          Compare plans
        </Link>
      </nav>
      <div className={styles.content}>
        <section className={styles.intro}>
          <p>Practice with a plan</p>
          <h2>Build answers that earn offers.</h2>
          <span>
            Create your account to save every practice round and turn feedback
            into a repeatable improvement loop.
          </span>
          <ul className={styles.benefits}>
            <li>Role-specific mock interviews</li>
            <li>Answer recording and transcription</li>
            <li>Actionable AI coaching</li>
          </ul>
          <div
            className={styles.trustLine}
            aria-label="Illustrative Offerly practice metrics"
          >
            <div>
              <strong>5,000+</strong>
              <span>sample practice metric</span>
            </div>
            <div>
              <strong>Student-focused</strong>
              <span>practice experience</span>
            </div>
            <div>
              <strong>34%</strong>
              <span>illustrative score lift</span>
            </div>
          </div>
        </section>
        <AuthForm mode="register" />
      </div>
    </main>
  );
}
