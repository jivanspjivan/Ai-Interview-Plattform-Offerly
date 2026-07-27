"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./answer-recorder.module.css";

type AnswerRecorderProps = {
  audio?: {
    blob: Blob;
    url: string;
    transcript?: string;
  };
  onAudioChange: (audio: Blob | undefined) => void;
  onRecordingChange: (isRecording: boolean) => void;
  onTranscriptChange: (transcript: string) => void;
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
  onAudioChange,
  onRecordingChange,
  onTranscriptChange,
}: AnswerRecorderProps) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [transcriptionStatus, setTranscriptionStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const [transcriptionError, setTranscriptionError] = useState("");
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
              ? "Transcribing…"
              : audio.transcript
                ? "Transcribe again"
                : "Create transcript"}
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
      </section>
    );
  }

  return (
    <section className={styles.recorder}>
      <div className={styles.ready}>
        <span className={styles.microphone} aria-hidden="true">
          ●
        </span>
        <div>
          <strong>Answer out loud</strong>
          <p>Record your response when you are ready.</p>
        </div>
      </div>
      <button
        className={styles.recordButton}
        type="button"
        disabled={status === "requesting"}
        onClick={startRecording}
      >
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
