import { useState, useEffect, useCallback } from "react";
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

  const fetchReasoningQuota = useCallback(async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await aiApi.fetchReasoningQuota();
      setQuota(data);
    } catch (err) {
      console.error("Failed to fetch reasoning quota:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch quota");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReasoningQuota();
  }, [fetchReasoningQuota]);

  const canUseReasoning = quota.used < quota.limit;
  const remainingReasoning = Math.max(0, quota.limit - quota.used);

  return {
    reasoningQuota: quota,
    fetchReasoningQuota,
    canUseReasoning,
    remainingReasoning,
    loading,
    error,
  };
}