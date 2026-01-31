"use client";

import { Lock, Crown } from "lucide-react";

export type BadgeSize = "sm" | "md" | "lg";
export type BadgeTier = "premium" | "elite";

interface FeatureBadgeProps {
    tier: BadgeTier;
    size?: BadgeSize;
    showIcon?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-0.5",
    lg: "text-sm px-3 py-1",
};

const iconSizes = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-3.5 h-3.5",
};

export function FeatureBadge({
    tier,
    size = "sm",
    showIcon = true,
    className = "",
}: FeatureBadgeProps) {
    const isPremium = tier === "premium";
    const label = isPremium ? "PREMIUM" : "ELITE";
    const Icon = isPremium ? Lock : Crown;

    return (
        <span
            className={`
        inline-flex items-center gap-1 font-semibold rounded-full uppercase tracking-wider
        ${sizeClasses[size]}
        ${isPremium ? "gradient-premium" : "gradient-elite"}
        text-white shadow-sm
        ${className}
      `}
        >
            {showIcon && <Icon className={iconSizes[size]} />}
            {label}
        </span>
    );
}

// Inline badge for text
interface InlineBadgeProps {
    tier: BadgeTier;
}

export function InlineBadge({ tier }: InlineBadgeProps) {
    return <FeatureBadge tier={tier} size="sm" showIcon={false} className="ml-1 align-middle" />;
}
