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
    <main className={`${styles.page} ${styles.registerPage}`}>
      <nav className={styles.nav} aria-label="Account navigation">
        <Link className={styles.brand} href="/">
          <span aria-hidden="true">✦</span>
          offerly
        </Link>
        <Link className={styles.plansLink} href="/plans">
          Compare plans
        </Link>
      </nav>
      <div className={`${styles.content} ${styles.registerContent}`}>
        <section className={`${styles.intro} ${styles.registerIntro}`}>
          <p>Practice with a plan</p>
          <h2>Build answers that earn offers.</h2>
          <span>
            Create your account to save every practice round and turn feedback
            into a repeatable improvement loop.
          </span>
          <div className={styles.interviewVisual} aria-hidden="true">
            <div className={styles.mockBrowser}>
              <div className={styles.mockBrowserBar}>
                <span />
                <span />
                <span />
                <small>Live interview</small>
                <time>08:42</time>
              </div>
              <div className={styles.mockQuestion}>
                <div className={styles.mockParticipants}>
                  <div>
                    <span>AI</span>
                    <small>Offerly coach</small>
                  </div>
                  <div>
                    <small>You</small>
                    <span>AM</span>
                  </div>
                </div>
                <div className={styles.mockProgress}>
                  <span />
                </div>
                <small>Question 04 of 08</small>
                <strong>Tell me about a difficult decision.</strong>
                <div className={styles.mockWaveform}>
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <div className={styles.mockTranscript}>
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
            <div className={`${styles.floatingMetric} ${styles.scoreMetric}`}>
              <span>AI score</span>
              <strong>92</strong>
            </div>
            <div
              className={`${styles.floatingMetric} ${styles.confidenceMetric}`}
            >
              <span>Confidence</span>
              <strong>High</strong>
            </div>
            <div className={`${styles.floatingMetric} ${styles.resumeMetric}`}>
              <span>Resume match</span>
              <strong>87%</strong>
            </div>
          </div>
          <ul className={styles.benefits}>
            <li>Role-specific mock interviews</li>
            <li>Answer recording and transcription</li>
            <li>Actionable AI coaching</li>
          </ul>
          <div
            className={styles.trustLine}
            aria-label="Offerly product metrics"
          >
            <div>
              <strong>10+</strong>
              <span>Role tracks</span>
            </div>
            <div>
              <strong>4</strong>
              <span>Feedback dimensions</span>
            </div>
            <div>
              <strong>3</strong>
              <span>Interview formats</span>
            </div>
          </div>
        </section>
        <AuthForm mode="register" />
      </div>
    </main>
  );
}
