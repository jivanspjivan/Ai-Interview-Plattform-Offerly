import type { Metadata } from "next";
import Link from "next/link";
import { InterviewSetupForm } from "@/components/interview-setup-form";
import styles from "./setup.module.css";

export const metadata: Metadata = {
  title: "Set up your interview | Offerly",
  description:
    "Choose your target role and interview preferences for a focused practice session.",
};

export default function NewInterviewPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Interview setup navigation">
        <Link className={styles.brand} href="/">
          <span aria-hidden="true">✦</span>
          offerly
        </Link>
        <p>Interview setup</p>
        <Link className={styles.backLink} href="/">
          <span aria-hidden="true">←</span>
          <span>Back home</span>
        </Link>
      </nav>

      <div className={styles.layout}>
        <section className={styles.introduction}>
          <p className={styles.eyebrow}>Your practice plan</p>
          <h1>Make this session feel like the real one.</h1>
          <p className={styles.description}>
            Tell us what you are preparing for. Your choices will shape the
            questions, pacing, and feedback in your mock interview.
          </p>

          <ol className={styles.steps} aria-label="Interview setup progress">
            <li className={styles.activeStep}>
              <span>1</span>
              <div>
                <strong>Set your focus</strong>
                <p>Role, level, and interview style</p>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <strong>Practice out loud</strong>
                <p>One realistic question at a time</p>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <strong>Review your feedback</strong>
                <p>Clear strengths and next actions</p>
              </div>
            </li>
          </ol>
        </section>

        <InterviewSetupForm />
      </div>
    </main>
  );
}
