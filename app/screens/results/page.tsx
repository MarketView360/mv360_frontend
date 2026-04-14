"use client";

import React, {
  Suspense,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ChevronLeft,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Search,
  X,
  Filter,
  Shield,
  ChevronDown,
  Sparkles,
  Building2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { GoogleAdSlot } from "@/components/GoogleAdSlot";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/providers/AuthProvider";

// For Excel/PDF exports (install: npm install exceljs file-saver jspdf)
// import * as XLSX from "xlsx"; // Removed for security

import { jsPDF } from "jspdf";

// Import screener types aligned with backend
import type { ScreenerRow } from "@/lib/types/screener";
import { stripOuterParentheses } from "@/lib/queryBuilder";

// Re-export for local usage (backward compatibility)
export type { ScreenerRow };

// Custom hook for debounced search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Field name mapping for query parsing (maps natural language to DB field names)
const QUERY_FIELD_MAP: Record<string, string> = {
  // Valuation
  'pe': 'pe_ratio', 'p/e': 'pe_ratio', 'pe ratio': 'pe_ratio', 'trailing pe': 'pe_ratio',
  'forward pe': 'forward_pe', 'fwd pe': 'forward_pe', 'forward p/e': 'forward_pe',
  'peg': 'peg_ratio', 'peg ratio': 'peg_ratio',
  'pb': 'price_book_mrq', 'p/b': 'price_book_mrq', 'price to book': 'price_book_mrq', 'price book': 'price_book_mrq',
  'ps': 'price_sales_ttm', 'p/s': 'price_sales_ttm', 'price to sales': 'price_sales_ttm', 'price sales': 'price_sales_ttm',
  'ev/ebitda': 'ev_ebitda', 'ev ebitda': 'ev_ebitda',
  'ev/revenue': 'ev_revenue', 'ev revenue': 'ev_revenue', 'ev sales': 'ev_revenue',
  'enterprise value': 'enterprise_value', 'ev': 'enterprise_value',
  'market cap': 'market_cap', 'market capitalization': 'market_cap', 'marketcap': 'market_cap',
  // Dividends
  'dividend yield': 'dividend_yield', 'div yield': 'dividend_yield', 'yield': 'dividend_yield',
  'payout ratio': 'payout_ratio', 'payout': 'payout_ratio',
  // Profitability
  'roe': 'return_on_equity_ttm', 'return on equity': 'return_on_equity_ttm',
  'roa': 'return_on_assets_ttm', 'return on assets': 'return_on_assets_ttm',
  'operating margin': 'operating_margin_ttm', 'opm': 'operating_margin_ttm',
  'profit margin': 'profit_margin', 'net margin': 'profit_margin',
  // Growth
  'revenue growth': 'quarterly_revenue_growth_yoy', 'sales growth': 'quarterly_revenue_growth_yoy',
  'earnings growth': 'quarterly_earnings_growth_yoy', 'eps growth': 'quarterly_earnings_growth_yoy',
  // Technical
  'beta': 'beta',
  'sma50': 'day_50_ma', '50 day ma': 'day_50_ma', '50 ma': 'day_50_ma',
  'sma200': 'day_200_ma', '200 day ma': 'day_200_ma', '200 ma': 'day_200_ma',
  '52 week high': 'week_52_high', '52w high': 'week_52_high', 'week 52 high': 'week_52_high',
  '52 week low': 'week_52_low', '52w low': 'week_52_low', 'week 52 low': 'week_52_low',
  // Analyst
  'analyst target': 'analyst_target_price', 'target price': 'analyst_target_price',
  'analyst rating': 'analyst_rating', 'rating': 'analyst_rating',
  // Other
  'eps': 'diluted_eps_ttm', 'eps ttm': 'diluted_eps_ttm',
  'revenue': 'revenue_ttm', 'sales': 'revenue_ttm', 'revenue ttm': 'revenue_ttm',
  'fcf': 'free_cash_flow', 'free cash flow': 'free_cash_flow',
  'ocf': 'operating_cash_flow', 'operating cash flow': 'operating_cash_flow',
  'net debt': 'net_debt',
  'shares outstanding': 'shares_outstanding', 'shares': 'shares_outstanding',
  'float': 'shares_float', 'shares float': 'shares_float',
  // Technical Indicators
  'rsi': 'rsi_14', 'rsi 14': 'rsi_14', 'rsi14': 'rsi_14', 'relative strength index': 'rsi_14',
  'macd': 'macd', 'macd line': 'macd',
  'macd signal': 'macd_signal', 'signal': 'macd_signal', 'signal line': 'macd_signal',
  'macd divergence': 'macd_divergence', 'divergence': 'macd_divergence',
  'ema': 'ema_20', 'ema 20': 'ema_20', 'ema20': 'ema_20', 'exponential moving average': 'ema_20',
};

// Define related column groups for smart suggestions
const RELATED_COLUMNS: Record<string, string[]> = {
  // Valuation metrics are related
  'pe_ratio': ['forward_pe', 'peg_ratio', 'price_book_mrq', 'price_sales_ttm', 'enterprise_value'],
  'forward_pe': ['pe_ratio', 'peg_ratio', 'analyst_target_price'],
  'peg_ratio': ['pe_ratio', 'forward_pe', 'quarterly_earnings_growth_yoy'],
  'price_book_mrq': ['pe_ratio', 'book_value_per_share', 'return_on_equity_ttm'],
  'price_sales_ttm': ['pe_ratio', 'revenue_ttm', 'revenue_per_share'],
  'ev_ebitda': ['enterprise_value', 'ev_revenue', 'operating_margin_ttm'],
  'enterprise_value': ['market_cap', 'net_debt', 'ev_ebitda'],
  // Profitability metrics
  'return_on_equity_ttm': ['return_on_assets_ttm', 'profit_margin', 'operating_margin_ttm', 'price_book_mrq'],
  'return_on_assets_ttm': ['return_on_equity_ttm', 'profit_margin', 'operating_margin_ttm'],
  'operating_margin_ttm': ['profit_margin', 'return_on_equity_ttm', 'ev_ebitda'],
  'profit_margin': ['operating_margin_ttm', 'return_on_equity_ttm', 'return_on_assets_ttm'],
  // Growth metrics
  'quarterly_revenue_growth_yoy': ['quarterly_earnings_growth_yoy', 'revenue_ttm', 'revenue_per_share'],
  'quarterly_earnings_growth_yoy': ['quarterly_revenue_growth_yoy', 'diluted_eps_ttm', 'peg_ratio'],
  // Dividend metrics
  'dividend_yield': ['payout_ratio', 'dividend_policy', 'free_cash_flow'],
  'payout_ratio': ['dividend_yield', 'free_cash_flow', 'diluted_eps_ttm'],
  // Cash flow metrics
  'free_cash_flow': ['operating_cash_flow', 'dividend_yield', 'payout_ratio'],
  'operating_cash_flow': ['free_cash_flow', 'net_debt'],
  // Size/liquidity metrics
  'market_cap': ['shares_outstanding', 'shares_float', 'enterprise_value'],
  'shares_outstanding': ['shares_float', 'market_cap'],
  'shares_float': ['shares_outstanding', 'market_cap'],
  // Technical Indicators
  'rsi_14': ['macd', 'ema_20', 'day_50_ma', 'day_200_ma'],
  'macd': ['macd_signal', 'macd_divergence', 'rsi_14', 'ema_20'],
  'macd_signal': ['macd', 'macd_divergence'],
  'macd_divergence': ['macd', 'macd_signal'],
  'ema_20': ['day_50_ma', 'day_200_ma', 'rsi_14', 'macd'],
};

// Parse query string to extract fields used in filters
function extractQueryFields(query: string): string[] {
  if (!query) return [];
  const lowerQuery = query.toLowerCase();
  const foundFields = new Set<string>();

  // Sort by length descending to match longer phrases first
  const sortedKeys = Object.keys(QUERY_FIELD_MAP).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    if (lowerQuery.includes(key)) {
      foundFields.add(QUERY_FIELD_MAP[key]);
    }
  }

  // Also check for direct DB field names in the query
  const dbFields = [
    'pe_ratio', 'forward_pe', 'peg_ratio', 'price_book_mrq', 'price_sales_ttm',
    'ev_ebitda', 'ev_revenue', 'enterprise_value', 'market_cap', 'dividend_yield',
    'payout_ratio', 'return_on_equity_ttm', 'return_on_assets_ttm', 'operating_margin_ttm',
    'profit_margin', 'quarterly_revenue_growth_yoy', 'quarterly_earnings_growth_yoy',
    'beta', 'day_50_ma', 'day_200_ma', 'week_52_high', 'week_52_low',
    'rsi_14', 'macd', 'macd_signal', 'macd_divergence', 'ema_20',
    'analyst_target_price', 'analyst_rating', 'diluted_eps_ttm', 'revenue_ttm',
    'free_cash_flow', 'operating_cash_flow', 'net_debt', 'shares_outstanding', 'shares_float',
  ];

  for (const field of dbFields) {
    if (lowerQuery.includes(field.replace(/_/g, ' ')) || lowerQuery.includes(field)) {
      foundFields.add(field);
    }
  }

  return Array.from(foundFields);
}

