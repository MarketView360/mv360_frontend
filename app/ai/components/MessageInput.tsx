"use client";

import React, { useRef, useState, useEffect } from "react";
import { Paperclip, Mic, Globe, Image as ImageIcon, CornerRightUp, Loader2, Square, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";
import { PaywallModal } from "@/components/paywall/PaywallModal";
import { ContextSelector } from "./ContextSelector";
import { Badge } from "@/components/ui/badge";

interface MessageInputProps {
  onSendMessage: (content: string, contextData?: { watchlistName: string; context: string; isWatchlistAnalysis?: boolean }) => void;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
  onContextSelect?: (watchlistId: string, watchlistName: string, context: string) => void;
}

const DEFAULT_MAX_LENGTH = 4000;

export function MessageInput({
  onSendMessage,
  className,
  disabled = false,
  maxLength = DEFAULT_MAX_LENGTH,
  onContextSelect
}: MessageInputProps) {
  const [input, setInput] = useState("");
  const [selectedContext, setSelectedContext] = useState<{ watchlistName: string; context: string; isWatchlistAnalysis?: boolean } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { session } = useAuth();
  // Simplified check, assuming session structure. 
  // Ideally this should be a hook `useIsPro()` but inline is fine.
  const isPro = session?.tier === "premium" || session?.tier === "pro" || session?.tier === "elite";

  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState("Pro Feature");

  const {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    error: voiceError
  } = useVoiceInput({
    token: session?.access_token ?? null,
    onTranscript: (text) => {
      setInput((prev) => {
        const needsSpace = prev.length > 0 && !prev.endsWith(" ");
        return prev + (needsSpace ? " " : "") + text;
      });
      // Auto-resize after transcript update
      setTimeout(adjustTextareaHeight, 0);
    },
    onError: (err) => toast.error("Voice Error", { description: err }),
  });

  const remainingChars = maxLength - input.length;
  const isNearLimit = remainingChars < 200;
  const isAtLimit = remainingChars <= 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleContextSelect = (watchlistId: string, watchlistName: string, context: string) => {
    setSelectedContext({ watchlistName, context, isWatchlistAnalysis: true });
    if (onContextSelect) {
      onContextSelect(watchlistId, watchlistName, context);
    }
  };

  const handleSubmit = () => {
    if (!input.trim() && !isRecording) return;

    // If recording, stop and don't send yet (let user review transcript)
    if (isRecording) {
      stopRecording();
      return;
    }

    onSendMessage(input, selectedContext || undefined);
    setInput("");
    setSelectedContext(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const toggleRecording = async () => {
    if (!isPro) {
      setPaywallFeature("Voice Input");
      setShowPaywall(true);
      return;
    }

    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleFileClick = () => {
    if (!isPro) {
      setPaywallFeature("Document Analysis");
      setShowPaywall(true);
      return;
    }
    // Placeholder for file attachment feature
    toast.info("Document upload coming soon!");
  };

  const handleImageClick = () => {
    if (!isPro) {
      setPaywallFeature("Image Analysis");
      setShowPaywall(true);
      return;
    }
    // Placeholder for image upload feature
    toast.info("Image upload coming soon!");
  };

  return (
    <>
      <div className={cn("relative max-w-3xl mx-auto w-full", className)}>
        <div className={cn("relative flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-200 focus-within:border-indigo-400 focus-within:shadow-md", className)}>
          {/* Selected Context Badge */}
          {selectedContext && (
            <div className="px-4 pt-3 pb-1">
              <Badge variant="secondary" className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 gap-1.5">
                <span>📋 {selectedContext.watchlistName}</span>
                <button
                  onClick={() => setSelectedContext(null)}
                  className="ml-1 hover:bg-violet-200 dark:hover:bg-violet-800 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            </div>
          )}

          {/* Text Area */}
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= maxLength) {
                setInput(value);
                adjustTextareaHeight();
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Listening..." : "Ask anything about finance, markets, or stocks..."}
            className="min-h-[60px] max-h-[200px] w-full resize-none border-none bg-transparent px-4 py-4 focus-visible:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 disabled:opacity-50"
            rows={1}
            disabled={disabled || isAtLimit || isProcessing}
          />

          {/* Toolbar */}
          <div className="flex items-center justify-between px-2 pb-2 mt-2">
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      disabled={isRecording}
                      onClick={handleFileClick}
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Attach file (Pro)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      disabled={isRecording}
                      onClick={handleImageClick}
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Upload image (Pro)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" disabled={isRecording}>
                      <Globe className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Search web</TooltipContent>
                </Tooltip>

                {onContextSelect && (
                  <ContextSelector
                    onSelectWatchlist={handleContextSelect}
                    disabled={isRecording || disabled}
                  />
                )}
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={toggleRecording}
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 rounded-full transition-all duration-300",
                        isRecording
                          ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-500 animate-pulse"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      )}
                      disabled={disabled || isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isRecording ? (
                        <Square className="w-3 h-3 fill-current" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isRecording ? "Stop recording" : "Voice input (Pro)"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                onClick={handleSubmit}
                disabled={(!input.trim() && !isRecording) || disabled || isProcessing}
                className={cn(
                  "h-8 w-8 rounded-lg p-0 transition-all duration-200",
                  (input.trim() || isRecording) && !disabled
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                )}
              >
                <CornerRightUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 px-1">
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            {isRecording ? "Listening..." : isProcessing ? "Transcribing..." : "AI can make mistakes. Please verify important financial information."}
          </p>
          {isNearLimit && (
            <p className={cn(
              "text-[10px] font-medium",
              isAtLimit ? "text-red-500" : "text-amber-500"
            )}>
              {remainingChars} characters remaining
            </p>
          )}
        </div>
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature={paywallFeature}
        benefits={[
          "Voice commands & dictation",
          "PDF & Document analysis",
          "Image recognition",
          "Unlimited reasoning models"
        ]}
      />
    </>
  );
}
