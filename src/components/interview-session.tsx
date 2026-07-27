"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getQuestions } from "@/data/interview-questions";
import type { InterviewSetup } from "@/types/interview";
import styles from "./interview-session.module.css";

type InterviewSessionProps = {
  setup: InterviewSetup;
};

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function InterviewSession({ setup }: InterviewSessionProps) {
  const questions = getQuestions(setup.interviewType);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isComplete) return;

    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isComplete]);

  const question = questions[questionIndex];
  const progress = ((questionIndex + 1) / questions.length) * 100;

  if (isComplete) {
    return (
      <main className={styles.page}>
        <section className={styles.completeCard} aria-live="polite">
          <span className={styles.completeIcon} aria-hidden="true">
            ✓
          </span>
          <p className={styles.eyebrow}>Session complete</p>
          <h1>You finished your {setup.role} practice round.</h1>
          <p className={styles.completeCopy}>
            You worked through {questions.length} questions in{" "}
            {formatTime(elapsedSeconds)}. Recording and detailed feedback will
            be added in the next feature.
          </p>
          <dl className={styles.summary}>
            <div>
              <dt>Format</dt>
              <dd>{setup.interviewType}</dd>
            </div>
            <div>
              <dt>Level</dt>
              <dd>{setup.experience}</dd>
            </div>
            <div>
              <dt>Target time</dt>
              <dd>{setup.duration} min</dd>
            </div>
          </dl>
          <div className={styles.completeActions}>
            <button
              type="button"
              onClick={() => {
                setQuestionIndex(0);
                setElapsedSeconds(0);
                setIsComplete(false);
              }}
            >
              Practice again
            </button>
            <Link href="/interview/new">Create a new plan</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Interview session navigation">
        <Link className={styles.brand} href="/">
          <span aria-hidden="true">✦</span>
          offerly
        </Link>
        <div className={styles.sessionMeta}>
          <strong>{setup.role}</strong>
          <span>•</span>
          <span>{setup.experience}</span>
        </div>
        <Link className={styles.exitLink} href="/interview/new">
          Exit session
        </Link>
      </nav>

      <div className={styles.progressTrack} aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <section className={styles.session}>
        <header className={styles.sessionHeader}>
          <p>
            Question {questionIndex + 1} of {questions.length}
          </p>
          <time aria-label={`Elapsed time ${formatTime(elapsedSeconds)}`}>
            {formatTime(elapsedSeconds)}
          </time>
        </header>

        <article className={styles.questionCard}>
          <span className={styles.questionType}>{question.type}</span>
          <h1>{question.prompt}</h1>
          <div className={styles.answerPrompt}>
            <span aria-hidden="true">◉</span>
            <div>
              <strong>Answer out loud</strong>
              <p>
                Take a moment to think, then respond as if an interviewer were
                listening.
              </p>
            </div>
          </div>
          <aside className={styles.guidance}>
            <strong>Answering tip</strong>
            <p>{question.guidance}</p>
          </aside>
        </article>

        <footer className={styles.controls}>
          <button
            className={styles.previousButton}
            type="button"
            disabled={questionIndex === 0}
            onClick={() => setQuestionIndex((current) => current - 1)}
          >
            ← Previous
          </button>
          <button
            className={styles.nextButton}
            type="button"
            onClick={() => {
              if (questionIndex === questions.length - 1) {
                setIsComplete(true);
              } else {
                setQuestionIndex((current) => current + 1);
              }
            }}
          >
            {questionIndex === questions.length - 1
              ? "Finish session"
              : "Next question →"}
          </button>
        </footer>
      </section>
    </main>
  );
}
