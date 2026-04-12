'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { paymentApi, Subscription, SubscriptionPlan, Payment } from '@/lib/api/payment';

interface PaymentStatus {
  subscription: Subscription | null;
  plans: SubscriptionPlan[];
  payments: Payment[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isPremium: boolean;
  isMax: boolean;
  isFree: boolean;
  canUpgrade: boolean;
  daysUntilExpiry: number | null;
}

export function usePaymentStatus(): PaymentStatus {
  const { session, isLoading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (authLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Always fetch plans (public endpoint)
      const plansData = await paymentApi.getPlans();
      setPlans(plansData);

      // Fetch subscription and payments if authenticated
      if (session?.access_token) {
        const [subscriptionData, paymentsData] = await Promise.all([
          paymentApi.getSubscription(session.access_token),
          paymentApi.getPaymentHistory(session.access_token, 10),
        ]);
        setSubscription(subscriptionData);
        setPayments(paymentsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token, authLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Compute derived state
  const isPremium = subscription?.status === 'active' && subscription?.plan?.tier === 'premium';
  const isMax = subscription?.status === 'active' && subscription?.plan?.tier === 'max';
  const isFree = !subscription || subscription.status !== 'active';
  const canUpgrade = isFree || isPremium;

  // Calculate days until expiry
  let daysUntilExpiry: number | null = null;
  if (subscription?.currentPeriodEnd) {
    const endDate = new Date(subscription.currentPeriodEnd);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return {
    subscription,
    plans,
    payments,
    isLoading: isLoading || authLoading,
    error,
    refetch: fetchData,
    isPremium,
    isMax,
    isFree,
    canUpgrade,
    daysUntilExpiry,
  };
}

/**
 * Hook for managing subscription checkout flow
 */
export function useSubscriptionCheckout() {
  const { session } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateCheckout = useCallback(
    async (
      tier: 'premium' | 'max',
      billingPeriod: 'monthly' | 'annual',
      userEmail: string,
      userName: string,
    ): Promise<boolean> => {
      if (!session?.access_token) {
        setError('Please sign in to continue');
        return false;
      }

      setIsProcessing(true);
      setError(null);

      try {
        // Load Razorpay script
        const { loadRazorpayScript, openRazorpayCheckout, paymentApi } = await import(
          '@/lib/api/payment'
        );
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error('Failed to load payment gateway');
        }

        // Create subscription on backend
        const subscriptionData = await paymentApi.createSubscription(
          session.access_token,
          tier,
          billingPeriod,
        );

        // Open Razorpay checkout
        return new Promise((resolve) => {
          openRazorpayCheckout({
            razorpayKeyId: subscriptionData.razorpayKeyId,
            razorpaySubscriptionId: subscriptionData.razorpaySubscriptionId,
            userEmail,
            userName,
            planName: `${tier.charAt(0).toUpperCase() + tier.slice(1)} ${billingPeriod}`,
            onSuccess: async (paymentId, subscriptionId, signature) => {
              try {
                // Verify payment on backend
                await paymentApi.verifyPayment(
                  session.access_token!,
                  paymentId,
                  subscriptionId,
                  signature,
                );
                setIsProcessing(false);
                resolve(true);
              } catch (verifyError) {
                setError('Payment verification failed. Please contact support.');
                setIsProcessing(false);
                resolve(false);
              }
            },
            onError: (err) => {
              setError(err?.description || 'Payment failed. Please try again.');
              setIsProcessing(false);
              resolve(false);
            },
            onClose: () => {
              setIsProcessing(false);
              resolve(false);
            },
          });
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initiate payment');
        setIsProcessing(false);
        return false;
      }
    },
    [session?.access_token],
  );

  return {
    initiateCheckout,
    isProcessing,
    error,
    clearError: () => setError(null),
  };
}
