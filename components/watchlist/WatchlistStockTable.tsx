"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { X, Loader2, GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { createClient } from "@/lib/supabase/client";
import type { WatchlistItem } from "@/hooks/useWatchlist";

function cleanTicker(ticker: string): string {
  return ticker.replace(/\.US$/i, "").toUpperCase();
}

interface StockRowData {
  code: string;
  name: string;
  price: number | null;
  price_change_1d: number | null;
  price_change_1w: number | null;
  price_change_1m: number | null;
  price_change_3m: number | null;
  price_change_1y: number | null;
}

type SortField = "price" | "price_change_1d" | "price_change_1w" | "price_change_1m" | "price_change_3m" | "price_change_1y" | "name";
type SortDir = "asc" | "desc";

interface WatchlistStockTableProps {
  items: WatchlistItem[];
  watchlistId: string;
  onRemoveStock: (watchlistId: string, ticker: string) => void;
  onCompareStock?: (ticker: string) => void;
  compareTickers?: string[];
}

const RETURN_COLUMNS: { key: SortField; label: string }[] = [
  { key: "price_change_1d", label: "1D" },
  { key: "price_change_1w", label: "5D" },
  { key: "price_change_1m", label: "1M" },
  { key: "price_change_3m", label: "3M" },
  { key: "price_change_1y", label: "1Y" },
];

function formatPercent(val: number | null | undefined): string {
  if (val == null) return "—";
  return `${val >= 0 ? "" : ""}${val.toFixed(2)}%`;
}

function percentColor(val: number | null | undefined): string {
  if (val == null) return "text-slate-500 dark:text-slate-400";
  if (val > 0) return "text-emerald-500";
  if (val < 0) return "text-red-500";
  return "text-slate-500 dark:text-slate-400";
}

export function WatchlistStockTable({ items, watchlistId, onRemoveStock, onCompareStock, compareTickers = [] }: WatchlistStockTableProps) {
  const [stockData, setStockData] = useState<Map<string, StockRowData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("price");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const supabaseRef = useRef(createClient());

  // Stable ticker key so we only refetch when the actual tickers change
  const tickerKey = useMemo(
    () => items.map((i) => i.ticker.toUpperCase()).sort().join(","),
    [items]
  );

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
      setSortDir(field === "name" ? "asc" : "desc");
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    const dataA = stockData.get(cleanTicker(a.ticker));
    const dataB = stockData.get(cleanTicker(b.ticker));

    let valA: number | string | null = null;
    let valB: number | string | null = null;

    if (sortField === "name") {
      valA = dataA?.name ?? a.ticker;
      valB = dataB?.name ?? b.ticker;
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

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1 text-brand">
        {sortDir === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-brand" />
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[280px]">
              <button
                className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors"
                onClick={() => toggleSort("name")}
              >
                Company
                <SortIcon field="name" />
              </button>
            </th>
            <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <button
                className="flex items-center gap-1 justify-end ml-auto hover:text-slate-900 dark:hover:text-white transition-colors"
                onClick={() => toggleSort("price")}
              >
                Price
                <SortIcon field="price" />
              </button>
            </th>
            {RETURN_COLUMNS.map((col) => (
              <th
                key={col.key}
                className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                <button
                  className="flex items-center gap-1 justify-end ml-auto hover:text-slate-900 dark:hover:text-white transition-colors"
                  onClick={() => toggleSort(col.key)}
                >
                  {col.label}
                  <SortIcon field={col.key} />
                </button>
              </th>
            ))}
            {onCompareStock && <th className="w-10" />}
            <th className="w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {sortedItems.map((item) => {
            const data = stockData.get(cleanTicker(item.ticker));
            const displayName = data?.name || item.ticker;
            const ticker = item.ticker.replace(/\.US$/i, "");

            return (
              <tr
                key={item.id}
                className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/company/${item.ticker}`}
                    className="flex items-center gap-3 min-w-0"
                  >
                    <CompanyLogo ticker={item.ticker} name={displayName} size="sm" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {ticker}
                      </p>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-sm text-slate-900 dark:text-white tabular-nums">
                  {data?.price != null
                    ? `$${Number(data.price).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                    : "—"}
                </td>
                {RETURN_COLUMNS.map((col) => {
                  const val = data?.[col.key] as number | null | undefined;
                  return (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-right font-mono text-sm tabular-nums font-medium ${percentColor(val)}`}
                    >
                      {formatPercent(val)}
                    </td>
                  );
                })}
                {onCompareStock && (
                  <td className="px-1 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-7 w-7 p-0 transition-opacity ${
                        compareTickers.includes(cleanTicker(item.ticker))
                          ? "text-brand opacity-100"
                          : "text-slate-400 hover:text-brand opacity-0 group-hover:opacity-100"
                      }`}
                      onClick={() => onCompareStock(item.ticker)}
                      title="Add to compare"
                    >
                      <GitCompareArrows className="w-4 h-4" />
                    </Button>
                  </td>
                )}
                <td className="px-2 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemoveStock(watchlistId, item.ticker)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
