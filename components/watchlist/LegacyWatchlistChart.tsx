"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import {
  createChart,
  ColorType,
  IChartApi,
  UTCTimestamp,
  CrosshairMode,
  CandlestickSeries,
  HistogramSeries,
} from "lightweight-charts";
import { X, Loader2, BarChart3, LineChart as LineChartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { createClient } from "@/lib/supabase/client";
import type { WatchlistItem } from "@/hooks/useWatchlist";
import Link from "next/link";

function cleanTicker(ticker: string): string {
  return ticker.replace(/\.US$/i, "").toUpperCase();
}

// Distinct colors for up to 10 stocks
const LINE_COLORS = [
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#ef4444", // red
  "#ec4899", // pink
  "#3b82f6", // blue
  "#f97316", // orange
  "#14b8a6", // teal
  "#a855f7", // purple
];

type Period = "1D" | "1M" | "6M" | "YTD" | "1Y" | "5Y";

const PERIODS: { key: Period; label: string }[] = [
  { key: "1D", label: "1D" },
  { key: "1M", label: "1M" },
  { key: "6M", label: "6M" },
  { key: "YTD", label: "YTD" },
  { key: "1Y", label: "1Y" },
  { key: "5Y", label: "5Y" },
];

function getStartDate(period: Period): string {
  const now = new Date();
  switch (period) {
    case "1D": {
      const d = new Date(now);
      d.setDate(d.getDate() - 5); // fetch 5 days to ensure we get at least 2 trading days
      return d.toISOString().slice(0, 10);
    }
    case "1M": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      return d.toISOString().slice(0, 10);
    }
    case "6M": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 6);
      return d.toISOString().slice(0, 10);
    }
    case "YTD": {
      return `${now.getFullYear()}-01-01`;
    }
    case "1Y": {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      return d.toISOString().slice(0, 10);
    }
    case "5Y": {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 5);
      return d.toISOString().slice(0, 10);
    }
  }
}

interface RawPriceRow {
  code: string;
  date: string;
  open: string | number;
  high: string | number;
  low: string | number;
  close: string | number;
  adjusted_close: string | number;
  volume: string | number;
}

type ChartMode = "line" | "candlestick";

interface StockSummary {
  code: string;
  name: string;
  latestPrice: number;
  dollarChange: number;
  percentChange: number;
  color: string;
}

interface WatchlistMoversProps {
  items: WatchlistItem[];
  onRemoveStock: (watchlistId: string, ticker: string) => void;
  watchlistId: string;
}

