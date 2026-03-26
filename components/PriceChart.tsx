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
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChartSettingsPopover } from "./ChartSettingsPopover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { UTCTimestamp } from "lightweight-charts";
import { ChartDataPoint, RiskZone, ChartOverlay, OscillatorPaneConfig } from "./TradingViewChart";
import dynamic from "next/dynamic";

const TradingViewChart = dynamic(
  () => import("./TradingViewChart").then((mod) => mod.TradingViewChart),
  { ssr: false, loading: () => <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-lg animate-pulse" /> }
);
import { Camera, Settings2, BarChart3, TrendingUp, CandlestickChart, ChevronDown, Lock, Building2, MousePointerClick, ShieldAlert, X } from "lucide-react";
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
  // ── Moving Averages ───────────────────────────────────────────────────────
  ema_9:            { label: 'EMA 9',    color: '#f59e0b', lineWidth: 1 },
  ema_21:           { label: 'EMA 21',   color: '#f97316', lineWidth: 1 },
  ema_50:           { label: 'EMA 50',   color: '#3b82f6', lineWidth: 2 },
  ema_200:          { label: 'EMA 200',  color: '#8b5cf6', lineWidth: 2 },
  sma_20:           { label: 'SMA 20',   color: '#06b6d4', lineWidth: 1 },
  sma_50:           { label: 'SMA 50',   color: '#0ea5e9', lineWidth: 2 },
  sma_200:          { label: 'SMA 200',  color: '#6366f1', lineWidth: 2 },
  wma_20:           { label: 'WMA 20',   color: '#10b981', lineWidth: 1 },
  hma_20:           { label: 'HMA 20',   color: '#14b8a6', lineWidth: 1 },
  dema_20:          { label: 'DEMA 20',  color: '#34d399', lineWidth: 1 },
  tema_20:          { label: 'TEMA 20',  color: '#6ee7b7', lineWidth: 1 },
  // ── Bollinger Bands ───────────────────────────────────────────────────────
  bollinger_upper:  { label: 'BB Upper', color: '#64748b', lineStyle: 2, lineWidth: 1 },
  bollinger_middle: { label: 'BB Mid',   color: '#94a3b8', lineWidth: 1 },
  bollinger_lower:  { label: 'BB Lower', color: '#64748b', lineStyle: 2, lineWidth: 1 },
  // ── Keltner Channel ──────────────────────────────────────────────────────
  keltner_upper:    { label: 'KC Upper', color: '#ec4899', lineStyle: 2, lineWidth: 1 },
  keltner_middle:   { label: 'KC Mid',   color: '#f9a8d4', lineWidth: 1 },
  keltner_lower:    { label: 'KC Lower', color: '#ec4899', lineStyle: 2, lineWidth: 1 },
  // ── Donchian Channel ─────────────────────────────────────────────────────
  donchian_upper:   { label: 'DC Upper', color: '#f43f5e', lineStyle: 2, lineWidth: 1 },
  donchian_middle:  { label: 'DC Mid',   color: '#fda4af', lineWidth: 1 },
  donchian_lower:   { label: 'DC Lower', color: '#f43f5e', lineStyle: 2, lineWidth: 1 },
  // ── Ichimoku Cloud ───────────────────────────────────────────────────────
  ichi_tenkan:      { label: 'Tenkan',   color: '#ef4444', lineWidth: 1 },
  ichi_kijun:       { label: 'Kijun',    color: '#3b82f6', lineWidth: 1 },
  ichi_senkou_a:    { label: 'Senkou A', color: '#22c55e', lineStyle: 2, lineWidth: 1 },
  ichi_senkou_b:    { label: 'Senkou B', color: '#ef4444', lineStyle: 2, lineWidth: 1 },
  ichi_chikou:      { label: 'Chikou',   color: '#a855f7', lineStyle: 1, lineWidth: 1 },
  // ── Trend Overlays ───────────────────────────────────────────────────────
  psar:             { label: 'PSAR',       color: '#f59e0b', lineWidth: 1, lineStyle: 1 },
  supertrend:       { label: 'SuperTrend', color: '#22d3ee', lineWidth: 2 },
  vwap:             { label: 'VWAP',       color: '#fb923c', lineWidth: 2 },
  // ── Pivot Points ─────────────────────────────────────────────────────────
  pivot:            { label: 'Pivot',  color: '#94a3b8', lineStyle: 2, lineWidth: 1 },
  pivot_r1:         { label: 'R1',     color: '#fca5a5', lineStyle: 2, lineWidth: 1 },
  pivot_r2:         { label: 'R2',     color: '#f87171', lineStyle: 2, lineWidth: 1 },
  pivot_r3:         { label: 'R3',     color: '#ef4444', lineStyle: 2, lineWidth: 1 },
  pivot_s1:         { label: 'S1',     color: '#86efac', lineStyle: 2, lineWidth: 1 },
  pivot_s2:         { label: 'S2',     color: '#4ade80', lineStyle: 2, lineWidth: 1 },
  pivot_s3:         { label: 'S3',     color: '#22c55e', lineStyle: 2, lineWidth: 1 },
  // ── Fibonacci Levels ─────────────────────────────────────────────────────
  fib_23_6:         { label: 'Fib 23.6%', color: '#c4b5fd', lineStyle: 3, lineWidth: 1 },
  fib_38_2:         { label: 'Fib 38.2%', color: '#a78bfa', lineStyle: 3, lineWidth: 1 },
  fib_50:           { label: 'Fib 50%',   color: '#8b5cf6', lineStyle: 3, lineWidth: 1 },
  fib_61_8:         { label: 'Fib 61.8%', color: '#7c3aed', lineStyle: 3, lineWidth: 1 },
  fib_78_6:         { label: 'Fib 78.6%', color: '#6d28d9', lineStyle: 3, lineWidth: 1 },
  // ── Oscillators (sub-pane only – excluded from price overlays) ──────────
  rsi_14:           { label: 'RSI (14)',       color: '#e879f9', lineWidth: 1, isOscillator: true },
  macd:             { label: 'MACD',           color: '#3b82f6', lineWidth: 1, isOscillator: true },
  macd_signal:      { label: 'MACD Signal',    color: '#ef4444', lineWidth: 1, isOscillator: true },
  macd_histogram:   { label: 'MACD Hist',      color: '#22c55e', lineWidth: 1, isOscillator: true },
  cci_20:           { label: 'CCI (20)',        color: '#f59e0b', lineWidth: 1, isOscillator: true },
  williams_r:       { label: 'Williams %R',    color: '#8b5cf6', lineWidth: 1, isOscillator: true },
  roc_12:           { label: 'ROC (12)',        color: '#06b6d4', lineWidth: 1, isOscillator: true },
  mfi_14:           { label: 'MFI (14)',        color: '#10b981', lineWidth: 1, isOscillator: true },
  ultimate_osc:     { label: 'Ultimate Osc',   color: '#f97316', lineWidth: 1, isOscillator: true },
  trix_15:          { label: 'TRIX (15)',       color: '#e879f9', lineWidth: 1, isOscillator: true },
  stochastic_k:     { label: 'Stoch %K',       color: '#3b82f6', lineWidth: 1, isOscillator: true },
  stochastic_d:     { label: 'Stoch %D',       color: '#ef4444', lineWidth: 1, isOscillator: true },
  adx:              { label: 'ADX',             color: '#f59e0b', lineWidth: 2, isOscillator: true },
  adx_plus_di:      { label: '+DI',             color: '#22c55e', lineWidth: 1, isOscillator: true },
  adx_minus_di:     { label: '-DI',             color: '#ef4444', lineWidth: 1, isOscillator: true },
  aroon_up:         { label: 'Aroon Up',        color: '#22c55e', lineWidth: 1, isOscillator: true },
  aroon_down:       { label: 'Aroon Down',      color: '#ef4444', lineWidth: 1, isOscillator: true },
  aroon_osc:        { label: 'Aroon Osc',       color: '#f59e0b', lineWidth: 1, isOscillator: true },
  elder_ray_bull:   { label: 'Elder Bull',      color: '#22c55e', lineWidth: 1, isOscillator: true },
  elder_ray_bear:   { label: 'Elder Bear',      color: '#ef4444', lineWidth: 1, isOscillator: true },
  obv:              { label: 'OBV',             color: '#3b82f6', lineWidth: 1, isOscillator: true },
  cmf_20:           { label: 'CMF (20)',        color: '#06b6d4', lineWidth: 1, isOscillator: true },
  force_index:      { label: 'Force Index',     color: '#f97316', lineWidth: 1, isOscillator: true },
  eom_14:           { label: 'EOM (14)',        color: '#8b5cf6', lineWidth: 1, isOscillator: true },
  pvt:              { label: 'PVT',             color: '#10b981', lineWidth: 1, isOscillator: true },
  adosc:            { label: 'A/D Osc',         color: '#f59e0b', lineWidth: 1, isOscillator: true },
  atr:              { label: 'ATR',             color: '#94a3b8', lineWidth: 1, isOscillator: true },
  hist_vol_20:      { label: 'Hist Vol (20)',   color: '#64748b', lineWidth: 1, isOscillator: true },
  chaikin_vol:      { label: 'Chaikin Vol',     color: '#475569', lineWidth: 1, isOscillator: true },
  zscore_20:        { label: 'Z-Score (20)',    color: '#f43f5e', lineWidth: 1, isOscillator: true },
  nvi:              { label: 'NVI',             color: '#a78bfa', lineWidth: 1, isOscillator: true },
  pvi:              { label: 'PVI',             color: '#818cf8', lineWidth: 1, isOscillator: true },
};

