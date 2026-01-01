"use client";

import React from "react";
import { Lock, KeyRound } from "lucide-react";
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
    id: "gpt",
    name: "GPT OSS",
    provider: "openai",
    icon: Icons.OpenAI,
    description: "OpenAI's GPT model",
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

interface ModelSelectorProps {
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
  isReasoningEnabled: boolean;
  onReasoningChange: (enabled: boolean) => void;
  className?: string;
  reasoningLabel?: string;
  disabled?: boolean;
}

export function ModelSelector({
  selectedModelId,
  onModelChange,
  isReasoningEnabled,
  onReasoningChange,
  className,
  reasoningLabel = "Reasoning",
  disabled = false,
}: ModelSelectorProps) {
  const selectedModel = MODELS.find((m) => m.id === selectedModelId) || MODELS[0];
  const { session } = useAuth();
  const { quota, loading, timeUntilReset } = useQuota(session?.access_token ?? null);
  
  // Hide quota UI for non-logged-in users
  const isAuthenticated = !!session;

  const getQuotaDisplay = () => {
    if (!quota) return null;
    const type = isReasoningEnabled ? "reasoning" : "standard";
    const q = quota[type];
    if (q.unlimited) return "Unlimited";
    const remaining = Math.max(0, q.limit - q.used);
    return `${remaining} out of ${q.limit} remaining`;
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
            {loading ? (
                <div className="ml-2 h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            ) : quota && isAuthenticated && (
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <span className="ml-1.5 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-help transition-colors border border-slate-200 dark:border-slate-800 rounded-full px-2 py-0.5 bg-slate-50 dark:bg-slate-900/50">
                      {getQuotaDisplay()}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[280px] text-xs p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl select-none z-[100]">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-50">Usage Quota</span>
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 uppercase tracking-wider font-semibold bg-slate-50 dark:bg-slate-900 ml-2">{quota.tier}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                          <span className="text-xs">Next Reset</span>
                          <span className="font-semibold text-sm text-slate-900 dark:text-slate-200 tabular-nums">{timeUntilReset()}</span>
                        </div>
                        {quota.tier === "free" && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-xs flex items-center justify-between group cursor-pointer hover:underline decoration-indigo-600/30 underline-offset-2">
                              <span>Upgrade your plan</span>
                              <span aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">→</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
        </div>
      )}
    </div>
  );
}
