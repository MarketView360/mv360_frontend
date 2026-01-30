"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Logo.dev configuration
const LOGO_DEV_BASE = "https://img.logo.dev/ticker";
const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY;

const BACKEND_URL =
  (process.env.NEXT_PUBLIC_BACKEND_URL as string | undefined) ??
  "http://localhost:4000";

// Index options (primary toggle)
type IndexType = "sp500" | "russell2000" | "nasdaq";
const INDEX_OPTIONS: { value: IndexType; label: string; description: string }[] = [
  { value: "sp500", label: "S&P 500", description: "500 large-cap US stocks" },
  { value: "russell2000", label: "Russell 2000", description: "2000 small-cap US stocks" },
  { value: "nasdaq", label: "NASDAQ", description: "NASDAQ Composite stocks" },
];

// Cap filter options (secondary toggle)
type CapFilter = "all" | "large" | "mid" | "small";
const CAP_OPTIONS: { value: CapFilter; label: string }[] = [
  { value: "all", label: "All Caps" },
  { value: "large", label: "Large" },
  { value: "mid", label: "Mid" },
  { value: "small", label: "Small" },
];

// Backend response types
interface HeatmapStock {
  ticker: string;
  name: string;
  sector: string;
  market_cap: number;
  price: number | null;
  change_1d: number | null;
  change_1w: number | null;
  weight: number | null;
  volume: number | null;
  avg_volume: number | null;
}

interface HeatmapSector {
  sector: string;
  stocks: HeatmapStock[];
  totalMarketCap: number;
  avgChange: number;
  advancers: number;
  decliners: number;
}

interface HeatmapResponse {
  sectors: HeatmapSector[];
  summary: {
    totalStocks: number;
    advancers: number;
    decliners: number;
    unchanged: number;
    avgChange: number;
    topSector: { name: string; change: number } | null;
    weakestSector: { name: string; change: number } | null;
  };
  index: string;
  lastUpdated: string;
}

type MarketHeatmapProps = {
  sector?: string;
  refreshToken?: number;
};

// Improved color scale with more granularity
const getColor = (change: number | null): string => {
  if (change === null) return "#3f3f46"; // zinc-700 for missing data
  
  // Gray zone for noise (-0.2% to +0.2%)
  if (change > -0.2 && change < 0.2) return "#52525b"; // zinc-600
  
  // Positive colors (light to strong)
  if (change >= 5.0) return "#047857"; // emerald-700 (extreme)
  if (change >= 3.0) return "#059669"; // emerald-600 (very strong)
  if (change >= 2.0) return "#10b981"; // emerald-500 (strong)
  if (change >= 1.0) return "#34d399"; // emerald-400 (moderate)
  if (change >= 0.2) return "#6ee7b7"; // emerald-300 (light)
  
  // Negative colors (light to strong)
  if (change <= -5.0) return "#b91c1c"; // red-700 (extreme)
  if (change <= -3.0) return "#dc2626"; // red-600 (very strong)
  if (change <= -2.0) return "#ef4444"; // red-500 (strong)
  if (change <= -1.0) return "#f87171"; // red-400 (moderate)
  if (change <= -0.2) return "#fca5a5"; // red-300 (light)
  
  return "#52525b"; // fallback
};

// Get text color based on background
const getTextColor = (change: number | null): string => {
  if (change === null) return "#a1a1aa";
  if (Math.abs(change) < 0.2) return "#d4d4d8";
  return "#ffffff";
};

// Helper to get logo URL
const getLogoUrl = (ticker: string): string | null => {
  if (!LOGO_DEV_TOKEN) return null;
  const cleanTicker = ticker?.replace(/\.US$/i, "") ?? "";
  const symbol = cleanTicker.toLowerCase();
  return `${LOGO_DEV_BASE}/${encodeURIComponent(symbol)}?token=${LOGO_DEV_TOKEN}`;
};

// Format market cap for display
const formatMarketCap = (mcap: number): string => {
  if (mcap >= 1e12) return `$${(mcap / 1e12).toFixed(2)}T`;
  if (mcap >= 1e9) return `$${(mcap / 1e9).toFixed(2)}B`;
  if (mcap >= 1e6) return `$${(mcap / 1e6).toFixed(2)}M`;
  return `$${mcap.toFixed(0)}`;
};

