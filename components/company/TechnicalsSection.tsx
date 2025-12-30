"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";
import { cn } from "@/lib/utils";

interface TechnicalData {
  date: string;
  sma_20: number | null;
  sma_50: number | null;
  sma_200: number | null;
  ema_12: number | null;
  ema_26: number | null;
  rsi_14: number | null;
  macd: number | null;
  macd_signal: number | null;
  macd_histogram: number | null;
  stoch_k: number | null;
  stoch_d: number | null;
  bb_upper: number | null;
  bb_middle: number | null;
  bb_lower: number | null;
  atr_14: number | null;
  adx: number | null;
  volatility: number | null;
}

interface TechnicalsSectionProps {
  ticker: string;
  currentPrice?: number | null;
}

const getRsiSignal = (rsi: number | null): { label: string; color: string } => {
  if (rsi === null) return { label: "N/A", color: "slate" };
  if (rsi >= 70) return { label: "Overbought", color: "red" };
  if (rsi <= 30) return { label: "Oversold", color: "green" };
  return { label: "Neutral", color: "slate" };
};

const getMacdSignal = (macd: number | null, signal: number | null): { label: string; color: string } => {
  if (macd === null || signal === null) return { label: "N/A", color: "slate" };
  if (macd > signal && macd > 0) return { label: "Bullish", color: "green" };
  if (macd < signal && macd < 0) return { label: "Bearish", color: "red" };
  if (macd > signal) return { label: "Turning Bullish", color: "yellow" };
  return { label: "Turning Bearish", color: "orange" };
};

const getTrendSignal = (price: number | null, sma50: number | null, sma200: number | null): { label: string; color: string } => {
  if (price === null || sma50 === null || sma200 === null) return { label: "N/A", color: "slate" };
  if (price > sma50 && sma50 > sma200) return { label: "Strong Uptrend", color: "green" };
  if (price < sma50 && sma50 < sma200) return { label: "Strong Downtrend", color: "red" };
  if (price > sma200) return { label: "Above 200 SMA", color: "green" };
  return { label: "Below 200 SMA", color: "red" };
};

