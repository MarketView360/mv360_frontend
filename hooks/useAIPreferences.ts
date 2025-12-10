"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export interface AIPreferences {
  preferredModel: string | null;
  autoRoutingEnabled: boolean;
  voiceInputEnabled: boolean;
  autoSpeakEnabled: boolean;
  ttsVoice: string | null;
}

export interface ByokStatus {
  groq: boolean;
  bytez: boolean;
  openrouter: boolean;
}

interface UseAIPreferencesResult {
  preferences: AIPreferences | null;
  byokKeys: ByokStatus | null;
  loading: boolean;
  error: string | null;
  updatePreferences: (updates: Partial<AIPreferences>) => Promise<boolean>;
  refetch: () => Promise<void>;
}

const DEFAULT_PREFERENCES: AIPreferences = {
  preferredModel: null,
  autoRoutingEnabled: true,
  voiceInputEnabled: false,
  autoSpeakEnabled: false,
  ttsVoice: null,
};

/**
 * Hook to manage AI preferences
 */
export function useAIPreferences(token: string | null): UseAIPreferencesResult {
  const [preferences, setPreferences] = useState<AIPreferences | null>(null);
  const [byokKeys, setByokKeys] = useState<ByokStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    if (!token) {
      setPreferences(DEFAULT_PREFERENCES);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/ai/preferences`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch preferences");
      }

      const data = await response.json();
      setPreferences(data.preferences);
      setByokKeys(data.byokKeys);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setPreferences(DEFAULT_PREFERENCES);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchPreferences();
  }, [fetchPreferences]);

  const updatePreferences = useCallback(
    async (updates: Partial<AIPreferences>): Promise<boolean> => {
      if (!token) return false;

      try {
        const response = await fetch(`${API_BASE}/ai/preferences`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error("Failed to update preferences");
        }

        const data = await response.json();
        setPreferences(data.preferences);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return false;
      }
    },
    [token],
  );

  return {
    preferences,
    byokKeys,
    loading,
    error,
    updatePreferences,
    refetch: fetchPreferences,
  };
}
