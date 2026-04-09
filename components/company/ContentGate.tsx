"use client";

import React from "react";
import { useAuth } from "@/providers/AuthProvider";
import { PaywallOverlay } from "@/components/paywall/PaywallOverlay";

export function ContentGate({
    children,
    feature = "Advanced Analysis",
    tier = "premium",
    compact = false,
    status = "active"
}: {
    children: React.ReactNode;
    feature?: string;
    tier?: "premium" | "elite" | "max";
    compact?: boolean;
    status?: "active" | "coming-soon";
}) {
    const { session } = useAuth();
    const hasAccess = session?.tier === "premium" || session?.tier === "elite" || session?.tier === "max";

    if (status === "coming-soon") {
        const minHeight = compact ? "min-h-[180px]" : "min-h-[400px]";
        return (
            <div className={`relative ${minHeight} rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800`}>
                <div className="absolute inset-0 z-10 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md" />
                <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
                    {compact ? (
                        <div className="glass-paywall px-6 py-4 max-w-sm mx-auto text-center relative z-50 animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        {feature}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Coming soon. We're working on it!
                                    </p>
                                </div>
                                <div className="ml-auto px-3 py-1.5 rounded-lg font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 text-[11px] border border-slate-200 dark:border-slate-700">
                                    Coming Soon
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-paywall p-8 max-w-md mx-auto text-center relative z-50 animate-in fade-in zoom-in-95 duration-300">
                            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                {feature}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                We're currently developing this feature. Stay tuned!
                            </p>
                        </div>
                    )}
                </div>
                <div className="p-8 filter blur-sm opacity-50 pointer-events-none select-none">
                    {children}
                </div>
            </div>
        );
    }

    if (!hasAccess) {
        const minHeight = compact ? "min-h-[180px]" : "min-h-[400px]";
        return (
            <div className={`relative ${minHeight} rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800`}>
                <div className="absolute inset-0 z-10 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md" />
                <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
                    <PaywallOverlay
                        tier={tier}
                        feature={feature}
                        compact={compact}
                        benefits={compact ? [] : [
                            "Deep dive fundamental analysis",
                            "AI-powered growth forecasts",
                            "Risk assessment & red flags",
                            "Competitor benchmarking"
                        ]}
                    />
                </div>
                {/* Blurred background content (optional, or just generic placeholder) */}
                <div className="p-8 filter blur-sm opacity-50 pointer-events-none select-none">
                    {children}
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