// Format volume
const formatVolume = (vol: number | null): string => {
  if (vol === null) return "—";
  if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`;
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`;
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`;
  return vol.toFixed(0);
};

// Stock Tile Component with hover tooltip
function StockTile({
  stock,
  size,
  onClick,
}: {
  stock: HeatmapStock;
  size: "xs" | "sm" | "md" | "lg" | "xl";
  onClick: (ticker: string) => void;
}) {
  const logoUrl = getLogoUrl(stock.ticker);
  const bgColor = getColor(stock.change_1d);
  const textColor = getTextColor(stock.change_1d);
  
  const sizeClasses = {
    xs: "w-8 h-8",
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
  };

  const showTicker = size !== "xs";
  const showChange = size === "lg" || size === "xl";
  const showLogo = size === "xl";

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => onClick(stock.ticker)}
            className={cn(
              "relative flex flex-col items-center justify-center gap-0.5 rounded transition-all hover:brightness-110 hover:scale-105 cursor-pointer border border-black/10",
              sizeClasses[size]
            )}
            style={{ backgroundColor: bgColor }}
          >
            {showLogo && logoUrl && (
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt=""
                  className="w-5 h-5 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
            {showTicker && (
              <span
                className="font-bold text-[10px] leading-none"
                style={{ color: textColor }}
              >
                {stock.ticker}
              </span>
            )}
            {showChange && stock.change_1d !== null && (
              <span
                className="text-[9px] font-medium leading-none"
                style={{ color: textColor }}
              >
                {stock.change_1d > 0 ? "+" : ""}
                {stock.change_1d.toFixed(2)}%
              </span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-slate-900 border-slate-700 text-white p-3 min-w-[220px]"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {logoUrl && (
                <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt=""
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="font-bold">{stock.ticker}</div>
                <div className="text-xs text-slate-400 truncate max-w-[150px]">
                  {stock.name}
                </div>
              </div>
              <div
                className={cn(
                  "text-lg font-bold font-mono",
                  stock.change_1d !== null && stock.change_1d >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                )}
              >
                {stock.change_1d !== null
                  ? `${stock.change_1d > 0 ? "+" : ""}${stock.change_1d.toFixed(2)}%`
                  : "—"}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-700 pt-2">
              <div>
                <span className="text-slate-400">Market Cap</span>
                <div className="font-mono">{formatMarketCap(stock.market_cap)}</div>
              </div>
              <div>
                <span className="text-slate-400">1W Change</span>
                <div
                  className={cn(
                    "font-mono",
                    stock.change_1w !== null && stock.change_1w >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  )}
                >
                  {stock.change_1w !== null
                    ? `${stock.change_1w > 0 ? "+" : ""}${stock.change_1w.toFixed(2)}%`
                    : "—"}
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400">Volume</span>
                <div className="font-mono">{formatVolume(stock.volume)}</div>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 border-t border-slate-700 pt-1">
              {stock.sector}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Sector Group Component
function SectorGroup({
  sector,
  onStockClick,
}: {
  sector: HeatmapSector;
  onStockClick: (ticker: string) => void;
}) {
  // Determine tile sizes based on market cap ranking within sector
  const getTileSize = (index: number, total: number): "xs" | "sm" | "md" | "lg" | "xl" => {
    if (total <= 3) return index === 0 ? "xl" : "lg";
    if (index === 0) return "xl";
    if (index <= 2) return "lg";
    if (index <= 6) return "md";
    if (index <= 15) return "sm";
    return "xs";
  };

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800/50">
      {/* Sector Header */}
      <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {sector.sector}
        </span>
        <div className="flex items-center gap-2 text-[10px]">
          <span
            className={cn(
              "font-mono font-medium",
              sector.avgChange >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            )}
          >
            {sector.avgChange >= 0 ? "+" : ""}
            {sector.avgChange.toFixed(2)}%
          </span>
          <span className="text-slate-400">
            <span className="text-emerald-500">{sector.advancers}</span>
            /
            <span className="text-red-500">{sector.decliners}</span>
          </span>
        </div>
      </div>
      {/* Stocks Grid */}
      <div className="p-2 flex flex-wrap gap-1 justify-start items-start">
        {sector.stocks.slice(0, 25).map((stock, idx) => (
          <StockTile
            key={stock.ticker}
            stock={stock}
            size={getTileSize(idx, sector.stocks.length)}
            onClick={onStockClick}
          />
        ))}
        {sector.stocks.length > 25 && (
          <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] text-slate-500">
            +{sector.stocks.length - 25}
          </div>
        )}
      </div>
    </div>
  );
}

// Summary Bar Component
function SummaryBar({ summary }: { summary: HeatmapResponse["summary"] }) {
  const advanceRatio = summary.totalStocks > 0
    ? ((summary.advancers / summary.totalStocks) * 100).toFixed(0)
    : "0";
  const declineRatio = summary.totalStocks > 0
    ? ((summary.decliners / summary.totalStocks) * 100).toFixed(0)
    : "0";

  return (
    <div className="flex flex-wrap items-center gap-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm">
      {/* Advance/Decline */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {summary.advancers}
          </span>
          <span className="text-slate-400 text-xs">({advanceRatio}%)</span>
        </div>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <div className="flex items-center gap-1">
          <TrendingDown className="w-4 h-4 text-red-500" />
          <span className="font-semibold text-red-600 dark:text-red-400">
            {summary.decliners}
          </span>
          <span className="text-slate-400 text-xs">({declineRatio}%)</span>
        </div>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <div className="flex items-center gap-1">
          <Minus className="w-4 h-4 text-slate-400" />
          <span className="text-slate-500">{summary.unchanged}</span>
        </div>
      </div>

      {/* Average Change */}
      <div className="flex items-center gap-1">
        <span className="text-slate-500 text-xs">Avg:</span>
        <span
          className={cn(
            "font-mono font-semibold",
            summary.avgChange >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          )}
        >
          {summary.avgChange >= 0 ? "+" : ""}
          {summary.avgChange.toFixed(2)}%
        </span>
      </div>

      {/* Top Sector */}
      {summary.topSector && (
        <div className="flex items-center gap-1">
          <span className="text-slate-500 text-xs">Top:</span>
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            {summary.topSector.name}
          </span>
          <span className="text-emerald-500 text-xs font-mono">
            +{summary.topSector.change.toFixed(2)}%
          </span>
        </div>
      )}

      {/* Weakest Sector */}
      {summary.weakestSector && (
        <div className="flex items-center gap-1">
          <span className="text-slate-500 text-xs">Weak:</span>
          <span className="font-medium text-red-600 dark:text-red-400">
            {summary.weakestSector.name}
          </span>
          <span className="text-red-500 text-xs font-mono">
            {summary.weakestSector.change.toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
}

export default function MarketHeatmap({ sector, refreshToken }: MarketHeatmapProps) {
  const [data, setData] = useState<HeatmapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<IndexType>("sp500");
  const [capFilter, setCapFilter] = useState<CapFilter>("all");
  const router = useRouter();

  const handleStockClick = useCallback(
    (ticker: string) => {
      router.push(`/company/${ticker}`);
    },
    [router]
  );

  // Fetch data from new backend endpoint
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          index: selectedIndex,
          ...(capFilter !== "all" && { cap: capFilter }),
          ...(sector && { sector }),
        });

        const res = await fetch(`${BACKEND_URL}/api/market/heatmap?${params}`);

        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("[Heatmap] Error:", err);
        setError("Unable to load market data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [selectedIndex, capFilter, sector, refreshToken]);

  // Filter sectors if external sector filter is applied
  const filteredSectors = useMemo(() => {
    if (!data?.sectors) return [];
    if (!sector) return data.sectors;
    return data.sectors.filter(
      (s) => s.sector.toLowerCase().includes(sector.toLowerCase())
    );
  }, [data?.sectors, sector]);

  return (
    <Card className="h-full border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 space-y-3">
        {/* Title Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Market Heatmap
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Tile size represents market capitalization. Colors show daily price change intensity.
                      Click any stock to view details.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Grouped by sector • Size = Market Cap
            </p>
          </div>

          {/* Toggles */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            {/* Primary: Index Toggle */}
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5">
              {INDEX_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedIndex(opt.value)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                    selectedIndex === opt.value
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Secondary: Cap Filter */}
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5">
              {CAP_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCapFilter(opt.value)}
                  className={cn(
                    "px-2 py-1 text-[11px] font-medium rounded transition-colors",
                    capFilter === opt.value
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Color Legend */}
        <div className="flex items-center gap-4 text-[10px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#047857" }} />
            <span>+5%+</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#10b981" }} />
            <span>+2-5%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#6ee7b7" }} />
            <span>+0.2-2%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#52525b" }} />
            <span>Flat</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#fca5a5" }} />
            <span>-0.2-2%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#ef4444" }} />
            <span>-2-5%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#b91c1c" }} />
            <span>-5%+</span>
          </div>
        </div>

        {/* Summary Bar */}
        {data?.summary && <SummaryBar summary={data.summary} />}
      </CardHeader>

      <CardContent className="p-4 pt-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[600px] gap-3">
            <div className="h-10 w-10 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-brand animate-spin" />
            <span className="text-sm text-slate-500">Loading market data…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[600px] gap-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
            <button
              type="button"
              onClick={() => setSelectedIndex(selectedIndex)}
              className="text-xs text-brand hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[650px] overflow-y-auto pr-1">
            {filteredSectors.map((sector) => (
              <SectorGroup
                key={sector.sector}
                sector={sector}
                onStockClick={handleStockClick}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
