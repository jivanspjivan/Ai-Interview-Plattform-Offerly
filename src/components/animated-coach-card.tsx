"use client";

import { useEffect, useRef, useState } from "react";

const waveHeights = [18, 29, 15, 38, 48, 24, 34, 58, 42, 22, 51, 65, 31, 45, 20];

const CheckIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20">
    <path d="m4 10 4 4 8-9" />
  </svg>
);

export function AnimatedCoachCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(84);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const timer = window.setInterval(
      () => setElapsedSeconds((current) => current + 1),
      1000,
    );

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      const reducedMotionFrame = requestAnimationFrame(() => setScore(84));
      return () => {
        window.clearInterval(timer);
        cancelAnimationFrame(reducedMotionFrame);
      };
    }

    const start = performance.now();
    let frame = 0;
    const countUp = (now: number) => {
      const progress = Math.min((now - start) / 1200, 1);
      setScore(Math.round(84 * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(countUp);
    };
    frame = requestAnimationFrame(countUp);

    return () => {
      window.clearInterval(timer);
      cancelAnimationFrame(frame);
    };
  }, [isVisible]);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = String(elapsedSeconds % 60).padStart(2, "0");

  return (
    <div
      ref={cardRef}
      className={`coach-card${isVisible ? " is-visible" : ""}`}
      aria-label="Example coaching feedback"
    >
      <div className="card-topbar">
        <div className="window-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p>Live practice</p>
        <span className="live-indicator">
          <i aria-hidden="true" />
          Live
        </span>
      </div>
      <div className="question-panel">
        <span className="question-label">Question 03 of 08</span>
        <h2>Tell me about a time you handled a difficult stakeholder.</h2>
        <div className="answer-wave" aria-hidden="true">
          {waveHeights.map((height, index) => (
            <span
              key={index}
              style={{
                height,
                animationDelay: `${index * -73}ms`,
                animationDuration: `${0.8 + (index % 5) * 0.1}s`,
              }}
            />
          ))}
        </div>
        <p className="recording-time">
          {minutes}:{seconds}
        </p>
      </div>
      <div className="feedback-panel">
        <div className="score">
          <strong>{score}</strong>
          <span>/ 100</span>
        </div>
        <div>
          <p className="feedback-title">Strong answer</p>
          <p className="feedback-copy">
            Your example was specific and your ownership was clear.
          </p>
        </div>
      </div>
      <div className="feedback-note">
        <span>
          <CheckIcon />
        </span>
        Add a measurable result to make the impact memorable.
      </div>
    </div>
  );
}
