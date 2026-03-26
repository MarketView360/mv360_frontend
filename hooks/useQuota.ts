"use client";

import { useEffect, useCallback, useSyncExternalStore } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:3001";

export interface QuotaStatus {
  tokens: { used: number; limit: number; remaining: number };
  reasoning: { used: number; limit: number; remaining: number };
  resetsAt?: string; // Only present when in cooldown (when quota resets)
  tier: "free" | "premium";
}

type StoreState = {
  token: string | null;
  quota: QuotaStatus | null;
  loading: boolean;
  error: string | null;
};

// Mutable backing store — mutated in place, then a new snapshot is created
const _store: StoreState = {
  token: null,
  quota: null,
  loading: false,
  error: null,
};

// Immutable snapshot — replaced on every change so React detects updates
let _snapshot: StoreState = { ..._store };

const listeners = new Set<() => void>();

function emitChange() {
  // Create a NEW object reference so useSyncExternalStore triggers re-renders
  _snapshot = { ..._store };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return _snapshot;
}

let _fetchInFlight = false;

async function fetchQuotaIntoStore(token: string | null, forceFresh: boolean = false) {
  // Prevent duplicate concurrent fetches
  if (_fetchInFlight && !forceFresh) return;
  _fetchInFlight = true;

  _store.token = token;
  _store.loading = true;
  _store.error = null;
  emitChange();

  if (!token) {
    _store.quota = null;
    _store.loading = false;
    _fetchInFlight = false;
    emitChange();
    return;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

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
    _store.quota = data;
  } catch (err) {
    console.error("Quota fetch error:", err);
    _store.error = err instanceof Error ? err.message : "Unknown error";
  } finally {
    _store.loading = false;
    _fetchInFlight = false;
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
