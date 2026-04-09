"use client";

import { usePostHog } from "posthog-js/react";
import { useEffect, useState } from "react";

/**
 * Hook to check if AI is enabled for free users via PostHog feature flag.
 *
 * Feature Flag: ai-enable-free
 * - When true: Free users can access AI with 20K token limit
 * - When false: AI access restricted to premium users only
 *
 * @example
 * ```tsx
 * const { isEnabled, isLoading } = useAiEnableFree();
 *
 * if (!isEnabled && userTier === 'free') {
 *   return <PremiumRequired />;
 * }
 * return <AiChatInterface />;
 * ```
 */
export function useAiEnableFree() {
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
      const enabled = posthog.isFeatureEnabled("ai-enable-free");
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
 * Hook to get the token limit for free users when ai-enable-free is enabled.
 * Returns the payload value or default of 20000 tokens.
 */
export function useAiEnableFreePayload() {
  const posthog = usePostHog();
  const [payload, setPayload] = useState<{ tokenLimit?: number } | null>(null);

  useEffect(() => {
    if (!posthog) return;

    const handleFeatureFlags = () => {
      const flagPayload = posthog.getFeatureFlagPayload("ai-enable-free");
      // Cast to expected type - PostHog returns JSON-serializable value
      setPayload((flagPayload as { tokenLimit?: number } | null) || null);
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
