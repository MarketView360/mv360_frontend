"use client";

import { useEffect, useCallback, useSyncExternalStore } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:4000";

export interface AIAccessStatus {
  allowed: boolean;
  reason?: 'not_premium' | 'cooldown_active' | 'quota_exceeded';
  message?: string;
  upgradeRequired?: boolean;
  cooldownInfo?: {
    active: boolean;
    until?: string;
    resetsAt?: string;
  };
  quota?: {
    used: number;
    limit: number;
    remaining: number;
  };
}

type StoreState = {
  token: string | null;
  access: AIAccessStatus | null;
  loading: boolean;
  error: string | null;
};

// Mutable backing store
const _store: StoreState = {
  token: null,
  access: null,
  loading: false,
  error: null,
};

// Immutable snapshot
let _snapshot: StoreState = { ..._store };

const listeners = new Set<() => void>();

function emitChange() {
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

async function fetchAccessIntoStore(token: string | null, forceFresh: boolean = false) {
  if (_fetchInFlight && !forceFresh) return;
  _fetchInFlight = true;

  _store.token = token;
  _store.loading = true;
  _store.error = null;
  emitChange();

  if (!token) {
    _store.access = {
      allowed: false,
      reason: 'not_premium',
      message: 'Authentication required',
      upgradeRequired: false,
    };
    _store.loading = false;
    _fetchInFlight = false;
    emitChange();
    return;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_BASE}/ai/access-check`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 403) {
        const data = await response.json();
        _store.access = {
          allowed: false,
          reason: 'not_premium',
          message: data.details || 'Premium access required',
          upgradeRequired: true,
        };
      } else if (response.status === 429) {
        const data = await response.json();
        _store.access = {
          allowed: false,
          reason: data.quotaExceeded ? 'quota_exceeded' : 'cooldown_active',
          message: data.details || 'Quota exceeded',
          cooldownInfo: data.cooldownUntil ? {
            active: true,
            until: data.cooldownUntil,
            resetsAt: data.resetsAt,
          } : undefined,
          quota: data.used !== undefined ? {
            used: data.used,
            limit: data.limit,
            remaining: 0,
          } : undefined,
        };
      } else {
        throw new Error("Failed to check AI access");
      }
    } else {
      const data = await response.json();
      _store.access = data;
    }
  } catch (err) {
    console.error("AI access check error:", err);
    _store.error = err instanceof Error ? err.message : "Unknown error";
  } finally {
    _store.loading = false;
    _fetchInFlight = false;
    emitChange();
  }
}

interface UseAIAccessResult {
  access: AIAccessStatus | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isPremium: boolean;
  canUseAI: boolean;
}

/**
 * Hook to check if user has access to AI chat (premium-only)
 */
export function useAIAccess(token: string | null): UseAIAccessResult {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (state.token !== token) {
      void fetchAccessIntoStore(token);
    }
  }, [token, state.token]);

  const fetchAccess = useCallback(async () => {
    await fetchAccessIntoStore(token, true);
  }, [token]);

  const isPremium = state.access?.reason !== 'not_premium';
  const canUseAI = state.access?.allowed ?? false;

  return {
    access: state.access,
    loading: state.loading,
    error: state.error,
    refetch: fetchAccess,
    isPremium,
    canUseAI,
  };
}
