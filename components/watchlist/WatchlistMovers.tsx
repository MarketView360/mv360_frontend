"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { X, Loader2 } from "lucide-react";
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
  adjusted_close: string | number;
}

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
  const [rawData, setRawData] = useState<RawPriceRow[]>([]);
  const [stockNames, setStockNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

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

  const formatDateTick = (dateStr: string) => {
    const d = new Date(dateStr);
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    if (period === "1D") {
      return `${months[d.getMonth()]} ${d.getDate()}`;
    }
    if (period === "1M") {
      return `${months[d.getMonth()]} ${d.getDate()}`;
    }
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  if (items.length === 0) return null;

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Watchlist Movers
        </h3>
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

      {/* Chart */}
      <div className="h-[200px] w-full mb-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 animate-spin text-brand" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-slate-400">
            No price data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
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
            </LineChart>
          </ResponsiveContainer>
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

            return (
              <div
                key={stock.code}
                className="flex items-center gap-3 py-2.5 group"
              >
                {/* Color indicator */}
                <div
                  className="w-1 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: stock.color }}
                />

                {/* Logo + name */}
                <Link
                  href={`/company/${originalTicker}`}
                  className="flex items-center gap-2.5 flex-1 min-w-0"
                >
                  <CompanyLogo
                    ticker={originalTicker}
                    name={stock.name}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
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
                  onClick={() => onRemoveStock(watchlistId, originalTicker)}
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
