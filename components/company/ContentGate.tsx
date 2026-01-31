"use client";

import React from "react";
import { useAuth } from "@/providers/AuthProvider";
import { PaywallOverlay } from "@/components/paywall/PaywallOverlay";

export function ContentGate({
    children,
    feature = "Advanced Analysis",
    tier = "premium",
    compact = false
}: {
    children: React.ReactNode;
    feature?: string;
    tier?: "premium" | "elite";
    compact?: boolean;
}) {
    const { session } = useAuth();
    const hasAccess = session?.tier === "premium" || session?.tier === "elite";

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
