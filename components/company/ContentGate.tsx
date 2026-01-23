"use client";

import React from "react";
import { useAuth } from "@/providers/AuthProvider";
import { PaywallOverlay } from "@/components/paywall/PaywallOverlay";

export function ContentGate({
    children,
    feature = "Advanced Analysis",
    tier = "pro"
}: {
    children: React.ReactNode;
    feature?: string;
    tier?: "pro" | "elite";
}) {
    const { session } = useAuth();
    const hasAccess = session?.tier === "pro" || session?.tier === "elite";

    if (!hasAccess) {
        return (
            <div className="relative min-h-[400px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="absolute inset-0 z-10 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md" />
                <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
                    <PaywallOverlay
                        tier={tier}
                        feature={feature}
                        benefits={[
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
