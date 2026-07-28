import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import styles from "./dashboard.module.css";

export const metadata: Metadata = {
  title: "Dashboard | Offerly",
  description: "Continue your Offerly interview practice.",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const [{ data: sessions }, { data: feedback }] = await Promise.all([
    supabase
      .from("interview_sessions")
      .select("id, role, interview_type, status, elapsed_seconds, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("interview_feedback")
      .select("overall_score")
      .eq("user_id", user.id),
  ]);
  const savedSessions = sessions ?? [];
  const completedSessions = savedSessions.filter(
    (session) => session.status === "completed",
  );
  const uniquePracticeDays = new Set(
    completedSessions.map((session) => session.created_at.slice(0, 10)),
  );
  let streak = 0;
  const cursor = new Date();
  if (!uniquePracticeDays.has(cursor.toISOString().slice(0, 10))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  while (uniquePracticeDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  const averageScore = feedback?.length
    ? Math.round(
        feedback.reduce((total, item) => total + item.overall_score, 0) /
          feedback.length,
      )
    : null;

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
          <strong>{completedSessions.length}</strong>
          <p>
            {completedSessions.length
              ? "Completed sessions saved to your account."
              : "Your first completed practice will appear here."}
          </p>
        </article>
        <article className={styles.metricCard}>
          <span>Current practice streak</span>
          <strong>
            {streak} {streak === 1 ? "day" : "days"}
          </strong>
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
          {savedSessions.length ? (
            <ul className={styles.sessionList}>
              {savedSessions.slice(0, 3).map((session) => (
                <li key={session.id}>
                  <div>
                    <strong>{session.role}</strong>
                    <span>{session.interview_type}</span>
                  </div>
                  <time dateTime={session.created_at}>
                    {new Intl.DateTimeFormat("en-IN", {
                      day: "numeric",
                      month: "short",
                    }).format(new Date(session.created_at))}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <p>
                Complete an interview to see its role, scores, transcript, and
                coaching summary in this space.
              </p>
              <Link href="/interview/new">Start your first session →</Link>
            </>
          )}
        </article>

        <article className={styles.emptyPanel}>
          <div>
            <span className={styles.panelIcon} aria-hidden="true">↗</span>
            <div>
              <p>Progress insights</p>
              <h2>Turn repeated practice into a trend.</h2>
            </div>
          </div>
          {averageScore === null ? (
            <>
              <p>
                Generate feedback on saved answers to start measuring
                structure, relevance, clarity, and evidence over time.
              </p>
              <span className={styles.pendingLabel}>No feedback saved yet</span>
            </>
          ) : (
            <div className={styles.averageScore}>
              <strong>{averageScore}</strong>
              <span>Average answer score</span>
            </div>
          )}
        </article>
      </section>
    </>
  );
}