export function WatchlistMovers({
  items,
  onRemoveStock,
  watchlistId,
}: WatchlistMoversProps) {
  const [period, setPeriod] = useState<Period>("YTD");
  const [chartMode, setChartMode] = useState<ChartMode>("line");
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [rawData, setRawData] = useState<RawPriceRow[]>([]);
  const [stockNames, setStockNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());
  const candlestickContainerRef = useRef<HTMLDivElement>(null);
  const candlestickChartRef = useRef<IChartApi | null>(null);

  const tickers = useMemo(
    () => items.map((i) => i.ticker.toUpperCase()).sort(),
    [items]
  );
  const tickerKey = tickers.join(",");

  // Fetch stock names once when tickers change
  useEffect(() => {
    if (!tickerKey) {
      setStockNames(new Map());
      return;
    }
    let cancelled = false;
    const codes = tickerKey.split(",");

    (async () => {
      try {
        const { data, error } = await supabaseRef.current.rpc(
          "get_watchlist_price_data",
          { ticker_codes: codes }
        );
        if (cancelled || error) return;
        const names = new Map<string, string>();
        for (const row of data || []) {
          if (row.code && row.name) names.set(row.code.toUpperCase(), row.name);
        }
        setStockNames(names);
      } catch {
        // ignore
      }
    })();

    return () => { cancelled = true; };
  }, [tickerKey]);

  // Fetch historical prices when tickers or period change
  useEffect(() => {
    if (!tickerKey) {
      setRawData([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const codes = tickerKey.split(",");
    const startDate = getStartDate(period);

    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabaseRef.current.rpc(
          "get_watchlist_historical_prices",
          { ticker_codes: codes, start_date: startDate, max_points_per_stock: 250 }
        );

        if (cancelled) return;
        if (error) {
          console.error("Error fetching historical prices:", error);
        } else {
          setRawData((data as RawPriceRow[]) || []);
        }
      } catch (err) {
        if (!cancelled) console.error("Error fetching historical prices:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tickerKey, period]);

  // Build unique stock codes from data
  const stockCodes = useMemo(() => {
    const codes = new Set<string>();
    for (const row of rawData) {
      codes.add(row.code);
    }
    return Array.from(codes).sort();
  }, [rawData]);

  // Assign colors
  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    stockCodes.forEach((code, i) => {
      map.set(code, LINE_COLORS[i % LINE_COLORS.length]);
    });
    return map;
  }, [stockCodes]);

  // Build normalized chart data: each date row has { date, [CODE]: percentChange }
  const { chartData, stockSummaries } = useMemo(() => {
    if (rawData.length === 0)
      return { chartData: [], stockSummaries: [] as StockSummary[] };

    // Group by code and build date->price maps for O(1) lookup
    const byCode = new Map<string, { date: string; price: number }[]>();
    const dateMaps = new Map<string, Map<string, number>>(); // code -> (date -> price)
    for (const row of rawData) {
      const price = Number(row.adjusted_close);
      if (isNaN(price)) continue;
      if (!byCode.has(row.code)) {
        byCode.set(row.code, []);
        dateMaps.set(row.code, new Map());
      }
      byCode.get(row.code)!.push({ date: row.date, price });
      dateMaps.get(row.code)!.set(row.date, price);
    }

    // Get base price (first data point) for each code
    const basePrices = new Map<string, number>();
    Array.from(byCode.entries()).forEach(([code, points]) => {
      if (points.length > 0) {
        basePrices.set(code, points[0].price);
      }
    });

    // For 1D period, only use the last 2 trading days
    if (period === "1D") {
      Array.from(byCode.entries()).forEach(([code, points]) => {
        if (points.length > 2) {
          const lastTwo = points.slice(-2);
          byCode.set(code, lastTwo);
          basePrices.set(code, lastTwo[0].price);
          const newDateMap = new Map<string, number>();
          lastTwo.forEach((p) => newDateMap.set(p.date, p.price));
          dateMaps.set(code, newDateMap);
        }
      });
    }

    // Collect all unique dates (server already downsampled if needed)
    const allDates = new Set<string>();
    Array.from(byCode.values()).forEach((points) => {
      points.forEach((p: { date: string; price: number }) => allDates.add(p.date));
    });
    const sortedDates = Array.from(allDates).sort();

    // Build chart rows using O(1) Map lookups
    const codes = Array.from(byCode.keys());
    const chartData = sortedDates.map((date) => {
      const row: Record<string, string | number> = { date };
      codes.forEach((code) => {
        const priceMap = dateMaps.get(code);
        const price = priceMap?.get(date);
        const base = basePrices.get(code);
        if (price !== undefined && base) {
          row[code] = ((price - base) / base) * 100;
        }
      });
      return row;
    });

    // Build summaries (use full data, not downsampled)
    const summaries: StockSummary[] = [];
    Array.from(byCode.entries()).forEach(([code, points]) => {
      if (points.length < 1) return;
      const base = basePrices.get(code) ?? points[0].price;
      const latest = points[points.length - 1].price;
      const dollarChange = latest - base;
      const percentChange = base ? ((latest - base) / base) * 100 : 0;

      summaries.push({
        code,
        name: stockNames.get(code) || code,
        latestPrice: latest,
        dollarChange,
        percentChange,
        color: colorMap.get(code) || LINE_COLORS[0],
      });
    });

    // Sort by percent change descending
    summaries.sort((a, b) => b.percentChange - a.percentChange);

    return { chartData, stockSummaries: summaries };
  }, [rawData, period, stockNames, colorMap]);

  // Build OHLCV data for candlestick chart (grouped by code)
  const candlestickDataByCode = useMemo(() => {
    const map = new Map<string, { time: number; open: number; high: number; low: number; close: number; volume: number }[]>();
    for (const row of rawData) {
      const o = Number(row.open);
      const h = Number(row.high);
      const l = Number(row.low);
      const c = Number(row.close);
      const v = Number(row.volume);
      if (isNaN(o) || isNaN(h) || isNaN(l) || isNaN(c)) continue;
      if (!map.has(row.code)) map.set(row.code, []);
      const time = Math.floor(new Date(row.date).getTime() / 1000);
      map.get(row.code)!.push({ time, open: o, high: h, low: l, close: c, volume: isNaN(v) ? 0 : v });
    }
    // Sort each by time
    Array.from(map.values()).forEach((arr) => arr.sort((a, b) => a.time - b.time));
    return map;
  }, [rawData]);

  // Auto-select first stock when switching to candlestick mode
  useEffect(() => {
    if (chartMode === "candlestick" && !selectedStock && stockCodes.length > 0) {
      setSelectedStock(stockCodes[0]);
    }
  }, [chartMode, selectedStock, stockCodes]);

  // Detect dark mode
  const isDark = typeof window !== "undefined" && document.documentElement.classList.contains("dark");

  // Render candlestick chart with lightweight-charts
  useEffect(() => {
    if (chartMode !== "candlestick" || !selectedStock || loading) return;
    if (!candlestickContainerRef.current) return;

    const ohlcData = candlestickDataByCode.get(selectedStock);
    if (!ohlcData || ohlcData.length === 0) return;

    // Clean up previous chart
    if (candlestickChartRef.current) {
      candlestickChartRef.current.remove();
      candlestickChartRef.current = null;
    }

    const container = candlestickContainerRef.current;
    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: isDark ? "#94a3b8" : "#64748b",
      },
      width: container.clientWidth,
      height: 200,
      grid: {
        vertLines: { color: isDark ? "#1e293b" : "#f1f5f9" },
        horzLines: { color: isDark ? "#1e293b" : "#f1f5f9" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: {
        borderColor: isDark ? "#334155" : "#e2e8f0",
      },
      timeScale: {
        borderColor: isDark ? "#334155" : "#e2e8f0",
        fixLeftEdge: true,
        fixRightEdge: true,
      },
    });

    candlestickChartRef.current = chart;

    // Deduplicate by time
    const uniqueData = Array.from(new Map(ohlcData.map((d) => [d.time, d])).values())
      .sort((a, b) => a.time - b.time);

    // Candlestick series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });
    candleSeries.setData(
      uniqueData.map((d) => ({
        time: d.time as UTCTimestamp,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))
    );

    // Volume series
    if (uniqueData.some((d) => d.volume > 0)) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "",
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });
      const volUp = isDark ? "rgba(59, 130, 246, 0.4)" : "rgba(37, 99, 235, 0.4)";
      const volDown = isDark ? "rgba(168, 85, 247, 0.4)" : "rgba(147, 51, 234, 0.4)";
      volumeSeries.setData(
        uniqueData.map((d) => ({
          time: d.time as UTCTimestamp,
          value: d.volume,
          color: d.close >= d.open ? volUp : volDown,
        }))
      );
    }

    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (candlestickContainerRef.current) {
        chart.applyOptions({ width: candlestickContainerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      candlestickChartRef.current = null;
    };
  }, [chartMode, selectedStock, candlestickDataByCode, loading, isDark]);

  const formatDateTick = (dateStr: string) => {
    const d = new Date(dateStr);
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  if (items.length === 0) return null;

  return (
    <div className="px-4 py-4">
      {/* Header: title + chart mode toggle + period pills */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Watchlist Movers
          </h3>
          {/* Chart mode toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-md p-0.5">
            <button
              onClick={() => setChartMode("line")}
              className={`p-1 rounded transition-colors ${
                chartMode === "line"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
              title="Comparison line chart"
            >
              <LineChartIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartMode("candlestick")}
              className={`p-1 rounded transition-colors ${
                chartMode === "candlestick"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
              title="Candlestick chart"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Stock selector for candlestick mode */}
          {chartMode === "candlestick" && stockCodes.length > 1 && (
            <select
              value={selectedStock || ""}
              onChange={(e) => setSelectedStock(e.target.value)}
              className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-0 rounded-md px-2 py-1 focus:ring-1 focus:ring-brand outline-none"
            >
              {stockCodes.map((code) => (
                <option key={code} value={code}>
                  {stockNames.get(code) || code}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                period === p.key
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div className="h-[200px] w-full mb-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 animate-spin text-brand" />
          </div>
        ) : chartMode === "line" ? (
          /* Multi-line comparison chart */
          chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-slate-400">
              No price data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={chartData}>
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDateTick}
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={40}
                />
                <YAxis
                  tickFormatter={(v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`}
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                  tickLine={false}
                  axisLine={false}
                  width={55}
                />
                <ReferenceLine y={0} stroke="#64748b" strokeDasharray="4 4" strokeOpacity={0.5} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(51, 65, 85, 0.5)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#f8fafc",
                  }}
                  labelFormatter={(label: string) => {
                    const d = new Date(label);
                    return d.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  formatter={(value: number, name: string) => [
                    `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`,
                    name,
                  ]}
                />
                {stockCodes.map((code) => (
                  <Line
                    key={code}
                    type="monotone"
                    dataKey={code}
                    stroke={colorMap.get(code)}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                ))}
              </RechartsLineChart>
            </ResponsiveContainer>
          )
        ) : (
          /* Candlestick chart */
          <div ref={candlestickContainerRef} className="w-full h-full" />
        )}
      </div>

      {/* Stock summary list */}
      {!loading && stockSummaries.length > 0 && (
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {stockSummaries.map((stock) => {
            const item = items.find(
              (i) => cleanTicker(i.ticker) === stock.code
            );
            const originalTicker = item?.ticker || stock.code;
            const isPositive = stock.percentChange >= 0;
            const isSelected = chartMode === "candlestick" && selectedStock === stock.code;

            return (
              <div
                key={stock.code}
                className={`flex items-center gap-3 py-2.5 group transition-colors ${
                  isSelected
                    ? "bg-slate-50 dark:bg-slate-800/50"
                    : ""
                } ${chartMode === "candlestick" ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30" : ""}`}
                onClick={chartMode === "candlestick" ? () => setSelectedStock(stock.code) : undefined}
              >
                {/* Color indicator */}
                <div
                  className={`w-1 h-8 rounded-full flex-shrink-0 transition-opacity ${
                    chartMode === "candlestick" && !isSelected ? "opacity-30" : ""
                  }`}
                  style={{ backgroundColor: stock.color }}
                />

                {/* Logo + name */}
                <Link
                  href={`/company/${originalTicker}`}
                  className="flex items-center gap-2.5 flex-1 min-w-0"
                  onClick={(e) => {
                    if (chartMode === "candlestick") {
                      e.preventDefault();
                      setSelectedStock(stock.code);
                    }
                  }}
                >
                  <CompanyLogo
                    ticker={originalTicker}
                    name={stock.name}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className={`font-semibold text-sm truncate ${
                      isSelected
                        ? "text-brand"
                        : "text-slate-900 dark:text-white"
                    }`}>
                      {stock.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {cleanTicker(originalTicker)}
                    </p>
                  </div>
                </Link>

                {/* Price */}
                <div className="text-right mr-2">
                  <p className="font-mono font-semibold text-sm text-slate-900 dark:text-white tabular-nums">
                    ${stock.latestPrice.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p
                    className={`font-mono text-xs tabular-nums ${
                      isPositive
                        ? "text-emerald-500"
                        : "text-red-500"
                    }`}
                  >
                    {isPositive ? "+" : ""}$
                    {stock.dollarChange.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                {/* Percent badge */}
                <div
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold font-mono tabular-nums ${
                    isPositive
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {isPositive ? "↗" : "↘"}{" "}
                  {Math.abs(stock.percentChange).toFixed(2)}%
                </div>

                {/* Remove button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveStock(watchlistId, originalTicker);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
