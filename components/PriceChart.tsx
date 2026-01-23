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
import { cn } from "@/lib/utils";
import { TradingViewChart, ChartDataPoint } from "./TradingViewChart";

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

interface PriceChartProps {
  data: PriceData[];
}

export function PriceChart({ data }: PriceChartProps) {
  const [range, setRange] = React.useState("1Y");
  const [view, setView] = React.useState<"price" | "drawdown" | "candlestick">("price");
  const isDark = typeof window !== "undefined" && document.documentElement.classList.contains("dark");

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

    const map: Record<string, number | "max"> = {
      "1M": 21,
      "6M": 126,
      "1Y": 252,
      "3Y": 252 * 3,
      "5Y": 252 * 5,
      "10Y": 252 * 10,
      Max: "max",
    };

    const windowSize = map[range] ?? "max";
    if (windowSize === "max") return enriched;
    if (enriched.length <= windowSize) return enriched;
    return enriched.slice(-windowSize);
  }, [enriched, range]);

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

  // Recharts Drawdown Data
  const drawdownData = React.useMemo(() => {
    if (view !== "drawdown" || !filteredData) return [];
    return filteredData.map((d) => ({
      date: d.date,
      drawdown: d.drawdown,
    }));
  }, [filteredData, view]);

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

  return (
    <Card className="w-full border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 transition-colors duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <CardTitle className="text-base font-medium text-slate-700 dark:text-slate-300 font-heading transition-colors duration-300">
            {view === "price" ? "Price & Volume" : view === "candlestick" ? "Candlestick" : "Drawdown from Peak"}
          </CardTitle>
          <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 rounded-md p-0.5 text-xs">
            <button
              onClick={() => setView("price")}
              className={cn(
                "px-2 py-0.5 rounded-md",
                view === "price"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              Price
            </button>
            <button
              onClick={() => setView("candlestick")}
              className={cn(
                "px-2 py-0.5 rounded-md",
                view === "candlestick"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              Candle
            </button>
            <button
              onClick={() => setView("drawdown")}
              className={cn(
                "px-2 py-0.5 rounded-md",
                view === "drawdown"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              Drawdown
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex space-x-1">
            {["1M", "6M", "1Y", "3Y", "5Y", "10Y", "Max"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "px-2 py-1 text-xs font-medium rounded-md transition-colors",
                  range === r
                    ? "bg-brand text-white"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-[320px] w-full">
          {view === "drawdown" ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={drawdownData}>
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
                  height={50}
                />
                <YAxis
                  stroke={isDark ? "#94a3b8" : "#64748b"}
                  fontSize={12}
                  tick={{ className: "font-mono" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value.toFixed(0)}%`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
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
                            <span className="text-xs text-slate-500">Drawdown</span>
                            <span className="font-mono font-bold text-orange-500">
                              {data.drawdown?.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="drawdown"
                  stroke="#f97316"
                  strokeWidth={2}
                  fillOpacity={0.05}
                  fill="#f97316"
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <TradingViewChart
              data={tvData}
              chartType={view === "candlestick" ? "candlestick" : "area"}
              colors={{
                lineColor: "#0087f6",
                areaTopColor: "#0087f6",
                areaBottomColor: "rgba(0, 135, 246, 0.0)",
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
