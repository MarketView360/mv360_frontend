"use client";

import { Lock, Crown, Sparkles, X } from "lucide-react";
import Link from "next/link";

export type TierType = "pro" | "elite";

interface PaywallOverlayProps {
    tier: TierType;
    feature: string;
    benefits?: string[];
    ctaText?: string;
    showFreeTrial?: boolean;
    onClose?: () => void;
    className?: string;
}

export function PaywallOverlay({
    tier,
    feature,
    benefits = [],
    ctaText,
    showFreeTrial = true,
    onClose,
    className = "",
}: PaywallOverlayProps) {
    const isPro = tier === "pro";
    const tierName = isPro ? "Pro" : "Elite";
    const defaultCta = showFreeTrial
        ? "Start 14-Day Free Trial"
        : `Upgrade to ${tierName}`;

    return (
        <div
            className={`glass-paywall p-8 max-w-md mx-auto text-center relative z-50 animate-in fade-in zoom-in-95 duration-300 ${className}`}
        >
            {/* Close button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-200/20 transition-colors"
                    aria-label="Close"
                >
                    <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </button>
            )}

            {/* Lock icon with tier-based gradient */}
            <div
                className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center animate-float ${isPro ? "gradient-pro" : "gradient-elite"
                    }`}
            >
                {isPro ? (
                    <Lock className="w-8 h-8 text-white" />
                ) : (
                    <Crown className="w-8 h-8 text-white" />
                )}
            </div>

            {/* Heading */}
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Unlock {feature}
            </h3>

            {/* Subtitle */}
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Available in {tierName} plan
            </p>

            {/* Benefits list */}
            {benefits.length > 0 && (
                <ul className="text-left space-y-3 mb-8">
                    {benefits.map((benefit, index) => (
                        <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                        >
                            <Sparkles className="w-4 h-4 text-growth-500 mt-0.5 flex-shrink-0" />
                            <span>{benefit}</span>
                        </li>
                    ))}
                </ul>
            )}

            {/* CTA Button */}
            <Link
                href="/pricing"
                className={`w-full inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-lg ${isPro ? "gradient-pro" : "gradient-elite"
                    }`}
            >
                {ctaText || defaultCta}
            </Link>

            {/* Secondary link */}
            <Link
                href="/pricing"
                className="block mt-4 text-sm text-slate-500 dark:text-slate-400 hover:text-brand transition-colors underline underline-offset-2"
            >
                View All Plans
            </Link>

            {/* Maybe later */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="block w-full mt-3 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                    Maybe Later
                </button>
            )}
        </div>
    );
}
