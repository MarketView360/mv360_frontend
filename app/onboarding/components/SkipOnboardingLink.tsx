"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface SkipOnboardingLinkProps {
  onSkip: () => Promise<void>;
  isLoading: boolean;
}

export function SkipOnboardingLink({
  onSkip,
  isLoading,
}: SkipOnboardingLinkProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  const handleSkip = async () => {
    setIsSkipping(true);
    await onSkip();
    setIsSkipping(false);
  };

  if (showConfirm) {
    return (
      <div className="flex flex-col items-center gap-2 py-1">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Are you sure? It only takes 2 more minutes.
        </p>
        <div className="flex items-center gap-5">
          <button
            onClick={() => setShowConfirm(false)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
          >
            Keep going
          </button>
          <span className="text-slate-200 dark:text-slate-700 text-xs">·</span>
          <button
            onClick={handleSkip}
            disabled={isSkipping || isLoading}
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors disabled:opacity-50"
          >
            {isSkipping && <Loader2 className="h-3 w-3 animate-spin" />}
            Skip anyway
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      disabled={isLoading}
      className="mx-auto block text-xs text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors disabled:opacity-40 py-1"
    >
      Skip for now
    </button>
  );
}