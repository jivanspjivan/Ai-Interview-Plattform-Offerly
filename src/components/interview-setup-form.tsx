"use client";

import { FormEvent, useState } from "react";
import styles from "./interview-setup-form.module.css";

const interviewTypes = [
  {
    value: "behavioral",
    label: "Behavioral",
    description: "Experience, collaboration, and leadership",
  },
  {
    value: "technical",
    label: "Technical",
    description: "Concepts, decisions, and problem solving",
  },
  {
    value: "mixed",
    label: "Mixed",
    description: "A balanced, full-round simulation",
  },
] as const;

const experienceLevels = ["Entry level", "Mid level", "Senior", "Leadership"];
const durations = [15, 30, 45];

type InterviewType = (typeof interviewTypes)[number]["value"];

type SetupState = {
  role: string;
  interviewType: InterviewType;
  experience: string;
  duration: number;
};

const initialSetup: SetupState = {
  role: "",
  interviewType: "behavioral",
  experience: "Mid level",
  duration: 30,
};

export function InterviewSetupForm() {
  const [setup, setSetup] = useState(initialSetup);
  const [submittedSetup, setSubmittedSetup] = useState<SetupState | null>(null);

  function updateSetup<Key extends keyof SetupState>(
    key: Key,
    value: SetupState[Key],
  ) {
    setSetup((current) => ({ ...current, [key]: value }));
    setSubmittedSetup(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedSetup(setup);
  }

  if (submittedSetup) {
    const selectedType = interviewTypes.find(
      (type) => type.value === submittedSetup.interviewType,
    );

    return (
      <section className={styles.confirmation} aria-live="polite">
        <span className={styles.confirmationIcon} aria-hidden="true">
          ✓
        </span>
        <p className={styles.kicker}>Practice plan ready</p>
        <h2>Your {submittedSetup.role} session is set.</h2>
        <p className={styles.confirmationCopy}>
          You selected a {submittedSetup.duration}-minute{" "}
          {selectedType?.label.toLowerCase()} interview at the{" "}
          {submittedSetup.experience.toLowerCase()} level.
        </p>
        <dl className={styles.summary}>
          <div>
            <dt>Role</dt>
            <dd>{submittedSetup.role}</dd>
          </div>
          <div>
            <dt>Format</dt>
            <dd>{selectedType?.label}</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd>{submittedSetup.duration} minutes</dd>
          </div>
        </dl>
        <div className={styles.notice}>
          The live interview room will be added in the next feature.
        </div>
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={() => setSubmittedSetup(null)}
        >
          Edit practice plan
        </button>
      </section>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formHeading}>
        <p className={styles.kicker}>Session details</p>
        <h2>What are you preparing for?</h2>
        <p>We will use these details to personalize your practice.</p>
      </div>

      <div className={styles.field}>
        <label htmlFor="role">Target role</label>
        <input
          id="role"
          name="role"
          type="text"
          placeholder="e.g. Frontend Developer"
          value={setup.role}
          onChange={(event) => updateSetup("role", event.target.value)}
          minLength={2}
          maxLength={80}
          required
        />
        <span>Use the exact title from the job description when possible.</span>
      </div>

      <fieldset className={styles.fieldset}>
        <legend>Interview type</legend>
        <div className={styles.typeGrid}>
          {interviewTypes.map((type) => (
            <label
              className={`${styles.optionCard} ${
                setup.interviewType === type.value ? styles.selectedCard : ""
              }`}
              key={type.value}
            >
              <input
                type="radio"
                name="interviewType"
                value={type.value}
                checked={setup.interviewType === type.value}
                onChange={() => updateSetup("interviewType", type.value)}
              />
              <span className={styles.radioMark} aria-hidden="true" />
              <strong>{type.label}</strong>
              <small>{type.description}</small>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.twoColumns}>
        <div className={styles.field}>
          <label htmlFor="experience">Experience level</label>
          <select
            id="experience"
            name="experience"
            value={setup.experience}
            onChange={(event) => updateSetup("experience", event.target.value)}
          >
            {experienceLevels.map((level) => (
              <option key={level}>{level}</option>
            ))}
          </select>
        </div>

        <fieldset className={styles.compactFieldset}>
          <legend>Duration</legend>
          <div className={styles.segmentedControl}>
            {durations.map((duration) => (
              <label key={duration}>
                <input
                  type="radio"
                  name="duration"
                  value={duration}
                  checked={setup.duration === duration}
                  onChange={() => updateSetup("duration", duration)}
                />
                <span>{duration} min</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <button className={styles.submitButton} type="submit">
        Create practice plan
        <span aria-hidden="true">→</span>
      </button>
      <p className={styles.privacyNote}>
        Your setup currently stays in this browser and is not stored.
      </p>
    </form>
  );
}
