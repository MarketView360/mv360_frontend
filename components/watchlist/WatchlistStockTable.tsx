"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  X, Loader2, GitCompareArrows, StickyNote, Check,
  ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, ChevronUp, ChevronDown,
  Square, CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { createClient } from "@/lib/supabase/client";
import type { WatchlistItem } from "@/providers/WatchlistProvider";
import { cleanTicker, formatPercent } from "@/lib/watchlist-utils";

interface StockRowData {
  code: string;
  name: string;
  sector: string | null;
  price: number | null;
  price_change_1d: number | null;
  price_change_1w: number | null;
  price_change_1m: number | null;
  price_change_3m: number | null;
  price_change_1y: number | null;
}

type SortField = "price" | "price_change_1d" | "price_change_1w" | "price_change_1m" | "price_change_3m" | "price_change_1y" | "name" | "sector";
type SortDir = "asc" | "desc";

interface WatchlistStockTableProps {
  items: WatchlistItem[];
  watchlistId: string;
  onRemoveStock: (watchlistId: string, ticker: string) => void;
  onCompareStock?: (ticker: string) => void;
  onUpdateNotes?: (watchlistId: string, ticker: string, notes: string) => void;
  compareTickers?: string[];
  selectedTickers?: string[];
  onSelectionChange?: (tickers: string[]) => void;
}

const RETURN_COLUMNS: { key: SortField; label: string; hideClass?: string }[] = [
  { key: "price_change_1d", label: "1D" },
  { key: "price_change_1m", label: "1M" },
];

