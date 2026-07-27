"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnswerRecorder } from "@/components/answer-recorder";
import { getQuestions } from "@/data/interview-questions";
import type { InterviewFeedback } from "@/types/interview-feedback";
import type { InterviewSetup } from "@/types/interview";
import styles from "./interview-session.module.css";

type InterviewSessionProps = {
  setup: InterviewSetup;
};

type AnswerRecording = {
  blob: Blob;
  url: string;
  transcript?: string;
  feedback?: InterviewFeedback;
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
  const [recordings, setRecordings] = useState<
    Record<string, AnswerRecording>
  >({});
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (isComplete) return;

    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isComplete]);

  const question = questions[questionIndex];
  const handleRecordingChange = useCallback((recording: boolean) => {
    setIsRecording(recording);
  }, []);

  if (isComplete) {
    return (
      <main className={styles.page}>
        <section className={styles.completeCard} aria-live="polite">
          <div className={styles.completeHero}>
            <div>
              <p className={styles.eyebrow}>
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="m8 12 2.5 2.5L16 9" />
                </svg>
                Session complete
              </p>
              <h1>You finished your {setup.role} practice round.</h1>
              <p className={styles.completeCopy}>
                You completed {questions.length} questions in{" "}
                {formatTime(elapsedSeconds)}. Review your session details or
                start another practice round.
              </p>
            </div>
            <aside
              className={styles.completionVisual}
              aria-label="100 percent complete"
            >
              <div className={styles.progressRing}>
                <svg viewBox="0 0 100 100" aria-hidden="true">
                  <circle cx="50" cy="50" r="42" />
                  <circle cx="50" cy="50" r="42" />
                </svg>
                <strong>100%</strong>
                <span>Complete</span>
              </div>
              <dl>
                <div>
                  <dt>
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                      <path d="M9 7h10M9 12h10M9 17h10M4.5 7l1 1 2-2M4.5 12l1 1 2-2M4.5 17l1 1 2-2" />
                    </svg>
                    Questions
                  </dt>
                  <dd>{questions.length}</dd>
                </div>
                <div>
                  <dt>
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                    Time taken
                  </dt>
                  <dd>{formatTime(elapsedSeconds)}</dd>
                </div>
              </dl>
            </aside>
          </div>
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
              <dt>Target</dt>
              <dd>{setup.duration} min</dd>
            </div>
            <div>
              <dt>Completed in</dt>
              <dd>{formatTime(elapsedSeconds)}</dd>
            </div>
          </dl>
          <div className={styles.completeActions}>
            <button
              type="button"
              onClick={() => {
                setQuestionIndex(0);
                setElapsedSeconds(0);
                setIsComplete(false);
                Object.values(recordings).forEach((recording) =>
                  URL.revokeObjectURL(recording.url),
                );
                setRecordings({});
              }}
            >
              <span aria-hidden="true">↻</span>
              Practice again
            </button>
            <Link href="/interview/new">
              <span aria-hidden="true">＋</span>
              Create a new plan
            </Link>
          </div>
          <Link className={styles.dashboardLink} href="/">
            <span>Go to dashboard</span>
            <span aria-hidden="true">→</span>
          </Link>
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
          <span>Exit session</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </nav>

      <section className={styles.session}>
        <header className={styles.sessionHeader}>
          <div className={styles.progressDetails}>
            <p>
              Question {questionIndex + 1} of {questions.length}
            </p>
            <div className={styles.segmentedProgress} aria-hidden="true">
              {questions.map((item, index) => (
                <span
                  className={index <= questionIndex ? styles.progressDone : ""}
                  key={item.id}
                />
              ))}
            </div>
          </div>
          <time aria-label={`Elapsed time ${formatTime(elapsedSeconds)}`}>
            <span aria-hidden="true">◷</span>
            <span>Elapsed</span>
            {formatTime(elapsedSeconds)}
          </time>
        </header>

        <article className={styles.questionCard}>
          <span className={styles.questionType}>{question.type}</span>
          <h1>{question.prompt}</h1>
          <AnswerRecorder
            audio={recordings[question.id]}
            question={question.prompt}
            role={setup.role}
            experience={setup.experience}
            onAudioChange={(audio) =>
              setRecordings((current) => {
                const next = { ...current };
                const previous = next[question.id];
                if (previous) URL.revokeObjectURL(previous.url);

                if (audio) {
                  next[question.id] = {
                    blob: audio,
                    url: URL.createObjectURL(audio),
                  };
                } else {
                  delete next[question.id];
                }
                return next;
              })
            }
            onRecordingChange={handleRecordingChange}
            onTranscriptChange={(transcript) =>
              setRecordings((current) => ({
                ...current,
                [question.id]: {
                  ...current[question.id],
                  transcript,
                },
              }))
            }
            onFeedbackChange={(feedback) =>
              setRecordings((current) => ({
                ...current,
                [question.id]: {
                  ...current[question.id],
                  feedback,
                },
              }))
            }
          />
          <aside className={styles.guidance}>
            <strong>
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M9 18h6m-5 3h4m3.2-7.3A7 7 0 1 0 6.8 13.7c1.1.9 1.7 1.8 1.9 2.8h6.6c.2-1 .8-1.9 1.9-2.8Z" />
              </svg>
              Answering tip
            </strong>
            <p>{question.guidance}</p>
          </aside>
        </article>

        <footer className={styles.controls}>
          <button
            className={styles.previousButton}
            type="button"
            disabled={questionIndex === 0 || isRecording}
            onClick={() => setQuestionIndex((current) => current - 1)}
          >
            ← Previous
          </button>
          <button
            className={styles.nextButton}
            type="button"
            disabled={isRecording}
            onClick={() => {
              if (questionIndex === questions.length - 1) {
                setIsComplete(true);
              } else {
                setQuestionIndex((current) => current + 1);
              }
            }}
          >
            <span>
              {questionIndex === questions.length - 1
                ? "Finish session"
                : "Next question"}
            </span>
            <span className={styles.nextArrow} aria-hidden="true">
              →
            </span>
          </button>
        </footer>
        {isRecording && (
          <p className={styles.recordingNotice}>
            Stop the recording before changing questions.
          </p>
        )}
      </section>
    </main>
  );
}
