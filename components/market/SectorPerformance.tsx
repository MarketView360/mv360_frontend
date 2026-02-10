"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Layers,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BACKEND_URL =
  (process.env.NEXT_PUBLIC_BACKEND_URL as string | undefined) ??
  "http://localhost:4000";

type TimeFrame = "1d" | "1w" | "1m";

const TIME_FRAME_LABELS: Record<TimeFrame, string> = {
  "1d": "1D",
  "1w": "1W",
  "1m": "1M",
};

interface SectorData {
  sector: string;
  change_1d: number;
  change_1w: number;
  change_1m: number;
  market_cap: number;
  stock_count: number;
  advancers: number;
  decliners: number;
}

type SortField = "change" | "name" | "market_cap";

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
}

function getChangeValue(sector: SectorData, tf: TimeFrame): number {
  if (tf === "1w") return sector.change_1w;
  if (tf === "1m") return sector.change_1m;
  return sector.change_1d;
}

export function SectorPerformance() {
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("1d");
  const [sortField, setSortField] = useState<SortField>("change");
  const [sortAsc, setSortAsc] = useState(false);
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/market/sectors`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSectors(data);
    } catch (err) {
      console.error("[SectorPerformance] Error:", err);
      setError("Unable to load sector data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === "name");
    }
  };

  const sorted = [...sectors].sort((a, b) => {
    let cmp = 0;
    if (sortField === "change") {
      cmp = getChangeValue(a, timeFrame) - getChangeValue(b, timeFrame);
    } else if (sortField === "name") {
      cmp = a.sector.localeCompare(b.sector);
    } else {
      cmp = a.market_cap - b.market_cap;
    }
    return sortAsc ? cmp : -cmp;
  });

  const maxChange =
    sorted.length > 0
      ? Math.max(...sorted.map((s) => Math.abs(getChangeValue(s, timeFrame))), 0.01)
      : 1;

  const totalAdvancers = sectors.reduce((sum, s) => sum + s.advancers, 0);
  const totalDecliners = sectors.reduce((sum, s) => sum + s.decliners, 0);
  const totalStocks = sectors.reduce((sum, s) => sum + s.stock_count, 0);

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-slate-800 dark:text-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            Sector Performance
          </div>

          <div className="flex items-center gap-2">
            {/* Time frame toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-md p-0.5">
              {(Object.keys(TIME_FRAME_LABELS) as TimeFrame[]).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeFrame(tf)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded transition-all",
                    timeFrame === tf
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  {TIME_FRAME_LABELS[tf]}
                </button>
              ))}
            </div>

            {!loading && (
              <button
                type="button"
                onClick={() => void fetchData()}
                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
          </div>
        </CardTitle>

        {/* Summary bar */}
        {!loading && !error && sectors.length > 0 && (
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{totalStocks} stocks</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3 h-3" />
              {totalAdvancers} advancing
            </span>
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-3 h-3" />
              {totalDecliners} declining
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-1">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="h-6 w-6 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-brand animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <p className="text-sm text-slate-500">{error}</p>
            <button
              type="button"
              onClick={() => void fetchData()}
              className="text-xs text-brand hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">
              <button
                type="button"
                onClick={() => handleSort("name")}
                className="w-36 text-left flex items-center gap-0.5 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                Sector
                {sortField === "name" && (
                  sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                )}
              </button>
              <div className="flex-1 text-center">Performance</div>
              <button
                type="button"
                onClick={() => handleSort("change")}
                className="w-16 text-right flex items-center justify-end gap-0.5 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                Change
                {sortField === "change" && (
                  sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                )}
              </button>
              <div className="w-20 text-right hidden sm:block">A / D</div>
              <button
                type="button"
                onClick={() => handleSort("market_cap")}
                className="w-16 text-right hidden md:flex items-center justify-end gap-0.5 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                Mkt Cap
                {sortField === "market_cap" && (
                  sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                )}
              </button>
            </div>

            <div className="space-y-0.5">
              {sorted.map((sector) => {
                const change = getChangeValue(sector, timeFrame);
                const isPositive = change >= 0;
                const barWidth = (Math.abs(change) / maxChange) * 50;
                const isHovered = hoveredSector === sector.sector;

                return (
                  <div
                    key={sector.sector}
                    className={cn(
                      "group flex items-center gap-3 text-sm rounded-md px-1 py-1.5 transition-colors cursor-default",
                      isHovered
                        ? "bg-slate-50 dark:bg-slate-800/60"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    )}
                    onMouseEnter={() => setHoveredSector(sector.sector)}
                    onMouseLeave={() => setHoveredSector(null)}
                  >
                    {/* Sector name */}
                    <span className="w-36 truncate text-slate-700 dark:text-slate-300 font-medium text-[13px]">
                      {sector.sector}
                    </span>

                    {/* Bar container */}
                    <div className="flex-1 flex items-center h-7 relative">
                      {/* Center line */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700/60" />

                      {isPositive ? (
                        <div
                          className="h-5 rounded-r-[3px] ml-[50%] transition-all duration-300"
                          style={{
                            width: `${barWidth}%`,
                            background: `linear-gradient(90deg, rgb(16 185 129 / 0.8), rgb(16 185 129))`,
                          }}
                        />
                      ) : (
                        <div
                          className="h-5 rounded-l-[3px] ml-auto mr-[50%] transition-all duration-300"
                          style={{
                            width: `${barWidth}%`,
                            background: `linear-gradient(270deg, rgb(244 63 94 / 0.8), rgb(244 63 94))`,
                          }}
                        />
                      )}
                    </div>

                    {/* Change % */}
                    <span
                      className={cn(
                        "w-16 text-right font-mono text-xs font-semibold",
                        isPositive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      )}
                    >
                      {isPositive ? "+" : ""}
                      {change.toFixed(2)}%
                    </span>

                    {/* Advancers / Decliners */}
                    <div className="w-20 hidden sm:flex items-center justify-end gap-1">
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                        <ChevronUp className="w-2.5 h-2.5" />
                        {sector.advancers}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
                        <ChevronDown className="w-2.5 h-2.5" />
                        {sector.decliners}
                      </span>
                    </div>

                    {/* Market cap */}
                    <span className="w-16 text-right text-[11px] text-slate-400 dark:text-slate-500 font-mono hidden md:block">
                      {formatMarketCap(sector.market_cap)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Tooltip overlay for hovered sector */}
            {hoveredSector && (() => {
              const s = sectors.find((sec) => sec.sector === hoveredSector);
              if (!s) return null;
              return (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 transition-all">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{s.sector}</span>
                  <div className="flex items-center gap-4">
                    <span>1D: <span className={s.change_1d >= 0 ? "text-emerald-500" : "text-rose-500"}>{s.change_1d >= 0 ? "+" : ""}{s.change_1d.toFixed(2)}%</span></span>
                    <span>1W: <span className={s.change_1w >= 0 ? "text-emerald-500" : "text-rose-500"}>{s.change_1w >= 0 ? "+" : ""}{s.change_1w.toFixed(2)}%</span></span>
                    <span>{s.stock_count} stocks</span>
                    <span>{formatMarketCap(s.market_cap)}</span>
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </CardContent>
    </Card>
  );
}
