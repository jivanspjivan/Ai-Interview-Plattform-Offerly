"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./account-settings.module.css";

async function responseMessage(response: Response) {
  const result = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(result.error ?? "The request could not be completed.");
}

export function AccountSettings({
  email,
  fullName,
}: {
  email: string;
  fullName: string;
}) {
  const router = useRouter();
  const [profileMessage, setProfileMessage] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [busy, setBusy] = useState<
    "profile" | "email" | "password" | "delete" | null
  >(null);

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("profile");
    setProfileMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: form.get("fullName") }),
      });
      await responseMessage(response);
      setProfileMessage("Your profile has been updated.");
      router.refresh();
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : "Profile update failed.");
    } finally {
      setBusy(null);
    }
  }

  async function updateEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("email");
    setEmailMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/account/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      });
      const result = (await response.json()) as {
        error?: string;
        message?: string;
      };
      if (!response.ok) {
        throw new Error(result.error ?? "The email could not be changed.");
      }
      setEmailMessage(
        result.message ?? "Check your email to confirm the address change.",
      );
    } catch (error) {
      setEmailMessage(error instanceof Error ? error.message : "Email update failed.");
    } finally {
      setBusy(null);
    }
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("password");
    setPasswordMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: form.get("password"),
          confirmation: form.get("confirmation"),
        }),
      });
      await responseMessage(response);
      formElement.reset();
      setPasswordMessage("Your password has been changed.");
    } catch (error) {
      setPasswordMessage(error instanceof Error ? error.message : "Password update failed.");
    } finally {
      setBusy(null);
    }
  }

  async function deleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !window.confirm(
        "Permanently delete your account, interview history, feedback, and billing record?",
      )
    ) {
      return;
    }
    setBusy("delete");
    setDeleteMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: form.get("confirmation") }),
      });
      await responseMessage(response);
      window.location.assign("/");
    } catch (error) {
      setDeleteMessage(error instanceof Error ? error.message : "Account deletion failed.");
      setBusy(null);
    }
  }

  return (
    <div className={styles.settings}>
      <form onSubmit={updateProfile}>
        <div>
          <span>Public profile</span>
          <h2>Edit your name</h2>
          <p>This name appears in your Offerly account and checkout details.</p>
        </div>
        <label>
          Full name
          <input
            defaultValue={fullName}
            maxLength={80}
            minLength={2}
            name="fullName"
            required
          />
        </label>
        <button disabled={busy !== null} type="submit">
          {busy === "profile" ? "Saving…" : "Save profile"}
        </button>
        {profileMessage && <p role="status">{profileMessage}</p>}
      </form>

      <form onSubmit={updateEmail}>
        <div>
          <span>Sign-in identity</span>
          <h2>Change email address</h2>
          <p>
            Supabase will send confirmation instructions before the new address
            becomes active.
          </p>
        </div>
        <label>
          Email address
          <input
            defaultValue={email}
            maxLength={254}
            name="email"
            required
            type="email"
          />
        </label>
        <button disabled={busy !== null} type="submit">
          {busy === "email" ? "Sending…" : "Change email"}
        </button>
        {emailMessage && <p role="status">{emailMessage}</p>}
      </form>

      <form onSubmit={updatePassword}>
        <div>
          <span>Account security</span>
          <h2>Change password</h2>
          <p>Use at least eight characters and avoid passwords used elsewhere.</p>
        </div>
        <div className={styles.twoFields}>
          <label>
            New password
            <input
              autoComplete="new-password"
              maxLength={128}
              minLength={8}
              name="password"
              required
              type="password"
            />
          </label>
          <label>
            Confirm password
            <input
              autoComplete="new-password"
              maxLength={128}
              minLength={8}
              name="confirmation"
              required
              type="password"
            />
          </label>
        </div>
        <button disabled={busy !== null} type="submit">
          {busy === "password" ? "Updating…" : "Change password"}
        </button>
        {passwordMessage && <p role="status">{passwordMessage}</p>}
      </form>

      <form className={styles.danger} onSubmit={deleteAccount}>
        <div>
          <span>Danger zone</span>
          <h2>Delete account permanently</h2>
          <p>
            This removes all sessions, answers, feedback, and account data. Any
            live recurring subscription is stopped first. This cannot be undone.
          </p>
        </div>
        <label>
          Enter {email} to confirm
          <input
            autoComplete="off"
            name="confirmation"
            required
            type="email"
          />
        </label>
        <button disabled={busy !== null} type="submit">
          {busy === "delete" ? "Deleting…" : "Delete my account"}
        </button>
        {deleteMessage && <p role="alert">{deleteMessage}</p>}
      </form>
    </div>
  );
}
