"use client";

import { useState } from "react";

interface SkipOnboardingLinkProps {
  onSkip: () => Promise<void>;
  isLoading: boolean;
}

export function SkipOnboardingLink({ onSkip, isLoading }: SkipOnboardingLinkProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (showConfirm) {
    return (
      <div className="text-center text-sm text-slate-500 dark:text-slate-400 space-y-2">
        <p>Are you sure? It only takes 2 more minutes.</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setShowConfirm(false)}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Continue
          </button>
          <button
            onClick={() => {
              setShowConfirm(false);
              onSkip();
            }}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:underline"
          >
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
      className="text-center text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
    >
      Skip for now
    </button>
  );
}
