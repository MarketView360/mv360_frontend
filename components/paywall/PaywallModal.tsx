"use client";

import { useEffect, useCallback } from "react";
import { X, Check, Lock, Crown, Sparkles } from "lucide-react";
import Link from "next/link";
import { TierType } from "./PaywallOverlay";

interface PricingPlan {
    name: string;
    tier: "free" | "pro" | "elite";
    price: string;
    period: string;
    description: string;
    features: string[];
    highlighted?: boolean;
    badge?: string;
}

const plans: PricingPlan[] = [
    {
        name: "Free Forever",
        tier: "free",
        price: "$0",
        period: "/month",
        description: "Perfect for getting started",
        features: [
            "Basic stock screener (10 filters)",
            "View up to 100 results",
            "15-min delayed quotes",
            "Basic charts (3 timeframes)",
            "7 days of news",
            "3 watchlists (25 stocks each)",
            "5 AI questions per day",
        ],
    },
    {
        name: "Professional",
        tier: "pro",
        price: "$19.99",
        period: "/month",
        description: "For serious individual investors",
        highlighted: true,
        badge: "Most Popular",
        features: [
            "Everything in Free, plus:",
            "Advanced screener (unlimited filters)",
            "Unlimited results",
            "All chart timeframes & indicators",
            "Full news archive with sentiment",
            "Unlimited watchlists",
            "100 AI questions per day",
            "Export to CSV/Excel",
            "Email alerts",
        ],
    },
    {
        name: "Elite Investor",
        tier: "elite",
        price: "$49.99",
        period: "/month",
        description: "For professional traders",
        badge: "Best Value",
        features: [
            "Everything in Pro, plus:",
            "Real-time data",
            "Pre-market & after-hours data",
            "Unlimited AI questions",
            "Voice input & document upload",
            "Unlimited portfolios",
            "Advanced portfolio analytics",
            "API access (10,000 calls/mo)",
            "Premium support",
        ],
    },
];

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    tier?: TierType;
    feature?: string;
    comparisonMode?: boolean;
    benefits?: string[];
}

export function PaywallModal({
    isOpen,
    onClose,
    tier = "pro",
    feature,
    comparisonMode = true,
    benefits,
}: PaywallModalProps) {
    // Handle escape key
    const handleEscape = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        },
        [onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, handleEscape]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-5xl max-h-[90vh] overflow-auto glass-paywall p-6 md:p-8 animate-in zoom-in-95 fade-in duration-300">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-200/20 transition-colors z-10"
                    aria-label="Close"
                >
                    <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    {feature && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-sm font-medium mb-4">
                            <Lock className="w-4 h-4" />
                            Unlock {feature}
                        </div>
                    )}
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Choose Your Plan
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Start free, upgrade anytime. No credit card required.
                    </p>
                </div>

                {/* Benefits List */}
                {benefits && benefits.length > 0 && (
                    <div className="max-w-md mx-auto mb-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 text-left">
                        <h4 className="font-semibold text-sm mb-3 text-slate-900 dark:text-white">What you get:</h4>
                        <ul className="space-y-2">
                            {benefits.map((b, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <Check className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                                    <span>{b}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Pricing cards */}
                {comparisonMode ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <PricingCard
                                key={plan.tier}
                                plan={plan}
                                recommended={plan.tier === tier}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="max-w-md mx-auto">
                        <PricingCard
                            plan={plans.find((p) => p.tier === tier) || plans[1]}
                            recommended
                        />
                    </div>
                )}

                {/* Trust signals */}
                <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 border-t border-slate-200/20">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Sparkles className="w-4 h-4 text-growth-500" />
                        30-Day Money Back
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Check className="w-4 h-4 text-growth-500" />
                        Cancel Anytime
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Lock className="w-4 h-4 text-growth-500" />
                        Secure Payment
                    </div>
                </div>
            </div>
        </div>
    );
}

interface PricingCardProps {
    plan: PricingPlan;
    recommended?: boolean;
}

function PricingCard({ plan, recommended }: PricingCardProps) {
    const isPro = plan.tier === "pro";
    const isElite = plan.tier === "elite";
    const isFree = plan.tier === "free";

    return (
        <div
            className={`relative p-6 rounded-2xl border transition-all ${recommended
                ? "border-brand shadow-lg shadow-brand/10 scale-105"
                : "border-slate-200 dark:border-slate-700"
                } bg-white dark:bg-slate-800`}
        >
            {/* Badge */}
            {plan.badge && (
                <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold text-white ${isPro ? "gradient-pro" : isElite ? "gradient-elite" : "bg-slate-500"
                        }`}
                >
                    {plan.badge}
                </div>
            )}

            {/* Plan name */}
            <div className="flex items-center gap-2 mb-2">
                {isPro && <Lock className="w-4 h-4 text-warning" />}
                {isElite && <Crown className="w-4 h-4 text-elite" />}
                <h3 className="font-semibold text-slate-900 dark:text-white">
                    {plan.name}
                </h3>
            </div>

            {/* Price */}
            <div className="mb-4">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">
                    {plan.price}
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                    {plan.period}
                </span>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {plan.description}
            </p>

            {/* CTA */}
            <Link
                href="/pricing"
                className={`w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-medium transition-all hover:scale-[1.02] ${isFree
                    ? "border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    : isPro
                        ? "gradient-pro text-white"
                        : "gradient-elite text-white"
                    }`}
            >
                {isFree ? "Get Started Free" : "Start Free Trial"}
            </Link>

            {/* Features */}
            <ul className="mt-6 space-y-3">
                {plan.features.map((feature, i) => (
                    <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
                    >
                        <Check className="w-4 h-4 text-growth-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
