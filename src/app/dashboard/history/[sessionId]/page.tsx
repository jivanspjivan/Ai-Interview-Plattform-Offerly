import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteSessionButton } from "@/components/delete-session-button";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { deleteSession } from "../actions";
import styles from "../../insights.module.css";

type SessionDetailPageProps = {
  params: Promise<{ sessionId: string }>;
};

export const metadata: Metadata = {
  title: "Session details | Offerly",
  description: "Review a saved Offerly interview session.",
};

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export default async function SessionDetailPage({
  params,
}: SessionDetailPageProps) {
  const user = await requireUser();
  const { sessionId } = await params;
  const supabase = await createClient();
  const { data: session } = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!session) notFound();

  const { data: answerData } = await supabase
    .from("interview_answers")
    .select("*")
    .eq("session_id", session.id)
    .eq("user_id", user.id)
    .order("created_at");
  const answers = answerData ?? [];
  const answerIds = answers.map((answer) => answer.id);
  const feedbackData = answerIds.length
    ? (
        await supabase
          .from("interview_feedback")
          .select("*")
          .eq("user_id", user.id)
          .in("answer_id", answerIds)
      ).data
    : [];
  const feedbackByAnswer = new Map(
    (feedbackData ?? []).map((feedback) => [feedback.answer_id, feedback]),
  );
  const practiceQuery = new URLSearchParams({
    role: session.role,
    type: session.interview_type,
    experience: session.experience_level,
    duration: String(session.planned_duration),
  });

  return (
    <section className={styles.section}>
      <header className={styles.detailHeader}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Saved session</p>
          <h1>{session.role}</h1>
          <span>
            Practiced on{" "}
            {new Intl.DateTimeFormat("en-IN", {
              dateStyle: "long",
            }).format(new Date(session.created_at))}
          </span>
        </div>
        <div className={styles.detailActions}>
          <Link
            className={styles.primaryAction}
            href={`/interview/session?${practiceQuery.toString()}`}
          >
            Practice again
          </Link>
          <Link className={styles.secondaryAction} href="/dashboard/history">
            Back to history
          </Link>
          <DeleteSessionButton
            action={deleteSession}
            className={styles.dangerButton}
            sessionId={session.id}
          />
        </div>
      </header>

      <dl className={styles.detailSummary}>
        <div>
          <dt>Format</dt>
          <dd>{session.interview_type}</dd>
        </div>
        <div>
          <dt>Level</dt>
          <dd>{session.experience_level}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{session.status.replace("_", " ")}</dd>
        </div>
        <div>
          <dt>Time practiced</dt>
          <dd>{formatElapsed(session.elapsed_seconds)}</dd>
        </div>
      </dl>

      {answers.length ? (
        <div className={styles.answerList}>
          {answers.map((answer, index) => {
            const feedback = feedbackByAnswer.get(answer.id);
            return (
              <article className={styles.answerCard} key={answer.id}>
                <span>
                  Question {index + 1} · {answer.question_type}
                </span>
                <h2>{answer.question_prompt}</h2>
                <div className={styles.transcript}>
                  <strong>Transcript</strong>
                  <p>{answer.transcript || "No transcript was saved."}</p>
                </div>
                {feedback && (
                  <div className={styles.feedback}>
                    <div className={styles.feedbackHeader}>
                      <strong className={styles.score}>
                        {feedback.overall_score}
                      </strong>
                      <p>{feedback.summary}</p>
                    </div>
                    <div className={styles.scoreGrid}>
                      {[
                        ["structure", feedback.structure_score],
                        ["relevance", feedback.relevance_score],
                        ["clarity", feedback.clarity_score],
                        ["evidence", feedback.evidence_score],
                      ].map(([label, score]) => (
                        <div key={label}>
                          <span>{label}</span>
                          <strong>{score}</strong>
                        </div>
                      ))}
                    </div>
                    <div className={styles.feedbackColumns}>
                      <div>
                        <strong>What worked</strong>
                        <ul>
                          {feedback.strengths.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong>Improve next</strong>
                        <ul>
                          {feedback.improvements.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <p className={styles.nextStep}>
                      <strong>Next action:</strong> {feedback.next_step}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className={styles.empty}>
          <strong>No transcribed answers were saved.</strong>
          <p>Practice this setup again and transcribe an answer to save it.</p>
          <Link href={`/interview/session?${practiceQuery.toString()}`}>
            Practice again →
          </Link>
        </div>
      )}
    </section>
  );
}
