"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { UTCTimestamp } from "lightweight-charts";
import { TradingViewChart, ChartDataPoint, RiskZone, ChartOverlay } from "./TradingViewChart";
import { Camera, Settings2, BarChart3, TrendingUp, CandlestickChart, ChevronDown, Lock, Building2, MousePointerClick, ShieldAlert } from "lucide-react";
import { useChartPreferences } from "@/hooks/useChartPreferences";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";

interface PriceData {
  date: string;
  price: number;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
  drawdown?: number;
}

// ─── Technical overlay configuration ─────────────────────────────────────────
const OVERLAY_CONFIGS: Record<
  string,
  { label: string; color: string; lineWidth?: 1 | 2 | 3 | 4; lineStyle?: 0 | 1 | 2 | 3 | 4; isOscillator?: boolean }
> = {
  ema_9:            { label: 'EMA 9',    color: '#f59e0b', lineWidth: 1 },
  ema_21:           { label: 'EMA 21',   color: '#f97316', lineWidth: 1 },
  ema_50:           { label: 'EMA 50',   color: '#3b82f6', lineWidth: 2 },
  ema_200:          { label: 'EMA 200',  color: '#8b5cf6', lineWidth: 2 },
  sma_20:           { label: 'SMA 20',   color: '#06b6d4', lineWidth: 1 },
  sma_50:           { label: 'SMA 50',   color: '#0ea5e9', lineWidth: 2 },
  sma_200:          { label: 'SMA 200',  color: '#6366f1', lineWidth: 2 },
  bollinger_upper:  { label: 'BB Upper', color: '#64748b', lineStyle: 2, lineWidth: 1 },
  bollinger_middle: { label: 'BB Mid',   color: '#94a3b8', lineWidth: 1 },
  bollinger_lower:  { label: 'BB Lower', color: '#64748b', lineStyle: 2, lineWidth: 1 },
  rsi_14:           { label: 'RSI (14)', color: '#e879f9', lineWidth: 1, isOscillator: true },
};

const BB_COLS = ['bollinger_upper', 'bollinger_middle', 'bollinger_lower'] as const;

interface PriceChartProps {
  data: PriceData[];
  /** Stock ticker symbol – required to fetch indicator data on demand */
  ticker?: string;
}

// Enterprise-only ranges
const ENTERPRISE_RANGES = ["Max"];

