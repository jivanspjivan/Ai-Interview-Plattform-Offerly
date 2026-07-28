import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import styles from "../insights.module.css";

export const metadata: Metadata = {
  title: "Progress | Offerly",
  description: "Track your Offerly interview-practice progress.",
};

function average(values: number[]) {
  return values.length
    ? Math.round(values.reduce((total, value) => total + value, 0) / values.length)
    : 0;
}

export default async function ProgressPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const [{ data: feedbackData }, { data: answerData }, { data: sessionData }] =
    await Promise.all([
      supabase
        .from("interview_feedback")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("interview_answers")
        .select("id, session_id")
        .eq("user_id", user.id),
      supabase
        .from("interview_sessions")
        .select("id, role, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
    ]);
  const feedback = feedbackData ?? [];
  const answers = answerData ?? [];
  const sessions = sessionData ?? [];

  if (!feedback.length) {
    return (
      <section className={styles.section}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Progress insights</p>
          <h1>Your improvement story starts with feedback.</h1>
          <span>
            Complete a practice answer and generate AI feedback to unlock score
            trends and skill comparisons.
          </span>
        </div>
        <div className={styles.empty}>
          <strong>No scored answers yet.</strong>
          <p>Your first feedback report will establish the baseline.</p>
          <Link href="/interview/new">Start a practice session →</Link>
        </div>
      </section>
    );
  }

  const categories = {
    structure: average(feedback.map((item) => item.structure_score)),
    relevance: average(feedback.map((item) => item.relevance_score)),
    clarity: average(feedback.map((item) => item.clarity_score)),
    evidence: average(feedback.map((item) => item.evidence_score)),
  };
  const orderedCategories = Object.entries(categories).sort(
    (left, right) => right[1] - left[1],
  );
  const strongest = orderedCategories[0];
  const improvement = orderedCategories.at(-1) ?? orderedCategories[0];
  const overallAverage = average(
    feedback.map((item) => item.overall_score),
  );
  const recentTrend = feedback.slice(-10);
  const firstScores = feedback.slice(0, Math.min(3, feedback.length));
  const latestScores = feedback.slice(-Math.min(3, feedback.length));
  const scoreChange =
    average(latestScores.map((item) => item.overall_score)) -
    average(firstScores.map((item) => item.overall_score));
  const answerSession = new Map(
    answers.map((answer) => [answer.id, answer.session_id]),
  );
  const sessionRole = new Map(
    sessions.map((session) => [session.id, session.role]),
  );
  const roleScores = new Map<string, number[]>();
  feedback.forEach((item) => {
    const sessionId = answerSession.get(item.answer_id);
    const role = sessionId ? sessionRole.get(sessionId) : undefined;
    if (!role) return;
    roleScores.set(role, [...(roleScores.get(role) ?? []), item.overall_score]);
  });
  const roleAverages = [...roleScores.entries()]
    .map(([role, scores]) => ({ role, score: average(scores) }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);
  const practiceDays = new Set(
    sessions
      .filter((session) => session.status === "completed")
      .map((session) => session.created_at.slice(0, 10)),
  );
  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      key,
      label: new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(date),
      practiced: practiceDays.has(key),
    };
  });

  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>Progress insights</p>
        <h1>See what repeated practice is changing.</h1>
        <span>
          Scores are calculated from your saved AI feedback and update as you
          complete more answers.
        </span>
      </div>

      <div className={styles.analyticsGrid}>
        <article className={styles.analyticsCard}>
          <span>Average answer score</span>
          <strong>{overallAverage}</strong>
          <p>Across {feedback.length} scored {feedback.length === 1 ? "answer" : "answers"}.</p>
        </article>
        <article className={styles.analyticsCard}>
          <span>Strongest skill</span>
          <strong>{strongest[0]}</strong>
          <p>Your current {strongest[0]} average is {strongest[1]}.</p>
        </article>
        <article className={styles.analyticsCard}>
          <span>Focus next</span>
          <strong>{improvement[0]}</strong>
          <p>Your current {improvement[0]} average is {improvement[1]}.</p>
        </article>
      </div>

      <div className={styles.chartGrid}>
        <article className={styles.chart}>
          <h2>Skill averages</h2>
          <p>Category scores across every saved feedback report.</p>
          <dl className={styles.barList}>
            {Object.entries(categories).map(([label, score]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd className={styles.bar}>
                  <i style={{ width: `${score}%` }} />
                </dd>
                <dd>{score}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className={styles.chart}>
          <h2>Recent score trend</h2>
          <p>
            Last {recentTrend.length} scored answers ·{" "}
            {scoreChange >= 0 ? "+" : ""}
            {scoreChange} from your starting baseline.
          </p>
          <div className={styles.trend} aria-label="Recent answer scores">
            {recentTrend.map((item) => (
              <div
                key={item.id}
                style={{ height: `${Math.max(item.overall_score, 8)}%` }}
                title={`Score ${item.overall_score}`}
              />
            ))}
          </div>
        </article>

        <article className={styles.chart}>
          <h2>Progress by target role</h2>
          <p>Average answer score for your most-practiced roles.</p>
          {roleAverages.length ? (
            <ul className={styles.roleList}>
              {roleAverages.map((item) => (
                <li key={item.role}>
                  <span>{item.role}</span>
                  <strong>{item.score}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>Role insights appear after answers are linked to sessions.</p>
          )}
        </article>

        <article className={styles.chart}>
          <h2>Last seven days</h2>
          <p>Completed practice activity during the current week.</p>
          <ul className={styles.roleList}>
            {lastSevenDays.map((day) => (
              <li key={day.key}>
                <span>{day.label}</span>
                <strong>{day.practiced ? "Practiced" : "—"}</strong>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
