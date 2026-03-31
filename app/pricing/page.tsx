"use client";

import React, { useState, useEffect } from "react";
import {
    Check,
    X,
    Lock,
    Crown,
    Shield,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    LucideIcon,
    Loader2,
    Bell,
} from "lucide-react";
import { waitlistApi } from "@/lib/api/waitlist";
import { toast } from "sonner";
import { WaitlistDialog, WaitlistFormData } from "./components/WaitlistDialog";

type BillingPeriod = "monthly" | "annually";

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

const plans: PricingPlan[] = [
    {
        name: "Free Plan",
        tier: "free",
        monthlyPrice: 0,
        annualPrice: 0,
        description: "Marketview 360 Features",
        features: [
            "Unlimited stock lookup (US stocks – beta)",
            "Basic charts & indicators",
            "Financials: Annual data only",
            "Up to 2 static watchlists (manual add/remove)",
            "Up to 10 stocks total across watchlists",
            "Up to 10 years historical price data",
            "Basic query builder (single-condition filters only)",
            "Read-only access to community (view posts & discussions)",
        ],
    },
    {
        name: "Premium",
        tier: "premium",
        monthlyPrice: 9.90,
        annualPrice: 99.00,
        description: "MarketView 360 Premium Features",
        highlighted: true,
        badge: "Most Popular",
        features: [
            "Unlimited stock analysis",
            "Unlimited watchlists",
            "Smart watchlists: Change highlights",
            "Smart watchlists: Alerts (price / metric-based)",
            "Advanced charts & indicators",
            "Financials: Quarterly + Annual data access",
            "Multi-stock comparison (5–20 stocks)",
            "Sector & peer benchmarking",
            "Advanced query builder (multi-condition)",
            "Save screeners & views",
            "Export to CSV / Excel",
            "Full community access: Post insights",
            "Full community access: Comment",
            "Full community access: Follow users",
            "AI summarisation (Jovan Ai Beta)",
        ],
    },
    {
        name: "Max",
        tier: "max",
        monthlyPrice: 49.99,
        annualPrice: 499.99,
        description: "For professional traders & analysts",
        badge: "Best Value",
        features: [
            "Everything in Premium, plus:",
            "Real-time data (true real-time)",
            "Pre-market & after-hours data",
            "Unlimited AI questions",
            "Voice input for AI",
            "Document upload for AI analysis",
            "Advanced pattern recognition",
            "Institutional metrics",
            "Options chain data",
            "Insider trading alerts",
            "Unlimited portfolios",
            "Advanced portfolio analytics",
            "API access (10,000 calls/month)",
            "Custom dashboards",
            "SMS alerts",
            "White-label reports",
            "Premium support (1-hour response)",
        ],
    },
];

