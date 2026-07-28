import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import styles from "./dashboard.module.css";

export const metadata: Metadata = {
  title: "Dashboard | Offerly",
  description: "Continue your Offerly interview practice.",
};

export default async function DashboardPage() {
  const user = await requireUser();

  const displayName =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : "Candidate";

  return (
    <>
      <section className={styles.hero}>
        <p>Your practice dashboard</p>
        <h1>Welcome, {displayName}.</h1>
        <span>
          Build consistency with focused practice. Your saved sessions and
          progress will collect here as the data layer comes online.
        </span>
        <div className={styles.heroActions}>
          <Link href="/interview/new">
            Start a practice session
            <span aria-hidden="true">→</span>
          </Link>
          <Link href="/dashboard/account">View account</Link>
        </div>
      </section>

      <section className={styles.summaryGrid} aria-label="Practice summary">
        <article className={styles.statusCard}>
          <span>Account status</span>
          <strong>Ready to practice</strong>
          <p>Your secure Offerly account is active.</p>
        </article>
        <article className={styles.metricCard}>
          <span>Sessions completed</span>
          <strong>0</strong>
          <p>Your first completed practice will appear here.</p>
        </article>
        <article className={styles.metricCard}>
          <span>Current practice streak</span>
          <strong>0 days</strong>
          <p>Start a session to begin building consistency.</p>
        </article>
      </section>

      <section className={styles.dashboardPanels}>
        <article className={styles.emptyPanel}>
          <div>
            <span className={styles.panelIcon} aria-hidden="true">◎</span>
            <div>
              <p>Recent sessions</p>
              <h2>Your practice history starts here.</h2>
            </div>
          </div>
          <p>
            Complete an interview to see its role, scores, transcript, and
            coaching summary in this space.
          </p>
          <Link href="/interview/new">Start your first session →</Link>
        </article>

        <article className={styles.emptyPanel}>
          <div>
            <span className={styles.panelIcon} aria-hidden="true">↗</span>
            <div>
              <p>Progress insights</p>
              <h2>Turn repeated practice into a trend.</h2>
            </div>
          </div>
          <p>
            After sessions are saved, Offerly will compare structure,
            relevance, clarity, and evidence over time.
          </p>
          <span className={styles.pendingLabel}>Available after Phase 4</span>
        </article>
      </section>
    </>
  );
}
