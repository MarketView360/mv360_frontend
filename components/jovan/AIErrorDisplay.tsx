"use client";

import { AlertCircle, RefreshCw, Settings, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// Error codes matching backend AIErrorCode
export type AIErrorCode =
  | "INVALID_API_KEY"
  | "MISSING_API_KEY"
  | "BYOK_REQUIRED"
  | "QUOTA_EXCEEDED"
  | "RATE_LIMITED"
  | "PROVIDER_ERROR"
  | "PROVIDER_UNAVAILABLE"
  | "PROVIDER_TIMEOUT"
  | "INVALID_REQUEST"
  | "MODEL_NOT_FOUND"
  | "CONTEXT_TOO_LONG"
  | "UNKNOWN_ERROR";

export interface AIError {
  code: AIErrorCode;
  message: string;
  hint?: string;
  provider?: string;
  model?: string;
}

interface AIErrorDisplayProps {
  error: AIError | string | null;
  onRetry?: () => void;
  onSwitchModel?: () => void;
  onOpenSettings?: () => void;
  className?: string;
}

// Map error codes to display info
const ERROR_INFO: Record<
  AIErrorCode,
  {
    title: string;
    icon: "alert" | "settings" | "zap";
    variant: "default" | "destructive";
    showRetry: boolean;
    showSwitchModel: boolean;
    showSettings: boolean;
  }
> = {
  INVALID_API_KEY: {
    title: "Invalid API Key",
    icon: "settings",
    variant: "destructive",
    showRetry: false,
    showSwitchModel: true,
    showSettings: true,
  },
  MISSING_API_KEY: {
    title: "API Key Required",
    icon: "settings",
    variant: "default",
    showRetry: false,
    showSwitchModel: true,
    showSettings: true,
  },
  BYOK_REQUIRED: {
    title: "API Key Required",
    icon: "settings",
    variant: "default",
    showRetry: false,
    showSwitchModel: true,
    showSettings: true,
  },
  QUOTA_EXCEEDED: {
    title: "Usage Limit Reached",
    icon: "zap",
    variant: "default",
    showRetry: false,
    showSwitchModel: true,
    showSettings: false,
  },
  RATE_LIMITED: {
    title: "Too Many Requests",
    icon: "alert",
    variant: "default",
    showRetry: true,
    showSwitchModel: false,
    showSettings: false,
  },
  PROVIDER_ERROR: {
    title: "Provider Error",
    icon: "alert",
    variant: "destructive",
    showRetry: true,
    showSwitchModel: true,
    showSettings: false,
  },
  PROVIDER_UNAVAILABLE: {
    title: "Service Unavailable",
    icon: "alert",
    variant: "destructive",
    showRetry: true,
    showSwitchModel: true,
    showSettings: false,
  },
  PROVIDER_TIMEOUT: {
    title: "Request Timeout",
    icon: "alert",
    variant: "default",
    showRetry: true,
    showSwitchModel: true,
    showSettings: false,
  },
  INVALID_REQUEST: {
    title: "Invalid Request",
    icon: "alert",
    variant: "destructive",
    showRetry: false,
    showSwitchModel: false,
    showSettings: false,
  },
  MODEL_NOT_FOUND: {
    title: "Model Not Available",
    icon: "alert",
    variant: "default",
    showRetry: false,
    showSwitchModel: true,
    showSettings: false,
  },
  CONTEXT_TOO_LONG: {
    title: "Conversation Too Long",
    icon: "alert",
    variant: "default",
    showRetry: false,
    showSwitchModel: true,
    showSettings: false,
  },
  UNKNOWN_ERROR: {
    title: "Something Went Wrong",
    icon: "alert",
    variant: "destructive",
    showRetry: true,
    showSwitchModel: false,
    showSettings: false,
  },
};

/**
 * Parse error from various formats into AIError
 */
function parseError(error: AIError | string | null): AIError | null {
  if (!error) return null;

  if (typeof error === "string") {
    // Try to detect error type from message
    const lowerMsg = error.toLowerCase();

    if (lowerMsg.includes("api key") || lowerMsg.includes("authentication")) {
      return {
        code: "INVALID_API_KEY",
        message: error,
        hint: "Check your API key in Settings",
      };
    }

    if (lowerMsg.includes("quota") || lowerMsg.includes("limit")) {
      return {
        code: "QUOTA_EXCEEDED",
        message: error,
        hint: "Wait for your quota to reset or try a free model",
      };
    }

    if (lowerMsg.includes("timeout")) {
      return {
        code: "PROVIDER_TIMEOUT",
        message: error,
        hint: "Try again or use a faster model",
      };
    }

    if (lowerMsg.includes("unavailable") || lowerMsg.includes("503")) {
      return {
        code: "PROVIDER_UNAVAILABLE",
        message: error,
        hint: "The service is temporarily unavailable",
      };
    }

    return {
      code: "UNKNOWN_ERROR",
      message: error,
      hint: "Please try again",
    };
  }

  return error;
}

export function AIErrorDisplay({
  error,
  onRetry,
  onSwitchModel,
  onOpenSettings,
  className,
}: AIErrorDisplayProps) {
  const parsedError = parseError(error);

  if (!parsedError) return null;

  const info = ERROR_INFO[parsedError.code] ?? ERROR_INFO.UNKNOWN_ERROR;

  const IconComponent =
    info.icon === "settings"
      ? Settings
      : info.icon === "zap"
        ? Zap
        : AlertCircle;

  return (
    <Alert
      variant={info.variant}
      className={cn("my-2", className)}
    >
      <IconComponent className="h-4 w-4" />
      <AlertTitle>{info.title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p>{parsedError.message}</p>
        {parsedError.hint && (
          <p className="mt-1 text-sm opacity-80">{parsedError.hint}</p>
        )}

        {/* Action buttons */}
        <div className="mt-3 flex flex-wrap gap-2">
          {info.showRetry && onRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              className="h-7 text-xs"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Try Again
            </Button>
          )}

          {info.showSwitchModel && onSwitchModel && (
            <Button
              size="sm"
              variant="outline"
              onClick={onSwitchModel}
              className="h-7 text-xs"
            >
              Switch Model
            </Button>
          )}

          {info.showSettings && onOpenSettings && (
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenSettings}
              className="h-7 text-xs"
            >
              <Settings className="mr-1 h-3 w-3" />
              Settings
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Inline error message for chat
 */
export function AIErrorInline({
  error,
  onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-destructive">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>{error}</span>
      {onRetry && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onRetry}
          className="h-6 px-2 text-xs"
        >
          <RefreshCw className="mr-1 h-3 w-3" />
          Retry
        </Button>
      )}
    </div>
  );
}
