"use client";

import { useEffect, useRef, useState } from "react";
import type { InterviewFeedback } from "@/types/interview-feedback";
import styles from "./answer-recorder.module.css";

type AnswerRecorderProps = {
  audio?: {
    blob: Blob;
    url: string;
    transcript?: string;
    feedback?: InterviewFeedback;
  };
  question: string;
  role: string;
  experience: string;
  onAudioChange: (audio: Blob | undefined) => void;
  onRecordingChange: (isRecording: boolean) => void;
  onTranscriptChange: (transcript: string) => void;
  onFeedbackChange: (feedback: InterviewFeedback) => void;
};

type RecorderStatus = "idle" | "requesting" | "recording" | "error";

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getSupportedMimeType() {
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return types.find((type) => MediaRecorder.isTypeSupported(type));
}

export function AnswerRecorder({
  audio,
  question,
  role,
  experience,
  onAudioChange,
  onRecordingChange,
  onTranscriptChange,
  onFeedbackChange,
}: AnswerRecorderProps) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [transcriptionStatus, setTranscriptionStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const [transcriptionError, setTranscriptionError] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const [feedbackError, setFeedbackError] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (status !== "recording") return;

    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    return () => {
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      onRecordingChange(false);
    };
  }, [onRecordingChange]);

  function releaseMicrophone() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setStatus("error");
      setErrorMessage("Audio recording is not supported in this browser.");
      return;
    }

    setStatus("requesting");
    setErrorMessage("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );

      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      });

      recorder.addEventListener("stop", () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        if (blob.size > 0) onAudioChange(blob);
        releaseMicrophone();
        setStatus("idle");
        onRecordingChange(false);
      });

      recorder.addEventListener("error", () => {
        releaseMicrophone();
        setStatus("error");
        setErrorMessage("The recording stopped unexpectedly. Please retry.");
        onRecordingChange(false);
      });

      onAudioChange(undefined);
      setElapsedSeconds(0);
      recorder.start();
      setStatus("recording");
      onRecordingChange(true);
    } catch (error) {
      releaseMicrophone();
      setStatus("error");
      onRecordingChange(false);
      setErrorMessage(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Microphone access was denied. Allow it in your browser settings and retry."
          : "We could not access your microphone. Check your device and retry.",
      );
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }

  async function transcribeAnswer() {
    if (!audio) return;

    setTranscriptionStatus("loading");
    setTranscriptionError("");

    const formData = new FormData();
    const extension = audio.blob.type.includes("mp4") ? "mp4" : "webm";
    formData.append("audio", audio.blob, `answer.${extension}`);

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as {
        transcript?: string;
        error?: string;
      };

      if (!response.ok || !result.transcript) {
        throw new Error(result.error || "Transcription failed.");
      }

      onTranscriptChange(result.transcript);
      setTranscriptionStatus("idle");
    } catch (error) {
      setTranscriptionStatus("error");
      setTranscriptionError(
        error instanceof Error
          ? error.message
          : "The answer could not be transcribed.",
      );
    }
  }

  async function generateFeedback() {
    if (!audio?.transcript) return;

    setFeedbackStatus("loading");
    setFeedbackError("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          experience,
          question,
          transcript: audio.transcript,
        }),
      });
      const result = (await response.json()) as {
        feedback?: InterviewFeedback;
        error?: string;
      };

      if (!response.ok || !result.feedback) {
        throw new Error(result.error || "Feedback generation failed.");
      }

      onFeedbackChange(result.feedback);
      setFeedbackStatus("idle");
    } catch (error) {
      setFeedbackStatus("error");
      setFeedbackError(
        error instanceof Error
          ? error.message
          : "Feedback could not be generated.",
      );
    }
  }

  if (status === "recording") {
    return (
      <section className={styles.recorder} aria-live="polite">
        <div className={styles.recordingStatus}>
          <span className={styles.recordingDot} aria-hidden="true" />
          <div>
            <strong>Recording your answer</strong>
            <p>Speak naturally. Your audio stays in this browser.</p>
          </div>
          <time>{formatTime(elapsedSeconds)}</time>
        </div>
        <button
          className={styles.stopButton}
          type="button"
          onClick={stopRecording}
        >
          <span aria-hidden="true" />
          Stop recording
        </button>
      </section>
    );
  }

  if (audio) {
    return (
      <section className={styles.recorder} aria-label="Recorded answer">
        <div className={styles.savedHeading}>
          <div>
            <strong>Answer recorded</strong>
            <p>Listen back before moving to the next question.</p>
          </div>
          <span>Saved</span>
        </div>
        <audio className={styles.audio} src={audio.url} controls>
          Your browser does not support audio playback.
        </audio>
        <div className={styles.savedActions}>
          <button
            className={styles.transcribeButton}
            type="button"
            disabled={transcriptionStatus === "loading"}
            onClick={transcribeAnswer}
          >
            {transcriptionStatus === "loading"
              ? "Preparing answer…"
              : "Use this answer"}
          </button>
          <button type="button" onClick={startRecording}>
            Re-record
          </button>
          <button
            className={styles.deleteButton}
            type="button"
            onClick={() => {
              onAudioChange(undefined);
              setElapsedSeconds(0);
            }}
          >
            Delete
          </button>
        </div>
        {transcriptionStatus === "error" && (
          <p className={styles.error} role="alert">
            {transcriptionError}
          </p>
        )}
        {audio.transcript && (
          <div className={styles.transcript}>
            <strong>Transcript</strong>
            <p>{audio.transcript}</p>
          </div>
        )}
        {audio.transcript && (
          <button
            className={styles.feedbackButton}
            type="button"
            disabled={feedbackStatus === "loading"}
            onClick={generateFeedback}
          >
            {feedbackStatus === "loading"
              ? "Reviewing answer…"
              : audio.feedback
                ? "Refresh AI feedback"
                : "Get AI feedback"}
          </button>
        )}
        {feedbackStatus === "error" && (
          <p className={styles.error} role="alert">
            {feedbackError}
          </p>
        )}
        {audio.feedback && (
          <section className={styles.feedback} aria-label="AI answer feedback">
            <header className={styles.feedbackHeader}>
              <div>
                <span>Answer score</span>
                <strong>{audio.feedback.overallScore}</strong>
              </div>
              <p>{audio.feedback.summary}</p>
            </header>
            <div className={styles.scoreGrid}>
              {Object.entries(audio.feedback.scores).map(([label, score]) => (
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
                  {audio.feedback.strengths.map((strength) => (
                    <li key={strength}>{strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Improve next</strong>
                <ul>
                  {audio.feedback.improvements.map((improvement) => (
                    <li key={improvement}>{improvement}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className={styles.nextStep}>
              <strong>Try this next</strong>
              <p>{audio.feedback.nextStep}</p>
            </div>
          </section>
        )}
      </section>
    );
  }

  return (
    <section className={styles.recorder}>
      <div className={styles.ready}>
        <span className={styles.microphone} aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M12 15.5a4 4 0 0 0 4-4v-5a4 4 0 0 0-8 0v5a4 4 0 0 0 4 4Zm-6-4a6 6 0 0 0 12 0M12 17.5V21m-3 0h6" />
          </svg>
        </span>
        <div>
          <strong>Answer out loud</strong>
          <p>Record your response when you are ready.</p>
        </div>
        <span className={styles.waveform} aria-hidden="true">
          {[8, 15, 23, 12, 27, 18, 10, 21, 14, 8].map((height, index) => (
            <i key={`${height}-${index}`} style={{ height }} />
          ))}
        </span>
      </div>
      <button
        className={styles.recordButton}
        type="button"
        disabled={status === "requesting"}
        onClick={startRecording}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M12 15.5a4 4 0 0 0 4-4v-5a4 4 0 0 0-8 0v5a4 4 0 0 0 4 4Zm-6-4a6 6 0 0 0 12 0M12 17.5V21m-3 0h6" />
        </svg>
        {status === "requesting" ? "Requesting microphone…" : "Record answer"}
      </button>
      {status === "error" && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}
    </section>
  );
}
