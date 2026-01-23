"use client";

import { useState, useEffect } from "react";
import { ExternalLink, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExternalLinkWarningProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  onConfirm: () => void;
}

const STORAGE_KEY = "mv360_external_link_warning_dismissed";

export function ExternalLinkWarning({
  open,
  onOpenChange,
  url,
  onConfirm,
}: ExternalLinkWarningProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (open) {
      const dismissed = localStorage.getItem(STORAGE_KEY) === "true";
      if (dismissed) {
        onConfirm();
        onOpenChange(false);
      }
    }
  }, [open, onConfirm, onOpenChange]);

  const handleConfirm = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    onConfirm();
    onOpenChange(false);
  };

  const getHostname = (link: string) => {
    try {
      return new URL(link).hostname;
    } catch {
      return link;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div
        className={cn(
          "relative z-50 w-full max-w-md rounded-xl border shadow-2xl",
          "bg-white dark:bg-slate-900",
          "border-slate-200 dark:border-slate-700",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}
      >
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Leaving MarketView360
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                You are about to visit an external website
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-4">
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Destination
            </p>
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <p className="text-sm text-slate-700 dark:text-slate-300 break-all font-mono">
                {getHostname(url)}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            This link will take you to a third-party website. MarketView360 is not
            responsible for the content, accuracy, or privacy practices of
            external sites.
          </p>

          {/* Don't show again checkbox */}
          <label className="mt-4 flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-brand focus:ring-brand focus:ring-offset-0"
            />
            <span className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
              Don&apos;t show this warning again
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center justify-center min-w-[100px] h-9 px-4 rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center justify-center min-w-[100px] h-9 px-4 rounded-md bg-brand text-white hover:bg-brand/90 transition-colors"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export function useExternalLinkWarning() {
  const [warningState, setWarningState] = useState<{
    open: boolean;
    url: string;
  }>({ open: false, url: "" });

  const showWarning = (url: string) => {
    const dismissed = localStorage.getItem(STORAGE_KEY) === "true";
    if (dismissed) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      setWarningState({ open: true, url });
    }
  };

  const closeWarning = () => {
    setWarningState({ open: false, url: "" });
  };

  const confirmNavigation = () => {
    if (warningState.url) {
      window.open(warningState.url, "_blank", "noopener,noreferrer");
    }
    closeWarning();
  };

  return {
    warningState,
    showWarning,
    closeWarning,
    confirmNavigation,
    setWarningOpen: (open: boolean) =>
      setWarningState((prev) => ({ ...prev, open })),
  };
}
