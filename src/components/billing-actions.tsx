"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PlanTier } from "@/lib/plans";

type RazorpayResult = {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
};

type RazorpayConstructor = new (options: Record<string, unknown>) => {
  open: () => void;
  on: (event: string, callback: (response: { error?: { description?: string } }) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

let checkoutScript: Promise<void> | null = null;

function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  checkoutScript ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay Checkout could not load."));
    document.head.appendChild(script);
  });
  return checkoutScript;
}

export function CheckoutButton({
  plan,
  className,
}: {
  plan: Exclude<PlanTier, "basic">;
  className: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function startCheckout() {
    setStatus("loading");
    setMessage("");
    try {
      await loadCheckout();
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const result = (await response.json()) as {
        error?: string;
        keyId?: string;
        subscriptionId?: string;
        planName?: string;
        email?: string;
        name?: string;
      };
      if (!response.ok || !result.keyId || !result.subscriptionId) {
        throw new Error(result.error ?? "Checkout could not be started.");
      }

      const Razorpay = window.Razorpay;
      if (!Razorpay) throw new Error("Razorpay Checkout is unavailable.");
      const checkout = new Razorpay({
        key: result.keyId,
        subscription_id: result.subscriptionId,
        name: "Offerly",
        description: `${result.planName} monthly subscription`,
        prefill: { email: result.email, name: result.name },
        theme: { color: "#24513b" },
        handler: async (payment: RazorpayResult) => {
          const verifyResponse = await fetch("/api/billing/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payment),
          });
          if (!verifyResponse.ok) {
            setStatus("error");
            setMessage("Payment returned, but verification is still pending.");
            return;
          }
          setStatus("idle");
          setMessage("Payment verified. Your subscription is being activated.");
          router.refresh();
        },
      });
      checkout.on("payment.failed", (failure) => {
        setStatus("error");
        setMessage(failure.error?.description ?? "Payment was not completed.");
      });
      checkout.open();
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Checkout failed.");
    }
  }

  return (
    <div>
      <button
        className={className}
        type="button"
        disabled={status === "loading"}
        onClick={startCheckout}
      >
        {status === "loading" ? "Opening checkout…" : `Choose ${plan === "premium" ? "Premium" : "Premium Plus"}`}
      </button>
      {message && <p role={status === "error" ? "alert" : "status"}>{message}</p>}
    </div>
  );
}

export function CancelSubscriptionButton({ className }: { className: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function cancel() {
    if (!window.confirm("Cancel your subscription at the end of this billing cycle?")) return;
    setIsLoading(true);
    const response = await fetch("/api/billing/cancel", { method: "POST" });
    const result = (await response.json()) as { error?: string };
    setIsLoading(false);
    if (!response.ok) {
      setMessage(result.error ?? "Cancellation failed.");
      return;
    }
    setMessage("Cancellation is scheduled for the end of the billing cycle.");
    router.refresh();
  }

  return (
    <div>
      <button className={className} type="button" disabled={isLoading} onClick={cancel}>
        {isLoading ? "Scheduling…" : "Cancel subscription"}
      </button>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
