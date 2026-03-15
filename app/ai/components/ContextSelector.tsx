"use client";

import { useState, useCallback } from "react";
import { AtSign, ListChecks, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useWatchlist } from "@/providers/WatchlistProvider";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";

interface ContextSelectorProps {
  onSelectWatchlist: (watchlistId: string, watchlistName: string, context: string) => void;
  disabled?: boolean;
}

interface StockMetrics {
  ticker: string;
  price?: number;
  price_change_1d?: number;
  price_change_1m?: number;
  market_cap?: number;
  pe_ratio?: number;
  eps_ttm?: number;
  sector?: string;
  roe?: number;
  roa?: number;
}

export function ContextSelector({ onSelectWatchlist, disabled }: ContextSelectorProps) {
  const { watchlists, loading } = useWatchlist();
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [loadingWatchlist, setLoadingWatchlist] = useState<string | null>(null);

  const fetchStockMetrics = useCallback(async (tickers: string[]): Promise<Map<string, StockMetrics>> => {
    const metricsMap = new Map<string, StockMetrics>();
    if (tickers.length === 0) return metricsMap;

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

    // Fetch data for each ticker in parallel using the company endpoint
    const promises = tickers.map(async (ticker) => {
      try {
        const res = await fetch(`${baseUrl}/api/company/${encodeURIComponent(ticker)}`);
        if (res.ok) {
          const data = await res.json();
          return { ticker, data };
        }
        return { ticker, data: null };
      } catch (err) {
        console.error(`[ContextSelector] Failed to fetch ${ticker}:`, err);
        return { ticker, data: null };
      }
    });

    const results = await Promise.all(promises);

    for (const { ticker, data } of results) {
      if (!data?.company) continue;
      const { company, metrics } = data;
      const cleanedTicker = ticker.replace(/\.US$/i, '').toUpperCase();
      metricsMap.set(cleanedTicker, {
        ticker: cleanedTicker,
        price: metrics?.price ?? metrics?.adj_close,
        price_change_1d: metrics?.refund_1d_p,
        price_change_1m: metrics?.refund_1m_p,
        market_cap: metrics?.market_capitalization ?? metrics?.market_cap,
        pe_ratio: metrics?.pe_ratio,
        eps_ttm: metrics?.eps_ttm,
        sector: company?.sector,
        roe: metrics?.roe,
        roa: metrics?.roa,
      });
    }

    return metricsMap;
  }, []);

  const handleWatchlistSelect = async (watchlistId: string) => {
    const watchlist = watchlists.find(w => w.id === watchlistId);
    if (!watchlist) return;

    setLoadingWatchlist(watchlistId);

    // Fetch actual stock metrics like in watchlist page
    const tickers = watchlist.items.map(item => item.ticker.replace(/\.US$/i, '').toUpperCase());
    const metricsMap = await fetchStockMetrics(tickers);

    const stocksWithMetrics = watchlist.items.map((item) => {
      const ticker = item.ticker.replace(/\.US$/i, '').toUpperCase();
      const metrics = metricsMap.get(ticker);
      return {
        ticker,
        notes: item.notes || "",
        ...metrics,
      };
    });

    // Build rich context with actual metrics
    const formatValue = (val: number | undefined, suffix = '') => 
      val !== undefined && val !== null ? `${val.toFixed(2)}${suffix}` : 'N/A';
    
    const formatLargeNum = (val: number | undefined) => {
      if (val === undefined || val === null) return 'N/A';
      if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
      if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
      if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
      return `$${val.toFixed(2)}`;
    };

    const context = `Context: The user is referencing their watchlist "${watchlist.name}".

Watchlist Details:
- Name: ${watchlist.name}
${watchlist.description ? `- Description: ${watchlist.description}` : ''}
- Total Stocks: ${watchlist.items.length}

Stocks with Current Metrics:
${stocksWithMetrics.map((s, i) => `${i + 1}. ${s.ticker}
   - Price: ${s.price ? `$${s.price.toFixed(2)}` : 'N/A'}
   - 1D Change: ${formatValue(s.price_change_1d, '%')}
   - 1M Change: ${formatValue(s.price_change_1m, '%')}
   - Market Cap: ${formatLargeNum(s.market_cap)}
   - P/E Ratio: ${formatValue(s.pe_ratio)}
   - EPS (TTM): ${formatValue(s.eps_ttm)}
   - ROE: ${formatValue(s.roe, '%')}
   - ROA: ${formatValue(s.roa, '%')}
   - Sector: ${s.sector || 'N/A'}
${s.notes ? `   - Notes: ${s.notes}` : ''}`).join('\n')}

Please use this watchlist information and metrics to assist the user with their query. Analyze trends, compare stocks, or provide insights based on the data above.`;

    onSelectWatchlist(watchlistId, watchlist.name, context);
    setLoadingWatchlist(null);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200",
            open && "bg-slate-100 dark:bg-slate-800 text-violet-600 dark:text-violet-400"
          )}
          disabled={disabled}
          title="Mention watchlist"
        >
          <AtSign className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-72 p-2 z-[100]"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-1">
          <div className="px-2 py-1.5">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Mention Context
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
            </div>
          ) : watchlists.length === 0 ? (
            <div className="px-2 py-6 text-center">
              <ListChecks className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No watchlists yet
              </p>
            </div>
          ) : (
            <>
              {/* Watchlists - show inline list instead of submenu to avoid positioning issues */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <ListChecks className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Watchlists
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-0.5">
                  {watchlists.map((watchlist) => (
                    <button
                      key={watchlist.id}
                      onClick={() => handleWatchlistSelect(watchlist.id)}
                      disabled={loadingWatchlist !== null}
                      className="w-full flex items-center justify-between px-2 py-2 rounded-md hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: watchlist.color }}
                        />
                        <div className="min-w-0 flex-1 text-left">
                          <p className="text-sm text-slate-700 dark:text-slate-300 truncate hover:text-violet-700 dark:hover:text-violet-300">
                            {watchlist.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {watchlist.items.length} stock{watchlist.items.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      {loadingWatchlist === watchlist.id && (
                        <Loader2 className="w-4 h-4 animate-spin text-violet-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
