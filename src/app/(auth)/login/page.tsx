import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import styles from "../auth.module.css";

export const metadata: Metadata = {
  title: "Log in | Offerly",
  description: "Log in to continue your interview practice.",
};

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Account navigation">
        <Link className={styles.brand} href="/">
          <span aria-hidden="true">✦</span>
          offerly
        </Link>
        <Link className={styles.plansLink} href="/plans">
          View plans
        </Link>
      </nav>
      <div className={styles.content}>
        <section className={styles.intro}>
          <p>Your private practice space</p>
          <h2>Pick up where you left off.</h2>
          <span>
            Return to your answers, coaching feedback, and progress whenever
            you are ready to practice again.
          </span>
          <ul className={styles.benefits}>
            <li>Keep interview sessions private</li>
            <li>Review transcripts and feedback</li>
            <li>Track improvement over time</li>
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
        <AuthForm mode="login" />
      </div>
    </main>
  );
}
