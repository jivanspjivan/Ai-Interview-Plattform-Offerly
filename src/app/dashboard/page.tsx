import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import styles from "./dashboard.module.css";

export const metadata: Metadata = {
  title: "Dashboard | Offerly",
  description: "Continue your Offerly interview practice.",
};

export default async function DashboardPage() {
  if (!hasSupabaseConfig()) {
    redirect("/login?error=configuration");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const displayName =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : "Candidate";

  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Dashboard navigation">
        <Link className={styles.brand} href="/">
          <span aria-hidden="true">✦</span>
          offerly
        </Link>
        <div>
          <span>{user.email}</span>
          <form action={signOut}>
            <button type="submit">Log out</button>
          </form>
        </div>
      </nav>

      <section className={styles.hero}>
        <p>Your practice dashboard</p>
        <h1>Welcome, {displayName}.</h1>
        <span>
          Your account is ready. Saved sessions and progress insights arrive in
          the next milestone.
        </span>
        <Link href="/interview/new">
          Start a practice session
          <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className={styles.grid} aria-label="Account summary">
        <article>
          <span>Account</span>
          <strong>Active</strong>
          <p>Your authentication session is securely stored in cookies.</p>
        </article>
        <article>
          <span>Recent sessions</span>
          <strong>Coming next</strong>
          <p>Interview history will appear here after database persistence.</p>
        </article>
        <article>
          <span>Progress</span>
          <strong>Coming next</strong>
          <p>Score trends and skill insights will follow saved sessions.</p>
        </article>
      </section>
    </main>
  );
}