function relativeTime(dateStr: string | undefined | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function ChangePill({ val }: { val: number | null | undefined }) {
  if (val == null) return <span className="text-slate-400 text-xs">—</span>;
  const isPositive = val >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-semibold font-mono tabular-nums ${
        isPositive
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-red-500/10 text-red-600 dark:text-red-400"
      }`}
    >
      {isPositive ? (
        <ArrowUpRight className="w-3 h-3" />
      ) : (
        <ArrowDownRight className="w-3 h-3" />
      )}
      {Math.abs(val).toFixed(2)}%
    </span>
  );
}

export function WatchlistStockTable({ items, watchlistId, onRemoveStock, onCompareStock, onUpdateNotes, compareTickers = [], selectedTickers = [], onSelectionChange }: WatchlistStockTableProps) {
  const [stockData, setStockData] = useState<Map<string, StockRowData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("price");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [localSelected, setLocalSelected] = useState<string[]>([]);

  const supabaseRef = useRef(createClient());

  const tickerKey = useMemo(
    () => items.map((i) => i.ticker.toUpperCase()).sort().join(","),
    [items]
  );

  // Sync selection state
  useEffect(() => {
    setLocalSelected(selectedTickers);
  }, [selectedTickers]);

  const handleSelectToggle = (ticker: string) => {
    const newSelection = localSelected.includes(ticker)
      ? localSelected.filter(t => t !== ticker)
      : [...localSelected, ticker];
    setLocalSelected(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleSelectAll = () => {
    if (localSelected.length === items.length) {
      setLocalSelected([]);
      onSelectionChange?.([]);
    } else {
      const allTickers = items.map(item => cleanTicker(item.ticker));
      setLocalSelected(allTickers);
      onSelectionChange?.(allTickers);
    }
  };

  const isAllSelected = items.length > 0 && localSelected.length === items.length;

  useEffect(() => {
    if (!tickerKey) {
      setStockData(new Map());
      setLoading(false);
      return;
    }

    let cancelled = false;
    const tickers = tickerKey.split(",");

    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabaseRef.current
          .rpc("get_watchlist_price_data", { ticker_codes: tickers });

        if (cancelled) return;

        if (error) {
          console.error("Error fetching stock data:", error);
          setLoading(false);
          return;
        }

        const map = new Map<string, StockRowData>();
        for (const row of data || []) {
          map.set(row.code?.toUpperCase(), {
            code: row.code,
            name: row.name,
            sector: row.sector || null,
            price: row.price != null ? Number(row.price) : null,
            price_change_1d: row.price_change_1d != null ? Number(row.price_change_1d) : null,
            price_change_1w: row.price_change_1w != null ? Number(row.price_change_1w) : null,
            price_change_1m: row.price_change_1m != null ? Number(row.price_change_1m) : null,
            price_change_3m: row.price_change_3m != null ? Number(row.price_change_3m) : null,
            price_change_1y: row.price_change_1y != null ? Number(row.price_change_1y) : null,
          });
        }
        setStockData(map);
      } catch (err) {
        if (!cancelled) console.error("Error fetching stock data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [tickerKey]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "name" || field === "sector" ? "asc" : "desc");
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    const dataA = stockData.get(cleanTicker(a.ticker));
    const dataB = stockData.get(cleanTicker(b.ticker));

    let valA: number | string | null = null;
    let valB: number | string | null = null;

    if (sortField === "name" || sortField === "sector") {
      valA = sortField === "name" ? (dataA?.name ?? a.ticker) : (dataA?.sector ?? "");
      valB = sortField === "name" ? (dataB?.name ?? b.ticker) : (dataB?.sector ?? "");
      const cmp = String(valA).localeCompare(String(valB));
      return sortDir === "asc" ? cmp : -cmp;
    }

    valA = dataA?.[sortField] ?? null;
    valB = dataB?.[sortField] ?? null;

    if (valA == null && valB == null) return 0;
    if (valA == null) return 1;
    if (valB == null) return -1;

    const diff = (valA as number) - (valB as number);
    return sortDir === "asc" ? diff : -diff;
  });

  const SortHeader = ({ field, label, className = "" }: { field: SortField; label: string; className?: string }) => {
    const active = sortField === field;
    return (
      <th className={`text-right px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider ${className}`}>
        <button
          className={`inline-flex items-center gap-0.5 transition-colors ${
            active ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
          onClick={() => toggleSort(field)}
        >
          {label}
          {active && (
            sortDir === "asc"
              ? <ChevronUp className="w-3 h-3" />
              : <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </th>
    );
  };

  // Compute summary stats for the mini bar at the top
  const summaryStats = useMemo(() => {
    let gainers = 0, losers = 0;
    let bestVal = -Infinity, worstVal = Infinity;
    let bestTicker = "", worstTicker = "";
    for (const item of items) {
      const data = stockData.get(cleanTicker(item.ticker));
      const change = data?.price_change_1d;
      if (change == null) continue;
      if (change >= 0) gainers++;
      else losers++;
      if (change > bestVal) { bestVal = change; bestTicker = cleanTicker(item.ticker); }
      if (change < worstVal) { worstVal = change; worstTicker = cleanTicker(item.ticker); }
    }
    return {
      gainers, losers,
      bestTicker: bestVal > -Infinity ? bestTicker : null,
      bestVal: bestVal > -Infinity ? bestVal : null,
      worstTicker: worstVal < Infinity ? worstTicker : null,
      worstVal: worstVal < Infinity ? worstVal : null,
    };
  }, [items, stockData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-brand" />
          <span className="text-xs text-slate-400">Loading prices...</span>
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div>
      {/* Summary strip */}
      {stockData.size > 0 && (
        <div className="flex items-center gap-4 px-4 py-2.5 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-700/50 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span className="font-medium">{items.length} stocks</span>
          </div>
          {summaryStats.gainers > 0 && (
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3 h-3" />
              <span className="font-medium">{summaryStats.gainers} up</span>
            </div>
          )}
          {summaryStats.losers > 0 && (
            <div className="flex items-center gap-1 text-red-500 dark:text-red-400">
              <TrendingDown className="w-3 h-3" />
              <span className="font-medium">{summaryStats.losers} down</span>
            </div>
          )}
          <div className="flex-1" />
          {summaryStats.bestTicker && (
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-slate-400">Best:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                {summaryStats.bestTicker} +{summaryStats.bestVal?.toFixed(2)}%
              </span>
            </div>
          )}
          {summaryStats.worstTicker && (
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-slate-400">Worst:</span>
              <span className="font-semibold text-red-500 dark:text-red-400 font-mono">
                {summaryStats.worstTicker} {summaryStats.worstVal?.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              {onSelectionChange && (
                <th className="w-12 px-4 py-2.5">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center justify-center w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 hover:border-brand dark:hover:border-brand transition-colors"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-brand" />
                    ) : localSelected.length > 0 ? (
                      <div className="w-2.5 h-2.5 bg-brand rounded-sm" />
                    ) : null}
                  </button>
                </th>
              )}
              <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider w-[260px]">
                <button
                  className={`inline-flex items-center gap-0.5 transition-colors ${
                    sortField === "name" ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                  onClick={() => toggleSort("name")}
                >
                  Company
                  {sortField === "name" && (
                    sortDir === "asc"
                      ? <ChevronUp className="w-3 h-3" />
                      : <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              </th>
              <th className="text-left px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider hidden xl:table-cell">
                <button
                  className={`inline-flex items-center gap-0.5 transition-colors ${
                    sortField === "sector" ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                  onClick={() => toggleSort("sector")}
                >
                  Sector
                  {sortField === "sector" && (
                    sortDir === "asc"
                      ? <ChevronUp className="w-3 h-3" />
                      : <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              </th>
              <SortHeader field="price" label="Price" />
              {RETURN_COLUMNS.map((col) => (
                <SortHeader key={col.key} field={col.key} label={col.label} className={col.hideClass || ""} />
              ))}
              <th className="w-[100px]" />
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item, idx) => {
              const data = stockData.get(cleanTicker(item.ticker));
              const displayName = data?.name || item.ticker;
              const ticker = item.ticker.replace(/\.US$/i, "");
              const dayChange = data?.price_change_1d;
              const isUp = dayChange != null && dayChange >= 0;

              const isSelected = localSelected.includes(cleanTicker(item.ticker));

              return (
                <React.Fragment key={item.id}>
                  <tr
                    className={`group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                      idx % 2 === 0 ? "" : "bg-slate-50/30 dark:bg-slate-800/10"
                    } ${isSelected ? "ring-2 ring-brand/20" : ""}`}
                  >
                    {onSelectionChange && (
                      <td className="px-4 py-2.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectToggle(cleanTicker(item.ticker));
                          }}
                          className="flex items-center justify-center w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 hover:border-brand dark:hover:border-brand transition-colors"
                        >
                          {isSelected && <CheckSquare className="w-4 h-4 text-brand" />}
                        </button>
                      </td>
                    )}
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/company/${item.ticker}`}
                        className="flex items-center gap-3 min-w-0"
                      >
                        <div className="relative">
                          <CompanyLogo ticker={item.ticker} name={displayName} size="sm" />
                          {dayChange != null && (
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center ${
                              isUp ? "bg-emerald-500" : "bg-red-500"
                            }`}>
                              {isUp ? (
                                <ArrowUpRight className="w-2 h-2 text-white" />
                              ) : (
                                <ArrowDownRight className="w-2 h-2 text-white" />
                              )}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm truncate leading-tight">
                            {displayName}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-medium">
                              {ticker}
                            </span>
                            {item.notes && (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 truncate max-w-[120px]" title={item.notes}>
                                &bull; {item.notes}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden lg:inline">
                              {relativeTime(item.added_at)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 hidden xl:table-cell">
                      {data?.sector ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 truncate max-w-[140px]">
                          {data.sector}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-white tabular-nums">
                          {data?.price != null
                            ? `$${Number(data.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : "—"}
                        </span>
                        {dayChange != null && (
                          <span className={`text-[11px] font-mono tabular-nums ${isUp ? "text-emerald-500" : "text-red-500"}`}>
                            {isUp ? "+" : ""}{dayChange.toFixed(2)}%
                          </span>
                        )}
                      </div>
                    </td>
                    {RETURN_COLUMNS.map((col) => {
                      const val = data?.[col.key] as number | null | undefined;
                      return (
                        <td
                          key={col.key}
                          className={`px-3 py-2.5 text-right ${col.hideClass || ""}`}
                        >
                          <ChangePill val={val} />
                        </td>
                      );
                    })}
                    <td className="px-2 py-2.5">
                      <div className="flex items-center justify-end gap-0.5">
                        {onCompareStock && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 w-7 p-0 transition-all ${
                              compareTickers.includes(cleanTicker(item.ticker))
                                ? "text-brand opacity-100 bg-brand/10"
                                : "text-slate-400 hover:text-brand md:opacity-0 md:group-hover:opacity-100"
                            }`}
                            onClick={() => onCompareStock(item.ticker)}
                            title="Compare"
                          >
                            <GitCompareArrows className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {onUpdateNotes && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 w-7 p-0 transition-all ${
                              editingNotes === item.ticker
                                ? "text-amber-500 bg-amber-500/10 opacity-100"
                                : item.notes
                                  ? "text-amber-500 opacity-100"
                                  : "text-slate-400 hover:text-amber-500 md:opacity-0 md:group-hover:opacity-100"
                            }`}
                            onClick={() => {
                              if (editingNotes === item.ticker) {
                                setEditingNotes(null);
                              } else {
                                setEditingNotes(item.ticker);
                                setNoteDraft(item.notes || "");
                              }
                            }}
                            title={item.notes ? "Edit note" : "Add note"}
                          >
                            <StickyNote className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-500/10 md:opacity-0 md:group-hover:opacity-100 transition-all"
                          onClick={() => { if (window.confirm(`Remove ${cleanTicker(item.ticker)} from this watchlist?`)) onRemoveStock(watchlistId, item.ticker); }}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {editingNotes === item.ticker && onUpdateNotes && (
                    <tr>
                      <td colSpan={99} className="px-4 py-2 bg-amber-50/60 dark:bg-amber-950/20 border-y border-amber-200/30 dark:border-amber-800/20">
                        <div className="flex items-center gap-2 max-w-xl">
                          <StickyNote className="w-4 h-4 text-amber-500 shrink-0" />
                          <input
                            type="text"
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            placeholder="Add a note for this stock..."
                            className="flex-1 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                onUpdateNotes(watchlistId, item.ticker, noteDraft);
                                setEditingNotes(null);
                              } else if (e.key === "Escape") {
                                setEditingNotes(null);
                              }
                            }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            className="h-8 px-3 bg-amber-500 hover:bg-amber-600 text-white"
                            onClick={() => {
                              onUpdateNotes(watchlistId, item.ticker, noteDraft);
                              setEditingNotes(null);
                            }}
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-slate-400 hover:text-slate-600"
                            onClick={() => setEditingNotes(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
