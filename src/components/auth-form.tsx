"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./auth-form.module.css";

type AuthFormProps = {
  mode: "login" | "register";
  initialMessage?: string;
};

function friendlyError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Something went wrong. Please try again.";
  }

  if (error.message.includes("Supabase is not configured")) {
    return "Account access is not configured yet. Add the Supabase environment variables to continue.";
  }

  if (/invalid login credentials/i.test(error.message)) {
    return "The email or password is incorrect.";
  }

  if (/user already registered/i.test(error.message)) {
    return "An account already exists for this email. Try logging in.";
  }

  if (/email rate limit/i.test(error.message)) {
    return "Too many email requests. Please wait a few minutes and try again.";
  }

  return error.message;
}

function getSafeNextPath() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export function AuthForm({ mode, initialMessage = "" }: AuthFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState(initialMessage);
  const [messageKind, setMessageKind] = useState<"error" | "success">(
    initialMessage ? "error" : "success",
  );
  const [isLoading, setIsLoading] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const fullName = String(formData.get("name") ?? "").trim();

    try {
      const supabase = createClient();

      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          },
        });

        if (error) throw error;

        if (!data.session) {
          setMessageKind("success");
          setMessage(
            "Check your email to verify your account, then return to log in.",
          );
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }

      router.push(getSafeNextPath());
      router.refresh();
    } catch (error) {
      setMessageKind("error");
      setMessage(friendlyError(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setMessage("");
    setIsLoading(true);

    try {
      const supabase = createClient();
      const next = getSafeNextPath();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
    } catch (error) {
      setMessageKind("error");
      setMessage(friendlyError(error));
      setIsLoading(false);
    }
  }

  return (
    <form
      className={`${styles.form} ${
        isRegister ? styles.registerForm : styles.loginForm
      }`}
      onSubmit={handleSubmit}
    >
      <div className={styles.heading}>
        <p>{isRegister ? "Start practicing" : "Welcome back"}</p>
        <h1>{isRegister ? "Create your Offerly account" : "Log in to Offerly"}</h1>
        <span>
          {isRegister
            ? "Save your sessions and turn every answer into measurable progress."
            : "Continue your interview practice and review your progress."}
        </span>
      </div>

      <button
        className={styles.googleButton}
        type="button"
        disabled={isLoading}
        onClick={handleGoogleLogin}
      >
        <span aria-hidden="true">G</span>
        {isLoading ? "Please wait…" : "Continue with Google"}
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
          {!isRegister && (
            <button
              type="button"
              onClick={() => router.push("/forgot-password")}
            >
              Forgot password?
            </button>
          )}
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
            I agree to the <Link href="/terms">Terms of Service</Link> and{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </span>
        </label>
      )}

      <button
        className={styles.submitButton}
        type="submit"
        disabled={isLoading}
      >
        {isLoading
          ? "Please wait…"
          : isRegister
            ? "Create account"
            : "Log in"}
        <span aria-hidden="true">→</span>
      </button>

      {message && (
        <p
          className={`${styles.message} ${
            messageKind === "error" ? styles.errorMessage : ""
          }`}
          role={messageKind === "error" ? "alert" : "status"}
        >
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
