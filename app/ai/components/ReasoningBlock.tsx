"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Brain, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Environment flag to control if users can expand and see reasoning content
// If false, only show the thinking indicator without expandable content
const ALLOW_REASONING_PREVIEW = 
  process.env.NEXT_PUBLIC_ALLOW_REASONING_PREVIEW !== "false";

interface ReasoningBlockProps {
  reasoning: string;
  isStreaming?: boolean;
  className?: string;
}

export function ReasoningBlock({ 
  reasoning, 
  isStreaming = false,
  className 
}: ReasoningBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // If no reasoning content and not streaming, don't render
  if (!reasoning && !isStreaming) {
    return null;
  }

  // Generate a preview of the reasoning (first ~100 chars)
  const getPreview = () => {
    if (!reasoning) return "Thinking...";
    const cleaned = reasoning.replace(/\s+/g, " ").trim();
    if (cleaned.length <= 80) return cleaned;
    return cleaned.slice(0, 80) + "...";
  };

  // If reasoning preview is disabled, show minimal indicator
  if (!ALLOW_REASONING_PREVIEW) {
    return (
      <div className={cn(
        "flex items-center gap-2 mb-3 px-3 py-2 rounded-lg",
        "bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50",
        "text-purple-700 dark:text-purple-300 text-xs",
        className
      )}>
        {isStreaming ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="font-medium">Reasoning...</span>
            <span className="text-purple-500 dark:text-purple-400 animate-pulse">
              Working through the problem
            </span>
          </>
        ) : (
          <>
            <Brain className="w-3.5 h-3.5" />
            <span className="font-medium">Reasoned response</span>
            <span className="text-purple-500 dark:text-purple-400">
              Deep thinking applied
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "mb-3 rounded-lg overflow-hidden",
      "bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50",
      className
    )}>
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 text-left",
          "text-purple-700 dark:text-purple-300 text-xs",
          "hover:bg-purple-100/50 dark:hover:bg-purple-900/30 transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-inset"
        )}
        aria-expanded={isExpanded}
      >
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        )}
        
        {isStreaming ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
        ) : (
          <Brain className="w-3.5 h-3.5 shrink-0" />
        )}
        
        <span className="font-medium shrink-0">
          {isStreaming ? "Thinking" : "Thought process"}
        </span>
        
        {/* Preview when collapsed */}
        {!isExpanded && (
          <span className="text-purple-500 dark:text-purple-400 truncate ml-1">
            {isStreaming && !reasoning ? (
              <span className="animate-pulse">Working through the problem...</span>
            ) : (
              getPreview()
            )}
          </span>
        )}
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className={cn(
          "px-3 pb-3 pt-1",
          "text-xs text-purple-800 dark:text-purple-200",
          "max-h-[300px] overflow-y-auto custom-scrollbar"
        )}>
          <div className="whitespace-pre-wrap leading-relaxed font-mono bg-purple-100/50 dark:bg-purple-900/30 rounded p-2">
            {reasoning || (
              <span className="text-purple-500 animate-pulse">
                Thinking...
              </span>
            )}
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-purple-500 animate-pulse ml-0.5 align-middle" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact reasoning indicator for use in message headers or inline
 */
export function ReasoningIndicator({ 
  isActive = false,
  className 
}: { 
  isActive?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]",
      "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400",
      "border border-purple-200 dark:border-purple-800",
      className
    )}>
      {isActive ? (
        <Loader2 className="w-2.5 h-2.5 animate-spin" />
      ) : (
        <Brain className="w-2.5 h-2.5" />
      )}
      <span className="font-medium">
        {isActive ? "Thinking" : "Reasoned"}
      </span>
    </div>
  );
}