export function TechnicalsSection({ ticker, currentPrice }: TechnicalsSectionProps) {
  const [technicals, setTechnicals] = useState<TechnicalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<"1M" | "3M" | "6M" | "1Y">("3M");

  useEffect(() => {
    const fetchTechnicals = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
        const res = await fetch(
          `${baseUrl}/api/company/${encodeURIComponent(ticker)}/technicals`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch technicals");
        }
        const data = await res.json();
        setTechnicals(data.technicals || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicals();
  }, [ticker]);

  const filteredData = useMemo(() => {
    if (!technicals.length) return [];

    const rangeMap: Record<string, number> = {
      "1M": 21,
      "3M": 63,
      "6M": 126,
      "1Y": 252,
    };

    const limit = rangeMap[range];
    // Data comes sorted desc, we need asc for charts
    const sorted = [...technicals].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return sorted.slice(-limit);
  }, [technicals, range]);

  const latestData = technicals[0]; // Most recent (desc order)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Technical Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || technicals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Technical Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {error || "No technical data available. Run the technicals sync to populate data."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const rsiSignal = getRsiSignal(latestData?.rsi_14);
  const macdSignal = getMacdSignal(latestData?.macd, latestData?.macd_signal);
  const trendSignal = getTrendSignal(currentPrice ?? null, latestData?.sma_50, latestData?.sma_200);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Technical Indicators</CardTitle>
          <div className="flex gap-1">
            {(["1M", "3M", "6M", "1Y"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "px-3 py-1 text-xs rounded-md transition-colors",
                  range === r
                    ? "bg-brand text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Signal Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SignalCard
            label="RSI (14)"
            value={latestData?.rsi_14?.toFixed(1) ?? "—"}
            signal={rsiSignal.label}
            signalColor={rsiSignal.color}
          />
          <SignalCard
            label="MACD"
            value={latestData?.macd?.toFixed(2) ?? "—"}
            signal={macdSignal.label}
            signalColor={macdSignal.color}
          />
          <SignalCard
            label="Trend"
            value={`SMA50: ${latestData?.sma_50?.toFixed(2) ?? "—"}`}
            signal={trendSignal.label}
            signalColor={trendSignal.color}
          />
          <SignalCard
            label="Volatility"
            value={latestData?.volatility ? `${latestData.volatility.toFixed(1)}%` : "—"}
            signal={latestData?.volatility && latestData.volatility > 30 ? "High" : "Normal"}
            signalColor={latestData?.volatility && latestData.volatility > 30 ? "orange" : "slate"}
          />
        </div>

        {/* RSI Chart */}
        <div>
          <h4 className="text-sm font-medium mb-2">RSI (14)</h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelFormatter={(d) => new Date(d).toLocaleDateString()}
                  formatter={(value: number) => [value?.toFixed(2), "RSI"]}
                />
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" />
                <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="rsi_14"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MACD Chart */}
        <div>
          <h4 className="text-sm font-medium mb-2">MACD</h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelFormatter={(d) => new Date(d).toLocaleDateString()}
                />
                <ReferenceLine y={0} stroke="#94a3b8" />
                <Area
                  type="monotone"
                  dataKey="macd_histogram"
                  fill="#94a3b8"
                  stroke="none"
                  fillOpacity={0.3}
                  name="Histogram"
                />
                <Line
                  type="monotone"
                  dataKey="macd"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="MACD"
                />
                <Line
                  type="monotone"
                  dataKey="macd_signal"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  name="Signal"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bollinger Bands Chart */}
        <div>
          <h4 className="text-sm font-medium mb-2">Bollinger Bands</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                />
                <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelFormatter={(d) => new Date(d).toLocaleDateString()}
                  formatter={(value: number) => [`$${value?.toFixed(2)}`, ""]}
                />
                <Area
                  type="monotone"
                  dataKey="bb_upper"
                  stroke="#94a3b8"
                  fill="#94a3b8"
                  fillOpacity={0.1}
                  strokeWidth={1}
                  name="Upper Band"
                />
                <Area
                  type="monotone"
                  dataKey="bb_lower"
                  stroke="#94a3b8"
                  fill="#ffffff"
                  fillOpacity={1}
                  strokeWidth={1}
                  name="Lower Band"
                />
                <Line
                  type="monotone"
                  dataKey="bb_middle"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="SMA 20"
                />
                <Line
                  type="monotone"
                  dataKey="sma_50"
                  stroke="#f59e0b"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  name="SMA 50"
                />
                <Line
                  type="monotone"
                  dataKey="sma_200"
                  stroke="#ef4444"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  name="SMA 200"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Current Values Table */}
        <div>
          <h4 className="text-sm font-medium mb-2">Current Values</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <ValueItem label="SMA 20" value={latestData?.sma_20} prefix="$" />
            <ValueItem label="SMA 50" value={latestData?.sma_50} prefix="$" />
            <ValueItem label="SMA 200" value={latestData?.sma_200} prefix="$" />
            <ValueItem label="EMA 12" value={latestData?.ema_12} prefix="$" />
            <ValueItem label="RSI (14)" value={latestData?.rsi_14} />
            <ValueItem label="ATR (14)" value={latestData?.atr_14} prefix="$" />
            <ValueItem label="ADX" value={latestData?.adx} />
            <ValueItem label="Stoch %K" value={latestData?.stoch_k} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SignalCard({
  label,
  value,
  signal,
  signalColor,
}: {
  label: string;
  value: string;
  signal: string;
  signalColor: string;
}) {
  const colorMap: Record<string, string> = {
    green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    orange: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    slate: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  };

  return (
    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</div>
      <div className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{value}</div>
      <Badge className={cn("text-xs", colorMap[signalColor] || colorMap.slate)}>
        {signal}
      </Badge>
    </div>
  );
}

function ValueItem({
  label,
  value,
  prefix = "",
}: {
  label: string;
  value: number | null | undefined;
  prefix?: string;
}) {
  return (
    <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-medium text-slate-900 dark:text-white">
        {value != null ? `${prefix}${value.toFixed(2)}` : "—"}
      </div>
    </div>
  );
}

export default TechnicalsSection;
