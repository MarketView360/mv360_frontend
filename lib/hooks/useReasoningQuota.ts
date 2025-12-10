import { useState, useEffect } from "react";

export function useReasoningQuota(token: string | null) {
  const [quota, setQuota] = useState({
    used: 0,
    limit: 3,
    resetsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });

  useEffect(() => {
    // Fetch from backend
    // const res = await fetch(`${API_BASE}/ai/reasoning-quota`, { headers: { Authorization: `Bearer ${token}` } })
    // setQuota(await res.json())
  }, [token]);

  const fetchReasoningQuota = () => {
    // Placeholder
  };

  const canUseReasoning = quota.used < quota.limit;

  return {
    reasoningQuota: quota,
    fetchReasoningQuota,
    canUseReasoning,
  };
}