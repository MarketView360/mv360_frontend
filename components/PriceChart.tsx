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
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
}

interface PriceChartProps {
  data: PriceData[];
}

export function PriceChart({ data }: PriceChartProps) {
  const [range, setRange] = React.useState("1Y");
  const [showVolume, setShowVolume] = React.useState(true);
  const [logScale, setLogScale] = React.useState(false);
  const [view, setView] = React.useState<"price" | "drawdown" | "candlestick">("price");
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
                {/* Simplified defs - could be removed if no longer used by Area/Bar */}
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
                tick={{ className: "font-mono" }}
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
                tick={{ className: "font-mono" }}
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
                      {view === "candlestick" ? (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          <div className="flex justify-between gap-2">
                            <span className="text-slate-500">O:</span>
                            <span className="font-mono font-semibold">${data.open?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span className="text-slate-500">H:</span>
                            <span className="font-mono font-semibold text-green-500">${data.high?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span className="text-slate-500">L:</span>
                            <span className="font-mono font-semibold text-red-500">${data.low?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span className="text-slate-500">C:</span>
                            <span className="font-mono font-semibold">${data.close?.toFixed(2)}</span>
                          </div>
                          {data.volume && (
                            <div className="col-span-2 flex justify-between gap-2 mt-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                              <span className="text-slate-500">Vol:</span>
                              <span className="font-mono">{(data.volume / 1000000).toFixed(2)}M</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-slate-500">{view === "price" ? "Price" : "Drawdown"}</span>
                            <span className="font-mono font-bold">
                              {view === "price" ? `$${data.price?.toFixed(2)}` : `${data.drawdown?.toFixed(2)}%`}
                            </span>
                          </div>
                          {data.volume && (
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-xs text-slate-500">Volume</span>
                              <span className="font-mono">{(data.volume / 1000000).toFixed(2)}M</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              {view === "candlestick" ? (
                <Bar
                  yAxisId="price"
                  dataKey="close"
                  shape={(props: any) => {
                    const { x, y, width, payload } = props;
                    const { open, close, high, low } = payload;
                    if (open === null || close === null || high === null || low === null) return <path />;

                    const isUp = close >= open;
                    const stroke = isUp ? (isDark ? "#22c55e" : "#16a34a") : (isDark ? "#ef4444" : "#dc2626");
                    const fill = isUp ? (isDark ? "#22c55e" : "#16a34a") : (isDark ? "#ef4444" : "#dc2626");

                    // Handle flat candle (open === close)
                    const bodyHeight = Math.abs(props.height);
                    const safeHeight = Math.max(bodyHeight, 1);
                    const ratio = bodyHeight > 0 ? bodyHeight / Math.abs(close - open) : 1;

                    // For flat candles, we use a default ratio or handle separately
                    // Since we also need high/low wicks, we need internal scale access to be perfect
                    // But with standard bar height, we can approximate
                    const hlRatio = bodyHeight > 0 ? ratio : (safeHeight / 0.1); // Fallback for very flat candles

                    const highY = y - (high - Math.max(open, close)) * hlRatio;
                    const lowY = y + safeHeight + (Math.min(open, close) - low) * hlRatio;

                    return (
                      <g key={`candle-${payload.date}`}>
                        <line x1={x + width / 2} y1={highY} x2={x + width / 2} y2={lowY} stroke={stroke} strokeWidth={1} />
                        <rect x={x} y={y} width={width} height={safeHeight} fill={fill} stroke={stroke} />
                      </g>
                    );
                  }}
                />
              ) : (
                <Area
                  yAxisId="price"
                  type="monotone"
                  dataKey={view === "price" ? "price" : "drawdown"}
                  stroke={view === "price" ? "#0087f6" : "#f97316"}
                  strokeWidth={2}
                  fillOpacity={0.05}
                  fill={view === "price" ? "#0087f6" : "#f97316"}
                />
              )}
              {showVolume && view !== "drawdown" && (
                <Bar
                  yAxisId="volume"
                  dataKey="volume"
                  barSize={range === "1M" ? 16 : 4}
                  fill="#94a3b8"
                  fillOpacity={0.2}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
