'use client';

import { usePostHog } from 'posthog-js/react';
import { useCallback } from 'react';

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

/**
 * Capture a PostHog event
 * @param eventName - The name of the event to capture
 * @param properties - Optional properties to include with the event
 *
 * @example
 * ```tsx
 * import { capturePostHogEvent } from '@/lib/posthog';
 *
 * capturePostHogEvent('button_clicked', { button_id: 'subscribe' });
 * ```
 */
export function capturePostHogEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    const posthog = (window as any).posthog;
    if (posthog) {
      posthog.capture(eventName, properties);
    }
  }
}

/**
 * Identify a user in PostHog
 * @param userId - Unique user identifier
 * @param properties - Optional user properties
 */
export function identifyPostHogUser(userId: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    const posthog = (window as any).posthog;
    if (posthog) {
      posthog.identify(userId, properties);
    }
  }
}

/**
 * Check if PostHog is initialized and ready
 */
export function isPostHogReady(): boolean {
  if (typeof window !== 'undefined') {
    const posthog = (window as any).posthog;
    return !!posthog && posthog.__loaded;
  }
  return false;
}
