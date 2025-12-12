"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  CartesianGrid,
  ComposedChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PriceData {
  date: string;
  price: number;
  volume: number | null;
}

interface PriceChartProps {
  data: PriceData[];
}

export function PriceChart({ data }: PriceChartProps) {
  const [range, setRange] = React.useState("1Y");
  const [showVolume, setShowVolume] = React.useState(true);
  const [logScale, setLogScale] = React.useState(false);
  const [view, setView] = React.useState<"price" | "drawdown">("price");
  const isDark = typeof window !== "undefined" && document.documentElement.classList.contains("dark");

  const enriched = React.useMemo(() => {
    if (!data || data.length === 0) return data;

    let peak = data[0]?.price ?? 0;

    return data.map((point, idx) => {
      const prev = idx > 0 ? data[idx - 1] : null;
      const prevClose = prev?.price ?? point.price;
      const changePct = prevClose ? ((point.price - prevClose) / prevClose) * 100 : 0;

      if (point.price > peak) {
        peak = point.price;
      }
      const drawdown = peak ? ((point.price - peak) / peak) * 100 : 0;

      return {
        ...point,
        changePct,
        drawdown, // negative numbers for drawdown from peak
      };
    });
  }, [data]);

  const filteredData = React.useMemo(() => {
    if (!enriched || enriched.length === 0) return enriched;

    const map: Record<string, number | "max"> = {
      "1M": 21,
      "6M": 126,
      "1Y": 252,
      "3Y": 252 * 3,
      "5Y": 252 * 5,
      Max: "max",
    };

    const windowSize = map[range] ?? "max";
    if (windowSize === "max") return enriched;
    if (enriched.length <= windowSize) return enriched;
    return enriched.slice(-windowSize);
  }, [enriched, range]);

  const formatDateLabel = React.useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);
    
    if (range === "1M") {
      return `${month} ${date.getDate()}`;
    } else if (range === "6M" || range === "1Y") {
      return `${month} '${year}`;
    } else {
      return `${month} '${year}`;
    }
  }, [range]);

  return (
    <Card className="w-full border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 transition-colors duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <CardTitle className="text-base font-medium text-slate-700 dark:text-slate-300 font-heading transition-colors duration-300">
            {view === "price" ? "Price & Volume" : "Drawdown from Peak"}
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
            {["1M", "6M", "1Y", "3Y", "5Y", "Max"].map((r) => (
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
          <div className="flex space-x-1 ml-2 text-xs">
            <button
              onClick={() => setShowVolume((v) => !v)}
              className={cn(
                "px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700",
                showVolume
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              Vol
            </button>
            <button
              onClick={() => setLogScale((v) => !v)}
              className={cn(
                "px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700",
                logScale
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              Log
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={filteredData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0087f6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#0087f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
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
                tickFormatter={formatDateLabel}
                interval="preserveStartEnd"
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis
                yAxisId="price"
                stroke={isDark ? "#94a3b8" : "#64748b"}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  view === "price" ? `$${value}` : `${value.toFixed(0)}%`
                }
                domain={["auto", "auto"]}
                scale={logScale && view === "price" ? "log" : "auto"}
              />
              <YAxis
                yAxisId="volume"
                orientation="right"
                stroke={isDark ? "#64748b" : "#94a3b8"}
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  if (!value || Number.isNaN(value)) return "";
                  const n = Number(value);
                  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
                  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
                  return `${n}`;
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1e293b" : "#fff",
                  borderRadius: "8px",
                  border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`,
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ color: isDark ? "#e2e8f0" : "#0f172a", fontWeight: 600 }}
                labelStyle={{ color: isDark ? "#cbd5e1" : "#64748b", marginBottom: "4px" }}
              />
              <Area
                yAxisId="price"
                type="monotone"
                dataKey={view === "price" ? "price" : "drawdown"}
                stroke={view === "price" ? "#0087f6" : "#f97316"}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
              {showVolume && view === "price" && (
                <Bar
                  yAxisId="volume"
                  dataKey="volume"
                  barSize={16}
                  fill="url(#colorVolume)"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
