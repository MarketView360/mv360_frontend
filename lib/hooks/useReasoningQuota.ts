import { useState, useEffect, useCallback, useRef } from "react";
import type { ReasoningQuota } from "@/lib/utils/jovan/types";
import { aiApi } from "@/lib/api/ai";

export function useReasoningQuota(token: string | null) {
  const [quota, setQuota] = useState<ReasoningQuota>({
    used: 0,
    limit: 3,
    resetsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);

  const fetchReasoningQuota = useCallback(async (force = false) => {
    if (!token) {
      return;
    }

    // Throttle requests to avoid spamming API
    const now = Date.now();
    if (!force && now - lastFetchRef.current < 5000) {
      return;
    }
    lastFetchRef.current = now;

    setLoading(true);
    setError(null);

    try {
      const data = await aiApi.fetchReasoningQuota();
      setQuota(data);
    } catch (err) {
      console.error("Failed to fetch reasoning quota:", err);
      const message = err instanceof Error ? err.message : "Failed to fetch quota";
      setError(message);
      // Don't overwrite quota on error, just show error state
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Set up periodic refresh for reset time
  useEffect(() => {
    if (!token) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial fetch
    fetchReasoningQuota(true);

    // Set up interval to refresh every minute and check for reset
    intervalRef.current = setInterval(() => {
      // Check if quota should have reset
      const now = new Date();
      const resetTime = new Date(quota.resetsAt);
      
      if (now >= resetTime) {
        // Force fetch to get updated quota
        fetchReasoningQuota(true);
      }
    }, 60000); // Check every minute

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [token, quota.resetsAt, fetchReasoningQuota]);

  const canUseReasoning = quota.used < quota.limit;
  const remainingReasoning = Math.max(0, quota.limit - quota.used);
  const resetsIn = Math.max(0, new Date(quota.resetsAt).getTime() - Date.now());
  const resetsInHours = Math.floor(resetsIn / (1000 * 60 * 60));
  const resetsInMinutes = Math.floor((resetsIn % (1000 * 60 * 60)) / (1000 * 60));

  return {
    reasoningQuota: quota,
    fetchReasoningQuota,
    canUseReasoning,
    remainingReasoning,
    resetsIn,
    resetsInHours,
    resetsInMinutes,
    loading,
    error,
  };
}