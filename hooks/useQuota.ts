"use client";

import { useEffect, useCallback, useSyncExternalStore } from "react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export interface QuotaStatus {
  tokens: { used: number; limit: number; remaining: number };
  reasoning: { used: number; limit: number; remaining: number };
  resetsAt: string;
  tier: "free" | "premium";
}

type StoreState = {
  token: string | null;
  quota: QuotaStatus | null;
  loading: boolean;
  error: string | null;
};

const store: StoreState = {
  token: null,
  quota: null,
  loading: false,
  error: null,
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return store;
}

async function fetchQuotaIntoStore(token: string | null, forceFresh: boolean = false) {
  store.token = token;
  store.loading = true;
  store.error = null;
  emitChange();

  if (!token) {
    store.quota = {
      tokens: { used: 5000, limit: 30000, remaining: 25000 },
      reasoning: { used: 1, limit: 3, remaining: 2 },
      resetsAt: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
      tier: "free",
    };
    store.loading = false;
    emitChange();
    return;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const url = forceFresh ? `${API_BASE}/ai/quota?fresh=1` : `${API_BASE}/ai/quota`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error("Failed to fetch quota");
    }

    const data = (await response.json()) as QuotaStatus;
    store.quota = data;
  } catch (err) {
    console.error("Quota fetch error:", err);
    store.quota = {
      tokens: { used: 5000, limit: 30000, remaining: 25000 },
      reasoning: { used: 1, limit: 3, remaining: 2 },
      resetsAt: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
      tier: "free",
    };
    store.error = err instanceof Error ? err.message : "Unknown error";
  } finally {
    store.loading = false;
    emitChange();
  }
}

interface UseQuotaResult {
  quota: QuotaStatus | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  canUse: (type: "tokens" | "reasoning") => boolean;
  getRemaining: (type: "tokens" | "reasoning") => number;
  timeUntilReset: () => string;
}

/**
 * Hook to fetch and manage user quota
 */
export function useQuota(token: string | null): UseQuotaResult {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    // Only refetch if token changed.
    if (state.token !== token) {
      void fetchQuotaIntoStore(token);
    }
  }, [token, state.token]);

  const fetchQuota = useCallback(async () => {
    await fetchQuotaIntoStore(token, true);
  }, [token]);

  const canUse = useCallback(
    (type: "tokens" | "reasoning"): boolean => {
      if (!state.quota) return false;
      const q = state.quota[type];
      return q.remaining > 0;
    },
    [state.quota],
  );

  const getRemaining = useCallback(
    (type: "tokens" | "reasoning"): number => {
      if (!state.quota) return 0;
      return state.quota[type].remaining;
    },
    [state.quota],
  );

  const timeUntilReset = useCallback((): string => {
    if (!state.quota?.resetsAt) return "";

    const resetTime = new Date(state.quota.resetsAt).getTime();
    const now = Date.now();
    const diff = resetTime - now;

    if (diff <= 0) return "Resetting soon...";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, [state.quota]);

  return {
    quota: state.quota,
    loading: state.loading,
    error: state.error,
    refetch: fetchQuota,
    canUse,
    getRemaining,
    timeUntilReset,
  };
}
