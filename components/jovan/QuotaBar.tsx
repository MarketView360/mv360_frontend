"use client";

import { Brain, MessageSquare, Sparkles, Mic } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { QuotaStatus } from "@/hooks/useQuota";

interface QuotaBarProps {
  quota: { used: number; limit: number; resetsAt: string };
  className?: string;
}

interface FullQuotaBarProps {
  quota: QuotaStatus;
  className?: string;
}

/**
 * Simple quota bar for reasoning only (legacy)
 */
export function QuotaBar({ quota, className }: QuotaBarProps) {
  const percentage = quota.limit > 0 ? (quota.used / quota.limit) * 100 : 0;

  return (
    <div
      className={cn(
        "rounded-lg bg-slate-100 p-3 text-xs dark:bg-slate-800",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-3 w-3 text-brand" />
          <span>Reasoning quota</span>
        </div>
        <span className="font-medium">
          {quota.used} / {quota.limit}
        </span>
      </div>
      <Progress value={percentage} className="h-1.5" />
      <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
        Resets at {new Date(quota.resetsAt).toLocaleTimeString()}
      </p>
    </div>
  );
}

/**
 * Full quota display with all types
 */
export function FullQuotaBar({ quota, className }: FullQuotaBarProps) {
  const quotaItems = [
    {
      key: "standard",
      label: "Messages",
      icon: MessageSquare,
      color: "text-blue-500",
      data: quota.standard,
    },
    {
      key: "reasoning",
      label: "Reasoning",
      icon: Brain,
      color: "text-purple-500",
      data: quota.reasoning,
    },
    {
      key: "premium",
      label: "Premium",
      icon: Sparkles,
      color: "text-amber-500",
      data: quota.premium,
    },
    {
      key: "voice",
      label: "Voice",
      icon: Mic,
      color: "text-green-500",
      data: quota.voice,
    },
  ];

  // Calculate time until reset
  const resetTime = new Date(quota.resetsAt);
  const now = new Date();
  const hoursUntilReset = Math.max(
    0,
    Math.ceil((resetTime.getTime() - now.getTime()) / (1000 * 60 * 60)),
  );

  return (
    <div
      className={cn(
        "rounded-lg bg-slate-100 p-3 text-xs dark:bg-slate-800",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="font-medium">Usage Today</span>
        <span className="text-[10px] text-slate-500">
          Resets in {hoursUntilReset}h
        </span>
      </div>

      <div className="space-y-2">
        {quotaItems.map((item) => {
          const Icon = item.icon;
          const percentage = item.data.unlimited
            ? 0
            : item.data.limit > 0
              ? (item.data.used / item.data.limit) * 100
              : 0;
          const isNearLimit = percentage >= 80;

          return (
            <div key={item.key}>
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon className={cn("h-3 w-3", item.color)} />
                  <span>{item.label}</span>
                </div>
                <span
                  className={cn(
                    "font-medium",
                    isNearLimit && !item.data.unlimited && "text-amber-600",
                  )}
                >
                  {item.data.unlimited ? (
                    "∞"
                  ) : (
                    <>
                      {item.data.used}/{item.data.limit}
                    </>
                  )}
                </span>
              </div>
              {!item.data.unlimited && (
                <Progress
                  value={percentage}
                  className={cn(
                    "h-1",
                    isNearLimit && "[&>div]:bg-amber-500",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
        <span
          className={cn(
            "text-[10px] px-1.5 py-0.5 rounded",
            quota.tier === "premium"
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400",
          )}
        >
          {quota.tier === "premium" ? "Premium" : "Free Tier"}
        </span>
      </div>
    </div>
  );
}