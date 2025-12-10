"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  Lock,
  Zap,
  Brain,
  Eye,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type {
  AIModel,
  AIProviderName,
  ModelCapability,
} from "@/lib/utils/jovan/models";
import { PROVIDER_NAMES } from "@/lib/utils/jovan/models";

const CAPABILITY_ICONS: Record<ModelCapability, React.ReactNode> = {
  reasoning: <Brain className="h-3 w-3 text-purple-500" />,
  vision: <Eye className="h-3 w-3 text-blue-500" />,
  tools: <Wrench className="h-3 w-3 text-green-500" />,
  "voice-input": <Zap className="h-3 w-3 text-orange-500" />,
  chat: null,
};

const SPEED_COLORS: Record<string, string> = {
  "ultra-fast": "text-green-500",
  fast: "text-emerald-500",
  medium: "text-yellow-500",
  slow: "text-orange-500",
};

interface ModelSelectorProps {
  models: Record<AIProviderName, AIModel[]>;
  selectedModel: AIModel | null;
  onSelect: (model: AIModel) => void;
  autoMode: boolean;
  onAutoModeChange: (enabled: boolean) => void;
  disabled?: boolean;
}

export function ModelSelector({
  models,
  selectedModel,
  onSelect,
  autoMode,
  onAutoModeChange,
  disabled = false,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);

  // Get all providers that have models
  const activeProviders = (
    Object.keys(models) as AIProviderName[]
  ).filter((p) => models[p].length > 0);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 min-w-[140px]"
          disabled={disabled}
        >
          {autoMode ? (
            <>
              <Sparkles className="h-4 w-4 text-brand" />
              <span>Auto</span>
            </>
          ) : selectedModel ? (
            <>
              <span className="truncate max-w-[100px]">
                {selectedModel.name}
              </span>
            </>
          ) : (
            <span>Select model</span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 max-h-[400px] overflow-y-auto">
        {/* Auto mode option */}
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              onAutoModeChange(true);
              setOpen(false);
            }}
          >
            <Sparkles className="mr-2 h-4 w-4 text-brand" />
            <div className="flex-1">
              <div className="font-medium">Auto (Smart Routing)</div>
              <div className="text-xs text-muted-foreground">
                Automatically selects the best model
              </div>
            </div>
            {autoMode && <Check className="h-4 w-4 text-brand" />}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Models grouped by provider */}
        {activeProviders.map((provider) => (
          <DropdownMenuGroup key={provider}>
            <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
              {PROVIDER_NAMES[provider]}
            </DropdownMenuLabel>

            {models[provider].map((model) => (
              <DropdownMenuItem
                key={model.id}
                disabled={!model.available && !model.requiresByok}
                onClick={() => {
                  if (model.available || model.requiresByok) {
                    onAutoModeChange(false);
                    onSelect(model);
                    setOpen(false);
                  }
                }}
                className={cn(
                  "flex items-start gap-2 py-2",
                  !model.available && !model.requiresByok && "opacity-50",
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{model.name}</span>
                    {model.requiresByok && (
                      <Lock className="h-3 w-3 text-amber-500 shrink-0" />
                    )}
                    {/* Capability icons */}
                    <div className="flex items-center gap-0.5">
                      {model.capabilities
                        .filter((c) => c !== "chat")
                        .map((cap) => (
                          <span key={cap}>{CAPABILITY_ICONS[cap]}</span>
                        ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={SPEED_COLORS[model.speed]}>
                      {model.speed.replace("-", " ")}
                    </span>
                    <span>·</span>
                    <span>
                      {model.tier === "free"
                        ? "Free"
                        : model.tier === "byok"
                          ? "BYOK"
                          : "Premium"}
                    </span>
                  </div>
                  {model.description && (
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                      {model.description}
                    </div>
                  )}
                </div>

                {!autoMode && selectedModel?.id === model.id && (
                  <Check className="h-4 w-4 text-brand shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
