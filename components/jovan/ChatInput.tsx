"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Brain, AlertTriangle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ChatMessage } from "@/lib/utils/jovan/types";

export function ChatInput({
  input,
  setInput,
  onSend,
  disabled,
  reasoningEnabled,
  setReasoningEnabled,
  quota,
}: {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
  reasoningEnabled: boolean;
  setReasoningEnabled: (v: boolean) => void;
  quota: { used: number; limit: number; resetsAt: string };
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canUseReasoning = quota.used < quota.limit;

  return (
    <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            id="chat-input"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="Ask Jovan anything about finance, metrics, or screening..."
            className="resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-brand dark:border-slate-700"
          />
          <div className="mt-1 flex items-center justify-between">
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Ctrl+Enter to send
            </p>
          </div>
        </div>
        <Button
          size="icon"
          className="rounded-full bg-brand text-white hover:bg-brand-dark"
          onClick={onSend}
          disabled={disabled || !input.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}