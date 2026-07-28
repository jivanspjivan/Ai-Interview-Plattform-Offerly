import type { Metadata } from "next";
import Link from "next/link";
import { PlansGrid } from "./plans-grid";
import styles from "./plans.module.css";

export const metadata: Metadata = {
  title: "Plans | Offerly",
  description: "Choose an Offerly interview practice plan.",
};

const plans = [
  {
    name: "Basic",
    price: "Free",
    description: "Build a consistent interview practice habit.",
    valueLabel: "Start with the essentials",
    features: [
      "3 practice sessions each month",
      "Answer recording and playback",
      "AI transcription",
      "Basic answer feedback",
    ],
    action: "Start free",
    href: "/register",
  },
  {
    name: "Premium",
    price: "₹199",
    suffix: "/ month",
    description: "Prepare seriously for an active job search.",
    valueLabel: "Best for active job searches",
    features: [
      "Unlimited practice sessions",
      "Full AI coaching and category scores",
      "Session history and saved transcripts",
      "Progress tracking by skill",
      "Priority transcription",
    ],
    action: "Choose Premium",
    href: "/dashboard/billing?plan=premium",
    featured: true,
  },
  {
    name: "Premium Plus",
    price: "₹399",
    suffix: "/ month",
    description: "Get the deepest preparation for high-stakes interviews.",
    valueLabel: "Best for serious preparation",
    features: [
      "Everything in Premium",
      "Job-description-tailored interviews",
      "Advanced progress insights",
      "Company and round-specific practice",
      "Personalized improvement plans",
    ],
    action: "Choose Premium Plus",
    href: "/dashboard/billing?plan=premium_plus",
    plus: true,
  },
];

export default function PlansPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <Link className={styles.brand} href="/">
          <span aria-hidden="true">✦</span>
          offerly
        </Link>
        <div>
          <Link className={styles.loginLink} href="/login">
            Log in
          </Link>
          <Link className={styles.navButton} href="/register">
            Get started
          </Link>
        </div>
      </nav>

      <header className={styles.heading}>
        <p>Simple, focused plans</p>
        <h1>Practice at the level your goals demand.</h1>
        <span>
          Start free and upgrade anytime for deeper feedback and progress
          tracking.
        </span>
      </header>

      <PlansGrid plans={plans} />
    </main>
  );
}
