import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { planCatalog, type PlanTier } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import {
  CancelSubscriptionButton,
  ChangePlanButton,
  CheckoutButton,
} from "@/components/billing-actions";
import styles from "./billing.module.css";

export const metadata: Metadata = {
  title: "Billing | Offerly",
  description: "Manage your Offerly plan and usage.",
};

export default async function BillingPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const [{ data: subscription }, { count: sessionCount }, { count: feedbackCount }] =
    await Promise.all([
      supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("interview_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", monthStart.toISOString()),
      supabase
        .from("interview_feedback")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", monthStart.toISOString()),
    ]);
  const isPaidActive = subscription?.status === "active";
  const tier: PlanTier = isPaidActive ? subscription.plan_tier : "basic";
  const currentPlan = planCatalog[tier];

  return (
    <section className={styles.section}>
      <header>
        <p>Plan and billing</p>
        <h1>Choose the support your preparation needs.</h1>
        <span>
          Manage your current plan, monthly usage, and Razorpay subscription.
        </span>
      </header>

      <div className={styles.currentPlan}>
        <div>
          <span>Current plan</span>
          <strong>{currentPlan.name}</strong>
          <p>
            {tier === "basic"
              ? "Free access with monthly practice limits."
              : `₹${currentPlan.price} per month · ${subscription?.status}`}
          </p>
        </div>
        {subscription?.current_period_end && (
          <div>
            <span>Current period ends</span>
            <strong>
              {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
                new Date(subscription.current_period_end),
              )}
            </strong>
          </div>
        )}
        {subscription?.scheduled_plan_tier && (
          <div>
            <span>Pending plan change</span>
            <strong>{planCatalog[subscription.scheduled_plan_tier].name}</strong>
            <p>
              {subscription.scheduled_change_at
                ? `Expected ${new Intl.DateTimeFormat("en-IN", {
                    dateStyle: "medium",
                  }).format(new Date(subscription.scheduled_change_at))}`
                : "Waiting for Razorpay confirmation"}
            </p>
          </div>
        )}
        {subscription?.cancel_at_period_end && (
          <div>
            <span>Cancellation scheduled</span>
            <strong>Access continues until period end</strong>
          </div>
        )}
        {isPaidActive && !subscription.cancel_at_period_end && (
          <CancelSubscriptionButton className={styles.cancelButton} />
        )}
      </div>

      <div className={styles.usageGrid}>
        <article>
          <span>Practice sessions this month</span>
          <strong>
            {sessionCount ?? 0}
            {currentPlan.monthlySessionLimit
              ? ` / ${currentPlan.monthlySessionLimit}`
              : ""}
          </strong>
        </article>
        <article>
          <span>AI feedback reports this month</span>
          <strong>
            {feedbackCount ?? 0}
            {currentPlan.monthlyFeedbackLimit
              ? ` / ${currentPlan.monthlyFeedbackLimit}`
              : ""}
          </strong>
        </article>
      </div>

      <div className={styles.planGrid}>
        {(["premium", "premium_plus"] as const).map((plan) => {
          const item = planCatalog[plan];
          return (
            <article key={plan}>
              <span>{item.name}</span>
              <strong>₹{item.price}<small>/month</small></strong>
              <ul>
                <li>Unlimited practice sessions</li>
                <li>Unlimited structured AI feedback</li>
                <li>Saved history and progress insights</li>
                {plan === "premium_plus" && (
                  <li>Advanced preparation features as they launch</li>
                )}
              </ul>
              {tier === plan ? (
                <p className={styles.activeLabel}>Current plan</p>
              ) : subscription?.scheduled_plan_tier === plan ? (
                <p className={styles.activeLabel}>Change scheduled</p>
              ) : isPaidActive ? (
                subscription.cancel_at_period_end ||
                subscription.scheduled_plan_tier ? (
                  <p className={styles.unavailableLabel}>
                    Resolve the pending billing change first
                  </p>
                ) : (
                  <ChangePlanButton
                    className={styles.checkoutButton}
                    currentPlan={tier as Exclude<PlanTier, "basic">}
                    nextPlan={plan}
                  />
                )
              ) : (
                <CheckoutButton className={styles.checkoutButton} plan={plan} />
              )}
            </article>
          );
        })}
      </div>

      <p className={styles.billingNote}>
        Payments are processed by Razorpay. Plan changes become active only
        after server-side signature verification and subscription webhooks.
      </p>
    </section>
  );
}