const BB_COLS       = ['bollinger_upper', 'bollinger_middle', 'bollinger_lower'] as const;
const KELTNER_COLS  = ['keltner_upper',   'keltner_middle',   'keltner_lower']   as const;
const DONCHIAN_COLS = ['donchian_upper',  'donchian_middle',  'donchian_lower']  as const;
const ICHI_COLS     = ['ichi_tenkan', 'ichi_kijun', 'ichi_senkou_a', 'ichi_senkou_b', 'ichi_chikou'] as const;
const PIVOT_COLS    = ['pivot', 'pivot_r1', 'pivot_r2', 'pivot_r3', 'pivot_s1', 'pivot_s2', 'pivot_s3'] as const;
const FIB_COLS      = ['fib_23_6', 'fib_38_2', 'fib_50', 'fib_61_8', 'fib_78_6'] as const;

// ─── Oscillator sub-pane definitions ──────────────────────────────────────────
interface OscillatorGroup {
  key: string;
  label: string;
  cols: string[];
  refLines: Array<{ price: number; color: string; label?: string }>;
}

const OSCILLATOR_GROUPS: OscillatorGroup[] = [
  { key: 'rsi_14',      label: 'RSI (14)',      cols: ['rsi_14'],                                   refLines: [{ price: 70, color: 'rgba(239,68,68,0.5)', label: 'OB' }, { price: 30, color: 'rgba(34,197,94,0.5)', label: 'OS' }, { price: 50, color: 'rgba(100,116,139,0.3)' }] },
  { key: 'macd',        label: 'MACD',          cols: ['macd', 'macd_signal', 'macd_histogram'],    refLines: [{ price: 0, color: 'rgba(100,116,139,0.4)' }] },
  { key: 'stochastic',  label: 'Stochastic',    cols: ['stochastic_k', 'stochastic_d'],             refLines: [{ price: 80, color: 'rgba(239,68,68,0.5)', label: 'OB' }, { price: 20, color: 'rgba(34,197,94,0.5)', label: 'OS' }, { price: 50, color: 'rgba(100,116,139,0.3)' }] },
  { key: 'adx',         label: 'ADX / DMI',     cols: ['adx', 'adx_plus_di', 'adx_minus_di'],       refLines: [{ price: 25, color: 'rgba(251,191,36,0.5)', label: 'Trend' }] },
  { key: 'aroon',       label: 'Aroon',         cols: ['aroon_up', 'aroon_down', 'aroon_osc'],      refLines: [{ price: 70, color: 'rgba(239,68,68,0.3)' }, { price: 30, color: 'rgba(34,197,94,0.3)' }, { price: 50, color: 'rgba(100,116,139,0.3)' }] },
  { key: 'elder_ray',   label: 'Elder Ray',     cols: ['elder_ray_bull', 'elder_ray_bear'],         refLines: [{ price: 0, color: 'rgba(100,116,139,0.4)' }] },
  { key: 'cci_20',      label: 'CCI (20)',       cols: ['cci_20'],                                   refLines: [{ price: 100, color: 'rgba(239,68,68,0.5)', label: 'OB' }, { price: -100, color: 'rgba(34,197,94,0.5)', label: 'OS' }, { price: 0, color: 'rgba(100,116,139,0.3)' }] },
  { key: 'williams_r',  label: 'Williams %R',   cols: ['williams_r'],                               refLines: [{ price: -20, color: 'rgba(239,68,68,0.5)', label: 'OB' }, { price: -80, color: 'rgba(34,197,94,0.5)', label: 'OS' }] },
  { key: 'mfi_14',      label: 'MFI (14)',       cols: ['mfi_14'],                                   refLines: [{ price: 80, color: 'rgba(239,68,68,0.5)', label: 'OB' }, { price: 20, color: 'rgba(34,197,94,0.5)', label: 'OS' }, { price: 50, color: 'rgba(100,116,139,0.3)' }] },
  { key: 'roc_12',      label: 'ROC (12)',       cols: ['roc_12'],                                   refLines: [{ price: 0, color: 'rgba(100,116,139,0.4)' }] },
  { key: 'ultimate_osc',label: 'Ultimate Osc',  cols: ['ultimate_osc'],                             refLines: [{ price: 70, color: 'rgba(239,68,68,0.5)', label: 'OB' }, { price: 30, color: 'rgba(34,197,94,0.5)', label: 'OS' }, { price: 50, color: 'rgba(100,116,139,0.3)' }] },
  { key: 'trix_15',     label: 'TRIX (15)',      cols: ['trix_15'],                                  refLines: [{ price: 0, color: 'rgba(100,116,139,0.4)' }] },
  { key: 'obv',         label: 'OBV',            cols: ['obv'],                                      refLines: [] },
  { key: 'cmf_20',      label: 'CMF (20)',       cols: ['cmf_20'],                                   refLines: [{ price: 0, color: 'rgba(100,116,139,0.4)' }] },
  { key: 'force_index', label: 'Force Index',   cols: ['force_index'],                              refLines: [{ price: 0, color: 'rgba(100,116,139,0.4)' }] },
  { key: 'eom_14',      label: 'EOM (14)',       cols: ['eom_14'],                                   refLines: [{ price: 0, color: 'rgba(100,116,139,0.4)' }] },
  { key: 'pvt',         label: 'PVT',            cols: ['pvt'],                                      refLines: [] },
  { key: 'adosc',       label: 'A/D Osc',        cols: ['adosc'],                                    refLines: [{ price: 0, color: 'rgba(100,116,139,0.4)' }] },
  { key: 'atr',         label: 'ATR',            cols: ['atr'],                                      refLines: [] },
  { key: 'hist_vol_20', label: 'Hist Vol (20)',  cols: ['hist_vol_20'],                              refLines: [] },
  { key: 'chaikin_vol', label: 'Chaikin Vol',   cols: ['chaikin_vol'],                              refLines: [{ price: 0, color: 'rgba(100,116,139,0.4)' }] },
  { key: 'zscore_20',   label: 'Z-Score (20)',  cols: ['zscore_20'],                                refLines: [{ price: 2, color: 'rgba(239,68,68,0.5)', label: '+2σ' }, { price: -2, color: 'rgba(34,197,94,0.5)', label: '-2σ' }, { price: 0, color: 'rgba(100,116,139,0.3)' }] },
  { key: 'nvi_pvi',     label: 'NVI / PVI',     cols: ['nvi', 'pvi'],                               refLines: [] },
];

