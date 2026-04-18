'use client';

import { usePostHog } from 'posthog-js/react';

/**
 * Hook for using PostHog analytics
 * @example
 * ```tsx
 * const posthog = usePostHogClient();
 *
 * const handlePurchase = () => {
 *   posthog?.capture('purchase_completed', { amount: 99, currency: 'USD' });
 * };
 * ```
 */
export function usePostHogClient() {
  return usePostHog();
}