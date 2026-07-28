import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import styles from "../auth.module.css";

export const metadata: Metadata = {
  title: "Log in | Offerly",
  description: "Log in to continue your interview practice.",
};

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const errorMessages: Record<string, string> = {
  configuration:
    "Account access is not configured yet. Add the Supabase environment variables to continue.",
  verification:
    "We could not verify that authentication link. Request a new link and try again.",
};

const successMessages: Record<string, string> = {
  "check-email":
    "Account created. Check your inbox and verify your email before logging in.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorCode = typeof params.error === "string" ? params.error : "";
  const registrationCode =
    typeof params.registered === "string" ? params.registered : "";
  const initialMessage =
    successMessages[registrationCode] ?? errorMessages[errorCode] ?? "";

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
        <section className={`${styles.intro} ${styles.loginIntro}`}>
          <p>Your private practice space</p>
          <h2>Pick up where you left off.</h2>
          <span>
            Return to your answers, coaching feedback, and progress whenever
            you are ready to practice again.
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
            <li>Keep interview sessions private</li>
            <li>Review transcripts and feedback</li>
            <li>Track improvement over time</li>
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
          <AuthForm
            mode="login"
            initialMessage={initialMessage}
            initialMessageKind={registrationCode ? "success" : "error"}
          />
      </div>
    </main>
  );
}