const comparisonFeatures = [
    {
        category: "Stock Lookup & Core Analysis",
        features: [
            { name: "US stock lookup (beta)", free: "Unlimited", pro: "Unlimited", elite: "Unlimited" },
            { name: "Stock analysis depth", free: "Basic", pro: "Advanced", elite: "Advanced" },
            { name: "Charts", free: "Basic", pro: "Advanced", elite: "Advanced" },
            { name: "Indicators", free: "Basic", pro: "Advanced", elite: "Advanced" },
            { name: "Historical price data", free: "Up to 10 years", pro: "Up to 10+ years (same, premium tools unlocked)", elite: "Up to 10+ years" },
            { name: "Data refresh priority", free: "Standard", pro: "Faster / priority refresh", elite: "Real-time" },
        ],
    },
    {
        category: "Financial Statements",
        features: [
            { name: "Financials access", free: "Annual only", pro: "Quarterly + Annual", elite: "Quarterly + Annual" },
            { name: "Fundamental insight views (derived metrics)", free: "Limited", pro: "Full / expanded", elite: "Full / expanded" },
        ],
    },
    {
        category: "Screening & Query Builder",
        features: [
            { name: "Query builder", free: "Basic (single-condition)", pro: "Advanced (multi-condition)", elite: "Advanced (multi-condition)" },
            { name: "Saved screeners / saved views", free: false, pro: true, elite: true },
            { name: "Screener results export", free: false, pro: "CSV / Excel", elite: "CSV / Excel / API" },
        ],
    },
    {
        category: "Watchlists & Alerts",
        features: [
            { name: "Watchlists", free: "Up to 2 static watchlists", pro: "Unlimited watchlists", elite: "Unlimited watchlists" },
            { name: "Total stocks in watchlists", free: "Up to 10 total", pro: "Unlimited", elite: "Unlimited" },
            { name: "Smart watchlist change highlights", free: false, pro: true, elite: true },
            { name: "Alerts (price / metric based)", free: false, pro: true, elite: true },
        ],
    },
    {
        category: "Comparison & Benchmarking",
        features: [
            { name: "Multi-stock comparison", free: "Limited / basic", pro: "5–20 stocks", elite: "Unlimited stocks" },
            { name: "Sector benchmarking", free: false, pro: true, elite: true },
            { name: "Peer benchmarking", free: false, pro: true, elite: true },
        ],
    },
    {
        category: "Community",
        features: [
            { name: "View community posts & discussions", free: "Read-only", pro: "Full access", elite: "Full access" },
            { name: "Post insights", free: false, pro: true, elite: true },
            { name: "Comment", free: false, pro: true, elite: true },
            { name: "Follow users", free: false, pro: true, elite: true },
        ],
    },
    {
        category: "AI (Jovan AI Beta)",
        features: [
            { name: "AI summarisation", free: false, pro: "Yes (Coming soon)", elite: "Yes (Coming soon)" },
            { name: "AI use cases", free: "-", pro: "Summarise stock analysis / comparisons / screeners (Coming Soon)", elite: "Summarise stock analysis / comparisons / screeners (Coming Soon)" },
        ],
    },
];

const faqs = [
    {
        question: "Do I need a credit card for the free tier?",
        answer: "No, the free tier is completely free forever. No credit card required to sign up or use the basic features.",
    },
    {
        question: "Can I cancel my subscription anytime?",
        answer: "Yes, you can cancel your subscription at any time. No questions asked, no cancellation fees.",
    },
    {
        question: "What happens to my data if I downgrade?",
        answer: "Your data is preserved when you downgrade. Some features become read-only, but you won't lose any saved screeners, watchlists, or history.",
    },
    {
        question: "Is there a discount for annual billing?",
        answer: "Yes! Save 17% with annual billing - that's essentially 2 months free compared to monthly billing.",
    },
    {
        question: "Do you offer refunds?",
        answer: "Yes, we offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, contact us for a full refund.",
    },
    {
        question: "Can I upgrade or downgrade my plan?",
        answer: "Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the end of your billing cycle. Billing is prorated.",
    },
    {
        question: "Is my payment information secure?",
        answer: "Absolutely. We use Stripe for secure payment processing. We never store your card details on our servers.",
    },
    {
        question: "Do you offer student or nonprofit discounts?",
        answer: "Yes! Contact us at support@marketview360.io with proof of eligibility for special pricing.",
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, debit cards, and PayPal through our secure Stripe integration.",
    },
    {
        question: "Can I get a custom plan for my team?",
        answer: "Yes, we offer enterprise pricing for teams of 5+ users. Contact us for a custom quote.",
    },
];

