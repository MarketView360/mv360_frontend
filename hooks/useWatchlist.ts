"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

export interface Watchlist {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface WatchlistItem {
  id: string;
  watchlist_id: string;
  ticker: string;
  added_at: string;
  notes: string | null;
}

export interface WatchlistWithItems extends Watchlist {
  items: WatchlistItem[];
}

export function useWatchlist() {
  const { user } = useAuth();
  const [watchlists, setWatchlists] = useState<WatchlistWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabaseRef = useRef(createClient());

  const fetchWatchlists = useCallback(async () => {
    if (!user) {
      setWatchlists([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: lists, error: listsError } = await supabaseRef.current
        .from("watchlists")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (listsError) throw listsError;

      if (!lists || lists.length === 0) {
        setWatchlists([]);
        setLoading(false);
        return;
      }

      const { data: items, error: itemsError } = await supabaseRef.current
        .from("watchlist_items")
        .select("*")
        .in(
          "watchlist_id",
          lists.map((l) => l.id)
        )
        .order("added_at", { ascending: false });

      if (itemsError) throw itemsError;

      const watchlistsWithItems: WatchlistWithItems[] = lists.map((list) => ({
        ...list,
        items: (items || []).filter((item) => item.watchlist_id === list.id),
      }));

      setWatchlists(watchlistsWithItems);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch watchlists";
      setError(message);
      console.error("Error fetching watchlists:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWatchlists();
  }, [fetchWatchlists]);

  const createWatchlist = useCallback(
    async (name: string, description?: string, color?: string) => {
      if (!user) return null;

      try {
        const { data, error } = await supabaseRef.current
          .from("watchlists")
          .insert({
            user_id: user.id,
            name,
            description: description || null,
            color: color || "#3b82f6",
          })
          .select()
          .single();

        if (error) throw error;

        const newWatchlist: WatchlistWithItems = { ...data, items: [] };
        setWatchlists((prev) => [newWatchlist, ...prev]);
        return newWatchlist;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to create watchlist";
        setError(message);
        return null;
      }
    },
    [user]
  );

  const deleteWatchlist = useCallback(
    async (watchlistId: string) => {
      try {
        const { error } = await supabaseRef.current
          .from("watchlists")
          .delete()
          .eq("id", watchlistId)
          .eq("user_id", user?.id ?? "");

        if (error) throw error;

        setWatchlists((prev) => prev.filter((w) => w.id !== watchlistId));
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to delete watchlist";
        setError(message);
        return false;
      }
    },
    [user]
  );

  const updateWatchlist = useCallback(
    async (watchlistId: string, updates: { name?: string; description?: string; color?: string }) => {
      try {
        const { data, error } = await supabaseRef.current
          .from("watchlists")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", watchlistId)
          .select()
          .single();

        if (error) throw error;

        setWatchlists((prev) =>
          prev.map((w) => (w.id === watchlistId ? { ...w, ...data } : w))
        );
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update watchlist";
        setError(message);
        return false;
      }
    },
    []
  );

  const addToWatchlist = useCallback(
    async (watchlistId: string, ticker: string, notes?: string) => {
      try {
        const { data, error } = await supabaseRef.current
          .from("watchlist_items")
          .insert({
            watchlist_id: watchlistId,
            ticker: ticker.toUpperCase(),
            notes: notes || null,
          })
          .select()
          .single();

        if (error) throw error;

        setWatchlists((prev) =>
          prev.map((w) =>
            w.id === watchlistId ? { ...w, items: [data, ...w.items] } : w
          )
        );
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to add to watchlist";
        setError(message);
        return false;
      }
    },
    []
  );

  const removeFromWatchlist = useCallback(
    async (watchlistId: string, ticker: string) => {
      try {
        const { error } = await supabaseRef.current
          .from("watchlist_items")
          .delete()
          .eq("watchlist_id", watchlistId)
          .eq("ticker", ticker.toUpperCase());

        if (error) throw error;

        setWatchlists((prev) =>
          prev.map((w) =>
            w.id === watchlistId
              ? { ...w, items: w.items.filter((i) => i.ticker !== ticker.toUpperCase()) }
              : w
          )
        );
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to remove from watchlist";
        setError(message);
        return false;
      }
    },
    []
  );

  const isTickerInWatchlist = useCallback(
    (watchlistId: string, ticker: string) => {
      const watchlist = watchlists.find((w) => w.id === watchlistId);
      return watchlist?.items.some((i) => i.ticker === ticker.toUpperCase()) ?? false;
    },
    [watchlists]
  );

  const getWatchlistsForTicker = useCallback(
    (ticker: string) => {
      return watchlists.filter((w) =>
        w.items.some((i) => i.ticker === ticker.toUpperCase())
      );
    },
    [watchlists]
  );

  return {
    watchlists,
    loading,
    error,
    fetchWatchlists,
    createWatchlist,
    deleteWatchlist,
    updateWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isTickerInWatchlist,
    getWatchlistsForTicker,
  };
}
