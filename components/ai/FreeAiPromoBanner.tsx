"use client";

import { X, Sparkles, Clock, Zap } from "lucide-react";
import { useFreeAiPromo } from "@/hooks/useFreeAiPromo";
import { useAuth } from "@/providers/AuthProvider";
import { useState, useEffect } from "react";

const BANNER_DISMISS_KEY = "free_ai_promo_dismissed";

export function FreeAiPromoBanner() {
  const { isEnabled, isLoading } = useFreeAiPromo();
  const { session } = useAuth();
  const [show, setShow] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  // Check if user has dismissed the banner
  useEffect(() => {
    if (isLoading) return;

    const dismissed = localStorage.getItem(BANNER_DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = new Date(dismissed);
      const hoursSinceDismissal = (Date.now() - dismissedAt.getTime()) / (1000 * 60 * 60);
      // Don't show again for 24 hours after dismissal
      if (hoursSinceDismissal < 24) {
        return;
      }
    }

    // Only show to authenticated free users when flag is enabled
    if (isEnabled && session) {
      setShow(true);
    }
  }, [isEnabled, isLoading, session]);

  const handleDismiss = () => {
    setIsDismissing(true);
    localStorage.setItem(BANNER_DISMISS_KEY, new Date().toISOString());
    setShow(false);
  };

  if (!show || isLoading) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-600 dark:via-teal-600 dark:to-cyan-600 text-white">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">
                🎉 Free AI Access - Limited Time!
              </p>
              <p className="text-xs text-emerald-100 mt-0.5 flex items-center gap-2">
                <span>Get 20,000 free tokens every 12 hours</span>
                <span className="hidden sm:inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-medium">
                  <Clock className="h-3 w-3" />
                  Offer ends soon
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.href = "/ai"}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors whitespace-nowrap"
            >
              <Zap className="h-3.5 w-3.5" />
              Try Now
            </button>
            <button
              onClick={handleDismiss}
              disabled={isDismissing}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
