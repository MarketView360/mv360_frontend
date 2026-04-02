"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const BANNER_DISMISS_KEY = "onboarding_banner_dismissed";
const BANNER_SHOW_DAYS = 7;

interface OnboardingBannerProps {
  className?: string;
}

export function OnboardingBanner({ className = "" }: OnboardingBannerProps) {
  const router = useRouter();
  const { session } = useAuth();
  const [show, setShow] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  useEffect(() => {
    const checkBannerVisibility = async () => {
      if (!session) return;

      // Check localStorage first for quick dismissal
      const dismissed = localStorage.getItem(BANNER_DISMISS_KEY);
      if (dismissed) {
        const dismissedAt = new Date(dismissed);
        const daysSinceDismissed = (Date.now() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed < BANNER_SHOW_DAYS) {
          return; // Still within dismissal period
        }
      }

      try {
        const response = await fetch(`${API_BASE}/profile/onboarding-status`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (response.ok) {
          const data = await response.json();
          // Show banner for users who need onboarding (either incomplete or skipped but banner not dismissed)
          if (data.needs_onboarding) {
            // For skipped users, also check server-side dismissal
            if (data.skipped) {
              const profileRes = await fetch(`${API_BASE}/profile`, {
                headers: { Authorization: `Bearer ${session.access_token}` },
              });
              if (profileRes.ok) {
                const profile = await profileRes.json();
                const metadata = profile.onboarding_metadata || {};
                if (!metadata.skip_banner_dismissed) {
                  setShow(true);
                }
              }
            } else {
              // For incomplete onboarding, always show banner
              setShow(true);
            }
          }
        }
      } catch {
        // Silently fail
      }
    };

    checkBannerVisibility();
  }, [session]);

  const handleDismiss = async () => {
    setIsDismissing(true);
    
    // Save to localStorage immediately for quick UX
    localStorage.setItem(BANNER_DISMISS_KEY, new Date().toISOString());
    setShow(false);

    // Also save to server
    if (session) {
      try {
        await fetch(`${API_BASE}/profile/onboarding/dismiss-banner`, {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
      } catch {
        // Silently fail - localStorage already has the dismissal
      }
    }
  };

  const handleComplete = () => {
    router.push("/onboarding?resume=true");
  };

  if (!show) return null;

  return (
    <div
      className={`bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white px-4 py-3 ${className}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm font-medium flex-1">
          Complete your profile for a personalized experience
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleComplete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            Complete Setup
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={handleDismiss}
            disabled={isDismissing}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
