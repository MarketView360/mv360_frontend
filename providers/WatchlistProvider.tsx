"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";

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

interface WatchlistContextType {
  watchlists: WatchlistWithItems[];
  loading: boolean;
  error: string | null;
  fetchWatchlists: () => Promise<void>;
  createWatchlist: (name: string, description?: string, color?: string) => Promise<WatchlistWithItems | null>;
  deleteWatchlist: (watchlistId: string) => Promise<boolean>;
  updateWatchlist: (watchlistId: string, updates: { name?: string; description?: string; color?: string }) => Promise<boolean>;
  addToWatchlist: (watchlistId: string, ticker: string, notes?: string) => Promise<boolean>;
  removeFromWatchlist: (watchlistId: string, ticker: string) => Promise<boolean>;
  updateItemNotes: (watchlistId: string, ticker: string, notes: string) => Promise<boolean>;
  isTickerInWatchlist: (watchlistId: string, ticker: string) => boolean;
  getWatchlistsForTicker: (ticker: string) => WatchlistWithItems[];
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [watchlists, setWatchlists] = useState<WatchlistWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const watchlistsRef = useRef<WatchlistWithItems[]>([]);

  // Keep ref in sync with state
  watchlistsRef.current = watchlists;

  const supabaseRef = useRef(createClient());

  const fetchWatchlists = useCallback(async () => {
    if (!user) {
      setWatchlists([]);
      setLoading(false);
      hasFetchedRef.current = false;
      return;
    }

    // Prevent redundant fetches if already loaded
    if (hasFetchedRef.current && watchlists.length > 0) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // T08: Single relational query instead of N+1
      const { data, error: fetchError } = await supabaseRef.current
        .from("watchlists")
        .select("*, watchlist_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const watchlistsWithItems: WatchlistWithItems[] = (data || []).map((list: any) => {
        const { watchlist_items, ...rest } = list;
        return {
          ...rest,
          items: ((watchlist_items as WatchlistItem[]) || []).sort(
            (a: WatchlistItem, b: WatchlistItem) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
          ),
        } as WatchlistWithItems;
      });

      setWatchlists(watchlistsWithItems);
      setError(null);
      hasFetchedRef.current = true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch watchlists";
      setError(message);
      console.error("Error fetching watchlists:", err);
    } finally {
      setLoading(false);
    }
  }, [user, watchlists.length]);

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
        toast.success(`Watchlist "${name}" created`);
        return newWatchlist;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to create watchlist";
        setError(message);
        toast.error(message);
        return null;
      }
    },
    [user]
  );

  const deleteWatchlist = useCallback(
    async (watchlistId: string) => {
      const target = watchlists.find((w) => w.id === watchlistId);
      try {
        const { error } = await supabaseRef.current
          .from("watchlists")
          .delete()
          .eq("id", watchlistId)
          .eq("user_id", user?.id ?? "");

        if (error) throw error;

        setWatchlists((prev) => prev.filter((w) => w.id !== watchlistId));
        toast.success(`Watchlist "${target?.name || ""}" deleted`);
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to delete watchlist";
        setError(message);
        toast.error(message);
        return false;
      }
    },
    [user, watchlists]
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
        toast.success("Watchlist updated");
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update watchlist";
        setError(message);
        toast.error(message);
        return false;
      }
    },
    []
  );

  const addToWatchlist = useCallback(
    async (watchlistId: string, ticker: string, notes?: string) => {
      // Normalize ticker - remove .US suffix if present
      const normalizedTicker = ticker.replace(/\.US$/i, '').toUpperCase();
      
      try {
        // Check if ticker already exists in watchlist
        const watchlist = watchlistsRef.current.find(w => w.id === watchlistId);
        if (watchlist) {
          const existingTickers = watchlist.items.map(i => i.ticker.replace(/\.US$/i, '').toUpperCase());
          if (existingTickers.includes(normalizedTicker)) {
            toast.info(`${normalizedTicker} is already in this watchlist`);
            return false;
          }
        }

        const { data, error } = await supabaseRef.current
          .from("watchlist_items")
          .insert({
            watchlist_id: watchlistId,
            ticker: normalizedTicker,
            notes: notes || null,
          })
          .select()
          .single();

        if (error) {
          // Handle duplicate key error specifically
          if (error.code === '23505') {
            toast.info(`${normalizedTicker} is already in this watchlist`);
            return false;
          }
          throw error;
        }

        setWatchlists((prev) =>
          prev.map((w) =>
            w.id === watchlistId ? { ...w, items: [data, ...w.items] } : w
          )
        );
        toast.success(`${normalizedTicker} added to watchlist`);
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to add to watchlist";
        console.error('[WatchlistProvider] addToWatchlist error:', err);
        setError(message);
        toast.error(message);
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
        toast.success(`${ticker.toUpperCase()} removed`);
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to remove from watchlist";
        setError(message);
        toast.error(message);
        return false;
      }
    },
    []
  );

  const updateItemNotes = useCallback(
    async (watchlistId: string, ticker: string, notes: string) => {
      try {
        const { error } = await supabaseRef.current
          .from("watchlist_items")
          .update({ notes: notes || null })
          .eq("watchlist_id", watchlistId)
          .eq("ticker", ticker.toUpperCase());

        if (error) throw error;

        setWatchlists((prev) =>
          prev.map((w) =>
            w.id === watchlistId
              ? {
                  ...w,
                  items: w.items.map((i) =>
                    i.ticker === ticker.toUpperCase() ? { ...i, notes: notes || null } : i
                  ),
                }
              : w
          )
        );
        toast.success("Note saved");
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update note";
        setError(message);
        toast.error(message);
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

  return (
    <WatchlistContext.Provider
      value={{
        watchlists,
        loading,
        error,
        fetchWatchlists,
        createWatchlist,
        deleteWatchlist,
        updateWatchlist,
        addToWatchlist,
        removeFromWatchlist,
        updateItemNotes,
        isTickerInWatchlist,
        getWatchlistsForTicker,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return context;
}

export type { WatchlistContextType };
