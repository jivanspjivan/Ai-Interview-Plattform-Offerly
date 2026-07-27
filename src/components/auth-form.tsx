"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import styles from "./auth-form.module.css";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const [message, setMessage] = useState("");
  const isRegister = mode === "register";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(
      "The page is ready. Connect Supabase to enable secure account access.",
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.heading}>
        <p>{isRegister ? "Start practicing" : "Welcome back"}</p>
        <h1>{isRegister ? "Create your Offerly account" : "Log in to Offerly"}</h1>
        <span>
          {isRegister
            ? "Save your sessions and turn every answer into measurable progress."
            : "Continue your interview practice and review your progress."}
        </span>
      </div>

      <button className={styles.googleButton} type="button" disabled>
        <span aria-hidden="true">G</span>
        Continue with Google
        <small>Coming soon</small>
      </button>

      <div className={styles.divider}>
        <span>or use email</span>
      </div>

      {isRegister && (
        <div className={styles.field}>
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            minLength={2}
            maxLength={80}
            required
          />
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>

      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label htmlFor="password">Password</label>
          {!isRegister && <button type="button">Forgot password?</button>}
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          placeholder={isRegister ? "At least 8 characters" : "Your password"}
          minLength={8}
          required
        />
      </div>

      {isRegister && (
        <label className={styles.consent}>
          <input type="checkbox" required />
          <span>
            I agree to the Terms of Service and Privacy Policy.
          </span>
        </label>
      )}

      <button className={styles.submitButton} type="submit">
        {isRegister ? "Create account" : "Log in"}
        <span aria-hidden="true">→</span>
      </button>

      {message && (
        <p className={styles.message} role="status">
          {message}
        </p>
      )}

      <p className={styles.switchMode}>
        {isRegister ? "Already have an account?" : "New to Offerly?"}{" "}
        <Link href={isRegister ? "/login" : "/register"}>
          {isRegister ? "Log in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
