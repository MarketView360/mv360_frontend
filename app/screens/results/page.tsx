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

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ScreenerRow[]>([]);
  const [source, setSource] = useState<string | undefined>(undefined);
  const [sortKey, setSortKey] = useState<string>("market_capitalization");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // New state for enhanced features
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set([
      "ticker",
      "code", // alias for ticker
      "name",
      "exchange",
      "adjusted_close",
      "market_cap",
      "dividend_yield",
      "change",
      "change_percent",
      // Valuation metrics (using correct backend column names)
      "pe_ratio",
      "forward_pe",
      "peg_ratio",
      "price_book_mrq",
      "price_sales_ttm",
      "ev_ebitda",
      "ev_revenue",
      // Financial strength
      "long_term_debt",
      "short_term_debt",
      "net_debt",
      // Earnings
      "earnings_share",
      "diluted_eps_ttm",
      "revenue_ttm",
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
    ])
  );
  const [exporting, setExporting] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

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
        setRows(arr || []);
        setSource(data?.url);
        setShowPaywall((arr || []).length > 20);
      } catch (e: any) {
        if (e.name === "AbortError") return;
        if (!active) return;
        setError(e?.message || "Failed to fetch results");
        setRows([]);
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
          key: "market_capitalization",
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
          key: "peg",
          label: "PEG",
          format: (v) => (v != null ? Number(v).toFixed(2) : ""),
        },
        {
          key: "pb",
          label: "P/B",
          format: (v) => (v != null ? Number(v).toFixed(2) : ""),
        },
        {
          key: "price_to_sales",
          label: "P/S",
          format: (v) => (v != null ? Number(v).toFixed(2) : ""),
        },
        {
          key: "ev_ebitda",
          label: "EV/EBITDA",
          format: (v) => (v != null ? Number(v).toFixed(2) : ""),
        },
        {
          key: "eps_ttm",
          label: "EPS (TTM)",
          format: (v) => (v != null ? `$${Number(v).toFixed(2)}` : ""),
        },
        {
          key: "diluted_eps_ttm",
          label: "Diluted EPS",
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
  const visibleAccessibleCount = Math.min(20, filteredRows.length);
  const visibleRestrictedCount = Math.max(0, filteredRows.length - 20);

  return (
    <TooltipProvider>
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
                  { key: "market_capitalization", label: "Market Cap" },
                  { key: "dividend_yield", label: "Div Yield" },
                  { key: "change", label: "Change" },
                  { key: "change_percent", label: "Change %" },
                  { key: "pe_ratio", label: "P/E" },
                  { key: "forward_pe", label: "Fwd P/E" },
                  { key: "peg_ratio", label: "PEG" },
                  { key: "price_book_mrq", label: "P/B" },
                  { key: "price_sales_ttm", label: "P/S" },
                  { key: "ev_ebitda", label: "EV/EBITDA" },
                  { key: "ev_revenue", label: "EV/Revenue" },
                  { key: "return_on_equity_ttm", label: "ROE" },
                  { key: "return_on_assets_ttm", label: "ROA" },
                  { key: "operating_margin_ttm", label: "OPM" },
                  { key: "profit_margin", label: "Profit Margin" },
                  { key: "net_debt", label: "Net Debt" },
                  { key: "free_cash_flow", label: "FCF" },
                  { key: "operating_cash_flow", label: "OCF" },
                  { key: "eps_ttm", label: "EPS (TTM)" },
                  { key: "diluted_eps_ttm", label: "Diluted EPS" },
                  { key: "revenue_ttm", label: "Sales (TTM)" },
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
                        {visibleColumns.has("market_capitalization") && (
                          <th
                            className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                            onClick={() => toggleSort("market_capitalization")}
                          >
                            <div className="flex items-center justify-end">
                              Market Cap{" "}
                              <SortIcon column="market_capitalization" />
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
                        {visibleColumns.has("peg") && (
                          <th
                            className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                            onClick={() => toggleSort("peg")}
                          >
                            <div className="flex items-center justify-end">
                              PEG <SortIcon column="peg" />
                            </div>
                          </th>
                        )}
                        {visibleColumns.has("pb") && (
                          <th
                            className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                            onClick={() => toggleSort("pb")}
                          >
                            <div className="flex items-center justify-end">
                              P/B <SortIcon column="pb" />
                            </div>
                          </th>
                        )}
                        {visibleColumns.has("price_to_sales") && (
                          <th
                            className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                            onClick={() => toggleSort("price_to_sales")}
                          >
                            <div className="flex items-center justify-end">
                              P/S <SortIcon column="price_to_sales" />
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
                        {visibleColumns.has("eps_ttm") && (
                          <th
                            className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                            onClick={() => toggleSort("eps_ttm")}
                          >
                            <div className="flex items-center justify-end">
                              EPS (TTM) <SortIcon column="eps_ttm" />
                            </div>
                          </th>
                        )}
                        {visibleColumns.has("diluted_eps_ttm") && (
                          <th
                            className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                            onClick={() => toggleSort("diluted_eps_ttm")}
                          >
                            <div className="flex items-center justify-end">
                              Diluted EPS <SortIcon column="diluted_eps_ttm" />
                            </div>
                          </th>
                        )}
                        {visibleColumns.has("revenue_ttm") && (
                          <th
                            className="text-right px-4 py-3.5 font-semibold cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors select-none text-xs uppercase tracking-wider"
                            onClick={() => toggleSort("revenue_ttm")}
                          >
                            <div className="flex items-center justify-end">
                              Sales (TTM) <SortIcon column="revenue_ttm" />
                            </div>
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
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredRows.map((r, i) => {
                        const isAccessible = i < 20;
                        const isPositive1d = (r.change ?? 0) >= 0;
                        const isPositive5d = (r.change_percent ?? 0) >= 0;
                        const isEven = i % 2 === 0;

                        return (
                          <tr
                            key={`${r.code}-${i}`}
                            className={`
                              transition-all duration-150 group
                              ${
                                isAccessible
                                  ? `${
                                      isEven
                                        ? "bg-white dark:bg-slate-900"
                                        : "bg-slate-50/50 dark:bg-slate-800/30"
                                    } hover:bg-blue-50 dark:hover:bg-slate-700/50 cursor-pointer`
                                  : "opacity-30 pointer-events-none select-none bg-slate-100/50 dark:bg-slate-800/50"
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
                            {visibleColumns.has("market_capitalization") && (
                              <td className="px-4 py-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                                {fmtCap(r.market_capitalization)}
                              </td>
                            )}
                            {visibleColumns.has("dividend_yield") && (
                              <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-muted-foreground tabular-nums">
                                {r.dividend_yield != null
                                  ? `${(r.dividend_yield * 100).toFixed(2)}%`
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
                            {visibleColumns.has("peg") && (
                              <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                                {r.peg != null ? r.peg.toFixed(2) : "—"}
                              </td>
                            )}
                            {/* P/B */}
                            {visibleColumns.has("pb") && (
                              <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums font-mono">
                                {r.pb != null ? r.pb.toFixed(2) : "—"}
                              </td>
                            )}
                            {/* P/S */}
                            {visibleColumns.has("price_to_sales") && (
                              <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums font-mono">
                                {r.price_to_sales != null
                                  ? r.price_to_sales.toFixed(2)
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
                            {/* EPS (TTM) */}
                            {visibleColumns.has("eps_ttm") && (
                              <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                                {r.eps_ttm != null
                                  ? `$${r.eps_ttm.toFixed(2)}`
                                  : "—"}
                              </td>
                            )}
                            {/* Diluted EPS */}
                            {visibleColumns.has("diluted_eps_ttm") && (
                              <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums font-mono">
                                {r.diluted_eps_ttm != null
                                  ? `$${r.diluted_eps_ttm.toFixed(2)}`
                                  : "—"}
                              </td>
                            )}
                            {/* Revenue (TTM) */}
                            {visibleColumns.has("revenue_ttm") && (
                              <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums font-mono">
                                {fmtCap(r.revenue_ttm)}
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
    </TooltipProvider>
  );
}
