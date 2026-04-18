import { getApiUrl } from '../utils';

const API_URL = getApiUrl();

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: string;
  billingPeriod: string;
  amountUsd: number;
  amountInr?: number;
  razorpayPlanId?: string;
  features: string[];
  isActive: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  plan?: SubscriptionPlan;
  razorpaySubscriptionId?: string;
  status: 'pending' | 'active' | 'paused' | 'canceled' | 'expired' | 'past_due';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  canceledAt?: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  subscriptionId?: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
  paymentMethod?: string;
  cardLast4?: string;
  cardBrand?: string;
  invoiceUrl?: string;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  razorpayPaymentMethodId?: string;
  razorpayTokenId?: string;
  methodType: 'card' | 'upi' | 'netbanking' | 'wallet' | 'other';
  cardLast4?: string;
  cardBrand?: string;
  cardIssuer?: string;
  cardType?: string;
  cardExpiryMonth?: number;
  cardExpiryYear?: number;
  upiVpa?: string;
  bankName?: string;
  bankCode?: string;
  walletProvider?: string;
  isDefault: boolean;
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionResponse {
  subscriptionId: string;
  razorpaySubscriptionId: string;
  razorpayKeyId: string;
  shortUrl?: string;
  status: string;
}

export const paymentApi = {
  /**
   * Get all available subscription plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await fetch(`${API_URL}/payment/plans`);
    if (!response.ok) {
      throw new Error('Failed to fetch plans');
    }
    return response.json();
  },

  /**
   * Get current user's subscription
   */
  async getSubscription(token: string): Promise<Subscription | null> {
    const response = await fetch(`${API_URL}/payment/subscription`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch subscription');
    }
    return response.json();
  },

  /**
   * Create a new subscription
   */
  async createSubscription(
    token: string,
    tier: 'premium' | 'max',
    billingPeriod: 'monthly' | 'annual',
  ): Promise<CreateSubscriptionResponse> {
    const response = await fetch(`${API_URL}/payment/subscription/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tier, billingPeriod }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to create subscription');
    }
    return response.json();
  },

  /**
   * Verify payment and activate subscription
   */
  async verifyPayment(
    token: string,
    razorpayPaymentId: string,
    razorpaySubscriptionId: string,
    razorpaySignature: string,
  ): Promise<Subscription> {
    const response = await fetch(`${API_URL}/payment/subscription/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        razorpay_payment_id: razorpayPaymentId,
        razorpay_subscription_id: razorpaySubscriptionId,
        razorpay_signature: razorpaySignature,
      }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Payment verification failed');
    }
    return response.json();
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    token: string,
    cancelImmediately: boolean = false,
    reason?: string,
  ): Promise<Subscription> {
    const response = await fetch(`${API_URL}/payment/subscription/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cancelImmediately, reason }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to cancel subscription');
    }
    return response.json();
  },

  /**
   * Pause subscription
   */
  async pauseSubscription(token: string): Promise<Subscription> {
    const response = await fetch(`${API_URL}/payment/subscription/pause`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to pause subscription');
    }
    return response.json();
  },

  /**
   * Resume subscription
   */
  async resumeSubscription(token: string): Promise<Subscription> {
    const response = await fetch(`${API_URL}/payment/subscription/resume`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to resume subscription');
    }
    return response.json();
  },

  /**
   * Get payment history
   */
  async getPaymentHistory(token: string, limit: number = 20): Promise<Payment[]> {
    const response = await fetch(`${API_URL}/payment/history?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch payment history');
    }
    return response.json();
  },

  // ===================== PAYMENT METHODS =====================

  /**
   * Get all payment methods for the user
   */
  async getPaymentMethods(token: string): Promise<PaymentMethod[]> {
    const response = await fetch(`${API_URL}/payment/methods`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch payment methods');
    }
    return response.json();
  },

  /**
   * Get the default payment method
   */
  async getDefaultPaymentMethod(token: string): Promise<PaymentMethod | null> {
    const response = await fetch(`${API_URL}/payment/methods/default`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch default payment method');
    }
    return response.json();
  },

  /**
   * Set a payment method as default
   */
  async setDefaultPaymentMethod(token: string, paymentMethodId: string): Promise<PaymentMethod> {
    const response = await fetch(`${API_URL}/payment/methods/default`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ paymentMethodId }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to set default payment method');
    }
    return response.json();
  },

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(token: string, paymentMethodId: string): Promise<void> {
    const response = await fetch(`${API_URL}/payment/methods/${paymentMethodId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to delete payment method');
    }
  },

  // ===================== INVOICES =====================

  /**
   * Get invoice URL for a payment
   */
  async getInvoiceUrl(token: string, paymentId: string): Promise<{ invoiceUrl: string | null; invoiceId: string | null }> {
    const response = await fetch(`${API_URL}/payment/invoice/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      if (response.status === 404) return { invoiceUrl: null, invoiceId: null };
      throw new Error('Failed to fetch invoice');
    }
    return response.json();
  },

  /**
   * Generate invoice for a payment
   */
  async generateInvoice(token: string, paymentId: string): Promise<{ invoiceUrl: string; invoiceId: string }> {
    const response = await fetch(`${API_URL}/payment/invoice/${paymentId}/generate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to generate invoice');
    }
    return response.json();
  },
};

/**
 * Load Razorpay checkout script
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Open Razorpay checkout modal
 */
export interface RazorpayCheckoutOptions {
  razorpayKeyId: string;
  razorpaySubscriptionId: string;
  userEmail: string;
  userName: string;
  planName: string;
  onSuccess: (paymentId: string, subscriptionId: string, signature: string) => void;
  onError: (error: any) => void;
  onClose?: () => void;
}

export function openRazorpayCheckout(options: RazorpayCheckoutOptions): void {
  const {
    razorpayKeyId,
    razorpaySubscriptionId,
    userEmail,
    userName,
    planName,
    onSuccess,
    onError,
    onClose,
  } = options;

  const razorpayOptions = {
    key: razorpayKeyId,
    subscription_id: razorpaySubscriptionId,
    name: 'MarketView360',
    description: `${planName} Subscription`,
    image: 'https://www.marketview360.io/logo.png',
    prefill: {
      name: userName,
      email: userEmail,
    },
    theme: {
      color: '#667eea',
    },
    handler: function (response: any) {
      onSuccess(
        response.razorpay_payment_id,
        response.razorpay_subscription_id,
        response.razorpay_signature,
      );
    },
    modal: {
      ondismiss: function () {
        onClose?.();
      },
      escape: true,
      animation: true,
    },
  };

  try {
    const razorpay = new (window as any).Razorpay(razorpayOptions);
    razorpay.on('payment.failed', function (response: any) {
      onError(response.error);
    });
    razorpay.open();
  } catch (error) {
    onError(error);
  }
}
