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
import {
  X,
  Loader2,
  BarChart3,
  LineChart as LineChartIcon,
  Plus,
  Search,
  GitCompareArrows,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { cleanTicker, LINE_COLORS } from "@/lib/watchlist-utils";
import { useTheme } from "@/app/providers";

type Period = "1D" | "1M" | "6M" | "YTD" | "1Y" | "5Y";
type ChartMode = "line" | "candlestick";

const PERIODS: { key: Period; label: string }[] = [
  { key: "1M", label: "1M" },
  { key: "6M", label: "6M" },
  { key: "YTD", label: "YTD" },
  { key: "1Y", label: "1Y" },
  { key: "5Y", label: "5Y" },
];

function getStartDate(period: Period): string {
  const now = new Date();
  switch (period) {
    case "1D": { const d = new Date(now); d.setDate(d.getDate() - 5); return d.toISOString().slice(0, 10); }
    case "1M": { const d = new Date(now); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); }
    case "6M": { const d = new Date(now); d.setMonth(d.getMonth() - 6); return d.toISOString().slice(0, 10); }
    case "YTD": return `${now.getFullYear()}-01-01`;
    case "1Y": { const d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d.toISOString().slice(0, 10); }
    case "5Y": { const d = new Date(now); d.setFullYear(d.getFullYear() - 5); return d.toISOString().slice(0, 10); }
  }
}

interface RawPriceRow {
  code: string; date: string;
  open: string | number; high: string | number; low: string | number;
  close: string | number; adjusted_close: string | number; volume: string | number;
}

interface StockSummary {
  code: string; name: string; latestPrice: number;
  dollarChange: number; percentChange: number; color: string;
}

interface SearchResult { code: string; name: string; }

interface StockCompareProps {
  tickers: string[];
  onAddTicker: (ticker: string) => void;
  onRemoveTicker: (ticker: string) => void;
  onClear: () => void;
}

