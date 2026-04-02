"use client";

import { usePostHog } from "posthog-js/react";
import { useEffect, useState, useCallback } from "react";

/**
 * Hook to check if AI features are enabled via PostHog feature flag.
 *
 * Feature Flag: ai-enabled
 * - When true: All users can access Jovan AI
 * - When false: AI features are restricted/unavailable for all users
 *
 * @example
 * ```tsx
 * const { isEnabled, isLoading } = useAiFeatureFlag();
 *
 * if (isLoading) return <Loading />;
 * if (!isEnabled) return <AiUnavailableMessage />;
 * return <AiChatInterface />;
 * ```
 */
export function useAiFeatureFlag() {
  const posthog = usePostHog();
  const [isEnabled, setIsEnabled] = useState<boolean | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if PostHog is ready
    if (!posthog) {
      setIsLoading(false);
      setIsEnabled(false);
      return;
    }

    // Check if feature flags are loaded
    const handleFeatureFlags = () => {
      const enabled = posthog.isFeatureEnabled("ai-enabled");
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
 * Hook to get the feature flag payload when ai-enabled is true.
 *
 * @example
 * ```tsx
 * const { payload } = useAiFeatureFlagPayload();
 *
 * if (payload?.customMessage) {
 *   return <div>{payload.customMessage}</div>;
 * }
 * ```
 */
export function useAiFeatureFlagPayload() {
  const posthog = usePostHog();
  const [payload, setPayload] = useState<any>(null);

  useEffect(() => {
    if (!posthog) return;

    const handleFeatureFlags = () => {
      const flagPayload = posthog.getFeatureFlagPayload("ai-enabled");
      setPayload(flagPayload || null);
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
