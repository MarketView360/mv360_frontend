"use client";

import { ReactNode } from "react";
import { PaywallOverlay, TierType } from "./PaywallOverlay";

interface BlurredContentProps {
    children: ReactNode;
    blurAmount?: number;
    showPreview?: number;
    tier?: TierType;
    feature?: string;
    benefits?: string[];
    showPaywall?: boolean;
    className?: string;
}

export function BlurredContent({
    children,
    blurAmount = 8,
    tier = "pro",
    feature = "Premium Features",
    benefits = [],
    showPaywall = true,
    className = "",
}: BlurredContentProps) {
    return (
        <div className={`relative ${className}`}>
            {/* Blurred content */}
            <div
                className="select-none pointer-events-none"
                style={{ filter: `blur(${blurAmount}px)` }}
                aria-hidden="true"
            >
                {children}
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-slate-900" />

            {/* Paywall overlay */}
            {showPaywall && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <PaywallOverlay tier={tier} feature={feature} benefits={benefits} />
                </div>
            )}
        </div>
    );
}

interface BlurredTableRowsProps {
    children: ReactNode;
    visibleRows?: number;
    totalRows?: number;
    tier?: TierType;
    feature?: string;
}

export function BlurredTableRows({
    children,
    visibleRows = 100,
    totalRows = 234,
    tier = "pro",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    feature = "All Results",
}: BlurredTableRowsProps) {
    return (
        <div className="relative">
            {children}

            {/* Blur overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white dark:from-slate-900 via-white/80 dark:via-slate-900/80 to-transparent pointer-events-none" />

            {/* Centered paywall card */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 glass-paywall px-6 py-4 text-center pointer-events-auto">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                    Viewing {visibleRows} of {totalRows} results
                </p>
                <a
                    href="/pricing"
                    className={`inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-white text-sm transition-all hover:scale-[1.02] ${tier === "pro" ? "gradient-pro" : "gradient-elite"
                        }`}
                >
                    Upgrade to {tier === "pro" ? "Pro" : "Elite"} to view all
                </a>
            </div>
        </div>
    );
}
