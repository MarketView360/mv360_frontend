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

// For Excel/PDF exports (install: npm install xlsx jspdf)
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";

// Import screener types aligned with backend
import type { ScreenerRow } from "@/lib/types/screener";

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

import { useAuth } from "@/providers/AuthProvider";
import { PaywallModal } from "@/components/paywall/PaywallModal";
import Link from "next/link";
import { Lock } from "lucide-react";

export default function ResultsPage() {
  return (
    <Suspense fallback={<ResultsPageSkeleton />}>
      <ResultsPageContent />
    </Suspense>
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
  const limit = Number(sp.get("limit") || 50);
  const offset = Number(sp.get("offset") || 0);
  const exchange = sp.get("exchange") || "us";

  const { session } = useAuth();
  const isPro = session?.tier === "pro" || session?.tier === "elite";

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rawRows, setRawRows] = useState<ScreenerRow[]>([]);

  // Apply limit for free users
  // Apply limit for free users
  const rows = useMemo(() => {
    return rawRows;
  }, [rawRows]);

  const accessLimit = useMemo(() => {
    if (!session) return 3;
    if (isPro) return Infinity;
    return 7;
  }, [session, isPro]);

  const [source, setSource] = useState<string | undefined>(undefined);
  const [sortKey, setSortKey] = useState<string>("market_cap");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // New state for enhanced features
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState("");

  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set([
      "ticker",
      "code", // alias for ticker
      "name",
      "exchange",
      "adjusted_close",
      "market_cap",
      "dividend_yield",
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
    ])
  );
  const [exporting, setExporting] = useState<string | null>(null);

  // Smart column selection: extract fields from query and auto-show them
  useEffect(() => {
    const extracted = extractQueryFields(query);
    
    // Auto-enable columns that are used in the query filter
    if (extracted.length > 0) {
      setVisibleColumns((prev) => {
        const updated = new Set(prev);
        for (const field of extracted) {
          updated.add(field);
        }
        return updated;
      });
    }
  }, [query]);

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

  // Fetch data
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const run = async () => {
      if (!query.trim()) return;
      setLoading(true);
      setError(null);

      try {
        const resp = await fetch(`${backendUrl}/api/run-query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, sort, limit, offset, exchange }),
          signal: controller.signal,
        });

        const data = await resp.json();
        if (!resp.ok) throw new Error(data?.error || `HTTP ${resp.status}`);

        // Parse response data
        let arr: ScreenerRow[] = [];
        if (Array.isArray(data?.data?.data)) arr = data.data.data;
        else if (Array.isArray(data?.data)) arr = data.data;
        else if (Array.isArray(data)) arr = data;
        else if (data?.results && Array.isArray(data.results))
          arr = data.results;

        if (!active) return;
        setRawRows(arr || []);
        setSource(data?.url);
        // showPaywall state is now controlled by explicit user actions, not length
        // setShowPaywall((arr || []).length > 20);
      } catch (e: any) {
        if (e.name === "AbortError") return;
        if (!active) return;
        setError(e?.message || "Failed to fetch results");
        setRawRows([]);
        setSource(undefined);
        setShowPaywall(false);
      } finally {
        if (active) setLoading(false);
      }
    };

    run();
    return () => {
      active = false;
      controller.abort();
    };
  }, [backendUrl, query, sort, limit, offset, exchange]);

  // Sort rows
  const sortedRows = useMemo(() => {
    const arr = [...rows];
    const key = sortKey as keyof ScreenerRow;
    arr.sort((a, b) => {
      const av = (a[key] as number | string | undefined) ?? 0;
      const bv = (b[key] as number | string | undefined) ?? 0;
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return arr;
  }, [rows, sortKey, sortDir]);

  // Filter rows based on search
  const filteredRows = useMemo(() => {
    if (!debouncedSearch.trim()) return sortedRows;

    const term = debouncedSearch.toLowerCase();
    return sortedRows.filter((row) => {
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
  }, [sortedRows, debouncedSearch]);

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

  const updateParams = useCallback(
    (newOffset: number) => {
      const params = new URLSearchParams({
        query,
        sort,
        limit: String(limit),
        offset: String(newOffset),
        exchange,
      });
      router.push(`/screens/results?${params.toString()}`);
    },
    [query, sort, limit, exchange, router]
  );

  const onNext = useCallback(
    () => updateParams(offset + limit),
    [offset, limit, updateParams]
  );
  const onPrev = useCallback(
    () => updateParams(Math.max(0, offset - limit)),
    [offset, limit, updateParams]
  );

  // Export functionality with multiple formats
  const exportData = useCallback(
    async (format: "csv" | "json" | "excel" | "pdf") => {
      if (!isPro) {
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
            const wsData = [
              exportColumns.map((c) => c.label),
              ...rowsToExport.map((r) =>
                exportColumns.map((col) => {
                  const raw = r[col.key];
                  // Return raw numbers for Excel, formatted strings for text
                  if (
                    col.key === "code" ||
                    col.key === "name" ||
                    col.key === "exchange"
                  ) {
                    return raw ?? "";
                  }
                  return raw != null ? Number(raw) : "";
                })
              ),
            ];
            const ws = XLSX.utils.aoa_to_sheet(wsData);

            // Auto-size columns
            const colWidths = exportColumns.map((col, i) => {
              const maxLen = Math.max(
                col.label.length,
                ...rowsToExport.map(
                  (r) => String(col.format(r[col.key])).length
                )
              );
              return { wch: Math.min(maxLen + 2, 30) };
            });
            ws["!cols"] = colWidths;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Screener Results");
            XLSX.writeFile(wb, `screener-results-${timestamp}.xlsx`);
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

  // Calculate visible row counts
  const visibleAccessibleCount = Math.min(accessLimit, filteredRows.length);
  const visibleRestrictedCount = Math.max(0, filteredRows.length - visibleAccessibleCount);

  const rowsToRender = useMemo(() => {
    if (isPro) return filteredRows;
    // Show a few extra blurred rows for effect
    return filteredRows.slice(0, Math.min(filteredRows.length, accessLimit + 5));
  }, [filteredRows, isPro, accessLimit]);

  return (
    <TooltipProvider>
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
                  <h1 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
                    Screener Results
                  </h1>
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

                {/* Column Visibility */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-1" /> Columns
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
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
                    ].map((col) => (
                      <DropdownMenuItem
                        key={col.key}
                        className="flex items-center justify-between"
                      >
                        <Label
                          htmlFor={`col-${col.key}`}
                          className="cursor-pointer"
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
                        Viewing {visibleAccessibleCount} of {filteredRows.length}{" "}
                        results
                      </p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Upgrade to unlock full historical data, exports, and
                        advanced analytics
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                  >
                    <Shield className="w-4 h-4 mr-1.5" /> Upgrade Pro
                  </Button>
                </div>
              </div>
            )}

            {/* Results Card */}
            <Card className="border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900 overflow-hidden w-full">
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
                          {filteredRows.length}{" "}
                          {filteredRows.length === 1 ? "stock" : "stocks"}
                        </Badge>
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
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 relative">
                          {rowsToRender.map((r, i) => {
                            const isAccessible = i < accessLimit;
                            const isPositive1d = (r.change ?? 0) >= 0;
                            const isPositive5d = (r.change_percent ?? 0) >= 0;
                            const isEven = i % 2 === 0;

                            return (
                              <tr
                                key={`${r.code}-${i}`}
                                className={`
                              transition-all duration-150 group
                              ${isAccessible
                                    ? `${isEven
                                      ? "bg-white dark:bg-slate-900"
                                      : "bg-slate-50/50 dark:bg-slate-800/30"
                                    } hover:bg-blue-50 dark:hover:bg-slate-700/50 cursor-pointer`
                                    : "filter blur-sm select-none pointer-events-none opacity-50 bg-slate-100/30 dark:bg-slate-800/30"
                                  }
                            `}
                                onClick={() => {
                                  if (isAccessible && r.code) {
                                    // Navigate to detail page or open modal
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
                                    {r.pe_ratio != null
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
                                    {fmtPct(r.payout_ratio)}
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
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {/* Glassmorphic Overlay for restricted results */}
                      {!isPro && filteredRows.length > accessLimit && (
                        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end pb-8 md:pb-12 items-center bg-linear-to-t from-slate-50 via-slate-50/90 to-transparent dark:from-slate-950 dark:via-slate-950/90 h-64 pointer-events-none">
                          <div className="pointer-events-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-6 md:p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 max-w-sm w-full text-center mx-4 group relative overflow-hidden">
                            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                            <Lock className="w-12 h-12 text-brand mx-auto mb-4 bg-brand/10 p-3 rounded-full" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                              {session ? "Unlock All Results" : "Login to View More"}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                              {session
                                ? `Upgrade to Pro to see all ${filteredRows.length} matches and export data.`
                                : "Create a free account to see more results."
                              }
                            </p>

                            {session ? (
                              <Link href="/pricing" className="block w-full">
                                <Button className="w-full bg-brand hover:bg-brand/90 text-white font-medium h-11 shadow-lg shadow-brand/20">
                                  Upgrade to Pro
                                </Button>
                              </Link>
                            ) : (
                              <Link href="/login" className="block w-full">
                                <Button className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 h-11">
                                  Sign In / Register
                                </Button>
                              </Link>
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
                          {offset + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {Math.min(offset + limit, filteredRows.length)}
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
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onPrev}
                        disabled={offset <= 0}
                        className="min-w-24"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                      </Button>

                      <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onNext}
                        disabled={filteredRows.length < limit}
                        className="min-w-24"
                      >
                        Next <ChevronLeft className="w-4 h-4 ml-1 rotate-180" />
                      </Button>
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
    </TooltipProvider>
  );
}
