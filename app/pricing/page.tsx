"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Check,
    X,
    Lock,
    Crown,
    Shield,
    RefreshCw,
    Users,
    ChevronDown,
    ChevronUp,
    Zap,
    LucideIcon,
} from "lucide-react";

type BillingPeriod = "monthly" | "annually";

interface PricingPlan {
    name: string;
    tier: "free" | "pro" | "elite";
    monthlyPrice: number;
    annualPrice: number;
    description: string;
    features: string[];
    highlighted?: boolean;
    badge?: string;
}

const plans: PricingPlan[] = [
    {
        name: "Free Forever",
        tier: "free",
        monthlyPrice: 0,
        annualPrice: 0,
        description: "Perfect for getting started",
        features: [
            "Basic stock screener (10 filters)",
            "View up to 100 results",
            "Real-time quotes (15-min delay)",
            "Basic charts (3 timeframes)",
            "7 days of news",
            "3 watchlists (25 stocks each)",
            "Save 3 custom screeners",
            "5 AI questions per day",
            "Basic statistics",
            "Annual financials (2 years)",
            "Market overview",
            "Mobile responsive",
        ],
    },
    {
        name: "Professional",
        tier: "pro",
        monthlyPrice: 19.99,
        annualPrice: 199.99,
        description: "For serious individual investors",
        highlighted: true,
        badge: "Most Popular",
        features: [
            "Everything in Free, plus:",
            "Advanced screener (unlimited filters)",
            "Unlimited results",
            "Real-time quotes",
            "Advanced charts (all timeframes, indicators)",
            "Full news archive with sentiment",
            "Unlimited watchlists (100 stocks each)",
            "Save unlimited screeners",
            "Screener alerts",
            "100 AI questions per day",
            "AI conversation history",
            "Full statistics with trends",
            "Quarterly financials (10 years)",
            "Analyst ratings & price targets",
            "Export to CSV/Excel",
            "Portfolio tracking (1 portfolio)",
            "Email alerts",
            "Priority support",
        ],
    },
    {
        name: "Elite Investor",
        tier: "elite",
        monthlyPrice: 49.99,
        annualPrice: 499.99,
        description: "For professional traders & analysts",
        badge: "Best Value",
        features: [
            "Everything in Pro, plus:",
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
        category: "Screening & Analysis",
        features: [
            { name: "Number of filters", free: "10", pro: "Unlimited", elite: "Unlimited" },
            { name: "Results limit", free: "100", pro: "Unlimited", elite: "Unlimited" },
            { name: "Saved screeners", free: "3", pro: "Unlimited", elite: "Unlimited" },
            { name: "Screener alerts", free: false, pro: true, elite: true },
            { name: "Backtesting", free: false, pro: false, elite: true },
            { name: "Export results", free: false, pro: true, elite: true },
        ],
    },
    {
        category: "Data & Charts",
        features: [
            { name: "Data delay", free: "15 min", pro: "Real-time", elite: "Real-time" },
            { name: "Chart timeframes", free: "3", pro: "All", elite: "All" },
            { name: "Technical indicators", free: "Basic", pro: "Advanced", elite: "Advanced" },
            { name: "Drawing tools", free: false, pro: true, elite: true },
            { name: "Comparison charts", free: false, pro: true, elite: true },
            { name: "Extended hours data", free: false, pro: false, elite: true },
        ],
    },
    {
        category: "Financials & Metrics",
        features: [
            { name: "Financial history", free: "2 years", pro: "10 years", elite: "10 years" },
            { name: "Quarterly data", free: false, pro: true, elite: true },
            { name: "Advanced metrics", free: false, pro: true, elite: true },
            { name: "Analyst ratings", free: false, pro: true, elite: true },
            { name: "Fair value calculator", free: false, pro: true, elite: true },
        ],
    },
    {
        category: "News & Insights",
        features: [
            { name: "News archive", free: "7 days", pro: "Full", elite: "Full" },
            { name: "Sentiment analysis", free: false, pro: true, elite: true },
            { name: "News alerts", free: false, pro: true, elite: true },
            { name: "Economic calendar", free: false, pro: true, elite: true },
            { name: "Earnings calendar", free: false, pro: true, elite: true },
        ],
    },
    {
        category: "AI Assistant",
        features: [
            { name: "Questions per day", free: "5", pro: "100", elite: "Unlimited" },
            { name: "Conversation history", free: "5 chats", pro: "Unlimited", elite: "Unlimited" },
            { name: "Context attachment", free: false, pro: true, elite: true },
            { name: "Voice input", free: false, pro: false, elite: true },
            { name: "Document upload", free: false, pro: false, elite: true },
        ],
    },
    {
        category: "Watchlists & Portfolio",
        features: [
            { name: "Watchlists", free: "3", pro: "Unlimited", elite: "Unlimited" },
            { name: "Stocks per list", free: "25", pro: "100", elite: "Unlimited" },
            { name: "Portfolio tracking", free: false, pro: "1 portfolio", elite: "Unlimited" },
            { name: "Performance analytics", free: false, pro: true, elite: true },
            { name: "Rebalancing tools", free: false, pro: false, elite: true },
        ],
    },
    {
        category: "Alerts & Notifications",
        features: [
            { name: "Price alerts", free: false, pro: true, elite: true },
            { name: "Screener alerts", free: false, pro: true, elite: true },
            { name: "News alerts", free: false, pro: true, elite: true },
            { name: "Email alerts", free: false, pro: true, elite: true },
            { name: "SMS alerts", free: false, pro: false, elite: true },
        ],
    },
    {
        category: "Export & API",
        features: [
            { name: "CSV/Excel export", free: false, pro: true, elite: true },
            { name: "API access", free: false, pro: false, elite: true },
            { name: "API calls per month", free: "-", pro: "-", elite: "10,000" },
            { name: "Webhooks", free: false, pro: false, elite: true },
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

    const isAnnual = billingPeriod === "annually";
    const savingsPercent = 17;

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
            {/* Hero Section */}
            <section className="pt-16 pb-12 md:pt-24 md:pb-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 dark:text-white mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                        Start free, upgrade anytime. No credit card required for the free tier.
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center gap-4 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <button
                            onClick={() => setBillingPeriod("monthly")}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${!isAnnual
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingPeriod("annually")}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${isAnnual
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                }`}
                        >
                            Annually
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-growth-500 text-white">
                                Save {savingsPercent}%
                            </span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-12 md:py-16">
                <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
                        {plans.map((plan) => (
                            <PricingCard
                                key={plan.tier}
                                plan={plan}
                                price={getPrice(plan)}
                                isAnnual={isAnnual}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Comparison */}
            <section className="py-12 md:py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
                <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold font-heading text-slate-900 dark:text-white mb-2">
                            Compare Plans in Detail
                        </h2>
                        <button
                            onClick={() => setShowAllFeatures(!showAllFeatures)}
                            className="inline-flex items-center gap-1 text-brand hover:text-brand-600 text-sm font-medium"
                        >
                            {showAllFeatures ? "Show Key Features" : "Show All Features"}
                            {showAllFeatures ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th className="text-left py-4 px-4 font-medium text-slate-500 dark:text-slate-400 w-1/3">
                                        Feature
                                    </th>
                                    <th className="text-center py-4 px-4 font-medium text-slate-900 dark:text-white">
                                        Free
                                    </th>
                                    <th className="text-center py-4 px-4 font-medium text-warning">
                                        <span className="inline-flex items-center gap-1">
                                            <Lock className="w-4 h-4" />
                                            Pro
                                        </span>
                                    </th>
                                    <th className="text-center py-4 px-4 font-medium text-elite">
                                        <span className="inline-flex items-center gap-1">
                                            <Crown className="w-4 h-4" />
                                            Elite
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonFeatures
                                    .slice(0, showAllFeatures ? undefined : 4)
                                    .map((category) => (
                                        <>
                                            <tr key={category.category} className="bg-slate-50 dark:bg-slate-800/50">
                                                <td
                                                    colSpan={4}
                                                    className="py-3 px-4 font-semibold text-slate-900 dark:text-white"
                                                >
                                                    {category.category}
                                                </td>
                                            </tr>
                                            {category.features.map((feature) => (
                                                <tr
                                                    key={feature.name}
                                                    className="border-b border-slate-100 dark:border-slate-800"
                                                >
                                                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">
                                                        {feature.name}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <FeatureValue value={feature.free} />
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <FeatureValue value={feature.pro} />
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <FeatureValue value={feature.elite} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-12 md:py-16">
                <div className="mx-auto max-w-3xl px-4 md:px-8 lg:px-12">
                    <h2 className="text-2xl md:text-3xl font-bold font-heading text-slate-900 dark:text-white text-center mb-8">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    <span className="font-medium text-slate-900 dark:text-white pr-4">
                                        {faq.question}
                                    </span>
                                    {openFaq === index ? (
                                        <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                    )}
                                </button>
                                {openFaq === index && (
                                    <div className="px-6 pb-4 text-slate-600 dark:text-slate-300 animate-in slide-in-from-top-2 duration-200">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Signals */}
            <section className="py-12 md:py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                        <TrustSignal icon={Shield} text="30-Day Money-Back Guarantee" />
                        <TrustSignal icon={RefreshCw} text="Cancel Anytime" />
                        <TrustSignal icon={Lock} text="Secure Payment" />
                        <TrustSignal icon={Users} text="10,000+ Happy Investors" />
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-16 md:py-24 gradient-brand">
                <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Ready to start investing smarter?
                    </h2>
                    <p className="text-lg text-white/80 mb-8">
                        Join thousands of investors using MarketView360
                    </p>
                    <Link
                        href="/auth/signup"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand font-semibold rounded-xl hover:bg-slate-50 transition-all hover:scale-[1.02] shadow-lg"
                    >
                        <Zap className="w-5 h-5" />
                        Start Free Trial
                    </Link>
                    <p className="mt-4 text-sm text-white/60">
                        No credit card required
                    </p>
                </div>
            </section>
        </div>
    );
}

// Pricing Card Component
function PricingCard({
    plan,
    price,
    isAnnual,
}: {
    plan: PricingPlan;
    price: string;
    isAnnual: boolean;
}) {
    const isPro = plan.tier === "pro";
    const isElite = plan.tier === "elite";
    const isFree = plan.tier === "free";

    return (
        <div
            className={`relative p-6 md:p-8 rounded-2xl border transition-all ${plan.highlighted
                ? "border-brand shadow-xl shadow-brand/10 scale-105 bg-white dark:bg-slate-800"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                }`}
        >
            {/* Badge */}
            {plan.badge && (
                <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-white whitespace-nowrap ${isPro ? "gradient-pro" : isElite ? "gradient-elite" : "bg-slate-500"
                        }`}
                >
                    {plan.badge}
                </div>
            )}

            {/* Plan name */}
            <div className="flex items-center gap-2 mb-2">
                {isPro && <Lock className="w-5 h-5 text-warning" />}
                {isElite && <Crown className="w-5 h-5 text-elite" />}
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {plan.name}
                </h3>
            </div>

            {/* Price */}
            <div className="mb-1">
                <span className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
                    {price}
                </span>
                <span className="text-slate-500 dark:text-slate-400">/month</span>
            </div>

            {/* Annual note */}
            {isAnnual && !isFree && (
                <p className="text-sm text-growth-600 dark:text-growth-400 mb-4">
                    Billed ${plan.annualPrice}/year
                </p>
            )}

            {/* Description */}
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {plan.description}
            </p>

            {/* CTA */}
            <Link
                href={isFree ? "/auth/signup" : "/auth/signup?plan=" + plan.tier}
                className={`w-full inline-flex items-center justify-center px-4 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] ${isFree
                    ? "border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    : isPro
                        ? "gradient-pro text-white shadow-lg shadow-warning/25"
                        : "gradient-elite text-white shadow-lg shadow-elite/25"
                    }`}
            >
                {isFree ? "Get Started Free" : "Start 14-Day Free Trial"}
            </Link>

            {!isFree && (
                <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2">
                    No credit card required
                </p>
            )}

            {/* Features */}
            <ul className="mt-8 space-y-3">
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

// Feature Value Component
function FeatureValue({ value }: { value: boolean | string }) {
    if (typeof value === "boolean") {
        return value ? (
            <Check className="w-5 h-5 text-growth-500 mx-auto" />
        ) : (
            <X className="w-5 h-5 text-slate-300 dark:text-slate-600 mx-auto" />
        );
    }
    return (
        <span className="text-sm text-slate-700 dark:text-slate-300">{value}</span>
    );
}

// Trust Signal Component
function TrustSignal({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
    return (
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Icon className="w-5 h-5 text-growth-500" />
            <span className="text-sm font-medium">{text}</span>
        </div>
    );
}
