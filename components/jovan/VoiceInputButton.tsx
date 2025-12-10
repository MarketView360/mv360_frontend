"use client";

import { useEffect } from "react";
import { Mic, MicOff, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useVoiceInput } from "@/hooks/useVoiceInput";

interface VoiceInputButtonProps {
  token: string | null;
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export function VoiceInputButton({
  token,
  onTranscript,
  disabled = false,
  className,
}: VoiceInputButtonProps) {
  const {
    isRecording,
    isProcessing,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    duration,
  } = useVoiceInput({
    token,
    onTranscript,
    onError: (err) => console.error("Voice input error:", err),
  });

  // Format duration as MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle click based on current state
  const handleClick = async () => {
    if (isRecording) {
      await stopRecording();
    } else if (!isProcessing) {
      await startRecording();
    }
  };

  // Keyboard shortcut: Escape to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isRecording) {
        cancelRecording();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRecording, cancelRecording]);

  const getButtonContent = () => {
    if (isProcessing) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="sr-only">Processing...</span>
        </>
      );
    }

    if (isRecording) {
      return (
        <>
          <div className="relative">
            <MicOff className="h-4 w-4" />
            {/* Recording indicator pulse */}
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          </div>
          <span className="ml-1 text-xs tabular-nums">
            {formatDuration(duration)}
          </span>
        </>
      );
    }

    return <Mic className="h-4 w-4" />;
  };

  const getTooltipContent = () => {
    if (isProcessing) return "Processing audio...";
    if (isRecording) return "Click to stop recording (Esc to cancel)";
    if (error) return error;
    return "Voice input (click to record)";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("relative inline-flex", className)}>
            <Button
              type="button"
              variant={isRecording ? "destructive" : "ghost"}
              size="icon"
              onClick={handleClick}
              disabled={disabled || isProcessing || !token}
              className={cn(
                "h-8 w-auto px-2 transition-all",
                isRecording && "bg-red-500 hover:bg-red-600 text-white",
                isProcessing && "opacity-70",
              )}
            >
              {getButtonContent()}
            </Button>

            {/* Cancel button when recording */}
            {isRecording && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={cancelRecording}
                className="h-8 w-8 ml-1 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Cancel recording</span>
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{getTooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
