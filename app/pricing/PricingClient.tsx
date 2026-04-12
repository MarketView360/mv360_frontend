"use client";

import React, { useState, useEffect } from "react";
import { Check, X, Crown, Shield, Loader2, Bell, CreditCard, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { waitlistApi } from "@/lib/api/waitlist";
import { toast } from "sonner";
import { WaitlistDialog, WaitlistFormData } from "./components/WaitlistDialog";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSubscriptionCheckout } from "@/lib/hooks/usePaymentStatus";

type BillingPeriod = "monthly" | "annually";

// Feature flag values: "enabled" | "disabled-coming-soon" | "disabled-paused"
type PaymentStatus = "enabled" | "disabled-coming-soon" | "disabled-paused" | null;

interface PricingPlan {
  name: string;
  tier: "free" | "premium" | "max";
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

interface PricingClientProps {
  plans: PricingPlan[];
}

export function PricingClient({ plans }: PricingClientProps) {
  const router = useRouter();
  const posthog = usePostHog();
  const { session, user } = useAuth();
  const { initiateCheckout, isProcessing, error: checkoutError } = useSubscriptionCheckout();
  
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(null);

  // Get feature flag for payment status
  useEffect(() => {
    if (posthog) {
      const flagValue = posthog.getFeatureFlag("premium-payment-status");
      setPaymentStatus((flagValue as PaymentStatus) || "disabled-coming-soon");
    }
  }, [posthog]);

  const handlePlanAction = async (tier: string) => {
    // Free tier - just redirect to signup/dashboard
    if (tier === "free") {
      if (session) {
        router.push("/dashboard");
      } else {
        router.push("/auth/signup");
      }
      return;
    }

    // Check payment status from feature flag
    if (paymentStatus !== "enabled") {
      // Show waitlist for coming soon or paused states
      setSelectedTier(tier);
      setIsWaitlistOpen(true);
      return;
    }

    // Payment is enabled - initiate checkout
    if (!session || !user) {
      toast.error("Please sign in to continue", {
        description: "You need an account to subscribe to a plan.",
        action: {
          label: "Sign In",
          onClick: () => router.push("/auth/login?redirect=/pricing"),
        },
      });
      return;
    }

    const success = await initiateCheckout(
      tier as "premium" | "max",
      billingPeriod === "monthly" ? "monthly" : "annual",
      user.email || "",
      user.user_metadata?.display_name || user.email?.split("@")[0] || "User",
    );

    if (success) {
      toast.success("🎉 Welcome to Premium!", {
        description: "Your subscription is now active.",
      });
      router.push("/settings/billing");
    }
  };

  const handleJoinWaitlist = (tier: string) => {
    setSelectedTier(tier);
    setIsWaitlistOpen(true);
  };

  const handleWaitlistSubmit = async (data: WaitlistFormData) => {
    setIsSubmitting(true);
    try {
      await waitlistApi.joinAnonymous({
        email: data.email,
        name: data.name,
        phone: data.phone,
        country: data.country,
      });
      toast.success("You're on the waitlist!", {
        description: `We'll notify you at ${data.email} when ${selectedTier} is available.`,
      });
      setIsWaitlistOpen(false);
    } catch (error) {
      toast.error("Something went wrong", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show checkout error if any
  useEffect(() => {
    if (checkoutError) {
      toast.error("Payment failed", { description: checkoutError });
    }
  }, [checkoutError]);

  const getPrice = (plan: PricingPlan) => {
    return billingPeriod === "monthly" ? plan.monthlyPrice : plan.annualPrice;
  };

  const getSavings = (plan: PricingPlan) => {
    if (billingPeriod === "annually" && plan.monthlyPrice > 0) {
      const monthlyCost = plan.monthlyPrice * 12;
      const annualCost = plan.annualPrice;
      const savings = monthlyCost - annualCost;
      return Math.round((savings / monthlyCost) * 100);
    }
    return 0;
  };

  return (
    <>
      {/* Maintenance Mode Banner */}
      {paymentStatus === "disabled-paused" && (
        <div className="mb-8 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                Payments Temporarily Paused
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                We're performing maintenance on our payment system. New subscriptions will be available again shortly.
                Join the waitlist to be notified when payments are re-enabled.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <span className={`text-sm font-medium transition-colors ${billingPeriod === "monthly" ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
          Monthly
        </span>
        <button
          onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "annually" : "monthly")}
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          role="switch"
          aria-checked={billingPeriod === "annually"}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${billingPeriod === "annually" ? "translate-x-6" : "translate-x-1"}`} />
        </button>
        <span className={`text-sm font-medium transition-colors ${billingPeriod === "annually" ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
          Annually
          <span className="ml-2 inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
            Save up to 20%
          </span>
        </span>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const price = getPrice(plan);
          const savings = getSavings(plan);
          const isPremium = plan.tier === "premium";
          const isMax = plan.tier === "max";

          return (
            <div
              key={plan.tier}
              className={`relative rounded-2xl border ${plan.highlighted ? "border-blue-500 shadow-xl shadow-blue-500/10" : "border-slate-200 dark:border-slate-800"} bg-white dark:bg-slate-900 p-8 ${plan.highlighted ? "md:-mt-4 md:scale-105" : ""}`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white">
                    {plan.tier === "premium" && <Crown className="h-3 w-3" />}
                    {plan.tier === "max" && <Shield className="h-3 w-3" />}
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{plan.description}</p>

                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-slate-900 dark:text-white">
                    ${price}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    /{billingPeriod === "monthly" ? "mo" : "yr"}
                  </span>
                </div>

                {savings > 0 && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    Save {savings}% with annual billing
                  </p>
                )}
              </div>

              <button
                onClick={() => handlePlanAction(plan.tier)}
                disabled={isSubmitting || isProcessing}
                className={`w-full rounded-lg py-3 px-4 font-medium transition-colors mb-6 ${
                  plan.highlighted
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
                } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {isSubmitting || isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : paymentStatus === "enabled" && (isPremium || isMax) ? (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Subscribe Now
                  </>
                ) : paymentStatus === "disabled-paused" && (isPremium || isMax) ? (
                  <>
                    <Clock className="h-4 w-4" />
                    Temporarily Unavailable
                  </>
                ) : isPremium || isMax ? (
                  <>
                    <Bell className="h-4 w-4" />
                    Join Waitlist
                  </>
                ) : (
                  "Get Started"
                )}
              </button>

              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <WaitlistDialog
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
        onSubmit={handleWaitlistSubmit}
      />
    </>
  );
}