export default function PricingPage() {
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
    const [showAllFeatures, setShowAllFeatures] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [userSubscription, setUserSubscription] = useState<{ tier: string } | null>(null);

    const isAnnual = billingPeriod === "annually";
    const savingsPercent = 17;

    // Fetch user subscription on mount
    useEffect(() => {
        async function fetchSubscription() {
            try {
                const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
                const response = await fetch(`${BACKEND_URL}/api/profile/subscription`, {
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserSubscription(data);
                }
            } catch (error) {
                // User not logged in or error fetching subscription - that's fine
                console.debug("Could not fetch subscription:", error);
            }
        }

        fetchSubscription();
    }, []);

    const getPrice = (plan: PricingPlan) => {
        if (plan.tier === "free") return "$0";
        if (isAnnual) {
            const monthlyEquivalent = plan.annualPrice / 12;
            return `$${monthlyEquivalent.toFixed(2)}`;
        }
        return `$${plan.monthlyPrice.toFixed(2)}`;
    };

    return (
        <div className="min-h-full bg-slate-50 dark:bg-slate-950">
            {/* Hero — compact header with billing toggle */}
            <section className="pt-6 pb-5 md:pt-8 md:pb-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="mx-auto max-w-5xl px-4 text-center">
                    <h1 className="text-2xl md:text-3xl font-bold font-heading text-slate-900 dark:text-white mb-1">
                        Choose Your Plan
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Start free, upgrade anytime. No credit card required.
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <button
                            onClick={() => setBillingPeriod("monthly")}
                            className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${!isAnnual
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingPeriod("annually")}
                            className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${isAnnual
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"
                                }`}
                        >
                            Annually
                            <span
                                className="px-1.5 py-0.5 text-[10px] font-bold rounded-full text-white"
                                style={{ backgroundColor: '#16a34a' }}
                            >
                                -{savingsPercent}%
                            </span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-8 md:py-10">
                <div className="mx-auto max-w-5xl px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 items-start">
                        {plans.map((plan) => (
                            <PricingCard
                                key={plan.tier}
                                plan={plan}
                                price={getPrice(plan)}
                                isAnnual={isAnnual}
                                userSubscription={userSubscription}
                            />
                        ))}
                    </div>

                    {/* Trust signals inline */}
                    <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                        <TrustSignal icon={Shield} text="30-Day Money-Back" />
                        <TrustSignal icon={RefreshCw} text="Cancel Anytime" />
                        <TrustSignal icon={Lock} text="Secure via Stripe" />
                    </div>
                </div>
            </section>

            {/* Feature Comparison */}
            <section className="py-8 md:py-10 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
                <div className="mx-auto max-w-5xl px-4">
                    <h2 className="text-xl md:text-2xl font-bold font-heading text-slate-900 dark:text-white mb-6">
                        Compare Plans
                    </h2>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                        <table className="w-full min-w-[640px]">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/80">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[40%]">
                                        Feature
                                    </th>
                                    <th className="text-center py-3 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Free
                                    </th>
                                    <th className="text-center py-3 px-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#f59e0b' }}>
                                        Premium
                                    </th>
                                    <th className="text-center py-3 px-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#8b5cf6' }}>
                                        Max
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonFeatures
                                    .slice(0, showAllFeatures ? undefined : 4)
                                    .map((category) => (
                                        <React.Fragment key={category.category}>
                                            <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                                                <td
                                                    colSpan={4}
                                                    className="py-2 px-4 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider"
                                                >
                                                    {category.category}
                                                </td>
                                            </tr>
                                            {category.features.map((feature) => (
                                                <tr
                                                    key={feature.name}
                                                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                                                >
                                                    <td className="py-2.5 px-4 text-sm text-slate-600 dark:text-slate-300">
                                                        {feature.name}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center">
                                                        <FeatureValue value={feature.free} />
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center">
                                                        <FeatureValue value={feature.pro} />
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center">
                                                        <FeatureValue value={(feature as any).elite} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Show All / Show Less button below the table */}
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => setShowAllFeatures(!showAllFeatures)}
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                            style={{ backgroundColor: '#0087f6' }}
                        >
                            {showAllFeatures ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            {showAllFeatures ? "Show Less" : `Show All ${comparisonFeatures.length} Categories`}
                        </button>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-8 md:py-10">
                <div className="mx-auto max-w-3xl px-4">
                    <h2 className="text-xl md:text-2xl font-bold font-heading text-slate-900 dark:text-white text-center mb-5">
                        FAQ
                    </h2>

                    <div className="space-y-2">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700/80 overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                                >
                                    <span className="text-sm font-medium text-slate-900 dark:text-white pr-4">
                                        {faq.question}
                                    </span>
                                    <ChevronDown
                                        className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${openFaq === index ? "rotate-180" : ""}`}
                                    />
                                </button>
                                {openFaq === index && (
                                    <div className="px-4 pb-3 text-sm text-slate-500 dark:text-slate-400">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

// Pricing Card Component
const TIER_COLORS: Record<string, { accent: string; bg: string; badge: string }> = {
    free: { accent: '#64748b', bg: 'transparent', badge: '' },
    premium: { accent: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b, #d97706)', badge: '#f59e0b' },
    max: { accent: '#8b5cf6', bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', badge: '#8b5cf6' },
};

function PricingCard({
    plan,
    price,
    isAnnual,
    userSubscription,
}: {
    plan: PricingPlan;
    price: string;
    isAnnual: boolean;
    userSubscription: { tier: string } | null;
}) {
    const isPremium = plan.tier === "premium";
    const isMax = plan.tier === "max";
    const isFree = plan.tier === "free";
    const isCurrentPlan = userSubscription?.tier === plan.tier;
    const colors = TIER_COLORS[plan.tier];

    // Waitlist state for premium plan
    const [waitlistLoading, setWaitlistLoading] = useState(false);
    const [inWaitlist, setInWaitlist] = useState(false);
    const [waitlistChecked, setWaitlistChecked] = useState(false);
    const [showWaitlistDialog, setShowWaitlistDialog] = useState(false);
    
    // User is logged in if we have subscription data (even if it's free tier)
    const isLoggedIn = userSubscription !== null;

    // Check waitlist status on mount for premium plan ONLY if logged in
    useEffect(() => {
        if (isPremium && isLoggedIn) {
            checkWaitlistStatus();
        } else if (isPremium && !isLoggedIn) {
            // Not logged in, mark as checked so UI renders
            setWaitlistChecked(true);
        }
    }, [isPremium, isLoggedIn]);

    const checkWaitlistStatus = async () => {
        try {
            const status = await waitlistApi.checkStatus();
            setInWaitlist(status.inWaitlist);
            setWaitlistChecked(true);
        } catch (error) {
            // Error checking status - default to not in waitlist
            console.error("Error checking waitlist status:", error);
            setInWaitlist(false);
            setWaitlistChecked(true);
        }
    };

    const handleJoinWaitlist = async () => {
        // If not logged in, show dialog
        if (!isLoggedIn) {
            setShowWaitlistDialog(true);
            return;
        }

        // If logged in, join directly
        setWaitlistLoading(true);
        try {
            const result = await waitlistApi.joinPremium();
            
            if (result.success) {
                setInWaitlist(true);
                if (result.alreadyInList) {
                    toast.info("Already on Waitlist", {
                        description: "You're already on the premium waitlist. We'll notify you when it's ready!",
                    });
                } else {
                    toast.success("Joined Waitlist!", {
                        description: "Check your email for confirmation. We'll notify you when Premium launches!",
                    });
                }
            }
        } catch (error) {
            console.error("Error joining waitlist:", error);
            toast.error("Failed to Join Waitlist", {
                description: error instanceof Error ? error.message : "Please try again or contact support.",
            });
        } finally {
            setWaitlistLoading(false);
        }
    };

    const handleAnonymousWaitlistSubmit = async (data: WaitlistFormData) => {
        try {
            const result = await waitlistApi.joinAnonymous(data);
            
            if (result.success) {
                setInWaitlist(true);
                toast.success("Joined Waitlist!", {
                    description: "Check your email for confirmation. We'll notify you when Premium launches!",
                });
            }
        } catch (error) {
            console.error("Error joining waitlist:", error);
            toast.error("Failed to Join Waitlist", {
                description: error instanceof Error ? error.message : "Please try again or contact support.",
            });
            throw error; // Re-throw to keep dialog open
        }
    };

    return (
        <div
            className={`relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden transition-all`}
            style={plan.highlighted ? { boxShadow: `0 0 0 1px ${colors.accent}50, 0 8px 30px -6px ${colors.accent}60` } : undefined}
        >
            {/* Top accent bar */}
            {plan.highlighted && (
                <div className="h-1" style={{ background: colors.bg }} />
            )}

            <div className="p-5">
                {/* Badge */}
                {plan.badge && (
                    <div className="mb-3">
                        <span
                            className="px-3 py-1 rounded-full text-[11px] font-bold text-white"
                            style={{ backgroundColor: colors.badge || '#64748b' }}
                        >
                            {plan.badge}
                        </span>
                    </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                    <div className="mb-3">
                        <span
                            className="px-3 py-1 rounded-full text-[11px] font-bold text-white"
                            style={{ backgroundColor: '#0087f6' }}
                        >
                            Current Plan
                        </span>
                    </div>
                )}

                {/* Plan name */}
                <div className="flex items-center gap-2 mb-3">
                    {isPremium && <Lock className="w-4 h-4" style={{ color: colors.accent }} />}
                    {isMax && <Crown className="w-4 h-4" style={{ color: colors.accent }} />}
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        {plan.name}
                    </h3>
                </div>

                {/* Price */}
                <div className="mb-1">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">
                        {price}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">/mo</span>
                    {isAnnual && !isFree && (
                        <span className="ml-2 text-sm text-slate-400 dark:text-slate-500 line-through">
                            ${plan.monthlyPrice.toFixed(2)}
                        </span>
                    )}
                </div>

                {/* Annual savings */}
                {isAnnual && !isFree && (
                    <p className="text-xs font-semibold mt-1 mb-3" style={{ color: '#16a34a' }}>
                        Save ${((plan.monthlyPrice * 12) - plan.annualPrice).toFixed(0)}/yr &middot; Billed ${plan.annualPrice.toFixed(0)}/yr
                    </p>
                )}

                {/* Description */}
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    {plan.description}
                </p>

                {/* CTA */}
                {isCurrentPlan ? (
                    // Current plan badge
                    <button
                        disabled
                        className="w-full py-2.5 rounded-lg text-sm font-semibold border-2 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 cursor-default"
                        style={{ borderColor: colors.accent }}
                    >
                        Current Plan
                    </button>
                ) : isFree ? (
                    <button
                        className="w-full py-2.5 rounded-lg text-sm font-semibold border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        Get Started Free
                    </button>
                ) : isPremium ? (
                    // Premium plan: Show waitlist button or upgrade
                    <>
                        {inWaitlist ? (
                            <button
                                disabled
                                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2"
                                style={{ background: colors.bg, opacity: 0.8 }}
                            >
                                <Bell className="w-4 h-4" />
                                On Waitlist
                            </button>
                        ) : (
                            <button
                                onClick={handleJoinWaitlist}
                                disabled={waitlistLoading}
                                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                style={{ background: colors.bg }}
                            >
                                {waitlistLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Joining...
                                    </>
                                ) : (
                                    <>
                                        <Bell className="w-4 h-4" />
                                        Join Waitlist
                                    </>
                                )}
                            </button>
                        )}
                        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                            {inWaitlist 
                                ? "We'll notify you when Premium launches!"
                                : "Be the first to know when we launch"}
                        </p>
                    </>
                ) : (
                    // Max plan: Coming soon
                    <>
                        <button
                            disabled
                            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white opacity-60 cursor-not-allowed"
                            style={{ background: colors.bg }}
                        >
                            Subscribe Now
                        </button>
                        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                            Coming soon
                        </p>
                    </>
                )}

                {/* Divider */}
                <div className="border-t border-slate-100 dark:border-slate-700 mt-4 mb-4" />

                {/* Features */}
                <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                        <li
                            key={i}
                            className="flex items-start gap-2 text-[13px] text-slate-600 dark:text-slate-300"
                        >
                            <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#16a34a' }} />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Waitlist Dialog for Anonymous Users */}
            {isPremium && (
                <WaitlistDialog
                    isOpen={showWaitlistDialog}
                    onClose={() => setShowWaitlistDialog(false)}
                    onSubmit={handleAnonymousWaitlistSubmit}
                />
            )}
        </div>
    );
}

// Feature Value Component
function FeatureValue({ value }: { value: boolean | string }) {
    if (typeof value === "boolean") {
        return value ? (
            <Check className="w-4 h-4 mx-auto" style={{ color: '#16a34a' }} />
        ) : (
            <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
        );
    }
    return (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{value}</span>
    );
}

// Trust Signal Component
function TrustSignal({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
    return (
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Icon className="w-4 h-4" style={{ color: '#16a34a' }} />
            <span className="text-xs font-medium">{text}</span>
        </div>
    );
}
