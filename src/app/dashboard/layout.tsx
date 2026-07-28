import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { signOut } from "./actions";
import styles from "./dashboard.module.css";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();

  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Dashboard navigation">
        <Link className={styles.brand} href="/">
          <span aria-hidden="true">✦</span>
          offerly
        </Link>
        <div className={styles.navLinks}>
          <Link href="/dashboard">Overview</Link>
          <Link href="/dashboard/history">History</Link>
          <Link href="/dashboard/progress">Progress</Link>
          <Link href="/dashboard/account">Account</Link>
        </div>
        <div className={styles.accountActions}>
          <span>{user.email}</span>
          <form action={signOut}>
            <button type="submit">Log out</button>
          </form>
        </div>
      </nav>
      {children}
    </main>
  );
}
