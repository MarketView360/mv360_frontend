"use client";

import React, { useState, useRef, useEffect } from "react";
import { Loader2, Lock, KeyRound, Wrench, TrendingUp } from "lucide-react";
import type { ToolsConfig } from "@/hooks/useToolsConfig";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Icons } from "./Icons";
import { useAuth } from "@/providers/AuthProvider";
import { useQuota } from "@/hooks/useQuota";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface ModelOption {
  id: string;
  name: string;
  provider: "openai" | "anthropic" | "google" | "auto" | "byok" | "moonshot.ai" | "groq";
  icon: React.ElementType;
  description: string;
  supportsReasoning: boolean;
  isLocked?: boolean;
}

const MODELS: ModelOption[] = [
{
    id: "gpt-oss",
    name: "Jovan Fast",
    provider: "openai",
    icon: Icons.Jovan,
    description: "Fast Jovan model",
    supportsReasoning: true,
  },
  {
    id: "byok",
    name: "BYOK Models",
    provider: "byok",
    icon: KeyRound,
    description: "Bring Your Own Key (Pro Plan)",
    supportsReasoning: false,
    isLocked: true,
  },
];

const TOOL_ICONS: Record<string, React.ElementType> = {
  TrendingUp,
};

interface ModelSelectorProps {
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
  isReasoningEnabled: boolean;
  onReasoningChange: (enabled: boolean) => void;
  toolsConfig?: ToolsConfig;
  onToolsEnabledChange?: (enabled: boolean) => void;
  onToolToggle?: (toolId: string, enabled: boolean) => boolean;
  className?: string;
  reasoningLabel?: string;
  disabled?: boolean;
}

