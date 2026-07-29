import Link from "next/link";
import { DashboardNavLinks } from "@/components/dashboard-nav-links";
import { isAdminEmail, requireUser } from "@/lib/auth";
import { signOut } from "./actions";
import styles from "./dashboard.module.css";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  const fullName =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "";
  const firstName = fullName.split(/\s+/)[0] || "Candidate";
  const initials = fullName
    ? fullName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()
    : (user.email?.[0] ?? "C").toUpperCase();

  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Dashboard navigation">
        <Link className={styles.brand} href="/">
          <span aria-hidden="true">✦</span>
          offerly
        </Link>
        <DashboardNavLinks isAdmin={isAdminEmail(user.email)} />
        <div className={styles.accountActions}>
          <details className={styles.profileMenu}>
            <summary>
              <span className={styles.avatar}>{initials}</span>
              <span>{firstName}</span>
              <span aria-hidden="true">⌄</span>
            </summary>
            <div>
              <Link href="/dashboard/account">Account settings</Link>
              <form action={signOut}>
                <button type="submit">Log out</button>
              </form>
            </div>
          </details>
        </div>
      </nav>
      {children}
    </main>
  );
}
