"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./plans.module.css";

type Plan = {
  name: string;
  price: string;
  suffix?: string;
  description: string;
  valueLabel: string;
  features: string[];
  action: string;
  href: string;
  featured?: boolean;
  plus?: boolean;
};

export function PlansGrid({ plans }: { plans: Plan[] }) {
  const [selectedPlan, setSelectedPlan] = useState("Premium");

  return (
    <section
      className={styles.planGrid}
      aria-label="Offerly plans"
      role="radiogroup"
    >
      {plans.map((plan) => {
        const isSelected = selectedPlan === plan.name;

        return (
          <article
            className={`${styles.plan} ${plan.featured ? styles.featured : ""} ${
              plan.plus ? styles.premiumPlus : ""
            } ${isSelected ? styles.selected : ""}`}
            key={plan.name}
            role="radio"
            aria-checked={isSelected}
            tabIndex={0}
            onClick={() => setSelectedPlan(plan.name)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedPlan(plan.name);
              }
            }}
          >
            {plan.featured && (
              <span className={styles.popular}>Most popular</span>
            )}
            {isSelected && (
              <span className={styles.selectedLabel}>Selected</span>
            )}
            <p>{plan.name}</p>
            <div className={styles.price}>
              <strong>{plan.price}</strong>
              {plan.suffix && <span>{plan.suffix}</span>}
            </div>
            <span className={styles.valueLabel}>{plan.valueLabel}</span>
            <p className={styles.description}>{plan.description}</p>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <Link href={plan.href} onClick={(event) => event.stopPropagation()}>
              <span>{plan.action}</span>
              {plan.featured && (
                <span className={styles.actionArrow} aria-hidden="true">
                  →
                </span>
              )}
            </Link>
          </article>
        );
      })}
    </section>
  );
}
