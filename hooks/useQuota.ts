"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export interface QuotaStatus {
  standard: { used: number; limit: number; unlimited: boolean };
  reasoning: { used: number; limit: number; unlimited: boolean };
  premium: { used: number; limit: number; unlimited: boolean };
  voice: { used: number; limit: number; unlimited: boolean };
  resetsAt: string;
  tier: "free" | "premium";
}

interface UseQuotaResult {
  quota: QuotaStatus | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  canUse: (type: "standard" | "reasoning" | "premium" | "voice") => boolean;
  getRemaining: (type: "standard" | "reasoning" | "premium" | "voice") => number;
  timeUntilReset: () => string;
}

/**
 * Hook to fetch and manage user quota
 */
export function useQuota(token: string | null): UseQuotaResult {
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuota = useCallback(async () => {
    if (!token) {
      // Mock data for unauthenticated/dev state
      setQuota({
        standard: { used: 12, limit: 50, unlimited: false },
        reasoning: { used: 3, limit: 5, unlimited: false },
        premium: { used: 0, limit: 0, unlimited: false },
        voice: { used: 0, limit: 0, unlimited: false },
        resetsAt: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(), // 4 hours from now
        tier: "free"
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

      const response = await fetch(`${API_BASE}/ai/quota`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Failed to fetch quota");
      }

      const data = await response.json();
      setQuota(data);
    } catch (err) {
      console.error("Quota fetch error:", err);
      // Fallback mock data for development/demo when backend is unreachable
      setQuota({
        standard: { used: 12, limit: 50, unlimited: false },
        reasoning: { used: 3, limit: 5, unlimited: false },
        premium: { used: 0, limit: 0, unlimited: false },
        voice: { used: 0, limit: 0, unlimited: false },
        resetsAt: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(), // 4 hours from now
        tier: "free"
      });
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchQuota();
  }, [fetchQuota]);

  const canUse = useCallback(
    (type: "standard" | "reasoning" | "premium" | "voice"): boolean => {
      if (!quota) return false;
      const q = quota[type];
      return q.unlimited || q.used < q.limit;
    },
    [quota],
  );

  const getRemaining = useCallback(
    (type: "standard" | "reasoning" | "premium" | "voice"): number => {
      if (!quota) return 0;
      const q = quota[type];
      if (q.unlimited) return Infinity;
      return Math.max(0, q.limit - q.used);
    },
    [quota],
  );

  const timeUntilReset = useCallback((): string => {
    if (!quota?.resetsAt) return "";

    const resetTime = new Date(quota.resetsAt).getTime();
    const now = Date.now();
    const diff = resetTime - now;

    if (diff <= 0) return "Resetting soon...";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, [quota]);

  return {
    quota,
    loading,
    error,
    refetch: fetchQuota,
    canUse,
    getRemaining,
    timeUntilReset,
  };
}