export function StockCompare({ tickers, onAddTicker, onRemoveTicker, onClear }: StockCompareProps) {
  const [period, setPeriod] = useState<Period>("YTD");
  const [chartMode, setChartMode] = useState<ChartMode>("line");
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [rawData, setRawData] = useState<RawPriceRow[]>([]);
  const [stockNames, setStockNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(false);
  const supabaseRef = useRef(createClient());
  const candlestickContainerRef = useRef<HTMLDivElement>(null);
  const candlestickChartRef = useRef<IChartApi | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const cleanedTickers = useMemo(() => tickers.map((t) => cleanTicker(t)).sort(), [tickers]);
  const tickerKey = cleanedTickers.join(",");

  // Close search on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearch(false); setSearchQuery(""); setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Search stocks
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 1) { setSearchResults([]); return; }
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const sanitized = searchQuery.replace(/[%_\\]/g, "");
        const { data, error } = await supabaseRef.current
          .from("companies").select("code, name")
          .or(`code.ilike.%${sanitized}%,name.ilike.%${sanitized}%`)
          .limit(8);
        if (!error && data) {
          setSearchResults(data.filter((r: SearchResult) => !cleanedTickers.includes(r.code.toUpperCase())).slice(0, 6));
        }
      } catch { /* ignore */ } finally { setSearchLoading(false); }
    }, 300);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery, cleanedTickers]);

  // Fetch stock names
  useEffect(() => {
    if (!tickerKey) { setStockNames(new Map()); return; }
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabaseRef.current.rpc("get_watchlist_price_data", { ticker_codes: tickerKey.split(",") });
        if (cancelled || error) return;
        const names = new Map<string, string>();
        for (const row of data || []) { if (row.code && row.name) names.set(row.code.toUpperCase(), row.name); }
        setStockNames(names);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [tickerKey]);

  // Fetch historical prices
  useEffect(() => {
    if (!tickerKey) { setRawData([]); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabaseRef.current.rpc("get_watchlist_historical_prices", {
          ticker_codes: tickerKey.split(","), start_date: getStartDate(period), max_points_per_stock: 250,
        });
        if (cancelled) return;
        if (error) console.error("Error fetching historical prices:", error);
        else setRawData((data as RawPriceRow[]) || []);
      } catch (err) { if (!cancelled) console.error("Error:", err); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [tickerKey, period]);

  const stockCodes = useMemo(() => {
    const codes = new Set<string>();
    for (const row of rawData) codes.add(row.code);
    return Array.from(codes).sort();
  }, [rawData]);

  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    stockCodes.forEach((code, i) => map.set(code, LINE_COLORS[i % LINE_COLORS.length]));
    return map;
  }, [stockCodes]);

  const { chartData, stockSummaries } = useMemo(() => {
    if (rawData.length === 0) return { chartData: [], stockSummaries: [] as StockSummary[] };
    const byCode = new Map<string, { date: string; price: number }[]>();
    const dateMaps = new Map<string, Map<string, number>>();
    for (const row of rawData) {
      const price = Number(row.adjusted_close);
      if (isNaN(price)) continue;
      if (!byCode.has(row.code)) { byCode.set(row.code, []); dateMaps.set(row.code, new Map()); }
      byCode.get(row.code)!.push({ date: row.date, price });
      dateMaps.get(row.code)!.set(row.date, price);
    }
    const basePrices = new Map<string, number>();
    Array.from(byCode.entries()).forEach(([code, pts]) => { if (pts.length > 0) basePrices.set(code, pts[0].price); });
    if (period === "1D") {
      Array.from(byCode.entries()).forEach(([code, pts]) => {
        if (pts.length > 2) {
          const lastTwo = pts.slice(-2); byCode.set(code, lastTwo); basePrices.set(code, lastTwo[0].price);
          const m = new Map<string, number>(); lastTwo.forEach((p) => m.set(p.date, p.price)); dateMaps.set(code, m);
        }
      });
    }
    const allDates = new Set<string>();
    Array.from(byCode.values()).forEach((pts) => pts.forEach((p) => allDates.add(p.date)));
    const sortedDates = Array.from(allDates).sort();
    const codes = Array.from(byCode.keys());
    const cd = sortedDates.map((date) => {
      const row: Record<string, string | number> = { date };
      codes.forEach((code) => {
        const price = dateMaps.get(code)?.get(date); const base = basePrices.get(code);
        if (price !== undefined && base) row[code] = ((price - base) / base) * 100;
      });
      return row;
    });
    const summaries: StockSummary[] = [];
    Array.from(byCode.entries()).forEach(([code, pts]) => {
      if (pts.length < 1) return;
      const base = basePrices.get(code) ?? pts[0].price;
      const latest = pts[pts.length - 1].price;
      summaries.push({ code, name: stockNames.get(code) || code, latestPrice: latest,
        dollarChange: latest - base, percentChange: base ? ((latest - base) / base) * 100 : 0,
        color: colorMap.get(code) || LINE_COLORS[0] });
    });
    summaries.sort((a, b) => b.percentChange - a.percentChange);
    return { chartData: cd, stockSummaries: summaries };
  }, [rawData, period, stockNames, colorMap]);

  const candlestickDataByCode = useMemo(() => {
    const map = new Map<string, { time: number; open: number; high: number; low: number; close: number; volume: number }[]>();
    for (const row of rawData) {
      const o = Number(row.open), h = Number(row.high), l = Number(row.low), c = Number(row.close), v = Number(row.volume);
      if (isNaN(o) || isNaN(h) || isNaN(l) || isNaN(c)) continue;
      if (!map.has(row.code)) map.set(row.code, []);
      map.get(row.code)!.push({ time: Math.floor(new Date(row.date).getTime() / 1000), open: o, high: h, low: l, close: c, volume: isNaN(v) ? 0 : v });
    }
    Array.from(map.values()).forEach((arr) => arr.sort((a, b) => a.time - b.time));
    return map;
  }, [rawData]);

  useEffect(() => {
    if (chartMode === "candlestick" && !selectedStock && stockCodes.length > 0) setSelectedStock(stockCodes[0]);
  }, [chartMode, selectedStock, stockCodes]);

  const { isDark } = useTheme();

  useEffect(() => {
    if (chartMode !== "candlestick" || loading || stockCodes.length === 0) return;
    if (!candlestickContainerRef.current) return;
    if (candlestickChartRef.current) { candlestickChartRef.current.remove(); candlestickChartRef.current = null; }
    const container = candlestickContainerRef.current;
    const chart = createChart(container, {
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: isDark ? "#94a3b8" : "#64748b", attributionLogo: false },
      width: container.clientWidth, height: 260,
      grid: { vertLines: { color: isDark ? "#1e293b" : "#f1f5f9" }, horzLines: { color: isDark ? "#1e293b" : "#f1f5f9" } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: isDark ? "#334155" : "#e2e8f0" },
      timeScale: { borderColor: isDark ? "#334155" : "#e2e8f0", fixLeftEdge: true, fixRightEdge: true },
    });
    candlestickChartRef.current = chart;
    const activeCode = selectedStock || stockCodes[0];
    const ohlcData = candlestickDataByCode.get(activeCode);
    if (ohlcData && ohlcData.length > 0) {
      const uniqueData = Array.from(new Map(ohlcData.map((d) => [d.time, d])).values()).sort((a, b) => a.time - b.time);
      const cs = chart.addSeries(CandlestickSeries, { upColor: "#26a69a", downColor: "#ef5350", borderVisible: false, wickUpColor: "#26a69a", wickDownColor: "#ef5350", priceScaleId: "right" });
      cs.setData(uniqueData.map((d) => ({ time: d.time as UTCTimestamp, open: d.open, high: d.high, low: d.low, close: d.close })));
      if (uniqueData.some((d) => d.volume > 0)) {
        const vs = chart.addSeries(HistogramSeries, { priceFormat: { type: "volume" }, priceScaleId: "volume" });
        vs.priceScale().applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });
        const vu = isDark ? "rgba(59,130,246,0.35)" : "rgba(37,99,235,0.35)";
        const vd = isDark ? "rgba(168,85,247,0.35)" : "rgba(147,51,234,0.35)";
        vs.setData(uniqueData.map((d) => ({ time: d.time as UTCTimestamp, value: d.volume, color: d.close >= d.open ? vu : vd })));
      }
    }
    chart.timeScale().fitContent();
    const handleResize = () => { if (candlestickContainerRef.current) chart.applyOptions({ width: candlestickContainerRef.current.clientWidth }); };
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); chart.remove(); candlestickChartRef.current = null; };
  }, [chartMode, selectedStock, candlestickDataByCode, stockCodes, colorMap, loading, isDark]);

  const formatDateTick = (dateStr: string) => {
    const d = new Date(dateStr);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  const handleAddFromSearch = (code: string) => {
    onAddTicker(code); setSearchQuery(""); setSearchResults([]); setShowSearch(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <GitCompareArrows className="w-5 h-5 text-brand" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Compare Stocks
            </h2>
            {tickers.length > 0 && (
              <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                {tickers.length} stock{tickers.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          {tickers.length > 0 && (
            <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-red-500 h-7" onClick={onClear}>
              Clear all
            </Button>
          )}
        </div>

        {/* Add stock search */}
        <div ref={searchContainerRef} className="relative">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search stocks to compare..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); }}
              onFocus={() => setShowSearch(true)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand"
            />
          </div>
          {showSearch && (searchResults.length > 0 || searchLoading) && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchLoading && searchResults.length === 0 ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-brand" />
                </div>
              ) : (
                searchResults.map((result) => (
                  <button
                    key={result.code}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                    onClick={() => handleAddFromSearch(result.code)}
                  >
                    <CompanyLogo ticker={result.code} name={result.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{result.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{result.code}</p>
                    </div>
                    <Plus className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chart + controls + stock list */}
      {tickers.length > 0 && (
        <div className="p-4">
          {/* Controls: chart mode + period pills */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 dark:bg-slate-700/50 rounded-md p-0.5">
                <button
                  onClick={() => setChartMode("line")}
                  className={`p-1.5 rounded transition-colors ${chartMode === "line" ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
                  title="Comparison line chart"
                >
                  <LineChartIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setChartMode("candlestick")}
                  className={`p-1.5 rounded transition-colors ${chartMode === "candlestick" ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
                  title="Candlestick chart"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                </button>
              </div>
              {chartMode === "candlestick" && stockCodes.length > 1 && (
                <select
                  value={selectedStock || ""}
                  onChange={(e) => setSelectedStock(e.target.value)}
                  className="text-xs bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-0 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-brand outline-none"
                >
                  {stockCodes.map((code) => (
                    <option key={code} value={code}>{stockNames.get(code) || code}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg p-0.5">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${period === p.key ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="h-[260px] w-full mb-3">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-5 h-5 animate-spin text-brand" />
              </div>
            ) : chartMode === "line" ? (
              chartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-slate-400">No price data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={chartData}>
                    <XAxis dataKey="date" tickFormatter={formatDateTick} tick={{ fontSize: 11 }} stroke="#94a3b8" tickLine={false} axisLine={false} minTickGap={40} />
                    <YAxis tickFormatter={(v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`} tick={{ fontSize: 11 }} stroke="#94a3b8" tickLine={false} axisLine={false} width={55} />
                    <ReferenceLine y={0} stroke="#64748b" strokeDasharray="4 4" strokeOpacity={0.5} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(51, 65, 85, 0.5)", borderRadius: "8px", fontSize: "12px", color: "#f8fafc" }}
                      labelFormatter={(label: string) => { const d = new Date(label); return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }}
                      formatter={(value: number, name: string) => [`${value >= 0 ? "+" : ""}${value.toFixed(2)}%`, name]}
                    />
                    {stockCodes.map((code) => (
                      <Line key={code} type="monotone" dataKey={code} stroke={colorMap.get(code)} strokeWidth={2} dot={false} connectNulls />
                    ))}
                  </RechartsLineChart>
                </ResponsiveContainer>
              )
            ) : (
              <div ref={candlestickContainerRef} className="w-full h-full" />
            )}
          </div>

          {/* Stock summary list */}
          {!loading && stockSummaries.length > 0 && (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {stockSummaries.map((stock) => {
                const isPositive = stock.percentChange >= 0;
                const isSelected = chartMode === "candlestick" && selectedStock === stock.code;
                return (
                  <div
                    key={stock.code}
                    className={`flex items-center gap-3 py-2.5 group transition-colors ${isSelected ? "bg-slate-50 dark:bg-slate-800/50" : ""} ${chartMode === "candlestick" ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30" : ""}`}
                    onClick={chartMode === "candlestick" ? () => setSelectedStock(stock.code) : undefined}
                  >
                    <div className={`w-1 h-8 rounded-full flex-shrink-0 transition-opacity ${chartMode === "candlestick" && !isSelected ? "opacity-30" : ""}`} style={{ backgroundColor: stock.color }} />
                    <Link
                      href={`/company/${stock.code}`}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                      onClick={(e) => { if (chartMode === "candlestick") { e.preventDefault(); setSelectedStock(stock.code); } }}
                    >
                      <CompanyLogo ticker={stock.code} name={stock.name} size="sm" />
                      <div className="min-w-0">
                        <p className={`font-semibold text-sm truncate ${isSelected ? "text-brand" : "text-slate-900 dark:text-white"}`}>{stock.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{stock.code}</p>
                      </div>
                    </Link>
                    <div className="text-right mr-2">
                      <p className="font-mono font-semibold text-sm text-slate-900 dark:text-white tabular-nums">
                        ${stock.latestPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className={`font-mono text-xs tabular-nums ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                        {isPositive ? "+" : ""}${stock.dollarChange.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className={`px-2.5 py-1 rounded-md text-xs font-semibold font-mono tabular-nums ${isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                      {isPositive ? "↗" : "↘"} {Math.abs(stock.percentChange).toFixed(2)}%
                    </div>
                    <Button
                      variant="ghost" size="sm"
                      className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      onClick={(e) => { e.stopPropagation(); onRemoveTicker(stock.code); }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {tickers.length === 0 && (
        <div className="px-4 pb-4 pt-2 text-center">
          <p className="text-sm text-slate-400">
            Search above or add stocks from your watchlists to compare
          </p>
        </div>
      )}
    </div>
  );
}
