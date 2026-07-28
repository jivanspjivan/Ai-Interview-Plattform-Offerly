"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./password-form.module.css";

type PasswordFormProps = {
  mode: "request" | "update";
};

function getMessage(error: unknown) {
  if (!(error instanceof Error)) return "Something went wrong. Please try again.";
  if (error.message.includes("Supabase is not configured")) {
    return "Password recovery is not configured yet. Add the Supabase environment variables.";
  }
  return error.message;
}

export function PasswordForm({ mode }: PasswordFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isUpdate = mode === "update";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);

    try {
      const supabase = createClient();

      if (isUpdate) {
        const password = String(formData.get("password") ?? "");
        const confirmation = String(formData.get("confirmation") ?? "");

        if (password !== confirmation) {
          throw new Error("The passwords do not match.");
        }

        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;

        setIsError(false);
        setMessage("Your password has been updated. Redirecting to your dashboard…");
        window.setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 900);
      } else {
        const email = String(formData.get("email") ?? "").trim();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
        });
        if (error) throw error;

        setIsError(false);
        setMessage(
          "If an account exists for that email, a password-reset link is on its way.",
        );
      }
    } catch (error) {
      setIsError(true);
      setMessage(getMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <p className={styles.eyebrow}>Secure account access</p>
      <h1>{isUpdate ? "Choose a new password" : "Reset your password"}</h1>
      <p className={styles.description}>
        {isUpdate
          ? "Use at least eight characters and choose a password you do not reuse elsewhere."
          : "Enter your account email and we’ll send you a secure recovery link."}
      </p>

      {isUpdate ? (
        <>
          <label>
            New password
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <label>
            Confirm new password
            <input
              name="confirmation"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
        </>
      ) : (
        <label>
          Email address
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </label>
      )}

      <button type="submit" disabled={isLoading}>
        {isLoading
          ? "Please wait…"
          : isUpdate
            ? "Update password"
            : "Send recovery link"}
        <span aria-hidden="true">→</span>
      </button>

      {message && (
        <p
          className={`${styles.message} ${isError ? styles.error : ""}`}
          role={isError ? "alert" : "status"}
        >
          {message}
        </p>
      )}

      {!isUpdate && (
        <p className={styles.backLink}>
          Remembered your password? <Link href="/login">Return to login</Link>
        </p>
      )}
    </form>
  );
}
