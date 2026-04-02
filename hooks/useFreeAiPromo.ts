"use client";

import { usePostHog } from "posthog-js/react";
import { useEffect, useState } from "react";

/**
 * Hook to check if the free AI promo message should be shown via PostHog feature flag.
 *
 * Feature Flag: show-free-ai-promo-msg
 * - When true: Shows a promo message to free users about free AI access (limited time offer)
 * - When false: No promo message shown
 *
 * @example
 * ```tsx
 * const { isEnabled, isLoading } = useFreeAiPromo();
 *
 * if (isEnabled && userTier === 'free') {
 *   return <FreeAiPromoBanner />;
 * }
 * return null;
 * ```
 */
export function useFreeAiPromo() {
  const posthog = usePostHog();
  const [isEnabled, setIsEnabled] = useState<boolean | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!posthog) {
      setIsLoading(false);
      setIsEnabled(false);
      return;
    }

    const handleFeatureFlags = () => {
      const enabled = posthog.isFeatureEnabled("show-free-ai-promo-msg");
      setIsEnabled(!!enabled);
      setIsLoading(false);
    };

    // Try immediate check (flags may be bootstrapped)
    const flags = posthog.featureFlags;
    if (flags && flags.getFlagVariants && Object.keys(flags.getFlagVariants()).length > 0) {
      handleFeatureFlags();
    } else {
      // Wait for flags to load
      const unsubscribe = posthog.onFeatureFlags(handleFeatureFlags);
      return () => unsubscribe();
    }
  }, [posthog]);

  return { isEnabled: isEnabled ?? false, isLoading };
}

/**
 * Hook to get the promo message payload (custom message, duration, etc.)
 */
export function useFreeAiPromoPayload() {
  const posthog = usePostHog();
  const [payload, setPayload] = useState<{ message?: string; durationDays?: number } | null>(null);

  useEffect(() => {
    if (!posthog) return;

    const handleFeatureFlags = () => {
      const flagPayload = posthog.getFeatureFlagPayload("show-free-ai-promo-msg");
      // Cast to expected type - PostHog returns JSON-serializable value
      setPayload((flagPayload as { message?: string; durationDays?: number } | null) || null);
    };

    const flags = posthog.featureFlags;
    if (flags && flags.getFlagVariants && Object.keys(flags.getFlagVariants()).length > 0) {
      handleFeatureFlags();
    } else {
      const unsubscribe = posthog.onFeatureFlags(handleFeatureFlags);
      return () => unsubscribe();
    }
  }, [posthog]);

  return { payload };
}