export function PriceChart({ data, ticker }: PriceChartProps) {
  const chartContainerRef = React.useRef<HTMLDivElement>(null);
  const {
    preferences,
    setShowVolume,
    setPriceDisplayMode,
    setShowDetailedTooltip,
    setAreaStyle,
    setCandlestickStyle,
    setRiskMode,
    setShowRiskZones,
    setShowWhatIfSimulation,
    isLoaded
  } = useChartPreferences();
  const { session } = useAuth();

  const isEnterprise = session?.tier === "enterprise" || session?.tier === "elite";
  const isPro = session?.tier === "premium" || session?.tier === "pro" || session?.tier === "elite" || session?.tier === "enterprise";

  const [range, setRange] = React.useState("1Y");
  const [view, setView] = React.useState<"price" | "risk" | "candlestick">("price");
  const [showVolume, setShowVolumeLocal] = React.useState(true);
  const [isDark, setIsDark] = React.useState(false);
  const [showEnterpriseGate, setShowEnterpriseGate] = React.useState(false);
  const [whatIfIndex, setWhatIfIndex] = React.useState<number | null>(null);

  // ── Technical indicators ────────────────────────────────────────────────────
  const [activeIndicators, setActiveIndicators] = React.useState<string[]>([]);
  const [indicatorCache, setIndicatorCache] = React.useState<
    Record<string, Array<{ date: string; value: number | null }>>
  >({});
  const [indicatorLoading, setIndicatorLoading] = React.useState(false);

  const toggleIndicator = React.useCallback((col: string) => {
    setActiveIndicators((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  }, []);

  const isBBActive = BB_COLS.every((k) => activeIndicators.includes(k));
  const toggleBB = React.useCallback(() => {
    setActiveIndicators((prev) =>
      BB_COLS.every((k) => prev.includes(k))
        ? prev.filter((k2) => !(BB_COLS as readonly string[]).includes(k2))
        : [...new Set([...prev.filter((k2) => !(BB_COLS as readonly string[]).includes(k2)), ...BB_COLS])]
    );
  }, []);

  // Stable string dep so the effect doesn't re-run on every render
  const indicatorKey = [...activeIndicators].sort().join(',');

  React.useEffect(() => {
    if (!ticker || !activeIndicators.length) return;
    const missing = activeIndicators.filter((k) => !indicatorCache[k]);
    if (missing.length === 0) return;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    setIndicatorLoading(true);
    fetch(`${backendUrl}/api/prices/${encodeURIComponent(ticker)}/technicals?cols=${missing.join(',')}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!json?.data) return;
        setIndicatorCache((prev) => {
          const next = { ...prev };
          for (const col of missing) {
            next[col] = (json.data as Array<Record<string, unknown>>).map((row) => ({
              date: row.date as string,
              value: row[col] != null ? Number(row[col]) : null,
            }));
          }
          return next;
        });
      })
      .catch(() => { /* silent fail – indicators are non-critical */ })
      .finally(() => setIndicatorLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indicatorKey, ticker]);

  const overlays: ChartOverlay[] = React.useMemo(() => {
    return activeIndicators
      .filter((k) => !OVERLAY_CONFIGS[k]?.isOscillator && indicatorCache[k])
      .map((k) => ({
        id: k,
        label: OVERLAY_CONFIGS[k].label,
        color: OVERLAY_CONFIGS[k].color,
        lineWidth: OVERLAY_CONFIGS[k].lineWidth,
        lineStyle: OVERLAY_CONFIGS[k].lineStyle,
        data: (indicatorCache[k] ?? [])
          .filter((d) => d.value != null && !Number.isNaN(d.value))
          .map((d) => ({ time: (new Date(d.date).getTime() / 1000) as UTCTimestamp, value: d.value as number })),
      }));
  }, [activeIndicators, indicatorCache]);

  const rsiOverlayData = React.useMemo(() => {
    if (!activeIndicators.includes('rsi_14') || !indicatorCache['rsi_14']) return undefined;
    return (indicatorCache['rsi_14'] ?? [])
      .filter((d) => d.value != null && !Number.isNaN(d.value))
      .map((d) => ({ time: (new Date(d.date).getTime() / 1000) as UTCTimestamp, value: d.value as number }));
  }, [activeIndicators, indicatorCache]);

  // Sync with preferences and detect dark mode
  React.useEffect(() => {
    if (isLoaded) {
      setShowVolumeLocal(preferences.showVolume);
    }
  }, [isLoaded, preferences.showVolume]);

  React.useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains("dark"));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const priceDisplayMode = preferences.priceDisplayMode ?? "rangeChange";
  const showDetailedTooltip = preferences.showDetailedTooltip ?? true;
  const areaStyle = preferences.areaStyle ?? "area";
  const candlestickStyle = preferences.candlestickStyle ?? "candlestick";
  const riskMode = preferences.riskMode ?? "drawdown";
  const showRiskZones = preferences.showRiskZones ?? true;
  const showWhatIfSimulation = preferences.showWhatIfSimulation ?? true;

  // Handle range selection with enterprise gate
  const handleRangeSelect = React.useCallback((r: string) => {
    if (ENTERPRISE_RANGES.includes(r) && !isEnterprise) {
      setShowEnterpriseGate(true);
      return;
    }
    setRange(r);
    setShowEnterpriseGate(false);
  }, [isEnterprise]);

  const handleVolumeToggle = React.useCallback((checked: boolean) => {
    setShowVolumeLocal(checked);
    setShowVolume(checked);
  }, [setShowVolume]);

  const handleSnapshot = React.useCallback((colorScheme: "default" | "light" | "dark" | "vibrant" | "mono") => {
    if (!chartContainerRef.current) return;
    const canvas = chartContainerRef.current.querySelector("canvas");
    if (!canvas) return;

    try {
      // For different color schemes, we'll adjust the canvas rendering
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Create a temporary canvas for color scheme adjustments
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      // Draw original canvas
      tempCtx.drawImage(canvas, 0, 0);

      // Apply color scheme filters
      if (colorScheme === "light") {
        // Invert for light background
        tempCtx.globalCompositeOperation = "difference";
        tempCtx.fillStyle = "white";
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      } else if (colorScheme === "dark") {
        // Keep as is (default dark mode)
      } else if (colorScheme === "vibrant") {
        // Increase saturation
        tempCtx.filter = "saturate(150%) contrast(110%)";
        tempCtx.drawImage(canvas, 0, 0);
      } else if (colorScheme === "mono") {
        // Grayscale
        tempCtx.filter = "grayscale(100%)";
        tempCtx.drawImage(canvas, 0, 0);
      }

      const link = document.createElement("a");
      link.download = `chart-${colorScheme}-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = tempCanvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Failed to take snapshot:", e);
    }
  }, []);

  const enriched = React.useMemo(() => {
    if (!data || data.length === 0) return data;

    let peak = data[0]?.price ?? 0;

    return data.map((point) => {
      if (point.price > peak) {
        peak = point.price;
      }
      const drawdown = peak ? ((point.price - peak) / peak) * 100 : 0;

      return {
        ...point,
        drawdown, // negative numbers for drawdown from peak
      };
    }) as (PriceData & { drawdown: number })[];
  }, [data]);

  const filteredData = React.useMemo(() => {
    if (!enriched || enriched.length === 0) return enriched;
    if (range === "Max") return enriched;

    // Get the latest date from the data as our anchor
    const lastPoint = enriched[enriched.length - 1];
    const latestDate = new Date(lastPoint.date);

    // Calculate cutoff date based on range relative to latest data point
    const cutoffDate = new Date(latestDate);

    switch (range) {
      case "1M":
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        break;
      case "6M":
        cutoffDate.setMonth(cutoffDate.getMonth() - 6);
        break;
      case "1Y":
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
        break;
      case "3Y":
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 3);
        break;
      case "5Y":
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 5);
        break;
      case "10Y":
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 10);
        break;
      default:
        return enriched;
    }

    // Filter points on or after cutoff date
    // Note: data.date is a string, so we compare timestamp or string ISO
    const cutoffTime = cutoffDate.getTime();

    // Debug logging
    console.log('[PriceChart] Debug:', {
      range,
      enrichedLen: enriched.length,
      firstEnrichedDate: enriched[0]?.date,
      lastEnrichedDate: lastPoint.date,
      latestDateObj: latestDate.toISOString(),
      cutoffDateObj: cutoffDate.toISOString()
    });

    return enriched.filter(p => new Date(p.date).getTime() >= cutoffTime);
  }, [enriched, range]);

  const rangeStats = React.useMemo(() => {
    if (!filteredData || filteredData.length === 0) return null;

    const first = filteredData[0];
    const last = filteredData[filteredData.length - 1];

    const startPrice = (first.close ?? first.price) || null;
    const endPrice = (last.close ?? last.price) || null;

    let rangeChangePct: number | null = null;
    if (startPrice && endPrice) {
      rangeChangePct = ((endPrice - startPrice) / startPrice) * 100;
    }

    let dayChangePct: number | null = null;
    if (filteredData.length >= 2) {
      const prev = filteredData[filteredData.length - 2];
      const prevPrice = (prev.close ?? prev.price) || null;
      if (prevPrice && endPrice) {
        dayChangePct = ((endPrice - prevPrice) / prevPrice) * 100;
      }
    }

    return {
      rangeChangePct,
      dayChangePct,
      startPrice,
    };
  }, [filteredData]);

  // Convert for TradingView
  const tvData: ChartDataPoint[] = React.useMemo(() => {
    if (!filteredData) return [];
    return filteredData.map((d) => ({
      time: new Date(d.date).getTime() / 1000,
      open: d.open ?? d.price,
      high: d.high ?? d.price,
      low: d.low ?? d.price,
      close: d.close ?? d.price,
      volume: d.volume ?? 0,
    }));
  }, [filteredData]);

  // Recharts Risk Data (drawdown, volatility, etc.)
  const riskData = React.useMemo(() => {
    if (view !== "risk" || !filteredData) return [];

    if (riskMode === "volatility") {
      // Calculate rolling volatility (20-day when possible, shorter window for short ranges)
      const maxWindow = 20;
      if (filteredData.length <= maxWindow) {
        // For short ranges, grow the window with available data so we still render a line
        return filteredData.map((d, i) => {
          if (i === 0) return { date: d.date, value: null };
          const slice = filteredData.slice(0, i + 1);
          const returns = slice
            .map((p, j) => (j > 0 ? Math.log((p.close ?? p.price) / (slice[j - 1].close ?? slice[j - 1].price)) : 0))
            .slice(1);
          if (returns.length === 0) {
            return { date: d.date, value: null };
          }
          const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
          const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
          const volatility = Math.sqrt(variance * 252) * 100; // Annualized
          return { date: d.date, value: volatility };
        });
      }

      const windowSize = maxWindow;
      return filteredData.map((d, i) => {
        if (i < windowSize) return { date: d.date, value: null };
        const slice = filteredData.slice(i - windowSize, i);
        const returns = slice
          .map((p, j) => (j > 0 ? Math.log((p.close ?? p.price) / (slice[j - 1].close ?? slice[j - 1].price)) : 0))
          .slice(1);
        if (returns.length === 0) {
          return { date: d.date, value: null };
        }
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
        const volatility = Math.sqrt(variance * 252) * 100; // Annualized
        return { date: d.date, value: volatility };
      });
    }

    // Default: drawdown
    return filteredData.map((d) => ({
      date: d.date,
      value: d.drawdown,
    }));
  }, [filteredData, view, riskMode]);

  // What-if simulation calculation
  const whatIfStats = React.useMemo(() => {
    if (!showWhatIfSimulation || whatIfIndex === null || !filteredData || filteredData.length === 0) return null;
    if (whatIfIndex < 0 || whatIfIndex >= filteredData.length) return null;

    const buyPoint = filteredData[whatIfIndex];
    const currentPoint = filteredData[filteredData.length - 1];
    const buyPrice = buyPoint.close ?? buyPoint.price;
    const currentPrice = currentPoint.close ?? currentPoint.price;

    const returnPct = ((currentPrice - buyPrice) / buyPrice) * 100;

    // Calculate max drawdown from buy point
    let peak = buyPrice;
    let maxDrawdown = 0;
    for (let i = whatIfIndex; i < filteredData.length; i++) {
      const price = filteredData[i].close ?? filteredData[i].price;
      if (price > peak) peak = price;
      const dd = ((price - peak) / peak) * 100;
      if (dd < maxDrawdown) maxDrawdown = dd;
    }

    const buyDate = new Date(buyPoint.date);
    const currentDate = new Date(currentPoint.date);
    const daysHeld = Math.floor((currentDate.getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      buyDate: buyPoint.date,
      returnPct,
      maxDrawdown,
      daysHeld,
    };
  }, [showWhatIfSimulation, whatIfIndex, filteredData]);

  // Calculate risk zones (overbought/oversold based on momentum, high volatility)
  const riskZonesData: RiskZone[] = React.useMemo(() => {
    if (!showRiskZones || !tvData) return [];

    const zones: RiskZone[] = [];
    const rsiPeriod = 14;
    const volPeriod = 20;
    const volThreshold = 40; // Annualized volatility > 40% = high volatility

    // Require at least enough points to compute RSI meaningfully
    if (tvData.length <= rsiPeriod + 1) {
      return [];
    }

    // Calculate RSI-like momentum indicator
    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < tvData.length; i++) {
      const change = tvData[i].close - tvData[i - 1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    // Check each point for overbought/oversold/high-volatility
    for (let i = rsiPeriod; i < tvData.length; i++) {
      // RSI calculation
      const avgGain = gains.slice(i - rsiPeriod, i).reduce((a, b) => a + b, 0) / rsiPeriod;
      const avgLoss = losses.slice(i - rsiPeriod, i).reduce((a, b) => a + b, 0) / rsiPeriod;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));

      // Volatility calculation
      if (i >= volPeriod) {
        const slice = tvData.slice(i - volPeriod, i);
        const returns = slice.map((p, j) => j > 0 ? Math.log(p.close / slice[j - 1].close) : 0).slice(1);
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
        const volatility = Math.sqrt(variance * 252) * 100;

        if (volatility > volThreshold) {
          zones.push({
            startTime: tvData[i].time,
            endTime: tvData[i].time,
            type: "high-volatility",
          });
        }
      }

      // RSI zones
      if (rsi > 70) {
        zones.push({
          startTime: tvData[i].time,
          endTime: tvData[i].time,
          type: "overbought",
        });
      } else if (rsi < 30) {
        zones.push({
          startTime: tvData[i].time,
          endTime: tvData[i].time,
          type: "oversold",
        });
      }
    }

    // Limit to most recent significant zones (to avoid cluttering chart)
    return zones.slice(-20);
  }, [showRiskZones, tvData]);

  const formatDateLabel = React.useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);

    if (range === "1M") {
      return `${month} ${date.getDate()}`;
    } else {
      return `${month} '${year}`;
    }
  }, [range]);

  const formatPercentLabel = (value: number | null | undefined) => {
    if (value == null || Number.isNaN(value)) return null;
    const fixed = value.toFixed(2);
    const sign = value > 0 ? "+" : "";
    return `${sign}${fixed}%`;
  };

  return (
    <Card className="w-full border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 transition-colors duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <CardTitle className="text-base font-medium text-slate-700 dark:text-slate-300 font-heading transition-colors duration-300">
            {view === "price" ? "Price & Volume" : view === "candlestick" ? "Candlestick" : riskMode === "volatility" ? "Volatility" : "Risk (Drawdown)"}
          </CardTitle>
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setView("price")}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      view === "price"
                        ? "bg-white dark:bg-slate-700 text-brand shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                  >
                    <TrendingUp className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Area Chart</TooltipContent>
              </UITooltip>
            </TooltipProvider>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setView("candlestick")}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      view === "candlestick"
                        ? "bg-white dark:bg-slate-700 text-brand shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                  >
                    <CandlestickChart className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Candlestick Chart</TooltipContent>
              </UITooltip>
            </TooltipProvider>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setView("risk")}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      view === "risk"
                        ? "bg-white dark:bg-slate-700 text-brand shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                  >
                    <ShieldAlert className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Risk Chart</TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {priceDisplayMode === "rangeChange" && rangeStats && (
            <div className="flex flex-row items-center gap-2 text-xs mr-1">
              {formatPercentLabel(rangeStats.rangeChangePct) && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 font-medium border",
                    (rangeStats.rangeChangePct ?? 0) > 0
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900"
                      : (rangeStats.rangeChangePct ?? 0) < 0
                        ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900"
                        : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700"
                  )}
                >
                  Period {formatPercentLabel(rangeStats.rangeChangePct)}
                </span>
              )}
              {formatPercentLabel(rangeStats.dayChangePct) && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 font-medium border opacity-70",
                    (rangeStats.dayChangePct ?? 0) > 0
                      ? "bg-emerald-50/80 text-emerald-600 border-emerald-200/80 dark:bg-emerald-950/15 dark:text-emerald-400 dark:border-emerald-900/80"
                      : (rangeStats.dayChangePct ?? 0) < 0
                        ? "bg-red-50/80 text-red-600 border-red-200/80 dark:bg-red-950/15 dark:text-red-400 dark:border-red-900/80"
                        : "bg-slate-50/80 text-slate-500 border-slate-200/80 dark:bg-slate-800/30 dark:text-slate-400 dark:border-slate-700/80"
                  )}
                >
                  1D Change {formatPercentLabel(rangeStats.dayChangePct)}
                </span>
              )}
            </div>
          )}

          <div className="flex space-x-1">
            {["1M", "6M", "1Y", "3Y", "5Y", "10Y", "Max"].map((r) => {
              const isLocked = ENTERPRISE_RANGES.includes(r) && !isEnterprise;
              return (
                <button
                  key={r}
                  onClick={() => handleRangeSelect(r)}
                  className={cn(
                    "px-2 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-0.5",
                    range === r
                      ? "bg-brand text-white"
                      : isLocked
                        ? "text-slate-400 dark:text-slate-500"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {r}
                  {isLocked && <Lock className="h-2.5 w-2.5 ml-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Settings & Snapshot */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Chart Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={showVolume}
                onCheckedChange={handleVolumeToggle}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Show Volume
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              {/* Technical Indicators */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Indicators{indicatorLoading && <span className="ml-1 text-[10px] text-slate-400">...</span>}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-52">
                  <DropdownMenuLabel className="text-xs">Moving Averages</DropdownMenuLabel>
                  {(['ema_9','ema_21','ema_50','ema_200','sma_20','sma_50','sma_200'] as const).map((k) => (
                    <DropdownMenuCheckboxItem
                      key={k}
                      checked={activeIndicators.includes(k)}
                      onCheckedChange={() => toggleIndicator(k)}
                      disabled={!ticker}
                    >
                      <span className="mr-2 font-bold" style={{ color: OVERLAY_CONFIGS[k].color }}>&#x2500;</span>
                      {OVERLAY_CONFIGS[k].label}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs">Bollinger Bands</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={isBBActive}
                    onCheckedChange={toggleBB}
                    disabled={!ticker}
                  >
                    <span className="mr-2 font-bold" style={{ color: OVERLAY_CONFIGS['bollinger_upper'].color }}>&#x2500;</span>
                    Bollinger Bands
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs">Oscillators</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={activeIndicators.includes('rsi_14')}
                    onCheckedChange={() => toggleIndicator('rsi_14')}
                    disabled={!ticker}
                  >
                    <span className="mr-2 font-bold" style={{ color: OVERLAY_CONFIGS['rsi_14'].color }}>&#x2500;</span>
                    RSI (14)
                  </DropdownMenuCheckboxItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-normal text-slate-500 dark:text-slate-400">
                Price Display
              </DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={priceDisplayMode === "rangeChange"}
                onCheckedChange={() => setPriceDisplayMode("rangeChange")}
              >
                % change since range start (default)
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={priceDisplayMode === "absolute"}
                onCheckedChange={() => setPriceDisplayMode("absolute")}
              >
                Absolute price only
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={showDetailedTooltip}
                onCheckedChange={(checked) => setShowDetailedTooltip(!!checked)}
              >
                Show detailed hover tooltip
              </DropdownMenuCheckboxItem>
              {/* Area chart specific options */}
              {view === "price" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    Area Chart Style
                  </DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={areaStyle === "area"}
                    onCheckedChange={() => setAreaStyle("area")}
                  >
                    Filled Area (default)
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={areaStyle === "line"}
                    onCheckedChange={() => setAreaStyle("line")}
                  >
                    Line Only
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    Interactive Features
                  </DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={showRiskZones}
                    onCheckedChange={(checked) => setShowRiskZones(!!checked)}
                  >
                    Show Risk Zones
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={showWhatIfSimulation}
                    onCheckedChange={(checked) => setShowWhatIfSimulation(!!checked)}
                  >
                    &quot;What If I Bought Here?&quot; Mode
                  </DropdownMenuCheckboxItem>
                </>
              )}

              {/* Candlestick chart specific options */}
              {view === "candlestick" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    Candlestick Style
                  </DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={candlestickStyle === "candlestick"}
                    onCheckedChange={() => setCandlestickStyle("candlestick")}
                  >
                    Standard Candlestick
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={candlestickStyle === "heikin-ashi"}
                    onCheckedChange={() => {
                      if (isPro) setCandlestickStyle("heikin-ashi");
                    }}
                    disabled={!isPro}
                  >
                    Heikin Ashi {!isPro && <Lock className="h-3 w-3 ml-1 opacity-50" />}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    Interactive Features
                  </DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={showRiskZones}
                    onCheckedChange={(checked) => setShowRiskZones(!!checked)}
                  >
                    Show Risk Zones
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={showWhatIfSimulation}
                    onCheckedChange={(checked) => setShowWhatIfSimulation(!!checked)}
                  >
                    &quot;What If I Bought Here?&quot; Mode
                  </DropdownMenuCheckboxItem>
                </>
              )}

              {/* Risk chart specific options */}
              {view === "risk" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    Risk Chart Mode
                  </DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={riskMode === "drawdown"}
                    onCheckedChange={() => setRiskMode("drawdown")}
                  >
                    Drawdown (default)
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={riskMode === "volatility"}
                    onCheckedChange={() => setRiskMode("volatility")}
                  >
                    Volatility (20-day)
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    Interactive Features
                  </DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={showRiskZones}
                    onCheckedChange={(checked) => setShowRiskZones(!!checked)}
                  >
                    Show Risk Zones
                  </DropdownMenuCheckboxItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 group relative">
                <Camera className="h-4 w-4" />
                <ChevronDown className="h-3 w-3 absolute -bottom-0.5 -right-0.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Save Chart Snapshot</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSnapshot("default")}>
                <Camera className="h-4 w-4 mr-2" />
                Default (Current Theme)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Settings2 className="h-4 w-4 mr-2" />
                  Color Schemes
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleSnapshot("light")}>
                    ☀️ Light Mode
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSnapshot("dark")}>
                    🌙 Dark Mode
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSnapshot("vibrant")}>
                    🎨 Vibrant Colors
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSnapshot("mono")}>
                    ⚫ Monochrome
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 relative">
        {/* Enterprise Gate Overlay */}
        {showEnterpriseGate && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm rounded-lg">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 max-w-sm mx-4 text-center shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Enterprise Feature</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Extended historical data (5Y, 10Y, Max) is available on Enterprise plans. Contact our sales team to unlock full access.
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={() => setShowEnterpriseGate(false)}>
                  Close
                </Button>
                <Link href="/contact-sales">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* What-If Simulation Stats */}
        {showWhatIfSimulation && whatIfStats && (
          <div className="absolute top-6 right-6 z-10 bg-white/75 dark:bg-slate-900/75 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700/80 rounded-lg p-3 text-xs shadow-lg">
            <div className="font-semibold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-1.5">
              <MousePointerClick className="h-3.5 w-3.5" />
              What If I Bought Here?
            </div>
            <div className="space-y-1">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Buy Date</span>
                <span className="font-mono text-slate-900 dark:text-slate-100">{whatIfStats.buyDate}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Return</span>
                <span className={cn("font-mono font-medium", whatIfStats.returnPct >= 0 ? "text-emerald-600" : "text-red-600")}>
                  {whatIfStats.returnPct >= 0 ? "+" : ""}{whatIfStats.returnPct.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Max Drawdown</span>
                <span className="font-mono text-orange-600">{whatIfStats.maxDrawdown.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Days Held</span>
                <span className="font-mono text-slate-900 dark:text-slate-100">{whatIfStats.daysHeld}</span>
              </div>
            </div>
            <button
              onClick={() => setWhatIfIndex(null)}
              className="mt-2 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              Click chart to change • Clear
            </button>
          </div>
        )}

        <div ref={chartContainerRef} className="h-80 w-full pb-6">
          {view === "risk" ? (
            riskMode === "volatility" && (!filteredData || filteredData.length < 25) ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-500 dark:text-slate-400">
                Volatility analysis is not available for very short periods. Try a longer range like 3M or 1Y.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={riskData}
                  margin={{ top: 8, right: 8, bottom: 28, left: 0 }}
                >
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
                    tickFormatter={formatDateLabel}
                    interval="preserveStartEnd"
                    angle={-45}
                    textAnchor="end"
                    height={64}
                  />
                  <YAxis
                    stroke={isDark ? "#94a3b8" : "#64748b"}
                    fontSize={12}
                    tick={{ className: "font-mono" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value?.toFixed(0) ?? 0}%`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const dataPoint = payload[0].payload;
                      return (
                        <div className={cn(
                          "p-3 rounded-lg border shadow-xl transition-colors duration-300",
                          isDark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                        )}>
                          <div className="text-xs font-bold text-slate-500 mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">
                            {label}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-xs text-slate-500">{riskMode === "volatility" ? "Volatility" : "Drawdown"}</span>
                              <span className="font-mono font-bold text-orange-500">
                                {dataPoint.value?.toFixed(2) ?? "—"}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={riskMode === "volatility" ? "#8b5cf6" : "#f97316"}
                    strokeWidth={2}
                    fillOpacity={0.05}
                    fill={riskMode === "volatility" ? "#8b5cf6" : "#f97316"}
                    connectNulls
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )
          ) : (
            <TradingViewChart
              data={tvData}
              chartType={view === "candlestick" ? "candlestick" : "area"}
              showVolume={showVolume}
              showDetailedTooltip={showDetailedTooltip}
              areaStyle={areaStyle}
              onPointClick={showWhatIfSimulation ? (index) => setWhatIfIndex(index) : undefined}
              riskZones={riskZonesData}
              showRiskZones={showRiskZones}
              showBaselineMarker={priceDisplayMode === "rangeChange"}
              baselinePrice={rangeStats?.startPrice ?? undefined}
              overlays={overlays}
              rsiData={rsiOverlayData}
              colors={{
                lineColor: isDark ? "#3b82f6" : "#2563eb",
                areaTopColor: isDark ? "rgba(59, 130, 246, 0.4)" : "rgba(37, 99, 235, 0.3)",
                areaBottomColor: isDark ? "rgba(59, 130, 246, 0.0)" : "rgba(37, 99, 235, 0.0)",
                upColor: isDark ? "#22c55e" : "#16a34a",
                downColor: isDark ? "#ef4444" : "#dc2626",
                wickUpColor: isDark ? "#22c55e" : "#16a34a",
                wickDownColor: isDark ? "#ef4444" : "#dc2626",
              }}
              height={320}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
