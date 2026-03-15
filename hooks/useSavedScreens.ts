"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface SavedScreen {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  query: string;
  sort_order: string;
  limit_count: number;
  exchange: string;
  result_count: number | null;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuotaInfo {
  can_save: boolean;
  current_count: number;
  max_allowed: number;
  message: string;
  subscription_tier: string;
}

interface UseSavedScreensResult {
  savedScreens: SavedScreen[];
  loading: boolean;
  error: string | null;
  quotaInfo: QuotaInfo | null;
  fetchSavedScreens: () => Promise<void>;
  saveScreen: (data: {
    name: string;
    description?: string;
    query: string;
    sort_order?: string;
    limit_count?: number;
    exchange?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateScreen: (
    id: string,
    updates: Partial<Omit<SavedScreen, "id" | "user_id" | "created_at">>
  ) => Promise<{ success: boolean; error?: string }>;
  deleteScreen: (id: string) => Promise<{ success: boolean; error?: string }>;
  checkQuota: () => Promise<QuotaInfo | null>;
}

export function useSavedScreens(token: string | null): UseSavedScreensResult {
  const [savedScreens, setSavedScreens] = useState<SavedScreen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);

  const supabase = createClient();

  const checkQuota = useCallback(async (): Promise<QuotaInfo | null> => {
    if (!token) {
      const defaultQuota: QuotaInfo = {
        can_save: false,
        current_count: 0,
        max_allowed: 0,
        message: "Please sign in to save screens",
        subscription_tier: "none",
      };
      setQuotaInfo(defaultQuota);
      return defaultQuota;
    }

    try {
      const { data, error } = await supabase.rpc("can_user_save_screen");
      if (error) throw error;

      const quota = Array.isArray(data) ? data[0] : data;
      if (quota) {
        setQuotaInfo(quota);
        return quota;
      }
      return null;
    } catch (err) {
      console.error("Error checking quota:", err);
      // Return default quota on error
      const defaultQuota: QuotaInfo = {
        can_save: true,
        current_count: 0,
        max_allowed: 5,
        message: "Unable to verify quota",
        subscription_tier: "free",
      };
      setQuotaInfo(defaultQuota);
      return defaultQuota;
    }
  }, [token, supabase]);

  const fetchSavedScreens = useCallback(async () => {
    if (!token) {
      setLoading(false);
      await checkQuota();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("user_saved_screens")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setSavedScreens(data || []);
      await checkQuota();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch saved screens");
    } finally {
      setLoading(false);
    }
  }, [token, supabase, checkQuota]);

  useEffect(() => {
    fetchSavedScreens();
  }, [fetchSavedScreens]);

  const saveScreen = useCallback(async (data: {
    name: string;
    description?: string;
    query: string;
    sort_order?: string;
    limit_count?: number;
    exchange?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    // Check quota first
    const quota = await checkQuota();
    if (quota && !quota.can_save) {
      return { success: false, error: quota.message };
    }

    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error("User not authenticated");

      const { data: result, error } = await supabase
        .from("user_saved_screens")
        .insert({
          user_id: userId,
          name: data.name,
          description: data.description || null,
          query: data.query,
          sort_order: data.sort_order || "market_capitalization.desc",
          limit_count: data.limit_count || 50,
          exchange: data.exchange || "us",
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh the list
      await fetchSavedScreens();

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save screen";
      return { success: false, error: message };
    }
  }, [token, supabase, checkQuota, fetchSavedScreens]);

  const updateScreen = useCallback(async (
    id: string,
    updates: Partial<Omit<SavedScreen, "id" | "user_id" | "created_at">>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    try {
      const { error } = await supabase
        .from("user_saved_screens")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Refresh the list
      await fetchSavedScreens();

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update screen";
      return { success: false, error: message };
    }
  }, [token, supabase, fetchSavedScreens]);

  const deleteScreen = useCallback(async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    try {
      const { error } = await supabase
        .from("user_saved_screens")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Refresh the list
      await fetchSavedScreens();

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete screen";
      return { success: false, error: message };
    }
  }, [token, supabase, fetchSavedScreens]);

  return {
    savedScreens,
    loading,
    error,
    quotaInfo,
    fetchSavedScreens,
    saveScreen,
    updateScreen,
    deleteScreen,
    checkQuota,
  };
}
