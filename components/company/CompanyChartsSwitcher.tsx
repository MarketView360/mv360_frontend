"use client";

import React, { useState, Suspense, useMemo, useEffect } from "react";
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
import { Maximize2, X } from "lucide-react";

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
}

export function CompanyChartsSwitcher({
  priceHistory,
  valuationMetrics,
  valuationHistory,
}: CompanyChartsSwitcherProps) {
  const [mode, setMode] = useState<"price" | "valuations" | "price_pe">(
    "price",
  );
  const [range, setRange] = useState<"1Y" | "3Y" | "5Y" | "Max">("1Y");
  const [normType, setNormType] = useState<"indexed" | "minmax">("indexed");
  const [fullscreen, setFullscreen] = useState(false);

  const hasValuations = valuationMetrics.some((m) => m.value != null);
  const valuationData = valuationMetrics
    .filter((m) => m.value != null)
    .map((m) => ({ label: m.label, value: m.value as number }));

  const hasPeHistory = valuationHistory.some((p) => p.pe_ratio != null);

  const filteredValuationHistory = useMemo(() => {
    if (!valuationHistory || valuationHistory.length === 0) return [];
    const map: Record<typeof range, number | "max"> = {
      "1Y": 252,
      "3Y": 252 * 3,
      "5Y": 252 * 5,
      Max: "max",
    };
    const windowSize = map[range];
    let filtered = valuationHistory;
    if (windowSize !== "max" && valuationHistory.length > windowSize) {
      filtered = valuationHistory.slice(-windowSize);
    }

    const prices = filtered.map(p => p.price).filter((p): p is number => p !== null);
    const pes = filtered.map(p => p.pe_ratio).filter((p): p is number => p !== null);

    if (prices.length === 0 || pes.length === 0) return filtered;

    // Base price/PE for indexing (first non-null point in range)
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

  const isDark =
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const renderChartBody = (heightClass: string) => (
    <>
      {mode === "price" && (
        <div className={cn(heightClass, "w-full")}>
          <Suspense fallback={<div className="h-full w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />}>
            <PriceChart data={priceHistory} />
          </Suspense>
        </div>
      )}
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
                {(["1Y", "3Y", "5Y", "Max"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRange(r)}
                    className={cn(
                      "px-2 py-1 rounded-md border transition-all",
                      range === r
                        ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
                        : "bg-white/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800",
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
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#0f172a" : "#ffffff",
                      borderRadius: 8,
                      border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`,
                    }}
                    formatter={(value: any, name: string, props: any) => {
                      const item = props.payload;
                      if (name === "price_normalized" && item?.price != null) {
                        return [`$${item.price.toFixed(2)}`, "Price"];
                      }
                      if (name === "pe_normalized" && item?.pe_ratio != null) {
                        return [`${item.pe_ratio.toFixed(2)}x`, "P/E"];
                      }
                      return [value, name];
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base font-medium text-slate-800 dark:text-slate-100 font-heading">
            {mode === "price"
              ? "Price & Volume"
              : mode === "valuations"
                ? "Valuations (snapshot)"
                : "Price & P/E over time"}
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
                onClick={() => setMode("price")}
              >
                Price
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-6 px-3 rounded-full text-[11px]",
                  mode === "price_pe"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-500 dark:text-slate-400"
                )}
                onClick={() => setMode("price_pe")}
              >
                Price & P/E
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-6 px-3 rounded-full text-[11px]",
                  mode === "valuations"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-500 dark:text-slate-400"
                )}
                onClick={() => setMode("valuations")}
                disabled={!hasValuations}
              >
                Valuation
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
      {fullscreen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-6xl mx-4 bg-slate-950 text-slate-50 rounded-xl shadow-2xl border border-slate-800 relative p-4">
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 text-slate-300 hover:bg-slate-800"
              aria-label="Close full screen chart"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="mb-3 flex items-center justify-between pr-8">
              <div className="text-sm font-semibold">
                {mode === "price"
                  ? "Price & Volume (Full screen)"
                  : mode === "valuations"
                    ? "Valuations snapshot (Full screen)"
                    : "Price & P/E over time (Full screen)"}
              </div>
            </div>
            {renderChartBody("h-[70vh]")}
          </div>
        </div>
      )}
    </>
  );
}
