'use client';

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

// ===================== SUBSCRIPTION EVENTS =====================

/**
 * Track subscription initiated event
 */
export function trackSubscriptionInitiated(tier: string, billingPeriod: string, amount: number) {
  capturePostHogEvent('subscription_initiated', {
    tier,
    billing_period: billingPeriod,
    amount,
    currency: 'USD',
  });
}

/**
 * Track subscription completed event
 */
export function trackSubscriptionCompleted(
  tier: string,
  billingPeriod: string,
  amount: number,
  paymentId?: string,
) {
  capturePostHogEvent('subscription_completed', {
    tier,
    billing_period: billingPeriod,
    amount,
    currency: 'USD',
    payment_id: paymentId,
  });
}

/**
 * Track subscription cancelled event
 */
export function trackSubscriptionCancelled(
  tier: string,
  cancelImmediately: boolean,
  reasons: string[],
  satisfactionScore?: number,
) {
  capturePostHogEvent('subscription_cancelled', {
    tier,
    cancel_immediately: cancelImmediately,
    reasons,
    satisfaction_score: satisfactionScore,
  });
}

/**
 * Track subscription resumed event
 */
export function trackSubscriptionResumed(tier: string) {
  capturePostHogEvent('subscription_resumed', {
    tier,
  });
}

/**
 * Track upgrade initiated
 */
export function trackUpgradeInitiated(fromTier: string, toTier: string) {
  capturePostHogEvent('upgrade_initiated', {
    from_tier: fromTier,
    to_tier: toTier,
  });
}

/**
 * Track upgrade completed
 */
export function trackUpgradeCompleted(fromTier: string, toTier: string) {
  capturePostHogEvent('upgrade_completed', {
    from_tier: fromTier,
    to_tier: toTier,
  });
}

/**
 * Track downgrade initiated
 */
export function trackDowngradeInitiated(fromTier: string, toTier: string) {
  capturePostHogEvent('downgrade_initiated', {
    from_tier: fromTier,
    to_tier: toTier,
  });
}

/**
 * Track payment failed
 */
export function trackPaymentFailed(tier: string, errorCode: string, errorDescription: string) {
  capturePostHogEvent('payment_failed', {
    tier,
    error_code: errorCode,
    error_description: errorDescription,
  });
}

/**
 * Track cancellation feedback view
 */
export function trackCancellationFeedbackView(tier: string) {
  capturePostHogEvent('cancellation_feedback_viewed', {
    tier,
  });
}

/**
 * Track billing page viewed
 */
export function trackBillingPageViewed(currentTier: string) {
  capturePostHogEvent('billing_page_viewed', {
    current_tier: currentTier,
  });
}

/**
 * Track pricing page viewed
 */
export function trackPricingPageViewed(currentTier: string | null) {
  capturePostHogEvent('pricing_page_viewed', {
    current_tier: currentTier || 'unauthenticated',
  });
}

// Re-export the hook from a separate file to avoid circular dependencies
export { usePostHogClient } from './posthog-hooks';
