"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  AIModel,
  AIProviderName,
  ModelsResponse,
  ProvidersStatusResponse,
} from "@/lib/utils/jovan/models";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

interface UseAIModelsResult {
  models: Record<AIProviderName, AIModel[]>;
  providers: AIProviderName[];
  freeReasoningModels: string[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getModelById: (id: string) => AIModel | undefined;
  getAvailableModels: () => AIModel[];
  getReasoningModels: () => AIModel[];
}

/**
 * Hook to fetch and manage available AI models
 */
export function useAIModels(token: string | null): UseAIModelsResult {
  const [models, setModels] = useState<Record<AIProviderName, AIModel[]>>({
    groq: [],
    bytez: [],
    openrouter: [],
  });
  const [providers, setProviders] = useState<AIProviderName[]>([]);
  const [freeReasoningModels, setFreeReasoningModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/ai/models`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch models");
      }

      const data = (await response.json()) as ModelsResponse;
      setModels(data.models);
      setProviders(data.providers);
      setFreeReasoningModels(data.freeReasoningModels);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchModels();
  }, [fetchModels]);

  const getModelById = useCallback(
    (id: string): AIModel | undefined => {
      for (const providerModels of Object.values(models)) {
        const found = providerModels.find((m) => m.id === id);
        if (found) return found;
      }
      return undefined;
    },
    [models],
  );

  const getAvailableModels = useCallback((): AIModel[] => {
    const available: AIModel[] = [];
    for (const providerModels of Object.values(models)) {
      available.push(...providerModels.filter((m) => m.available));
    }
    return available;
  }, [models]);

  const getReasoningModels = useCallback((): AIModel[] => {
    const reasoning: AIModel[] = [];
    for (const providerModels of Object.values(models)) {
      reasoning.push(
        ...providerModels.filter((m) => m.capabilities.includes("reasoning")),
      );
    }
    return reasoning;
  }, [models]);

  return {
    models,
    providers,
    freeReasoningModels,
    loading,
    error,
    refetch: fetchModels,
    getModelById,
    getAvailableModels,
    getReasoningModels,
  };
}

/**
 * Hook to fetch provider status
 */
export function useProviderStatus(): {
  status: Record<AIProviderName, { name: string; available: boolean }> | null;
  loading: boolean;
  error: string | null;
} {
  const [status, setStatus] = useState<Record<
    AIProviderName,
    { name: string; available: boolean }
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch(`${API_BASE}/ai/providers/status`);
        if (!response.ok) {
          throw new Error("Failed to fetch provider status");
        }
        const data = (await response.json()) as ProvidersStatusResponse;
        setStatus(data.providers);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    void fetchStatus();
  }, []);

  return { status, loading, error };
}
