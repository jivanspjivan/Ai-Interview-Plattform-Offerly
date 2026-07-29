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
      ? user.user_metadata.full_name.trim()
      : "Candidate";
  const firstName = displayName.split(/\s+/)[0] || "Candidate";
  const recommendedRole = savedSessions[0]?.role ?? "Software Engineer";

  return (
    <>
      <section className={styles.hero}>
        <p>Your practice dashboard</p>
        <h1>Welcome back, {firstName}.</h1>
        <span>
          Practice interviews, track your progress, and improve with
          personalized feedback.
        </span>
        <div className={styles.heroActions}>
          <Link href="/interview/new">
            <span className={styles.actionIcon} aria-hidden="true">▶</span>
            Start mock interview
          </Link>
          <Link href="/dashboard/history">View interview history</Link>
        </div>
      </section>

      <section className={styles.summaryGrid} aria-label="Practice summary">
        <article className={styles.recommendedCard}>
          <span className={styles.metricIcon} aria-hidden="true">▶</span>
          <div>
            <span>Next recommended practice</span>
            <strong>{recommendedRole}</strong>
            <p>15 questions · Around 20 minutes</p>
          </div>
          <Link href="/interview/new" aria-label={`Start a ${recommendedRole} interview`}>
            Start
          </Link>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricIcon} aria-hidden="true">✓</span>
          <div>
            <span>Sessions completed</span>
            <strong>{completedSessions.length}</strong>
            <p>
              {completedSessions.length
                ? "Completed mock interviews."
                : "Complete your first mock interview."}
            </p>
          </div>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricIcon} aria-hidden="true">↗</span>
          <div>
            <span>Current practice streak</span>
            <strong>
              {streak} {streak === 1 ? "day" : "days"}
            </strong>
            <p>Practice today to build consistency.</p>
          </div>
        </article>
      </section>

      <section className={styles.quickStart}>
        <div className={styles.sectionHeading}>
          <div>
            <p>Quick start</p>
            <h2>Choose your interview</h2>
          </div>
          <Link href="/interview/new">Customize a session →</Link>
        </div>
        <div className={styles.practiceModes}>
          <article>
            <span aria-hidden="true">⌘</span>
            <h3>Technical interview</h3>
            <p>Role-specific problem solving and technical communication.</p>
            <div><span>20 min</span><span>Focused</span></div>
            <Link href="/interview/new">Start interview →</Link>
          </article>
          <article>
            <span aria-hidden="true">✦</span>
            <h3>Behavioral interview</h3>
            <p>Practice clear STAR stories around real workplace situations.</p>
            <div><span>15 min</span><span>All levels</span></div>
            <Link href="/interview/new">Start interview →</Link>
          </article>
          <article>
            <span aria-hidden="true">◫</span>
            <h3>Mixed interview</h3>
            <p>Prepare for a balanced round with technical and people skills.</p>
            <div><span>25 min</span><span>Balanced</span></div>
            <Link href="/interview/new">Start interview →</Link>
          </article>
        </div>
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
            <>
              <ul className={styles.sessionList}>
                {savedSessions.slice(0, 3).map((session) => (
                  <li key={session.id}>
                    <Link href={`/dashboard/history/${session.id}`}>
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
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/history">View all sessions →</Link>
            </>
          ) : (
            <>
              <p>
                Complete your first mock interview to see feedback, scores, and
                coaching insights.
              </p>
              <Link href="/interview/new">Start interview →</Link>
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
                Complete your first mock interview to start measuring clarity,
                relevance, structure, and progress over time.
              </p>
              <Link href="/interview/new">Start interview →</Link>
            </>
          ) : (
            <>
              <div className={styles.averageScore}>
                <strong>{averageScore}</strong>
                <span>Average answer score</span>
              </div>
              <Link href="/dashboard/progress">View full progress →</Link>
            </>
          )}
        </article>
      </section>
    </>
  );
}
