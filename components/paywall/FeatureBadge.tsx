"use client";

import { Crown, Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type BadgeSize = "sm" | "md" | "lg";
export type BadgeTier = "premium" | "elite" | "max";

interface FeatureBadgeProps {
  tier: BadgeTier;
  /** @deprecated Sizing is now uniform — kept for API compat */
  size?: BadgeSize;
  showIcon?: boolean;
  className?: string;
}

const TIER_MAP = {
  premium: {
    label: "Premium",
    Icon: Zap,
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
  },
  elite: {
    label: "Elite",
    Icon: Crown,
    className: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/25",
  },
  max: {
    label: "Max",
    Icon: Sparkles,
    className: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/25",
  },
} as const;

export function FeatureBadge({
  tier,
  size: _size,
  showIcon = true,
  className,
}: FeatureBadgeProps) {
  const { label, Icon, className: tierClass } = TIER_MAP[tier];

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 text-[10px] font-semibold uppercase tracking-wider",
        tierClass,
        className
      )}
    >
      {showIcon && <Icon size={12} strokeWidth={2} aria-hidden="true" />}
      {label}
    </Badge>
  );
}

// Inline badge for text
interface InlineBadgeProps {
  tier: BadgeTier;
}

export function InlineBadge({ tier }: InlineBadgeProps) {
  return <FeatureBadge tier={tier} showIcon={false} className="ml-1 align-middle" />;
}
