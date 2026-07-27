"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { findJobRoles } from "@/data/job-roles";
import {
  durations,
  experienceLevels,
  initialInterviewSetup,
  interviewTypes,
  type InterviewSetup,
} from "@/types/interview";
import styles from "./interview-setup-form.module.css";

export function InterviewSetupForm() {
  const router = useRouter();
  const [setup, setSetup] = useState(initialInterviewSetup);
  const [isRoleFocused, setIsRoleFocused] = useState(false);

  const matchingRoles = findJobRoles(setup.role);
  const showRoleSuggestions = isRoleFocused && matchingRoles.length > 0;

  function updateSetup<Key extends keyof InterviewSetup>(
    key: Key,
    value: InterviewSetup[Key],
  ) {
    setSetup((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams({
      role: setup.role.trim(),
      type: setup.interviewType,
      experience: setup.experience,
      duration: String(setup.duration),
    });
    router.push(`/interview/session?${params.toString()}`);
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
        <div
          className={styles.roleInput}
          onFocus={() => setIsRoleFocused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setIsRoleFocused(false);
            }
          }}
        >
          <input
            id="role"
            name="role"
            type="text"
            placeholder="e.g. Frontend Developer"
            value={setup.role}
            onChange={(event) => updateSetup("role", event.target.value)}
            role="combobox"
            aria-autocomplete="list"
            aria-controls="role-suggestions"
            aria-expanded={showRoleSuggestions}
            minLength={2}
            maxLength={80}
            autoComplete="off"
            required
          />
          {showRoleSuggestions && (
            <ul
              className={styles.roleSuggestions}
              id="role-suggestions"
              role="listbox"
              aria-label="Suggested roles"
            >
              {matchingRoles.map((role) => (
                <li key={role.label} role="option" aria-selected="false">
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      updateSetup("role", role.label);
                      setIsRoleFocused(false);
                    }}
                  >
                    <span>{role.label}</span>
                    <small>Use this role</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
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
            onChange={(event) =>
              updateSetup(
                "experience",
                event.target.value as InterviewSetup["experience"],
              )
            }
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
        Start interview
        <span aria-hidden="true">→</span>
      </button>
      <p className={styles.privacyNote}>
        <span aria-hidden="true">🔒</span>
        Your practice session is private and is not stored.
      </p>
    </form>
  );
}