// Get smart column suggestions: query fields + related secondary columns
function getSmartColumns(queryFields: string[]): string[] {
  const smartCols = new Set<string>(queryFields);

  // Add up to 2 related columns per query field for context
  for (const field of queryFields) {
    const related = RELATED_COLUMNS[field];
    if (related) {
      // Add first 2 related columns that aren't already in the set
      let added = 0;
      for (const rel of related) {
        if (!smartCols.has(rel) && added < 2) {
          smartCols.add(rel);
          added++;
        }
      }
    }
  }

  return Array.from(smartCols);
}

import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { Lock } from "lucide-react";
import { AddToWatchlistButton } from "@/components/company/AddToWatchlistButton";
import { useMetricsPreferences } from "@/hooks/useMetricsPreferences";

export default function ResultsPage() {
  return (
    <TooltipProvider>
      <Suspense fallback={<ResultsPageSkeleton />}>
        <ResultsPageContent />
      </Suspense>
    </TooltipProvider>
  );
}

function ResultsPageSkeleton() {
  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 flex items-center justify-center min-h-[50vh]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand" />
    </div>
  );
}

function ResultsPageContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const query = sp.get("query") || "";
  const sort = sp.get("sort") || "market_capitalization.desc";
  const exchange = sp.get("exchange") || "us";

  // Premium users need more rows per fetch for proper pagination
  const limit = Number(sp.get("limit") || 500);
  const offset = Number(sp.get("offset") || 0);

  const { session, loading: authLoading } = useAuth();
  const { profile } = useProfile(session?.access_token || null);
  const userPlan = profile?.subscription_tier || "free";

  // Tier is fetched from database by backend, not from session metadata
  const [backendTier, setBackendTier] = useState<string | null>(null);
  const isPremium = backendTier === "premium" || backendTier === "elite";

  const [loading, setLoading] = useState<boolean>(false);
  const [streaming, setStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rawRows, setRawRows] = useState<ScreenerRow[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Apply limit for free users
  // Apply limit for free users
  const rows = useMemo(() => {
    return rawRows;
  }, [rawRows]);

  const accessLimit = useMemo(() => {
    // Use backendTier which is fetched from database
    if (backendTier === "premium" || backendTier === "elite") return Infinity;
    if (backendTier === "free") return 7;
    if (!session) return 3; // anonymous
    return 7; // default to free if tier not yet loaded
  }, [session, backendTier]);

  const [source, setSource] = useState<string | undefined>(undefined);
  const [sortKey, setSortKey] = useState<string>("market_cap");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // New state for enhanced features
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Available sectors for filter
  const SECTORS = [
    "Technology",
    "Healthcare",
    "Financial Services",
    "Consumer Cyclical",
    "Communication Services",
    "Industrials",
    "Consumer Defensive",
    "Energy",
    "Basic Materials",
    "Real Estate",
    "Utilities",
  ];

  // Base columns always shown
  const BASE_COLUMNS: string[] = [
    "ticker",
    "code",
    "name",
    "exchange",
    "adjusted_close",
    "market_cap",
  ];

  // Full set of optional columns that can be toggled
  const ALL_OPTIONAL_COLUMNS: string[] = [
    "dividend_yield",
    "dividend_policy",
    // Valuation metrics
    "pe_ratio",
    "forward_pe",
    "peg_ratio",
    "price_book_mrq",
    "price_sales_ttm",
    "ev_ebitda",
    "ev_revenue",
    "enterprise_value",
    // Financial strength
    "net_debt",
    // Earnings & Growth
    "diluted_eps_ttm",
    "revenue_ttm",
    "quarterly_revenue_growth_yoy",
    "quarterly_earnings_growth_yoy",
    "payout_ratio",
    "revenue_per_share",
    "book_value_per_share",
    // Cash Flow
    "free_cash_flow",
    "operating_cash_flow",
    // Technical
    "day_50_ma",
    "day_200_ma",
    "beta",
    "week_52_high",
    "week_52_low",
    // Profitability
    "return_on_equity_ttm",
    "return_on_assets_ttm",
    "operating_margin_ttm",
    "profit_margin",
    // Analyst & Shares
    "analyst_target_price",
    "analyst_rating",
    "shares_outstanding",
    "shares_float",
    // Technical Indicators (from screener_data)
    "rsi_14",
    "macd",
    "macd_signal",
    "macd_divergence",
    "ema_20",
  ];

  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    () => new Set(BASE_COLUMNS)
  );
  const [exporting, setExporting] = useState<string | null>(null);

  const { preferences, isLoaded: metricsPrefsLoaded } = useMetricsPreferences();

  // Initialize columns based on smart column preference
  useEffect(() => {
    if (!metricsPrefsLoaded) return;

    if (preferences.enableSmartScreenerColumns) {
      // Ensure base columns are always visible, keep any user toggles for others
      setVisibleColumns((prev) => {
        const updated = new Set(prev);
        BASE_COLUMNS.forEach((c) => updated.add(c));
        return updated;
      });
    } else {
      // When smart columns are disabled, show full default set
      setVisibleColumns(new Set([...BASE_COLUMNS, ...ALL_OPTIONAL_COLUMNS]));
    }
  }, [metricsPrefsLoaded, preferences.enableSmartScreenerColumns]);

  // Smart column selection: extract fields from query and auto-show them with related columns
  useEffect(() => {
    if (!metricsPrefsLoaded || !preferences.enableSmartScreenerColumns) return;

    const extracted = extractQueryFields(query);
    const smartCols = getSmartColumns(extracted);

    if (smartCols.length > 0) {
      setVisibleColumns((prev) => {
        const updated = new Set(BASE_COLUMNS);
        for (const field of smartCols) {
          updated.add(field);
        }
        return updated;
      });
    }
  }, [query, metricsPrefsLoaded, preferences.enableSmartScreenerColumns]);

  const backendUrl = useMemo(
    () =>
      (process.env.NEXT_PUBLIC_BACKEND_URL as string) ||
      "http://localhost:4000",
    []
  );

  // Number formatters
  const fmt = useMemo(() => new Intl.NumberFormat("en-US"), []);
  const fmtUsd = useCallback(
    (n?: number | null) => (n == null ? "—" : `$${fmt.format(Number(n))}`),
    [fmt]
  );
  // Format percentage values that are already stored as percentages (e.g., 5.2 = 5.2%)
  const fmtPct = useCallback(
    (n?: number | null) => (n == null ? "—" : `${Number(n).toFixed(2)}%`),
    []
  );
  // Note: decimal percentage formatter removed as it's currently unused (lint).
  const fmtCap = useCallback(
    (n?: number) => {
      if (n == null) return "—";
      const abs = Math.abs(n);
      if (abs >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
      if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
      if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
      return `$${fmt.format(n)}`;
    },
    [fmt]
  );

  // Fetch data using streaming endpoint for progressive loading
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const run = async () => {
      if (!query.trim()) return;
      if (authLoading) return; // Wait for auth to resolve before sending request
      setLoading(true);
      setStreaming(true);
      setError(null);
      setRawRows([]);
      setTotalCount(0);

      // Strip redundant outer parentheses to prevent backend parsing issues
      // E.g., "(PE < 25)" -> "PE < 25" (prevents arithmetic node wrapping)
      const cleanedQuery = stripOuterParentheses(query);

      try {
        // Build headers with JWT token if available
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }

        const resp = await fetch(`${backendUrl}/api/stream-query`, {
          method: "POST",
          headers,
          body: JSON.stringify({ query: cleanedQuery, sort, limit, offset, exchange }),
          signal: controller.signal,
        });

        if (!resp.ok) {
          const errorData = await resp.json().catch(() => ({}));
          throw new Error(errorData?.error || `HTTP ${resp.status}`);
        }

        // Process NDJSON stream
        const reader = resp.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!active) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const msg = JSON.parse(line);

              if (msg.type === "meta" && msg.tier) {
                // Capture tier from backend (fetched from database)
                setBackendTier(msg.tier);
              } else if (msg.type === "row" && msg.data) {
                // Add row progressively
                setRawRows((prev) => [...prev, msg.data as ScreenerRow]);
              } else if (msg.type === "done") {
                setTotalCount(msg.totalCount || 0);
                if (msg.tier) setBackendTier(msg.tier);
                setStreaming(false);
              } else if (msg.type === "error") {
                throw new Error(msg.error);
              }
            } catch {
              console.warn("Failed to parse stream line:", line);
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim() && active) {
          try {
            const msg = JSON.parse(buffer);
            if (msg.type === "done") {
              setTotalCount(msg.totalCount || 0);
            }
          } catch {
            // Ignore parse errors on final buffer
          }
        }

      } catch (e: unknown) {
        const err = e as Error;
        if (err.name === "AbortError") return;
        if (!active) return;
        setError(err?.message || "Failed to fetch results");
        setRawRows([]);
        setSource(undefined);
        setShowPaywall(false);
      } finally {
        if (active) {
          setLoading(false);
          setStreaming(false);
        }
      }
    };

    run();
    return () => {
      active = false;
      controller.abort();
    };
  }, [backendUrl, query, sort, limit, offset, exchange, session?.access_token, authLoading]);

  // Sort rows
  // Backend already limits rows based on tier, so just use all rows
  // The accessLimit is only used for UI display (paywall banner, etc.)
  const accessibleRows = useMemo(() => {
    return rows;
  }, [rows]);

  const sortedRows = useMemo(() => {
    if (!sortKey) return accessibleRows;
    return [...accessibleRows].sort((a, b) => {
      const aVal = a[sortKey as keyof ScreenerRow];
      const bVal = b[sortKey as keyof ScreenerRow];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [accessibleRows, sortKey, sortDir]);

  // Filter rows based on search and sector
  // Filtering also constrained to accessible rows for free users
  const filteredRows = useMemo(() => {
    let result = sortedRows;

    // Apply sector filter
    if (selectedSector) {
      result = result.filter((row) => {
        const rowSector = (row as Record<string, unknown>).sector as string | undefined;
        return rowSector?.toLowerCase() === selectedSector.toLowerCase();
      });
    }

    // Apply search filter
    if (debouncedSearch.trim()) {
      const term = debouncedSearch.toLowerCase();
      result = result.filter((row) => {
        const searchableFields = [
          row.code,
          row.name,
          row.exchange,
          row.market_capitalization?.toString(),
          row.adjusted_close?.toString(),
          row.dividend_yield?.toString(),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableFields.includes(term);
      });
    }

    return result;
  }, [sortedRows, debouncedSearch, selectedSector]);

  // Paginate filtered rows for display (client-side pagination)
  const paginatedRows = useMemo(() => {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    return filteredRows.slice(start, end);
  }, [filteredRows, currentPage, pageSize]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredRows.length / pageSize);
  }, [filteredRows.length, pageSize]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, selectedSector, pageSize]);

  const toggleSort = useCallback((key: string) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortDir("desc");
      return key;
    });
  }, []);

  // Client-side pagination used instead of URL-based navigation

  // Export functionality with multiple formats
  const exportData = useCallback(
    async (format: "csv" | "json" | "excel" | "pdf") => {
      if (!isPremium) {
        setPaywallFeature("Export Results");
        setShowPaywall(true);
        return;
      }

      if (filteredRows.length === 0) return;

      // Export all filtered rows (remove paywall limit for export)
      const rowsToExport = filteredRows;
      const timestamp = new Date().toISOString().split("T")[0];
      setExporting(format);

      // Column definitions with labels and formatters
      const columnDefs: {
        key: keyof ScreenerRow;
        label: string;
        format: (val: unknown) => string | number;
      }[] = [
          { key: "code", label: "Code", format: (v) => String(v ?? "") },
          { key: "name", label: "Name", format: (v) => String(v ?? "") },
          { key: "exchange", label: "Exchange", format: (v) => String(v ?? "") },
          {
            key: "adjusted_close",
            label: "Price",
            format: (v) => (v != null ? Number(v).toFixed(2) : ""),
          },
          {
            key: "market_cap",
            label: "Market Cap",
            format: (v) => {
              if (v == null) return "";
              const n = Number(v);
              if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
              if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
              if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
              return `$${n.toFixed(0)}`;
            },
          },
          {
            key: "dividend_yield",
            label: "Div Yield",
            format: (v) => (v != null ? `${(Number(v) * 100).toFixed(2)}%` : ""),
          },
          {
            key: "analyst_target_price",
            label: "Analyst Tgt",
            format: (v) => (v != null ? `$${Number(v).toFixed(2)}` : ""),
          },
          {
            key: "analyst_rating",
            label: "Rating",
            format: (v) => (v != null ? String(v) : ""),
          },
          {
            key: "quarterly_revenue_growth_yoy",
            label: "Rev Growth",
            format: (v) => (v != null ? `${(Number(v) * 100).toFixed(2)}%` : ""),
          },
          {
            key: "quarterly_earnings_growth_yoy",
            label: "EPS Growth",
            format: (v) => (v != null ? `${(Number(v) * 100).toFixed(2)}%` : ""),
          },
          {
            key: "pe_ratio",
            label: "P/E",
            format: (v) => (v != null ? Number(v).toFixed(2) : ""),
          },
          {
            key: "forward_pe",
            label: "Fwd P/E",
            format: (v) => (v != null ? Number(v).toFixed(2) : ""),
          },
          {
            key: "peg_ratio",
            label: "PEG",
            format: (v) => (v != null ? Number(v).toFixed(2) : ""),
          },
          {
            key: "price_book_mrq",
            label: "P/B",
            format: (v) => (v != null ? Number(v).toFixed(2) : ""),
          },
          {
            key: "price_sales_ttm",
            label: "P/S",
            format: (v) => (v != null ? Number(v).toFixed(2) : ""),
          },
          {
            key: "ev_ebitda",
            label: "EV/EBITDA",
            format: (v) => (v != null ? Number(v).toFixed(2) : ""),
          },
          {
            key: "enterprise_value",
            label: "Ent Value",
            format: (v) => {
              if (v == null) return "";
              const n = Number(v);
              if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
              if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
              if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
              return `$${n.toFixed(0)}`;
            },
          },
          {
            key: "payout_ratio",
            label: "Payout",
            format: (v) => (v != null ? `${(Number(v) * 100).toFixed(2)}%` : ""),
          },
          {
            key: "revenue_per_share",
            label: "Rev/Share",
            format: (v) => (v != null ? `$${Number(v).toFixed(2)}` : ""),
          },
          {
            key: "book_value_per_share",
            label: "BV/Share",
            format: (v) => (v != null ? `$${Number(v).toFixed(2)}` : ""),
          },
          {
            key: "shares_float",
            label: "Float",
            format: (v) => {
              if (v == null) return "";
              const n = Number(v);
              if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
              if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
              return fmt.format(n);
            },
          },
          {
            key: "net_debt",
            label: "Net Debt",
            format: (v) => {
              if (v == null) return "";
              const n = Number(v);
              if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
              if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
              if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
              return `$${n.toFixed(0)}`;
            },
          },
          {
            key: "free_cash_flow",
            label: "FCF",
            format: (v) => {
              if (v == null) return "";
              const n = Number(v);
              if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
              if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
              if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
              return `$${n.toFixed(0)}`;
            },
          },
          {
            key: "operating_cash_flow",
            label: "OCF",
            format: (v) => {
              if (v == null) return "";
              const n = Number(v);
              if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
              if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
              if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
              return `$${n.toFixed(0)}`;
            },
          },
          {
            key: "diluted_eps_ttm",
            label: "EPS (TTM)",
            format: (v) => (v != null ? `$${Number(v).toFixed(2)}` : ""),
          },
          {
            key: "revenue_ttm",
            label: "Sales (TTM)",
            format: (v) => {
              if (v == null) return "";
              const n = Number(v);
              if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
              if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
              if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
              return `$${n.toFixed(0)}`;
            },
          },
          {
            key: "return_on_equity_ttm",
            label: "ROE",
            format: (v) => (v != null ? `${(Number(v) * 100).toFixed(2)}%` : ""),
          },
          {
            key: "day_50_ma",
            label: "SMA50",
            format: (v) => (v != null ? Number(v).toFixed(2) : ""),
          },
          {
            key: "day_200_ma",
            label: "SMA200",
            format: (v) => (v != null ? Number(v).toFixed(2) : ""),
          },
          {
            key: "rsi_14",
            label: "RSI",
            format: (v) => (v != null ? Number(v).toFixed(2) : ""),
          },
          {
            key: "macd",
            label: "MACD",
            format: (v) => (v != null ? Number(v).toFixed(4) : ""),
          },
          {
            key: "macd_signal",
            label: "Signal",
            format: (v) => (v != null ? Number(v).toFixed(4) : ""),
          },
          {
            key: "macd_divergence",
            label: "Divergence",
            format: (v) => (v != null ? Number(v).toFixed(4) : ""),
          },
          {
            key: "ema_20",
            label: "EMA20",
            format: (v) => (v != null ? Number(v).toFixed(2) : ""),
          },
        ];

      // Filter to only visible columns
      const exportColumns = columnDefs.filter((col) =>
        visibleColumns.has(col.key as string)
      );

      try {
        switch (format) {
          case "csv": {
            const headers = exportColumns.map((c) => c.label);
            const csvRows = [
              headers.join(","),
              ...rowsToExport.map((r) =>
                exportColumns
                  .map((col) => {
                    const val = col.format(r[col.key]);
                    // Escape quotes and wrap in quotes if contains comma
                    const strVal = String(val);
                    if (
                      strVal.includes(",") ||
                      strVal.includes('"') ||
                      strVal.includes("\n")
                    ) {
                      return `"${strVal.replace(/"/g, '""')}"`;
                    }
                    return strVal;
                  })
                  .join(",")
              ),
            ];
            const csvBlob = new Blob([csvRows.join("\n")], {
              type: "text/csv;charset=utf-8;",
            });
            downloadFile(csvBlob, `screener-results-${timestamp}.csv`);
            break;
          }

          case "json": {
            const jsonData = rowsToExport.map((r) => {
              const obj: Record<string, unknown> = {};
              exportColumns.forEach((col) => {
                obj[col.key] = r[col.key] ?? null;
              });
              return obj;
            });
            const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], {
              type: "application/json",
            });
            downloadFile(jsonBlob, `screener-results-${timestamp}.json`);
            break;
          }

          case "excel": {
            const ExcelJS = await import("exceljs");
            const { saveAs } = await import("file-saver");

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Screener Results");

            // Add headers
            const headers = exportColumns.map(col => col.label);
            worksheet.addRow(headers);

            // Add data rows
            rowsToExport.forEach(row => {
              const rowData = exportColumns.map(col => {
                const raw = row[col.key];
                // For number fields, try to keep as number for Excel aggregation
                const val = col.format(raw);
                if (
                  typeof raw === 'number' &&
                  (String(col.key).includes('market_cap') ||
                    String(col.key).includes('price') ||
                    col.key !== 'code')
                ) {
                  // Use the formatted string for consistency
                  return val;
                }
                return val;
              });
              worksheet.addRow(rowData);
            });

            // Styling: Bold header
            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true };

            // Auto column widths
            worksheet.columns.forEach((column, i) => {
              const colDef = exportColumns[i];
              const maxLen = Math.max(
                colDef.label.length,
                ...rowsToExport.map(
                  (r) => String(colDef.format(r[colDef.key])).length
                )
              );
              column.width = Math.min(maxLen + 2, 30);
            });

            // Write and save
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            saveAs(blob, `screener-results-${timestamp}.xlsx`);
            break;
          }

          case "pdf": {
            const doc = new jsPDF({
              orientation: "landscape",
              unit: "mm",
              format: "a4",
            });

            // Title
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("Stock Screener Results", 14, 15);

            // Subtitle with query
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100);
            const queryText =
              query.length > 100 ? query.substring(0, 100) + "..." : query;
            doc.text(`Query: ${queryText}`, 14, 22);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 27);
            doc.setTextColor(0);

            // Select key columns for PDF (limited space)
            const pdfColumns = exportColumns.slice(0, 12); // First 12 visible columns

            // Table settings
            const startY = 35;
            const rowHeight = 7;
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 10;
            const tableWidth = pageWidth - margin * 2;
            const colWidth = tableWidth / pdfColumns.length;

            // Draw header
            doc.setFillColor(51, 65, 85); // slate-700
            doc.rect(margin, startY, tableWidth, rowHeight, "F");
            doc.setTextColor(255);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");

            pdfColumns.forEach((col, i) => {
              const x = margin + i * colWidth + 2;
              doc.text(col.label, x, startY + 5, { maxWidth: colWidth - 4 });
            });

            // Draw rows
            doc.setTextColor(0);
            doc.setFont("helvetica", "normal");
            let yPos = startY + rowHeight;

            rowsToExport.forEach((row, rowIndex) => {
              // Check if we need a new page
              if (yPos + rowHeight > doc.internal.pageSize.getHeight() - 10) {
                doc.addPage();
                yPos = 15;

                // Redraw header on new page
                doc.setFillColor(51, 65, 85);
                doc.rect(margin, yPos, tableWidth, rowHeight, "F");
                doc.setTextColor(255);
                doc.setFont("helvetica", "bold");
                pdfColumns.forEach((col, i) => {
                  const x = margin + i * colWidth + 2;
                  doc.text(col.label, x, yPos + 5, { maxWidth: colWidth - 4 });
                });
                doc.setTextColor(0);
                doc.setFont("helvetica", "normal");
                yPos += rowHeight;
              }

              // Alternate row colors
              if (rowIndex % 2 === 0) {
                doc.setFillColor(248, 250, 252); // slate-50
                doc.rect(margin, yPos, tableWidth, rowHeight, "F");
              }

              // Draw cell values
              pdfColumns.forEach((col, i) => {
                const x = margin + i * colWidth + 2;
                const val = String(col.format(row[col.key]));
                doc.text(val, x, yPos + 5, { maxWidth: colWidth - 4 });
              });

              yPos += rowHeight;
            });

            // Footer
            const pageCount = doc.internal.pages.length - 1;
            doc.setFontSize(8);
            doc.setTextColor(150);
            for (let i = 1; i <= pageCount; i++) {
              doc.setPage(i);
              doc.text(
                `Page ${i} of ${pageCount}`,
                pageWidth - margin - 25,
                doc.internal.pageSize.getHeight() - 5
              );
            }

            doc.save(`screener-results-${timestamp}.pdf`);
            break;
          }
        }
      } finally {
        setTimeout(() => setExporting(null), 1000);
      }
    },
    [filteredRows, visibleColumns, query]
  );

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleColumn = useCallback((column: string) => {
    setVisibleColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(column)) {
        newSet.delete(column);
      } else {
        newSet.add(column);
      }
      return newSet;
    });
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  const SortIcon = ({ column }: { column: string }) => {
    if (sortKey !== column)
      return (
        <ArrowUpDown className="w-3.5 h-3.5 ml-1.5 inline opacity-40 transition-opacity" />
      );
    return sortDir === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 ml-1.5 inline text-slate-900 dark:text-slate-100 animate-pulse" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 ml-1.5 inline text-slate-900 dark:text-slate-100 animate-pulse" />
    );
  };

  // Calculate visible row counts - backend already limits rows based on tier
  const visibleAccessibleCount = filteredRows.length;
  const visibleRestrictedCount = Math.max(0, totalCount - filteredRows.length);

  const rowsToRender = useMemo(() => {
    // Backend already limits rows based on tier, just render all paginated rows
    return paginatedRows;
  }, [paginatedRows]);

  // Number of skeleton rows to show during streaming
  const skeletonRows = useMemo(() => {
    if (!streaming) return 0;
    // Show skeleton rows to fill up to expected count
    const expected = Math.min(pageSize, 10);
    return Math.max(0, expected - rawRows.length);
  }, [streaming, pageSize, rawRows.length]);

  useEffect(() => {
    // Premium/Elite users never see paywall (they can paginate through all results)
    if (backendTier === 'premium' || backendTier === 'elite') {
      setShowPaywall(false);
      return;
    }

    // Show paywall if backend limited results due to tier (not pagination)
    // For free users: backend sends max 7 rows even if totalCount is higher
    // For anonymous: backend sends max 3 rows
    const isTierLimited =
      !streaming &&
      totalCount > 0 &&
      rawRows.length > 0 &&
      totalCount > rawRows.length &&
      backendTier !== 'premium' &&
      backendTier !== 'elite';

    if (isTierLimited) {
      if (!paywallFeature) {
        setPaywallFeature("See all screener results");
      }
      setShowPaywall(true);
    } else {
      setShowPaywall(false);
    }
  }, [streaming, totalCount, rawRows.length, paywallFeature, backendTier]);

  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="w-full max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 space-y-4">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/screens?tab=builder")}
                size="sm"
                className="shrink-0"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
                    Screener Results
                  </h1>
                  {metricsPrefsLoaded && preferences.enableSmartScreenerColumns && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-full border border-amber-300 bg-amber-50/60 dark:bg-amber-950/20 px-1.5 py-0.5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors text-[11px] leading-none"
                          aria-label="Smart columns are enabled"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Smart
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">
                          <span className="font-semibold">✨ Smart columns enabled:</span> The table prioritizes metrics used in your screener query.
                          You can change this in <span className="font-semibold">Settings → Key Metrics</span>.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-muted-foreground mt-0.5">
                  <span className="font-medium">Query:</span>{" "}
                  <span className="text-muted-foreground break-all">{query}</span>
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="w-full md:w-auto flex items-center gap-2">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <Input
                  placeholder="Search results..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-slate-400 dark:focus:ring-slate-500 dark:text-slate-100"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={clearSearch}
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-slate-600" />
                  </Button>
                )}
              </div>

              {/* Sector Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Building2 className="w-4 h-4 mr-1" />
                    {selectedSector || "Sector"}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => setSelectedSector("")}
                    className={!selectedSector ? "bg-slate-100 dark:bg-slate-700" : ""}
                  >
                    All Sectors
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {SECTORS.map((sector) => (
                    <DropdownMenuItem
                      key={sector}
                      onClick={() => setSelectedSector(sector)}
                      className={selectedSector === sector ? "bg-slate-100 dark:bg-slate-700" : ""}
                    >
                      {sector}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Column Visibility - stays open on toggle */}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-1" /> Columns
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 max-h-80 overflow-y-auto">
                  {[
                    { key: "code", label: "Code" },
                    { key: "name", label: "Name" },
                    { key: "exchange", label: "Exchange" },
                    { key: "adjusted_close", label: "Price" },
                    { key: "market_cap", label: "Market Cap" },
                    { key: "dividend_yield", label: "Div Yield" },
                    { key: "dividend_policy", label: "Div Policy" },
                    { key: "pe_ratio", label: "P/E" },
                    { key: "forward_pe", label: "Fwd P/E" },
                    { key: "peg_ratio", label: "PEG" },
                    { key: "price_book_mrq", label: "P/B" },
                    { key: "price_sales_ttm", label: "P/S" },
                    { key: "ev_ebitda", label: "EV/EBITDA" },
                    { key: "ev_revenue", label: "EV/Revenue" },
                    { key: "enterprise_value", label: "Ent Value" },
                    { key: "return_on_equity_ttm", label: "ROE" },
                    { key: "return_on_assets_ttm", label: "ROA" },
                    { key: "operating_margin_ttm", label: "OPM" },
                    { key: "profit_margin", label: "Profit Margin" },
                    { key: "payout_ratio", label: "Payout" },
                    { key: "revenue_per_share", label: "Rev/Share" },
                    { key: "book_value_per_share", label: "BV/Share" },
                    { key: "net_debt", label: "Net Debt" },
                    { key: "free_cash_flow", label: "FCF" },
                    { key: "operating_cash_flow", label: "OCF" },
                    { key: "diluted_eps_ttm", label: "EPS (TTM)" },
                    { key: "revenue_ttm", label: "Sales (TTM)" },
                    { key: "quarterly_revenue_growth_yoy", label: "Rev Growth" },
                    { key: "quarterly_earnings_growth_yoy", label: "EPS Growth" },
                    { key: "analyst_target_price", label: "Analyst Tgt" },
                    { key: "analyst_rating", label: "Rating" },
                    { key: "shares_outstanding", label: "Shares" },
                    { key: "shares_float", label: "Float" },
                    { key: "day_50_ma", label: "SMA50" },
                    { key: "day_200_ma", label: "SMA200" },
                    { key: "beta", label: "Beta" },
                    { key: "week_52_high", label: "52W High" },
                    { key: "week_52_low", label: "52W Low" },
                    // Technical Indicators
                    { key: "rsi_14", label: "RSI" },
                    { key: "macd", label: "MACD" },
                    { key: "macd_signal", label: "MACD Signal" },
                    { key: "macd_divergence", label: "Divergence" },
                    { key: "ema_20", label: "EMA 20" },
                  ].map((col) => (
                    <DropdownMenuItem
                      key={col.key}
                      className="flex items-center justify-between"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Label
                        htmlFor={`col-${col.key}`}
                        className="cursor-pointer flex-1"
                      >
                        {col.label}
                      </Label>
                      <Switch
                        id={`col-${col.key}`}
                        checked={visibleColumns.has(col.key)}
                        onCheckedChange={() => toggleColumn(col.key)}
                      />
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Paywall Banner */}
          {showPaywall && (
            <div className="relative overflow-hidden rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-4">
              <div className="absolute inset-y-0 left-0 w-1 bg-amber-500" />
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      Viewing {visibleAccessibleCount} of {totalCount > 0 ? totalCount : filteredRows.length}{" "}
                      results
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Upgrade your account to <span className="font-semibold">Premium</span> to unlock full historical data,
                      exports, and advanced analytics.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-semibold shadow-sm"
                >
                  <Shield className="w-4 h-4 mr-1.5" /> Upgrade account
                </Button>
              </div>
            </div>
          )}

          {/* Results Card */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900 overflow-visible w-full">
            <CardHeader className="py-3 px-4 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
                      <span className="text-slate-600 dark:text-muted-foreground">
                        Loading results...
                      </span>
                    </span>
                  ) : (
                    <>
                      <span className="text-slate-900 dark:text-slate-100">
                        Results
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                      >
                        {filteredRows.length} of {totalCount > 0 ? totalCount : filteredRows.length}{" "}
                        {totalCount === 1 ? "match" : "matches"}
                      </Badge>
                      {streaming && (
                        <div className="flex items-center gap-1.5 text-sm text-brand animate-pulse">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Loading...</span>
                        </div>
                      )}
                      {searchTerm && (
                        <Badge
                          variant="outline"
                          className="border-slate-300 dark:border-slate-600 text-slate-600 dark:text-muted-foreground"
                        >
                          {visibleAccessibleCount} visible
                        </Badge>
                      )}
                    </>
                  )}
                </CardTitle>

                {/* Export Menu */}
                {!loading && filteredRows.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={exporting !== null}
                      >
                        {exporting ? (
                          <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 mr-1.5" />
                        )}
                        Export
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => exportData("csv")}>
                        <span className="text-emerald-600 font-mono text-xs mr-2">
                          CSV
                        </span>
                        Spreadsheet
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportData("json")}>
                        <span className="text-blue-600 font-mono text-xs mr-2">
                          JSON
                        </span>
                        Data File
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => exportData("excel")}>
                        <span className="text-green-600 font-mono text-xs mr-2">
                          XLSX
                        </span>
                        Excel Workbook
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportData("pdf")}>
                        <span className="text-red-600 font-mono text-xs mr-2">
                          PDF
                        </span>
                        Document
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Error State */}
              {error && (
                <div className="m-4 p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 text-red-800 text-sm flex items-start gap-3">
                  <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">Failed to load results</p>
                    <p className="text-red-700">{error}</p>
                    <p className="text-xs text-red-600 mt-2 font-mono bg-red-50 p-2 rounded">
                      API: {source}
                    </p>
                  </div>
                </div>
              )}

              {/* Loading Table Skeleton */}
              {loading && (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="flex items-center gap-3 p-4 animate-pulse"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                      <div className="h-4 flex-1 bg-slate-200 dark:bg-slate-700 rounded" />
                      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                      <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                      <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && filteredRows.length === 0 && (
                <div className="p-12 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-muted-foreground/60" />
                  </div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {searchTerm ? "No matches found" : "No results found"}
                  </p>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "Try adjusting your filters or search criteria"}
                  </p>
                  {source && (
                    <div className="text-xs text-muted-foreground/80 break-all font-mono bg-slate-50 dark:bg-slate-800 p-3 rounded max-w-2xl mx-auto">
                      API Request: {source}
                    </div>
                  )}
                </div>
              )}

              {/* Results Table */}
              {!loading && !error && filteredRows.length > 0 && (
                <div className="relative w-full">
                  <div className="overflow-x-auto max-h-[75vh]">
                    <table className="w-full text-sm relative border-collapse min-w-[1200px]">
                      <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b-2 border-slate-200 dark:border-slate-700 shadow-sm">
                        <tr>
                          {visibleColumns.has("code") && (
                            <th
                              className="text-left px-4 py-3 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider w-24"
                              onClick={() => toggleSort("code")}
                            >
                              <div className="flex items-center">
                                Code <SortIcon column="code" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("name") && (
                            <th
                              className="text-left px-4 py-3 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider min-w-[200px]"
                              onClick={() => toggleSort("name")}
                            >
                              <div className="flex items-center">
                                Name <SortIcon column="name" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("exchange") && (
                            <th
                              className="text-center px-4 py-3 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider w-24"
                              onClick={() => toggleSort("exchange")}
                            >
                              <div className="flex items-center justify-center">
                                Exchange <SortIcon column="exchange" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("adjusted_close") && (
                            <th
                              className="text-right px-4 py-3 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("adjusted_close")}
                            >
                              <div className="flex items-center justify-end">
                                Price <SortIcon column="adjusted_close" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("market_cap") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("market_cap")}
                            >
                              <div className="flex items-center justify-end">
                                Market Cap{" "}
                                <SortIcon column="market_cap" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("shares_outstanding") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("shares_outstanding")}
                            >
                              <div className="flex items-center justify-end">
                                Shares <SortIcon column="shares_outstanding" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("shares_float") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("shares_float")}
                            >
                              <div className="flex items-center justify-end">
                                Float <SortIcon column="shares_float" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("dividend_yield") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("dividend_yield")}
                            >
                              <div className="flex items-center justify-end">
                                Div Yield <SortIcon column="dividend_yield" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("dividend_policy") && (
                            <th
                              className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider"
                            >
                              Div Policy
                            </th>
                          )}
                          {visibleColumns.has("pe_ratio") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("pe_ratio")}
                            >
                              <div className="flex items-center justify-end">
                                P/E <SortIcon column="pe_ratio" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("forward_pe") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("forward_pe")}
                            >
                              <div className="flex items-center justify-end">
                                Fwd P/E <SortIcon column="forward_pe" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("peg_ratio") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("peg_ratio")}
                            >
                              <div className="flex items-center justify-end">
                                PEG <SortIcon column="peg_ratio" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("price_book_mrq") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("price_book_mrq")}
                            >
                              <div className="flex items-center justify-end">
                                P/B <SortIcon column="price_book_mrq" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("price_sales_ttm") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("price_sales_ttm")}
                            >
                              <div className="flex items-center justify-end">
                                P/S <SortIcon column="price_sales_ttm" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("ev_ebitda") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("ev_ebitda")}
                            >
                              <div className="flex items-center justify-end">
                                EV/EBITDA <SortIcon column="ev_ebitda" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("enterprise_value") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("enterprise_value")}
                            >
                              <div className="flex items-center justify-end">
                                Ent Value <SortIcon column="enterprise_value" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("diluted_eps_ttm") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("diluted_eps_ttm")}
                            >
                              <div className="flex items-center justify-end">
                                EPS (TTM) <SortIcon column="diluted_eps_ttm" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("net_debt") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("net_debt")}
                            >
                              <div className="flex items-center justify-end">
                                Net Debt <SortIcon column="net_debt" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("payout_ratio") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("payout_ratio")}
                            >
                              <div className="flex items-center justify-end">
                                Payout <SortIcon column="payout_ratio" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("return_on_equity_ttm") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("return_on_equity_ttm")}
                            >
                              <div className="flex items-center justify-end">
                                ROE <SortIcon column="return_on_equity_ttm" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("return_on_assets_ttm") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("return_on_assets_ttm")}
                            >
                              <div className="flex items-center justify-end">
                                ROA <SortIcon column="return_on_assets_ttm" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("operating_margin_ttm") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("operating_margin_ttm")}
                            >
                              <div className="flex items-center justify-end">
                                OPM <SortIcon column="operating_margin_ttm" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("profit_margin") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("profit_margin")}
                            >
                              <div className="flex items-center justify-end">
                                Margin <SortIcon column="profit_margin" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("revenue_per_share") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("revenue_per_share")}
                            >
                              <div className="flex items-center justify-end">
                                Rev/Share <SortIcon column="revenue_per_share" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("book_value_per_share") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("book_value_per_share")}
                            >
                              <div className="flex items-center justify-end">
                                BV/Share <SortIcon column="book_value_per_share" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("free_cash_flow") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("free_cash_flow")}
                            >
                              <div className="flex items-center justify-end">
                                FCF <SortIcon column="free_cash_flow" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("operating_cash_flow") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("operating_cash_flow")}
                            >
                              <div className="flex items-center justify-end">
                                OCF <SortIcon column="operating_cash_flow" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("quarterly_revenue_growth_yoy") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("quarterly_revenue_growth_yoy")}
                            >
                              <div className="flex items-center justify-end">
                                Rev Growth <SortIcon column="quarterly_revenue_growth_yoy" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("quarterly_earnings_growth_yoy") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("quarterly_earnings_growth_yoy")}
                            >
                              <div className="flex items-center justify-end">
                                EPS Growth <SortIcon column="quarterly_earnings_growth_yoy" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("analyst_target_price") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("analyst_target_price")}
                            >
                              <div className="flex items-center justify-end">
                                Target <SortIcon column="analyst_target_price" />
                              </div>
                            </th>
                          )}

                          {visibleColumns.has("analyst_rating") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("analyst_rating")}
                            >
                              Rating <SortIcon column="analyst_rating" />
                            </th>
                          )}
                          {visibleColumns.has("day_50_ma") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("day_50_ma")}
                            >
                              <div className="flex items-center justify-end">
                                SMA50 <SortIcon column="day_50_ma" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("day_200_ma") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("day_200_ma")}
                            >
                              <div className="flex items-center justify-end">
                                SMA200 <SortIcon column="day_200_ma" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("beta") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("beta")}
                            >
                              <div className="flex items-center justify-end">
                                Beta <SortIcon column="beta" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("rsi_14") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("rsi_14")}
                            >
                              <div className="flex items-center justify-end">
                                RSI <SortIcon column="rsi_14" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("macd") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("macd")}
                            >
                              <div className="flex items-center justify-end">
                                MACD <SortIcon column="macd" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("macd_signal") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("macd_signal")}
                            >
                              <div className="flex items-center justify-end">
                                Signal <SortIcon column="macd_signal" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("macd_divergence") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("macd_divergence")}
                            >
                              <div className="flex items-center justify-end">
                                Divergence <SortIcon column="macd_divergence" />
                              </div>
                            </th>
                          )}
                          {visibleColumns.has("ema_20") && (
                            <th
                              className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                              onClick={() => toggleSort("ema_20")}
                            >
                              <div className="flex items-center justify-end">
                                EMA20 <SortIcon column="ema_20" />
                              </div>
                            </th>
                          )}
                          <th className="sticky right-0 bg-slate-100 dark:bg-slate-800 px-2 py-3.5 text-xs uppercase tracking-wider font-semibold text-center w-10 border-l border-slate-200 dark:border-slate-700" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 relative">
                        {/* Skeleton loading rows during streaming */}
                        {streaming && skeletonRows > 0 && Array.from({ length: skeletonRows }).map((_, idx) => (
                          <tr key={`skeleton-${idx}`} className="animate-pulse">
                            {visibleColumns.has("code") && (
                              <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" /></td>
                            )}
                            {visibleColumns.has("name") && (
                              <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" /></td>
                            )}
                            {visibleColumns.has("exchange") && (
                              <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12 mx-auto" /></td>
                            )}
                            {visibleColumns.has("adjusted_close") && (
                              <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 ml-auto" /></td>
                            )}
                            {visibleColumns.has("market_cap") && (
                              <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 ml-auto" /></td>
                            )}
                            {visibleColumns.has("dividend_yield") && (
                              <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12 ml-auto" /></td>
                            )}
                            {visibleColumns.has("pe_ratio") && (
                              <td className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12 ml-auto" /></td>
                            )}
                          </tr>
                        ))}
                        {rowsToRender.map((r, rowIndex) => {
                          const isAccessible = rowIndex < accessLimit;
                          const isEven = rowIndex % 2 === 0;
                          const shouldShowAdAfter = (rowIndex + 1) % 5 === 0 && rowIndex < accessLimit;

                          return (
                            <React.Fragment key={`${r.code}-${rowIndex}`}>
                              <tr
                                className={`
                                transition-all duration-150 group
                                ${isAccessible
                                    ? `${isEven
                                      ? "bg-white dark:bg-slate-900"
                                      : "bg-slate-50/50 dark:bg-slate-800/30"
                                    } hover:bg-blue-100/70 dark:hover:bg-slate-700 hover:shadow-sm cursor-pointer`
                                    : "filter blur-sm select-none pointer-events-none opacity-50 bg-slate-100/30 dark:bg-slate-800/30"
                                  }
                              `}
                                onClick={() => {
                                  if (isAccessible && r.code) {
                                    router.push(`/company/${r.code}`);
                                  }
                                }}
                              >
                              {visibleColumns.has("code") && (
                                <td className="px-4 py-3 font-mono text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                  {r.code || "—"}
                                </td>
                              )}
                              {visibleColumns.has("name") && (
                                <td className="px-4 py-3 text-slate-800 dark:text-slate-200 max-w-xs font-medium">
                                  <Tooltip>
                                    <TooltipTrigger className="text-left w-full truncate">
                                      {r.name || "—"}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="max-w-sm">{r.name}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </td>
                              )}
                              {visibleColumns.has("exchange") && (
                                <td className="px-4 py-3 text-center">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                    {r.exchange || "—"}
                                  </span>
                                </td>
                              )}
                              {visibleColumns.has("adjusted_close") && (
                                <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                                  {fmtUsd(r.adjusted_close)}
                                </td>
                              )}
                              {visibleColumns.has("market_cap") && (
                                <td className="px-4 py-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                                  {fmtCap(r.market_cap)}
                                </td>
                              )}
                              {visibleColumns.has("shares_outstanding") && (
                                <td className="px-4 py-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                                  {fmtCap(r.shares_outstanding)}
                                </td>
                              )}
                              {visibleColumns.has("shares_float") && (
                                <td className="px-4 py-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                                  {fmtCap(r.shares_float)}
                                </td>
                              )}
                              {visibleColumns.has("dividend_yield") && (
                                <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-muted-foreground tabular-nums">
                                  {r.dividend_yield != null
                                    ? `${(r.dividend_yield * 100).toFixed(2)}%`
                                    : "—"}
                                </td>
                              )}
                              {visibleColumns.has("dividend_policy") && (
                                <td className="px-4 py-3 text-left text-xs text-slate-600 dark:text-slate-400">
                                  {r.dividend_policy && typeof r.dividend_policy === "object" && "label" in r.dividend_policy
                                    ? (r.dividend_policy as { label: string }).label
                                    : "—"}
                                </td>
                              )}
                              {/* P/E Ratio */}
                              {visibleColumns.has("pe_ratio") && (
                                <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                                  {r.pe_ratio != null && Number(r.pe_ratio) > 0
                                    ? r.pe_ratio.toFixed(2)
                                    : "—"}
                                </td>
                              )}
                              {/* Forward P/E */}
                              {visibleColumns.has("forward_pe") && (
                                <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                                  {r.forward_pe != null
                                    ? r.forward_pe.toFixed(2)
                                    : "—"}
                                </td>
                              )}
                              {/* PEG */}
                              {visibleColumns.has("peg_ratio") && (
                                <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                                  {r.peg_ratio != null ? r.peg_ratio.toFixed(2) : "—"}
                                </td>
                              )}
                              {/* P/B */}
                              {visibleColumns.has("price_book_mrq") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums font-mono">
                                  {r.price_book_mrq != null ? r.price_book_mrq.toFixed(2) : "—"}
                                </td>
                              )}
                              {/* P/S */}
                              {visibleColumns.has("price_sales_ttm") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums font-mono">
                                  {r.price_sales_ttm != null
                                    ? r.price_sales_ttm.toFixed(2)
                                    : "—"}
                                </td>
                              )}
                              {/* EV/EBITDA */}
                              {visibleColumns.has("ev_ebitda") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums font-mono">
                                  {r.ev_ebitda != null
                                    ? r.ev_ebitda.toFixed(2)
                                    : "—"}
                                </td>
                              )}
                              {/* Enterprise Value */}
                              {visibleColumns.has("enterprise_value") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums font-mono">
                                  {fmtCap(r.enterprise_value)}
                                </td>
                              )}
                              {/* EPS (TTM) / Diluted */}
                              {visibleColumns.has("diluted_eps_ttm") && (
                                <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                                  {r.diluted_eps_ttm != null
                                    ? `$${r.diluted_eps_ttm.toFixed(2)}`
                                    : "—"}
                                </td>
                              )}
                              {/* Net Debt */}
                              {visibleColumns.has("net_debt") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums font-mono">
                                  {fmtCap(r.net_debt)}
                                </td>
                              )}
                              {/* Payout */}
                              {visibleColumns.has("payout_ratio") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums font-mono">
                                  {r.payout_ratio != null
                                    ? `${(Number(r.payout_ratio) * 100).toFixed(2)}%`
                                    : "—"}
                                </td>
                              )}
                              {/* ROE */}
                              {visibleColumns.has("return_on_equity_ttm") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums font-mono">
                                  {fmtPct(r.return_on_equity_ttm)}
                                </td>
                              )}
                              {/* ROA */}
                              {visibleColumns.has("return_on_assets_ttm") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums font-mono">
                                  {fmtPct(r.return_on_assets_ttm)}
                                </td>
                              )}
                              {/* OPM */}
                              {visibleColumns.has("operating_margin_ttm") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums font-mono">
                                  {fmtPct(r.operating_margin_ttm)}
                                </td>
                              )}
                              {/* Profit Margin */}
                              {visibleColumns.has("profit_margin") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums font-mono">
                                  {fmtPct(r.profit_margin)}
                                </td>
                              )}
                              {/* Rev/Share */}
                              {visibleColumns.has("revenue_per_share") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums font-mono">
                                  {fmtUsd(r.revenue_per_share)}
                                </td>
                              )}
                              {/* BV/Share */}
                              {visibleColumns.has("book_value_per_share") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums font-mono">
                                  {fmtUsd(r.book_value_per_share)}
                                </td>
                              )}
                              {/* FCF */}
                              {visibleColumns.has("free_cash_flow") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums font-mono">
                                  {fmtCap(r.free_cash_flow)}
                                </td>
                              )}
                              {/* OCF */}
                              {visibleColumns.has("operating_cash_flow") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums font-mono">
                                  {fmtCap(r.operating_cash_flow)}
                                </td>
                              )}
                              {/* Rev Growth */}
                              {visibleColumns.has("quarterly_revenue_growth_yoy") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums font-mono">
                                  {fmtPct(r.quarterly_revenue_growth_yoy)}
                                </td>
                              )}
                              {/* EPS Growth */}
                              {visibleColumns.has("quarterly_earnings_growth_yoy") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums font-mono">
                                  {fmtPct(r.quarterly_earnings_growth_yoy)}
                                </td>
                              )}
                              {/* Target Price */}
                              {visibleColumns.has("analyst_target_price") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums font-mono">
                                  {fmtUsd(r.analyst_target_price)}
                                </td>
                              )}
                              {/* Rating */}
                              {visibleColumns.has("analyst_rating") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                                  {r.analyst_rating ? Number(r.analyst_rating).toFixed(2) : "—"}
                                </td>
                              )}
                              {/* SMA50 */}
                              {visibleColumns.has("day_50_ma") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums">
                                  {r.day_50_ma != null
                                    ? `$${r.day_50_ma.toFixed(2)}`
                                    : "—"}
                                </td>
                              )}
                              {/* SMA200 */}
                              {visibleColumns.has("day_200_ma") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums">
                                  {r.day_200_ma != null
                                    ? `$${r.day_200_ma.toFixed(2)}`
                                    : "—"}
                                </td>
                              )}
                              {/* Beta */}
                              {visibleColumns.has("beta") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums">
                                  {r.beta != null ? r.beta.toFixed(2) : "—"}
                                </td>
                              )}
                              {/* RSI */}
                              {visibleColumns.has("rsi_14") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums">
                                  {r.rsi_14 != null ? r.rsi_14.toFixed(2) : "—"}
                                </td>
                              )}
                              {/* MACD */}
                              {visibleColumns.has("macd") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums font-mono">
                                  {r.macd != null ? r.macd.toFixed(4) : "—"}
                                </td>
                              )}
                              {/* MACD Signal */}
                              {visibleColumns.has("macd_signal") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums font-mono">
                                  {r.macd_signal != null ? r.macd_signal.toFixed(4) : "—"}
                                </td>
                              )}
                              {/* MACD Divergence */}
                              {visibleColumns.has("macd_divergence") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums font-mono">
                                  {r.macd_divergence != null ? r.macd_divergence.toFixed(4) : "—"}
                                </td>
                              )}
                              {/* EMA 20 */}
                              {visibleColumns.has("ema_20") && (
                                <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums">
                                  {r.ema_20 != null ? `$${r.ema_20.toFixed(2)}` : "—"}
                                </td>
                              )}
                              {/* Watchlist action */}
                              <td
                                className={`sticky right-0 px-2 py-1 text-center border-l border-slate-200 dark:border-slate-700 ${isEven ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-800/30"}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {isAccessible && r.code && (
                                  <AddToWatchlistButton ticker={r.code} />
                                )}
                              </td>
                            </tr>
                              {/* Ad slot after every 5 rows */}
                              {shouldShowAdAfter && (
                                <tr>
                                  <td colSpan={visibleColumns.size + 1} className="py-2">
                                    <GoogleAdSlot />
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Login/Upgrade section below restricted results */}
                    {(backendTier !== 'premium' && backendTier !== 'elite') && totalCount > rawRows.length && (
                      <div className="py-8 px-4 text-center border-t border-slate-200 dark:border-slate-700 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900">
                        <div className="max-w-md mx-auto">
                          {/* Icon */}
                          <div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0087f6, #0070d6)' }}>
                            <Lock className="w-6 h-6 text-white" />
                          </div>

                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            {session ? "Unlock All Results" : "Login to View More"}
                          </h3>

                          <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">
                            {session
                              ? `Upgrade your account to Premium to see all ${totalCount > 0 ? totalCount : rawRows.length} matches and export data.`
                              : "Create a free account to see more results."
                            }
                          </p>

                          {session ? (
                            <Link href="/pricing">
                              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold h-10 px-6 rounded-lg shadow-md transition-all hover:shadow-lg hover:scale-[1.02]">
                                Upgrade account
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-100 dark:to-slate-200 text-white dark:text-slate-900 font-semibold h-10 px-6 rounded-lg shadow-md transition-all hover:shadow-lg hover:scale-[1.02]"
                              onClick={() => window.location.href = '/auth/login'}
                            >
                              Sign In / Register
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Paywall Footer Message */}
                  {showPaywall && filteredRows.length > 20 && (
                    <div className="sticky bottom-0 bg-white dark:bg-slate-900 p-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-center gap-3 text-sm text-slate-600 dark:text-muted-foreground">
                        <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1 max-w-24" />
                        <Shield className="w-4 h-4 text-amber-500" />
                        <span>
                          {visibleRestrictedCount} additional results hidden
                        </span>
                        <Shield className="w-4 h-4 text-amber-500" />
                        <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1 max-w-24" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pagination Footer */}
              {!loading && !error && filteredRows.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="text-sm text-slate-600 dark:text-muted-foreground flex items-center gap-2">
                    <span>
                      Showing{" "}
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {currentPage * pageSize + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {Math.min((currentPage + 1) * pageSize, filteredRows.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {filteredRows.length}
                      </span>{" "}
                      results
                    </span>
                    {searchTerm && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-50 text-blue-700"
                      >
                        filtered
                      </Badge>
                    )}
                    {selectedSector && (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      >
                        {selectedSector}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Results per page selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Per page:</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="min-w-16">
                            {pageSize}
                            <ChevronDown className="w-3 h-3 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {[10, 25, 50, 100].map((size) => (
                            <DropdownMenuItem
                              key={size}
                              onClick={() => setPageSize(size)}
                              className={pageSize === size ? "bg-slate-100 dark:bg-slate-700" : ""}
                            >
                              {size}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />

                    {/* Page navigation */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(0)}
                        disabled={currentPage === 0}
                        className="px-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <ChevronLeft className="w-4 h-4 -ml-2" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                        className="min-w-20"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                      </Button>

                      <span className="px-3 text-sm text-slate-600 dark:text-slate-300">
                        Page <span className="font-semibold">{currentPage + 1}</span> of <span className="font-semibold">{totalPages || 1}</span>
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage >= totalPages - 1}
                        className="min-w-20"
                      >
                        Next <ChevronLeft className="w-4 h-4 ml-1 rotate-180" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages - 1)}
                        disabled={currentPage >= totalPages - 1}
                        className="px-2"
                      >
                        <ChevronLeft className="w-4 h-4 rotate-180" />
                        <ChevronLeft className="w-4 h-4 -ml-2 rotate-180" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Floating Export Button (Mobile) */}
          <div className="fixed bottom-4 right-4 md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="lg"
                  className="rounded-full shadow-lg bg-slate-900 hover:bg-slate-800"
                >
                  <Download className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => exportData("csv")}>
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportData("json")}>
                  Export JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
