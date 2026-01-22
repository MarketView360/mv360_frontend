"use client";

import Link from "next/link";

interface UsageIndicatorProps {
    current: number;
    limit: number;
    label: string;
    upgradeLink?: string;
    showUpgrade?: boolean;
    className?: string;
}

export function UsageIndicator({
    current,
    limit,
    label,
    upgradeLink = "/pricing",
    showUpgrade = true,
    className = "",
}: UsageIndicatorProps) {
    const percentage = Math.min((current / limit) * 100, 100);
    const isWarning = percentage >= 60 && percentage < 90;
    const isDanger = percentage >= 90;

    const barClass = isDanger
        ? "usage-bar-danger"
        : isWarning
            ? "usage-bar-warning"
            : "";

    return (
        <div
            className={`flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 ${className}`}
        >
            {/* Progress bar */}
            <div className={`usage-bar w-24 ${barClass}`}>
                <div
                    className="usage-bar-fill"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Text */}
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {current} of {limit} {label}
            </span>

            {/* Upgrade link */}
            {showUpgrade && current >= limit * 0.6 && (
                <Link
                    href={upgradeLink}
                    className="text-xs font-medium text-brand hover:text-brand-600 transition-colors"
                >
                    Upgrade
                </Link>
            )}
        </div>
    );
}

// Compact version for inline use
interface CompactUsageProps {
    current: number;
    limit: number;
    className?: string;
}

export function CompactUsage({ current, limit, className = "" }: CompactUsageProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="flex gap-0.5">
                {Array.from({ length: limit }).map((_, i) => (
                    <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-colors ${i < current
                            ? "bg-brand"
                            : "bg-slate-200 dark:bg-slate-700"
                            }`}
                    />
                ))}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
                {current}/{limit}
            </span>
        </div>
    );
}
