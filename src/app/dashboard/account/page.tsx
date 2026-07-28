import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import styles from "../dashboard.module.css";

export const metadata: Metadata = {
  title: "Account | Offerly",
  description: "Review your Offerly account details.",
};

export default async function AccountPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  const displayName =
    profile?.full_name ??
    (typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : "Not provided");
  const provider =
    typeof user.app_metadata.provider === "string"
      ? user.app_metadata.provider
      : "email";

  return (
    <section className={styles.accountPage}>
      <div className={styles.accountHeading}>
        <p>Account settings</p>
        <h1>Your Offerly profile</h1>
        <span>
          Review the identity attached to your practice history and coaching
          data.
        </span>
      </div>

      <div className={styles.accountGrid}>
        <article>
          <span>Full name</span>
          <strong>{displayName}</strong>
        </article>
        <article>
          <span>Email address</span>
          <strong>{user.email}</strong>
        </article>
        <article>
          <span>Sign-in method</span>
          <strong>{provider === "google" ? "Google" : "Email and password"}</strong>
        </article>
        <article>
          <span>Account created</span>
          <strong>
            {new Intl.DateTimeFormat("en-IN", {
              dateStyle: "medium",
            }).format(new Date(user.created_at))}
          </strong>
        </article>
      </div>

      <div className={styles.settingsNotice}>
        <div>
          <strong>Your profile is connected to the Offerly database.</strong>
          <p>
            Editing profile fields and persistent interview preferences can be
            added as the account experience expands.
          </p>
        </div>
        <Link href="/dashboard">Back to overview</Link>
      </div>
    </section>
  );
}
