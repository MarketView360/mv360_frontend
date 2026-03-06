"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Loader2, StickyNote, Check, Settings2, RefreshCw,
  ArrowUpRight, ArrowDownRight, ChevronUp, ChevronDown,
  Square, CheckSquare, Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { createClient } from "@/lib/supabase/client";
import type { WatchlistItem } from "@/providers/WatchlistProvider";
import { cleanTicker } from "@/lib/watchlist-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface StockRowData {
  code: string;
  name: string;
  sector: string | null;
  price: number | null;
  price_change_1d: number | null;
  price_change_1m: number | null;
  market_cap: number | null;
  revenue_ttm: number | null;
  eps_ttm: number | null;
  pe_ratio: number | null;
  forward_pe?: number | null;
  enterprise_value: number | null;
  ev_ebitda?: number | null;
  price_to_book?: number | null;
  price_to_sales?: number | null;
  roe: number | null;
  roa: number | null;
  profit_margin?: number | null;
  operating_margin_ttm?: number | null;
  beta?: number | null;
  dividend_yield?: number | null;
}

type SortField = "name" | "sector" | "price" | "price_change_1d" | "price_change_1m" | "market_cap" | "revenue_ttm" | "eps_ttm" | "pe_ratio" | "enterprise_value" | "roe" | "roa";
type SortDir = "asc" | "desc";

interface ColumnConfig {
  key: SortField;
  label: string;
  format: (val: any) => string;
  align?: "left" | "right";
  sortable: boolean;
}

const formatMarketCap = (n: number | null) => {
  if (n == null) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
};

const ALL_COLUMNS: ColumnConfig[] = [
  { key: "sector", label: "Sector", format: (v) => v || "—", align: "left", sortable: true },
  { key: "price", label: "Price", format: (v) => v != null ? `$${v.toFixed(2)}` : "—", align: "right", sortable: true },
  { key: "price_change_1d", label: "1D", format: (v) => v != null ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` : "—", align: "right", sortable: true },
  { key: "price_change_1m", label: "1M", format: (v) => v != null ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` : "—", align: "right", sortable: true },
  { key: "market_cap", label: "Mkt Cap", format: formatMarketCap, align: "right", sortable: true },
  { key: "revenue_ttm", label: "Revenue", format: (v) => v != null ? `$${(v / 1e9).toFixed(2)}B` : "—", align: "right", sortable: true },
  { key: "eps_ttm", label: "EPS", format: (v) => v != null ? `$${v.toFixed(2)}` : "—", align: "right", sortable: true },
  { key: "pe_ratio", label: "P/E", format: (v) => v != null ? v.toFixed(2) : "—", align: "right", sortable: true },
  { key: "enterprise_value", label: "EV", format: (v) => v != null ? `$${(v / 1e9).toFixed(2)}B` : "—", align: "right", sortable: true },
  { key: "roe", label: "ROE", format: (v) => v != null ? `${v.toFixed(2)}%` : "—", align: "right", sortable: true },
  { key: "roa", label: "ROA", format: (v) => v != null ? `${v.toFixed(2)}%` : "—", align: "right", sortable: true },
];

// Default visible columns: sector, price, 1D, 1M, market_cap (always shown)
const DEFAULT_VISIBLE_COLUMNS: SortField[] = ["sector", "price", "price_change_1d", "price_change_1m", "market_cap"];
const ALWAYS_VISIBLE_COLUMNS: SortField[] = ["sector", "price", "price_change_1d", "price_change_1m"];

interface EnhancedWatchlistTableProps {
  items: WatchlistItem[];
  watchlistId: string;
  onRemoveStock: (watchlistId: string, ticker: string) => Promise<boolean>;
  onUpdateNotes: (watchlistId: string, ticker: string, notes: string) => Promise<boolean>;
  selectedTickers?: string[];
  onSelectionChange?: (tickers: string[]) => void;
  onStockDataChange?: (data: Map<string, StockRowData>) => void;
  onRefresh?: () => void;
}

// Export StockRowData type for use in other components
export type { StockRowData };

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

