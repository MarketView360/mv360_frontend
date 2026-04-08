"use client";

import React, { useState, useMemo, Suspense, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PriceChart } from "@/components/PriceChart";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ComposedChart,
  Area,
  Line,
} from "recharts";
import { Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export interface PriceHistoryPoint {
  date: string;
  price: number;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
}

interface ValuationMetric {
  label: string;
  value: number | null;
}

interface ValuationHistoryPoint {
  date: string;
  price: number | null;
  pe_ratio: number | null;
}

interface CompanyChartsSwitcherProps {
  priceHistory: PriceHistoryPoint[];
  valuationMetrics: ValuationMetric[];
  valuationHistory: ValuationHistoryPoint[];
  ticker?: string;
}

export function CompanyChartsSwitcher({
  priceHistory,
  valuationMetrics,
  valuationHistory,
  ticker,
}: CompanyChartsSwitcherProps) {
  const [mode, setMode] = useState<"price" | "valuations" | "price_pe">(
    "price",
  );
  const [range, setRange] = useState<"1Y" | "3Y" | "5Y">("1Y");
  const [normType, setNormType] = useState<"indexed" | "minmax">("indexed");
  const [fullscreen, setFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [currentPriceHistory, setCurrentPriceHistory] = useState<PriceHistoryPoint[] | null>(priceHistory);
  const [showComingSoon, setShowComingSoon] = useState(false);

  // Cache for prefetched price data (stored in memory, survives re-renders)
  const priceDataCache = React.useRef<Map<string, PriceHistoryPoint[]>>(new Map());
  // Track which ticker's data has been prefetched
  const prefetchedTicker = React.useRef<string | null>(null);
  const isPrefetching = React.useRef(false);

  // Fetch prices for the selected range (with caching)
  const fetchPricesForRange = React.useCallback(async (selectedRange: typeof range, setLoading = true) => {
    if (!ticker) return;

    const cacheKey = `${ticker}:${selectedRange}`;

    // Check cache first
    const cached = priceDataCache.current.get(cacheKey);
    if (cached) {
      setCurrentPriceHistory(cached);
      return;
    }

    if (setLoading) setIsLoadingPrices(true);
    try {
      const rangeParam = selectedRange.toLowerCase();
      const res = await fetch(`/api/prices/${encodeURIComponent(ticker)}?range=${rangeParam}`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`Failed to fetch prices: ${res.statusText}`);
      const data = await res.json();
      const mapped: PriceHistoryPoint[] = (data.prices || []).map((p: any) => ({
        date: p.date,
        price: p.adj_close ?? p.close ?? 0,
        open: p.open ?? null,
        high: p.high ?? null,
        low: p.low ?? null,
        close: p.close ?? null,
        volume: p.volume ?? null,
      }));
      priceDataCache.current.set(cacheKey, mapped);
      setCurrentPriceHistory(mapped);
    } catch (err) {
      console.error("Error fetching prices for range:", err);
    } finally {
      if (setLoading) setIsLoadingPrices(false);
    }
  }, [ticker]);

  const handleRangeChange = React.useCallback((newRange: typeof range) => {
    setRange(newRange);
    // Check cache first - if available, set immediately
    const cacheKey = `${ticker}:${newRange}`;
    const cached = priceDataCache.current.get(cacheKey);
    if (cached) {
      setCurrentPriceHistory(cached);
    } else {
      // Not cached, fetch and show loading
      fetchPricesForRange(newRange);
    }
  }, [fetchPricesForRange, ticker]);

  // Prefetch extended ranges in background after initial load
  useEffect(() => {
    if (!mounted || !ticker || isPrefetching.current) return;

    // Skip if already prefetched for this ticker
    if (prefetchedTicker.current === ticker) return;

    isPrefetching.current = true;
    prefetchedTicker.current = ticker;

    // Prefetch 3Y, 5Y in background (non-blocking, staggered to avoid overwhelming)
    const prefetchRanges = async () => {
      const rangesToPrefetch: Array<{ range: typeof range; delay: number }> = [
        { range: "3Y", delay: 200 },   // Start after 200ms
        { range: "5Y", delay: 600 },   // Start after 600ms
      ];

      for (const { range: r, delay } of rangesToPrefetch) {
        // Wait for delay
        await new Promise(resolve => setTimeout(resolve, delay));

        // Only prefetch if not already cached for this ticker
        const cacheKey = `${ticker}:${r}`;
        if (!priceDataCache.current.has(cacheKey)) {
          const rangeParam = r.toLowerCase();
          fetch(`/api/prices/${encodeURIComponent(ticker)}?range=${rangeParam}`, {
            headers: { "Content-Type": "application/json" },
          })
            .then(res => res.json())
            .then(data => {
              const mapped: PriceHistoryPoint[] = (data.prices || []).map((p: any) => ({
                date: p.date,
                price: p.adj_close ?? p.close ?? 0,
                open: p.open ?? null,
                high: p.high ?? null,
                low: p.low ?? null,
                close: p.close ?? null,
                volume: p.volume ?? null,
              }));
              priceDataCache.current.set(cacheKey, mapped);
            })
            .catch(() => {
              // Silently fail - user can still click and fetch on-demand
            });
        }
      }
    };

    prefetchRanges();
  }, [mounted, ticker]);

  // ... (rest of the logic remains same until render) ...
  const hasValuations = valuationMetrics.some((m) => m.value != null);
  const valuationData = valuationMetrics
    .filter((m) => m.value != null)
    .map((m) => ({ label: m.label, value: m.value as number }));

  const hasPeHistory = valuationHistory.some((p) => p.pe_ratio != null);

  const filteredValuationHistory = useMemo(() => {
    // ... logic ...
    if (!valuationHistory || valuationHistory.length === 0) return [];
    const map: Record<typeof range, number> = {
      "1Y": 252,
      "3Y": 252 * 3,
      "5Y": 252 * 5,
    };
    const windowSize = map[range];
    let filtered = valuationHistory;
    if (valuationHistory.length > windowSize) {
      filtered = valuationHistory.slice(-windowSize);
    }

    const prices = filtered.map(p => p.price).filter((p): p is number => p !== null);
    const pes = filtered.map(p => p.pe_ratio).filter((p): p is number => p !== null);

    if (prices.length === 0 || pes.length === 0) return filtered;

    const basePrice = prices[0];
    const basePe = pes[0];

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const minPe = Math.min(...pes);
    const maxPe = Math.max(...pes);

    const priceRange = maxPrice - minPrice || 1;
    const peRange = maxPe - minPe || 1;

    return filtered.map(point => {
      let priceNorm: number | null = null;
      let peNorm: number | null = null;

      if (normType === "indexed") {
        priceNorm = point.price !== null && basePrice ? (point.price / basePrice) * 100 : null;
        peNorm = point.pe_ratio !== null && basePe ? (point.pe_ratio / basePe) * 100 : null;
      } else {
        priceNorm = point.price !== null ? ((point.price - minPrice) / priceRange) * 100 : null;
        peNorm = point.pe_ratio !== null ? ((point.pe_ratio - minPe) / peRange) * 100 : null;
      }

      return {
        ...point,
        price_normalized: priceNorm,
        pe_normalized: peNorm,
      };
    });
  }, [valuationHistory, range, normType]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark =
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const handleModeChange = (newMode: "price" | "valuations" | "price_pe") => {
    if (newMode === "price") {
      setMode("price");
    }
    // Coming soon features - do nothing, buttons are disabled
  };

  const renderChartBody = (heightClass: string) => (
    <>
      {mode === "price" && (
        <div className={cn(heightClass, "w-full")}>
          <Suspense fallback={<div className="h-full w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />}>
            {isLoadingPrices ? (
              <div className="h-full w-full flex items-center justify-center">
                <div className="text-sm text-slate-500 dark:text-slate-400">Loading prices...</div>
              </div>
            ) : (
              <PriceChart data={currentPriceHistory || priceHistory} ticker={ticker} />
            )}
          </Suspense>
        </div>
      )}
      {/* ... keeping other renders ... */}
      {mode === "valuations" && (
        <div className={cn(heightClass, "w-full")}>
          {hasValuations ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={valuationData}
                margin={{ top: 12, right: 16, bottom: 8, left: 0 }}
                layout="vertical"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke={isDark ? "#475569" : "#e2e8f0"}
                />
                <XAxis
                  type="number"
                  stroke={isDark ? "#cbd5e1" : "#64748b"}
                  fontSize={12}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={90}
                  stroke={isDark ? "#cbd5e1" : "#64748b"}
                  fontSize={12}
                />
                {/* Fixed Tooltip props error */}
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#0f172a" : "#ffffff",
                    borderRadius: 8,
                    border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`,
                  }}
                  formatter={(value: any) =>
                    typeof value === "number" ? value.toFixed(2) : value
                  }
                />
                <Bar
                  dataKey="value"
                  radius={4}
                  fill="#0f766e"
                  isAnimationActive
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              Valuation metrics are not available for this company yet.
            </div>
          )}
        </div>
      )}
      {mode === "price_pe" && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-[11px] sm:text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-[#0f766e] rounded" />
                <span className="text-slate-600 dark:text-slate-400">Price ({normType === "indexed" ? "indexed" : "norm"})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-[#f97316] rounded" />
                <span className="text-slate-600 dark:text-slate-400">P/E Ratio ({normType === "indexed" ? "indexed" : "norm"})</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1 text-[11px] bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md">
                <button
                  onClick={() => setNormType("indexed")}
                  className={cn(
                    "px-2 py-0.5 rounded transition-all",
                    normType === "indexed" ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Index
                </button>
                <button
                  onClick={() => setNormType("minmax")}
                  className={cn(
                    "px-2 py-0.5 rounded transition-all",
                    normType === "minmax" ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Rel
                </button>
              </div>
              <div className="flex gap-1 text-[11px]">
                {(["1Y", "3Y", "5Y"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRangeChange(r)}
                    className={cn(
                      "px-2 py-1 rounded-md transition-all font-medium",
                      range === r
                        ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className={cn(heightClass, "w-full")}>
            {hasPeHistory ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={filteredValuationHistory}>
                  <defs>
                    <linearGradient id="colorPricePe" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={isDark ? "#475569" : "#e2e8f0"}
                  />
                  <XAxis
                    dataKey="date"
                    stroke={isDark ? "#94a3b8" : "#64748b"}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(dateStr: string) => {
                      const date = new Date(dateStr);
                      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                      return `${months[date.getMonth()]} '${date.getFullYear().toString().slice(-2)}`;
                    }}
                    interval="preserveStartEnd"
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    yAxisId="normalized"
                    stroke={isDark ? "#94a3b8" : "#64748b"}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={() => ""}
                    hide
                  />
                  {/* Fixed Tooltip props error by using simple props */}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#0f172a" : "#ffffff",
                      borderRadius: 8,
                      border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`,
                    }}
                  />
                  <Area
                    yAxisId="normalized"
                    type="monotone"
                    dataKey="price_normalized"
                    stroke="#0f766e"
                    fill="url(#colorPricePe)"
                    strokeWidth={2}
                    name="price_normalized"
                  />
                  <Line
                    yAxisId="normalized"
                    type="monotone"
                    dataKey="pe_normalized"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                    name="pe_normalized"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                Historical P/E data is not available for this company yet.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <Card className="w-full border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base font-medium text-slate-800 dark:text-slate-100 font-heading">
            {mode === "price"
              ? "Price & Volume"
              : mode === "valuations"
                ? "Valuations (Coming Soon)"
                : "Price & P/E (Coming Soon)"}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 p-0.5 text-xs">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-6 px-3 rounded-full text-[11px]",
                  mode === "price"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-500 dark:text-slate-400"
                )}
                onClick={() => handleModeChange("price")}
              >
                Price
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-6 px-3 rounded-full text-[11px] gap-1 opacity-80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors",
                  mode === "price_pe"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-500 dark:text-slate-400"
                )}
                onClick={() => setShowComingSoon(true)}
              >
                Price & P/E
                <span className="text-[9px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">Coming Soon</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-6 px-3 rounded-full text-[11px] gap-1 opacity-80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors",
                  mode === "valuations"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-500 dark:text-slate-400"
                )}
                onClick={() => setShowComingSoon(true)}
              >
                Valuation
                <span className="text-[9px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">Coming Soon</span>
              </Button>
            </div>
            <button
              type="button"
              onClick={() => setFullscreen(true)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="View chart full screen"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {renderChartBody("h-96")}
        </CardContent>
      </Card>

      {fullscreen && mounted && createPortal(
        <div className="fixed inset-0 z-9999 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0 px-4 pt-3 pb-0">
            {mode === "price" && (
              <PriceChart
                data={currentPriceHistory || priceHistory}
                ticker={ticker}
                fullscreen={fullscreen}
                onClose={() => setFullscreen(false)}
              />
            )}
          </div>
        </div>,
        document.body
      )}

      <Dialog open={showComingSoon} onOpenChange={setShowComingSoon}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Coming Soon</DialogTitle>
            <DialogDescription>
              We're currently developing the advanced valuation tools and Price-to-Earnings charts. Stay tuned!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowComingSoon(false)}>Got it</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