interface PriceChartProps {
  data: PriceData[];
  /** Stock ticker symbol – required to fetch indicator data on demand */
  ticker?: string;
  /** Whether the chart is rendered in fullscreen mode */
  fullscreen?: boolean;
  /** Callback to close fullscreen — renders an X button in the header */
  onClose?: () => void;
}

// Enterprise-only ranges
const ENTERPRISE_RANGES = ["Max"];

export function PriceChart({ data, ticker, fullscreen = false, onClose }: PriceChartProps) {
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
  const [activeOscillatorKey, setActiveOscillatorKey] = React.useState<string | null>(null);

  const toggleIndicator = React.useCallback((col: string) => {
    setActiveIndicators((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  }, []);

  // setActiveIndicators is stable, so these closures are stable too
  const makeGroupToggle = (cols: readonly string[]) => () => {
    setActiveIndicators((prev) =>
      cols.every((k) => prev.includes(k))
        ? prev.filter((k2) => !(cols as readonly string[]).includes(k2))
        : Array.from(new Set([...prev.filter((k2) => !(cols as readonly string[]).includes(k2)), ...cols]))
    );
  };

  const isBBActive       = BB_COLS.every((k)       => activeIndicators.includes(k));
  const isKeltnerActive  = KELTNER_COLS.every((k)  => activeIndicators.includes(k));
  const isDonchianActive = DONCHIAN_COLS.every((k) => activeIndicators.includes(k));
  const isIchiActive     = ICHI_COLS.every((k)     => activeIndicators.includes(k));
  const isPivotActive    = PIVOT_COLS.every((k)    => activeIndicators.includes(k));
  const isFibActive      = FIB_COLS.every((k)      => activeIndicators.includes(k));

  const toggleBB       = makeGroupToggle(BB_COLS);
  const toggleKeltner  = makeGroupToggle(KELTNER_COLS);
  const toggleDonchian = makeGroupToggle(DONCHIAN_COLS);
  const toggleIchi     = makeGroupToggle(ICHI_COLS);
  const togglePivot    = makeGroupToggle(PIVOT_COLS);
  const toggleFib      = makeGroupToggle(FIB_COLS);

  // Cols needed for the active oscillator group
  const activeOscCols = React.useMemo(() => {
    if (!activeOscillatorKey) return [] as string[];
    return OSCILLATOR_GROUPS.find((g) => g.key === activeOscillatorKey)?.cols ?? [];
  }, [activeOscillatorKey]);

  // Stable string dep so the effect doesn't re-run on every render
  const indicatorKey = [...activeIndicators, ...activeOscCols].sort().join(',');

  React.useEffect(() => {
    const allCols = [...activeIndicators, ...activeOscCols];
    if (!ticker || !allCols.length) return;
    const missing = allCols.filter((k) => !indicatorCache[k]);
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

  const overlays: ChartOverlay[] = React.useMemo(() => {
    // Clamp indicator data to the currently visible date range so the chart
    // never auto-zooms out to show the full historical dataset.
    const startTime = filteredData?.length ? new Date(filteredData[0].date).getTime() / 1000 : 0;
    const endTime = filteredData?.length ? new Date(filteredData[filteredData.length - 1].date).getTime() / 1000 : Infinity;
    return activeIndicators
      .filter((k) => !OVERLAY_CONFIGS[k]?.isOscillator && indicatorCache[k])
      .map((k) => ({
        id: k,
        label: OVERLAY_CONFIGS[k].label,
        color: OVERLAY_CONFIGS[k].color,
        lineWidth: OVERLAY_CONFIGS[k].lineWidth,
        lineStyle: OVERLAY_CONFIGS[k].lineStyle,
        data: (indicatorCache[k] ?? [])
          .filter((d) => {
            if (d.value == null || Number.isNaN(d.value)) return false;
            const t = new Date(d.date).getTime() / 1000;
            return t >= startTime && t <= endTime;
          })
          .map((d) => ({ time: (new Date(d.date).getTime() / 1000) as UTCTimestamp, value: d.value as number })),
      }));
  }, [activeIndicators, indicatorCache, filteredData]);

  const oscillatorPaneConfig = React.useMemo((): OscillatorPaneConfig | undefined => {
    if (!activeOscillatorKey) return undefined;
    const group = OSCILLATOR_GROUPS.find((g) => g.key === activeOscillatorKey);
    if (!group) return undefined;

    const startTime = filteredData?.length ? new Date(filteredData[0].date).getTime() / 1000 : 0;
    const endTime   = filteredData?.length ? new Date(filteredData[filteredData.length - 1].date).getTime() / 1000 : Infinity;

    const toPoints = (col: string) =>
      (indicatorCache[col] ?? [])
        .filter((d) => {
          if (d.value == null || Number.isNaN(d.value)) return false;
          const t = new Date(d.date).getTime() / 1000;
          return t >= startTime && t <= endTime;
        })
        .map((d) => ({ time: (new Date(d.date).getTime() / 1000) as UTCTimestamp, value: d.value as number }));

    if (activeOscillatorKey === 'macd') {
      const histogram = (indicatorCache['macd_histogram'] ?? [])
        .filter((d) => {
          if (d.value == null || Number.isNaN(d.value)) return false;
          const t = new Date(d.date).getTime() / 1000;
          return t >= startTime && t <= endTime;
        })
        .map((d) => ({
          time: (new Date(d.date).getTime() / 1000) as UTCTimestamp,
          value: d.value as number,
          color: (d.value as number) >= 0 ? 'rgba(34,197,94,0.65)' : 'rgba(239,68,68,0.65)',
        }));
      return {
        label: 'MACD',
        lines: [
          { data: toPoints('macd'),        color: '#3b82f6', lineWidth: 1 },
          { data: toPoints('macd_signal'), color: '#ef4444', lineWidth: 1 },
        ],
        histogram,
        refLines: group.refLines,
      };
    }

    const lines = group.cols.map((col) => ({
      data: toPoints(col),
      color: OVERLAY_CONFIGS[col]?.color ?? '#94a3b8',
      lineWidth: (OVERLAY_CONFIGS[col]?.lineWidth ?? 1) as 1 | 2,
    }));
    return { label: group.label, lines, refLines: group.refLines };
  }, [activeOscillatorKey, indicatorCache, filteredData]);

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

  const [fsChartHeight] = React.useState(() =>
    typeof window !== "undefined" ? Math.round(Math.max(300, window.innerHeight * 0.97 - 205)) : 600
  );

  const Wrapper = fullscreen ? React.Fragment : Card;
  const wrapperProps = fullscreen ? {} : { className: "w-full border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 transition-colors duration-300" };
  const headerClass = fullscreen
    ? "flex flex-row items-center justify-between space-y-0 pb-2 border-b border-slate-700 transition-colors duration-300 shrink-0"
    : "flex flex-row items-center justify-between space-y-0 pb-2 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300";
  const contentClass = fullscreen ? "pt-1 flex flex-col flex-1 min-h-0 relative" : "p-4 relative";

  return (
    <Wrapper {...(wrapperProps as any)}>
      <div className={headerClass}>
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
                <TooltipContent className="z-[10000]">Area Chart</TooltipContent>
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
                <TooltipContent className="z-[10000]">Candlestick Chart</TooltipContent>
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
                <TooltipContent className="z-[10000]">Risk Chart</TooltipContent>
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
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 shadow-sm"
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

          {/* Settings */}
          <ChartSettingsPopover
            showVolume={showVolume}
            onToggleVolume={() => handleVolumeToggle(!showVolume)}
            priceDisplayMode={priceDisplayMode}
            onSetPriceDisplayMode={setPriceDisplayMode}
            showDetailedTooltip={showDetailedTooltip}
            onSetShowDetailedTooltip={setShowDetailedTooltip}
            view={view === "risk" ? "price" : view}
            onViewChange={(v) => setView(v)}
            areaStyle={areaStyle}
            onSetAreaStyle={setAreaStyle}
            candlestickStyle={candlestickStyle}
            onSetCandlestickStyle={setCandlestickStyle}
            isPro={isPro}
            showRiskZones={showRiskZones}
            onSetShowRiskZones={setShowRiskZones}
            showWhatIfSimulation={showWhatIfSimulation}
            onSetShowWhatIfSimulation={setShowWhatIfSimulation}
            activeIndicators={activeIndicators}
            onToggleIndicator={toggleIndicator}
            indicatorLoading={indicatorLoading}
            isBBActive={isBBActive}
            onToggleBB={toggleBB}
            isKeltnerActive={isKeltnerActive}
            onToggleKeltner={toggleKeltner}
            isDonchianActive={isDonchianActive}
            onToggleDonchian={toggleDonchian}
            isIchiActive={isIchiActive}
            onToggleIchi={toggleIchi}
            isPivotActive={isPivotActive}
            onTogglePivot={togglePivot}
            isFibActive={isFibActive}
            onToggleFib={toggleFib}
            activeOscillatorKey={activeOscillatorKey}
            onSetActiveOscillatorKey={setActiveOscillatorKey}
            oscillatorGroups={OSCILLATOR_GROUPS}
            overlayConfigs={OVERLAY_CONFIGS}
            ticker={ticker}
          />

          {/* Snapshot */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Camera className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 z-[10000]">
              <DropdownMenuLabel>Snapshot Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSnapshot("default")}>
                Save Chart (Default)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSnapshot("light")}>
                Save Chart (Light BG)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSnapshot("dark")}>
                Save Chart (Dark BG)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSnapshot("vibrant")}>
                Save Chart (Vibrant)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSnapshot("mono")}>
                Save Chart (Grayscale)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 text-slate-300 hover:bg-slate-800 ml-1"
              aria-label="Close fullscreen"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className={contentClass}>
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

        <div ref={chartContainerRef} className={cn("w-full", fullscreen ? "flex-1 min-h-0 flex flex-col" : !fullscreen ? "pb-6" : undefined, view === "risk" && !fullscreen ? "h-80" : undefined)}>
          {view === "risk" ? (
            riskMode === "volatility" && (!filteredData || filteredData.length < 25) ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-500 dark:text-slate-400">
                Volatility analysis is not available for very short periods. Try a longer range like 3M or 1Y.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={fullscreen ? 550 : 296}>
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
              oscillatorPane={oscillatorPaneConfig}
              reserveSubPanel={fullscreen}
              colors={{
                lineColor: isDark ? "#3b82f6" : "#2563eb",
                areaTopColor: isDark ? "rgba(59, 130, 246, 0.4)" : "rgba(37, 99, 235, 0.3)",
                areaBottomColor: isDark ? "rgba(59, 130, 246, 0.0)" : "rgba(37, 99, 235, 0.0)",
                upColor: isDark ? "#22c55e" : "#16a34a",
                downColor: isDark ? "#ef4444" : "#dc2626",
                wickUpColor: isDark ? "#22c55e" : "#16a34a",
                wickDownColor: isDark ? "#ef4444" : "#dc2626",
              }}
              height={fullscreen ? 0 : 320}
            />
          )}
        </div>
      </div>
    </Wrapper>
  );
}
