"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { shouldShowAds, type UserPlan } from "@/lib/adsControl";

/**
 * Hook to determine if Google Ads should be visible based on:
 * - Current page pathname
 * - User's subscription plan
 * - PostHog feature flag state
 */
export function useAdsVisible(userPlan: UserPlan): boolean {
  const pathname = usePathname();
  const [showAds, setShowAds] = useState(false);

  useEffect(() => {
    // Initial check
    setShowAds(shouldShowAds(pathname, userPlan));

    // Listen for feature flag changes
    const unsubscribe = posthog.onFeatureFlags(() => {
      setShowAds(shouldShowAds(pathname, userPlan));
    });

    return () => {
      unsubscribe();
    };
  }, [pathname, userPlan]);

  return showAds;
}