export function ModelSelector({
  selectedModelId,
  onModelChange,
  isReasoningEnabled,
  onReasoningChange,
  toolsConfig,
  onToolsEnabledChange,
  onToolToggle,
  className,
  reasoningLabel = "Reasoning",
  disabled = false,
}: ModelSelectorProps) {
  const selectedModel = MODELS.find((m) => m.id === selectedModelId) || MODELS[0];
  const { session } = useAuth();
  const { quota, loading, timeUntilReset } = useQuota(session?.access_token ?? null);
  const [toolsPopupOpen, setToolsPopupOpen] = useState(false);
  const toolsPopupRef = useRef<HTMLDivElement>(null);
  
  // Hide quota UI for non-logged-in users
  const isAuthenticated = !!session;

  // Close tools popup on outside click
  useEffect(() => {
    if (!toolsPopupOpen) return;
    const handler = (e: MouseEvent) => {
      if (toolsPopupRef.current && !toolsPopupRef.current.contains(e.target as Node)) {
        setToolsPopupOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [toolsPopupOpen]);

  const getQuotaDisplay = () => {
    if (!quota) return "Loading...";
    
    if (isReasoningEnabled) {
      // Show reasoning message count
      const q = quota.reasoning;
      return `${q.remaining} of ${q.limit} reasoning messages`;
    } else {
      // Show token count for standard messages
      const q = quota.tokens;
      const tokensInK = (q.remaining / 1000).toFixed(1);
      const limitInK = (q.limit / 1000).toFixed(0);
      return `${tokensInK}K of ${limitInK}K tokens`;
    }
  };

  return (
    <div className={cn("flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 shadow-sm", className)}>
      <div className="flex-1 min-w-[200px]">
        <Select 
            value={selectedModelId} 
            onValueChange={(val) => {
                const model = MODELS.find(m => m.id === val);
                if (model?.isLocked) return; // Prevent selection of locked items
                onModelChange(val);
            }}
        >
          <SelectTrigger className="w-full border-none bg-transparent shadow-none focus:ring-0 h-auto p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
            <div className="flex items-center gap-2.5 text-sm font-medium">
                <div className={cn("w-5 h-5 flex items-center justify-center rounded", 
                    selectedModel.provider === 'openai' && "text-slate-900 dark:text-white",
                    selectedModel.provider === 'anthropic' && "text-slate-900 dark:text-white",
                )}>
                    <selectedModel.icon className={cn("w-4 h-4",
                        selectedModel.provider === 'auto' && "text-indigo-600 dark:text-indigo-400",
                        selectedModel.provider === 'google' && "text-blue-600 dark:text-blue-400",
                        selectedModel.provider === 'byok' && "text-slate-500",
                    )} />
                </div>
                <span className="text-slate-900 dark:text-slate-100">{selectedModel.name}</span>
            </div>
          </SelectTrigger>
          <SelectContent align="start" className="w-[320px] p-1">
            {MODELS.map((model) => (
              <SelectItem 
                key={model.id} 
                value={model.id} 
                disabled={model.isLocked}
                className={cn(
                    "py-3 px-3 cursor-pointer rounded-md my-0.5 transition-all duration-200",
                    model.isLocked 
                        ? "opacity-100 bg-linear-to-r from-slate-50 to-amber-50/50 dark:from-slate-900 dark:to-amber-950/20 border border-transparent hover:border-amber-200 dark:hover:border-amber-900/50" 
                        : "focus:bg-slate-100 dark:focus:bg-slate-800"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("mt-0.5 w-8 h-8 rounded-md flex items-center justify-center shrink-0 border transition-colors",
                      model.provider === 'auto' && "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400",
                      model.provider === 'openai' && "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white",
                      model.provider === 'anthropic' && "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white",
                      model.provider === 'google' && "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400",
                      model.provider === 'moonshot.ai' && "border-amber-200 dark:border-amber-800/50 bg-amber-100/50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500",
                      model.provider === 'groq' && "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white",
                  )}>
                    <model.icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-0.5 text-left flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <span className={cn("font-medium text-sm truncate",
                            model.isLocked ? "text-slate-700 dark:text-slate-300" : "text-slate-900 dark:text-slate-100"
                        )}>
                            {model.name}
                        </span>
                        {model.id === 'auto' && <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border-none">SMART</Badge>}
                        {model.isLocked && (
                            <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className="h-5 px-1.5 text-[9px] border-amber-200 text-amber-600 dark:border-amber-800 dark:text-amber-500 uppercase tracking-wide">Pro</Badge>
                                <Lock className="w-3 h-3 text-slate-400" />
                            </div>
                        )}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {model.description}
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedModel.supportsReasoning && isAuthenticated && (
        <div className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-800">
            <Switch 
                id="reasoning-mode" 
                checked={isReasoningEnabled}
                onCheckedChange={onReasoningChange}
                disabled={disabled}
                className="scale-75 data-[state=checked]:bg-indigo-600"
            />
            <Label htmlFor="reasoning-mode" className="text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                {reasoningLabel}
            </Label>
            {isAuthenticated && (
              loading && !quota ? (
                <div className="ml-2 h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              ) : quota ? (
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <span className="ml-1.5 inline-flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-help transition-colors border border-slate-200 dark:border-slate-800 rounded-full px-2 py-0.5 bg-slate-50 dark:bg-slate-900/50">
                        {loading && (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        )}
                        <span>{getQuotaDisplay()}</span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[280px] text-xs p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl select-none z-100">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                          <span className="font-semibold text-sm text-slate-900 dark:text-slate-50">Usage Quota</span>
                          <Badge variant="outline" className="text-[10px] h-5 px-1.5 uppercase tracking-wider font-semibold bg-slate-50 dark:bg-slate-900 ml-2">{quota.tier}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                            <span className="text-xs">Tokens</span>
                            <span className="font-semibold text-sm text-slate-900 dark:text-slate-200 tabular-nums">
                              {(quota.tokens.remaining / 1000).toFixed(1)}K / {(quota.tokens.limit / 1000).toFixed(0)}K
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                            <span className="text-xs">Reasoning</span>
                            <span className="font-semibold text-sm text-slate-900 dark:text-slate-200 tabular-nums">
                              {quota.reasoning.remaining} / {quota.reasoning.limit}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-xs">Next reset in</span>
                            <span className="font-semibold text-sm text-slate-900 dark:text-slate-200 tabular-nums">{timeUntilReset()}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            Resets every 12h (00:00 / 12:00 UTC)
                          </div>
                          {quota.tier === "free" && (
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                              <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-xs flex items-center justify-between group cursor-pointer hover:underline decoration-indigo-600/30 underline-offset-2">
                                <span>Upgrade to Premium</span>
                                <span aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">→</span>
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                300K tokens + 10 reasoning / 12h
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : null
            )}
        </div>
      )}

      {/* Tools tile with popup */}
      {isAuthenticated && toolsConfig && (
        <div className="relative pl-4 border-l border-slate-200 dark:border-slate-800" ref={toolsPopupRef}>
          <button
            type="button"
            onClick={() => setToolsPopupOpen((prev) => !prev)}
            disabled={disabled}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors select-none",
              toolsConfig.enabled
                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                : "bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <Wrench className="h-3 w-3" />
            Tools
            {toolsConfig.enabled && (
              <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            )}
          </button>

          {/* Popup */}
          {toolsPopupOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">AI Tools</span>
                  </div>
                  <Switch
                    checked={toolsConfig.enabled}
                    onCheckedChange={(checked) => onToolsEnabledChange?.(checked)}
                    className="scale-75 data-[state=checked]:bg-emerald-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {toolsConfig.enabled ? "Tools can fetch real-time data for your queries" : "Tools disabled — AI answers from knowledge only"}
                </p>
              </div>

              {toolsConfig.enabled && (
                <div className="p-2 space-y-1">
                  {toolsConfig.tools.map((tool) => {
                    const IconComp = TOOL_ICONS[tool.icon] || Wrench;
                    const isOnlyTool = toolsConfig.tools.length === 1;
                    const enabledCount = toolsConfig.tools.filter((t) => t.enabled).length;
                    const cantDisable = tool.enabled && (isOnlyTool || enabledCount <= 1);

                    return (
                      <div
                        key={tool.id}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={cn(
                            "p-1.5 rounded-md",
                            tool.enabled
                              ? "bg-emerald-100 dark:bg-emerald-900/30"
                              : "bg-slate-100 dark:bg-slate-800"
                          )}>
                            <IconComp className={cn(
                              "h-3.5 w-3.5",
                              tool.enabled
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-slate-400"
                            )} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">{tool.name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{tool.description}</p>
                          </div>
                        </div>
                        <TooltipProvider>
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <div>
                                <Switch
                                  checked={tool.enabled}
                                  onCheckedChange={(checked) => onToolToggle?.(tool.id, checked)}
                                  disabled={cantDisable}
                                  className="scale-[0.6] data-[state=checked]:bg-emerald-600"
                                />
                              </div>
                            </TooltipTrigger>
                            {cantDisable && (
                              <TooltipContent side="left" className="text-xs">
                                Disable tools entirely to turn this off
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
