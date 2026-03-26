"use client";

import React from "react";
import { Zap, Clock, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuotaIndicatorProps {
  canUseReasoning: boolean;
  remainingReasoning: number;
  resetsInHours: number;
  resetsInMinutes: number;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  reasoningLimit?: number;
}

export function QuotaIndicator({
  canUseReasoning,
  remainingReasoning,
  resetsInHours,
  resetsInMinutes,
  loading = false,
  error = null,
  onRefresh,
}: QuotaIndicatorProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Loader2 className="w-3 h-3 animate-spin" />
        Loading quota...
      </div>
    );
  }

  if (error) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="h-6 px-2 text-xs text-amber-600 hover:text-amber-700 gap-1"
            >
              <AlertCircle className="w-3 h-3" />
              Quota error
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{error}</p>
            <p className="text-xs text-slate-500 mt-1">Click to retry</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const resetText = resetsInHours > 0 
    ? `${resetsInHours}h ${resetsInMinutes}m`
    : `${resetsInMinutes}m`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 text-xs">
            <Zap className={cn(
              "w-3 h-3",
              canUseReasoning 
                ? "text-green-500" 
                : "text-slate-400"
            )} />
            <span className={cn(
              "font-medium",
              canUseReasoning 
                ? "text-slate-700 dark:text-slate-300" 
                : "text-slate-500"
            )}>
              {remainingReasoning}/{reasoningLimit ?? 10} reasoning
            </span>
            {!canUseReasoning && (
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-500">
                <Clock className="w-3 h-3" />
                <span>{resetText}</span>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <p>
              {canUseReasoning 
                ? `${remainingReasoning} reasoning messages available today`
                : "Daily reasoning limit reached"
              }
            </p>
            {!canUseReasoning && (
              <p className="text-slate-500">
                Resets in {resetText}
              </p>
            )}
            <p className="text-slate-500">
              Premium users get {reasoningLimit ?? 10} reasoning messages per 12h
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