function MetricCheckbox({ checked, disabled }: { checked: boolean; disabled?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center w-5 h-5 rounded border-2 text-xs font-bold transition-all duration-150 ${
        checked
          ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
          : "border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-800"
      } ${disabled ? 'opacity-60' : ''}`}
    >
      {checked && <span>✓</span>}
    </div>
  );
}

export function EnhancedWatchlistTable({ 
  items, 
  watchlistId, 
  onRemoveStock, 
  onUpdateNotes,
  selectedTickers = [], 
  onSelectionChange,
  onStockDataChange,
  onRefresh
}: EnhancedWatchlistTableProps) {
  const [stockData, setStockData] = useState<Map<string, StockRowData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("price");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [showCustomize, setShowCustomize] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [highlightRows, setHighlightRows] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('watchlist_highlight_rows') === 'true';
    }
    return false;
  });
  const [visibleColumns, setVisibleColumns] = useState<SortField[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('watchlist_table_columns');
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as SortField[];
          // Ensure always visible columns are included - use filter to deduplicate
          const combined = [...ALWAYS_VISIBLE_COLUMNS, ...parsed.filter((p: SortField) => !ALWAYS_VISIBLE_COLUMNS.includes(p))];
          return combined;
        } catch {
          return DEFAULT_VISIBLE_COLUMNS;
        }
      }
    }
    return DEFAULT_VISIBLE_COLUMNS;
  });

  const supabaseRef = useRef(createClient());

  const tickerKey = useMemo(
    () => items.map((i) => cleanTicker(i.ticker)).sort().join(","),
    [items]
  );

  const handleSelectToggle = (ticker: string) => {
    const newSelection = selectedTickers.includes(ticker)
      ? selectedTickers.filter(t => t !== ticker)
      : [...selectedTickers, ticker];
    onSelectionChange?.(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedTickers.length === items.length) {
      onSelectionChange?.([]);
    } else {
      const allTickers = items.map(item => cleanTicker(item.ticker));
      onSelectionChange?.(allTickers);
    }
  };

  const handleToggleColumn = (columnKey: SortField) => {
    // Prevent toggling default columns
    if (ALWAYS_VISIBLE_COLUMNS.includes(columnKey)) return;
    
    const newVisible = visibleColumns.includes(columnKey)
      ? visibleColumns.filter(k => k !== columnKey)
      : [...visibleColumns, columnKey];
    setVisibleColumns(newVisible);
    if (typeof window !== 'undefined') {
      localStorage.setItem('watchlist_table_columns', JSON.stringify(newVisible));
    }
  };

  const handleToggleHighlight = () => {
    const newValue = !highlightRows;
    setHighlightRows(newValue);
    if (typeof window !== 'undefined') {
      localStorage.setItem('watchlist_highlight_rows', String(newValue));
    }
  };

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
    onRefresh?.();
  };

  const isAllSelected = items.length > 0 && selectedTickers.length === items.length;

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
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
        
        // Use batch endpoint for better performance
        const tickersParam = tickers.join(',');
        const url = `${baseUrl}/api/companies/batch?tickers=${encodeURIComponent(tickersParam)}&exchange=us`;
        console.log('[EnhancedWatchlistTable] Fetching from:', url);
        
        const res = await fetch(url);
        
        if (!res.ok) {
          console.error('[EnhancedWatchlistTable] Fetch failed:', res.status, res.statusText);
          throw new Error(`Failed to fetch batch data: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('[EnhancedWatchlistTable] Raw response:', data);
        const results = data.companies || [];
        
        if (cancelled) return;

        console.log('[EnhancedWatchlistTable] API Results:', results);
        console.log('[EnhancedWatchlistTable] Requested tickers:', tickers);
        console.log('[EnhancedWatchlistTable] Received companies:', results.length);

        const map = new Map<string, StockRowData>();
        for (const result of results) {
          if (!result?.company?.ticker) {
            console.warn('[EnhancedWatchlistTable] Skipping result - missing company.ticker:', result);
            continue;
          }
          const { company, metrics } = result;
          console.log(`[EnhancedWatchlistTable] Processing ${company.ticker}:`, { company, metrics });
          
          // Use cleaned ticker as map key for consistent lookup
          const cleanedTicker = cleanTicker(company.ticker);
          map.set(cleanedTicker, {
            code: company.ticker,
            name: company.name,
            sector: company.sector,
            price: metrics?.price != null ? Number(metrics.price) : null,
            price_change_1d: metrics?.refund_1d_p != null ? Number(metrics.refund_1d_p) : null,
            price_change_1m: metrics?.refund_1m_p != null ? Number(metrics.refund_1m_p) : null,
            market_cap: metrics?.market_cap != null ? Number(metrics.market_cap) : null,
            revenue_ttm: metrics?.revenue_ttm != null ? Number(metrics.revenue_ttm) : null,
            eps_ttm: metrics?.eps_ttm != null ? Number(metrics.eps_ttm) : null,
            pe_ratio: metrics?.pe_ratio != null ? Number(metrics.pe_ratio) : null,
            forward_pe: metrics?.forward_pe != null ? Number(metrics.forward_pe) : null,
            enterprise_value: metrics?.enterprise_value != null ? Number(metrics.enterprise_value) : null,
            ev_ebitda: metrics?.ev_ebitda != null ? Number(metrics.ev_ebitda) : null,
            price_to_book: metrics?.price_to_book != null ? Number(metrics.price_to_book) : null,
            price_to_sales: metrics?.price_to_sales != null ? Number(metrics.price_to_sales) : null,
            roe: metrics?.roe != null ? Number(metrics.roe) : null,
            roa: metrics?.roa != null ? Number(metrics.roa) : null,
            profit_margin: metrics?.profit_margin != null ? Number(metrics.profit_margin) : null,
            operating_margin_ttm: metrics?.operating_margin_ttm != null ? Number(metrics.operating_margin_ttm) : null,
            beta: metrics?.beta != null ? Number(metrics.beta) : null,
            dividend_yield: metrics?.dividend_yield != null ? Number(metrics.dividend_yield) : null,
          });
        }
        console.log('[EnhancedWatchlistTable] Final stock data map:', map);
        setStockData(map);
        onStockDataChange?.(map);
      } catch (err) {
        if (!cancelled) console.error("Error fetching stock data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [tickerKey, onStockDataChange, refreshKey]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aData = stockData.get(cleanTicker(a.ticker));
      const bData = stockData.get(cleanTicker(b.ticker));

      if (!aData || !bData) return 0;

      const aVal = aData[sortField];
      const bVal = bData[sortField];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const cmp = typeof aVal === 'string' 
        ? aVal.localeCompare(bVal as string)
        : (aVal as number) - (bVal as number);

      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [items, stockData, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const activeColumns = useMemo(() => {
    return ALL_COLUMNS.filter(c => visibleColumns.includes(c.key));
  }, [visibleColumns]);

  if (loading && items.length > 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-brand" />
      </div>
    );
  }

  // Get row highlight class based on 1D price change
  const getRowHighlightClass = (change1d: number | null) => {
    if (!highlightRows || change1d == null) return '';
    if (change1d > 0) return 'bg-emerald-100/60 dark:bg-emerald-900/40';
    if (change1d < 0) return 'bg-red-100/60 dark:bg-red-900/40';
    return '';
  };

  return (
    <>
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {items.length} {items.length === 1 ? 'stock' : 'stocks'}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => setShowCustomize(true)}
            >
              <Settings2 className="w-3.5 h-3.5" />
              Customize
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/50 dark:bg-slate-800/30 sticky top-0 z-10">
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="px-3 py-2 text-left w-10">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center justify-center w-4 h-4 rounded border border-slate-300 dark:border-slate-600 hover:border-brand transition-colors"
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-brand" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Company
              </th>
              {activeColumns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2 text-${col.align || 'left'} text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider ${col.sortable ? 'cursor-pointer select-none hover:text-brand transition-colors' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : ''}`}>
                    <span>{col.label}</span>
                    {col.sortable && sortField === col.key && (
                      sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item, idx) => {
              const ticker = cleanTicker(item.ticker);
              const data = stockData.get(ticker);
              const isSelected = selectedTickers.includes(ticker);
              const highlightClass = getRowHighlightClass(data?.price_change_1d ?? null);

              return (
                <tr
                  key={item.ticker}
                  className={`${highlightClass || (idx % 2 === 0 ? '' : 'bg-slate-50/30 dark:bg-slate-800/10')} hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors ${isSelected ? 'ring-2 ring-brand/30 bg-brand/5' : ''}`}
                >
                  <td className="px-3 py-3">
                    <button
                      onClick={() => handleSelectToggle(ticker)}
                      className="flex items-center justify-center w-4 h-4 rounded border border-slate-300 dark:border-slate-600 hover:border-brand transition-colors"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-brand" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <Link href={`/company/${ticker}`} className="flex items-center gap-2 group">
                      <CompanyLogo ticker={ticker} name={data?.name || ticker} size="sm" />
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900 dark:text-white truncate group-hover:text-brand transition-colors">
                          {ticker}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                          {data?.name || '—'}
                        </div>
                      </div>
                    </Link>
                  </td>
                  {activeColumns.map((col) => {
                    const value = data?.[col.key];
                    const formatted = col.format(value);
                    const isChange = col.key.includes('change');
                    const numValue = typeof value === 'number' ? value : null;

                    return (
                      <td key={col.key} className={`px-3 py-3 text-${col.align || 'left'}`}>
                        {isChange && numValue != null ? (
                          <span
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-semibold font-mono tabular-nums ${
                              numValue >= 0
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-red-500/10 text-red-600 dark:text-red-400"
                            }`}
                          >
                            {numValue >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {Math.abs(numValue).toFixed(2)}%
                          </span>
                        ) : (
                          <span className="font-mono text-slate-700 dark:text-slate-300">{formatted}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 py-3">
                    {editingNotes === item.ticker ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          className="text-xs px-2 py-1 border rounded w-32"
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              onUpdateNotes?.(watchlistId, ticker, noteDraft);
                              setEditingNotes(null);
                            } else if (e.key === "Escape") {
                              setEditingNotes(null);
                            }
                          }}
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            onUpdateNotes?.(watchlistId, ticker, noteDraft);
                            setEditingNotes(null);
                          }}
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        className="text-xs text-slate-500 hover:text-brand flex items-center gap-1 group"
                        onClick={() => {
                          setEditingNotes(item.ticker);
                          setNoteDraft(item.notes || "");
                        }}
                      >
                        <StickyNote className="w-3 h-3" />
                        <span className="truncate max-w-[100px]">
                          {item.notes || "Add note"}
                        </span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Customize Table Dialog */}
      <Dialog open={showCustomize} onOpenChange={setShowCustomize}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-brand" />
              Customize Table
            </DialogTitle>
            <DialogDescription>
              Configure columns and display preferences.
            </DialogDescription>
          </DialogHeader>

          {/* Display Settings */}
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Display Settings
              </h4>
              <button
                type="button"
                onClick={handleToggleHighlight}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Highlight rows by performance
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Green for gains, red for losses based on 1D change
                  </div>
                </div>
                <div className={`w-11 h-6 rounded-full transition-all relative shadow-inner ${highlightRows ? 'bg-emerald-500 dark:bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${highlightRows ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </button>
            </div>

            {/* Columns */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Visible Columns
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {ALL_COLUMNS.map(col => {
                  const isDefault = ALWAYS_VISIBLE_COLUMNS.includes(col.key);
                  const isChecked = visibleColumns.includes(col.key) || isDefault;
                  
                  return (
                    <button
                      key={col.key}
                      type="button"
                      onClick={() => handleToggleColumn(col.key)}
                      disabled={isDefault}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                        isChecked
                          ? 'border-brand/50 bg-brand/5'
                          : 'border-slate-200 dark:border-slate-700'
                      } ${
                        isDefault 
                          ? 'opacity-70 cursor-not-allowed' 
                          : 'hover:border-brand/30 cursor-pointer'
                      }`}
                    >
                      <MetricCheckbox checked={isChecked} disabled={isDefault} />
                      <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                        {col.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400">
                Sector, Price, 1D, and 1M are always visible.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-700">
            <Button onClick={() => setShowCustomize(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
