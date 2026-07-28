import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./legal-page.module.css";

export function LegalPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Legal navigation">
        <Link className={styles.brand} href="/">
          <span aria-hidden="true">✦</span>
          offerly
        </Link>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/refund-policy">Refunds</Link>
          <Link href="/support">Support</Link>
        </div>
      </nav>

      <article className={styles.document}>
        <header>
          <p>{eyebrow}</p>
          <h1>{title}</h1>
          <span>{description}</span>
          <small>Effective July 28, 2026 · Last updated July 28, 2026</small>
        </header>
        <div className={styles.content}>{children}</div>
      </article>

      <footer className={styles.footer}>
        <span>© 2026 Offerly. All rights reserved.</span>
        <Link href="/">Return home</Link>
      </footer>
    </main>
  );
}
