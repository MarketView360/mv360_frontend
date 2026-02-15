"use client";

import { Database, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolUsageBlockProps {
  toolName: string;
  isActive?: boolean;
  className?: string;
}

const TOOL_DISPLAY_NAMES: Record<string, string> = {
  get_fundamentals: "Fetching fundamental data",
  // Add more tool display names as we add more tools
};

const TOOL_DESCRIPTIONS: Record<string, string> = {
  get_fundamentals: "Retrieving company financials and metrics from our database",
};

export function ToolUsageBlock({ 
  toolName, 
  isActive = false,
  className 
}: ToolUsageBlockProps) {
  const displayName = TOOL_DISPLAY_NAMES[toolName] || toolName;
  const description = TOOL_DESCRIPTIONS[toolName] || "Processing request";

  return (
    <div className={cn(
      "flex items-center gap-2 mb-3 px-3 py-2 rounded-lg",
      "bg-emerald-50/80 dark:bg-emerald-900/20",
      "border border-emerald-200 dark:border-emerald-800",
      className
    )}>
      {isActive ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium text-emerald-900 dark:text-emerald-100 text-sm">
            {displayName}...
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 text-xs animate-pulse">
            {description}
          </span>
        </>
      ) : (
        <>
          <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium text-emerald-900 dark:text-emerald-100 text-sm">
            {displayName}
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 text-xs">
            Complete
          </span>
        </>
      )}
    </div>
  );
}

/**
 * Compact tool usage indicator for use in message headers or inline
 */
export function ToolUsageIndicator({ 
  isActive = false,
  className 
}: { 
  isActive?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs",
      "bg-emerald-50 dark:bg-emerald-900/20",
      "border border-emerald-200 dark:border-emerald-800",
      className
    )}>
      {isActive ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium text-emerald-700 dark:text-emerald-300">
            Using tools
          </span>
        </>
      ) : (
        <>
          <Database className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium text-emerald-700 dark:text-emerald-300">
            Tools used
          </span>
        </>
      )}
    </div>
  );
}
