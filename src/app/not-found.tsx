import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span className={styles.mark} aria-hidden="true">
          ✦
        </span>
        <p className={styles.eyebrow}>404 · Wrong route</p>
        <h1>This page does not exist.</h1>
        <p className={styles.description}>
          The address may be incorrect or the page may have moved. Choose a
          valid destination below to continue with Offerly.
        </p>
        <nav className={styles.actions} aria-label="Useful destinations">
          <Link href="/interview/new">Set up an interview</Link>
          <Link href="/">Go home</Link>
          <Link href="/plans">View plans</Link>
        </nav>
      </section>
    </main>
  );
}
