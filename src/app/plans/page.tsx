import type { Metadata } from "next";
import Link from "next/link";
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
    price: "₹179",
    suffix: "/ month",
    description: "Prepare seriously for an active job search.",
    features: [
      "Unlimited practice sessions",
      "Full AI coaching and category scores",
      "Session history and saved transcripts",
      "Progress tracking by skill",
      "Priority transcription",
    ],
    action: "Choose Premium",
    href: "/register?plan=premium",
    featured: true,
  },
  {
    name: "Premium Plus",
    price: "₹379",
    suffix: "/ month",
    description: "Get the deepest preparation for high-stakes interviews.",
    features: [
      "Everything in Premium",
      "Job-description-tailored interviews",
      "Advanced progress insights",
      "Company and round-specific practice",
      "Personalized improvement plans",
    ],
    action: "Choose Premium Plus",
    href: "/register?plan=premium-plus",
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
          <Link href="/login">Log in</Link>
          <Link className={styles.navButton} href="/register">
            Get started
          </Link>
        </div>
      </nav>

      <header className={styles.heading}>
        <p>Simple, focused plans</p>
        <h1>Practice at the level your goals demand.</h1>
        <span>
          Start free, then upgrade when you want deeper feedback and progress
          tracking. No payment is collected in this version.
        </span>
      </header>

      <section className={styles.planGrid} aria-label="Offerly plans">
        {plans.map((plan) => (
          <article
            className={`${styles.plan} ${plan.featured ? styles.featured : ""}`}
            key={plan.name}
          >
            {plan.featured && <span className={styles.popular}>Most popular</span>}
            <p>{plan.name}</p>
            <div className={styles.price}>
              <strong>{plan.price}</strong>
              {plan.suffix && <span>{plan.suffix}</span>}
            </div>
            <p className={styles.description}>{plan.description}</p>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <Link href={plan.href}>{plan.action}</Link>
          </article>
        ))}
      </section>
    </main>
  );
}
