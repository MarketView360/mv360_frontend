"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { WatchlistWithItems } from "@/providers/WatchlistProvider";
import { cleanTicker } from "@/lib/watchlist-utils";

interface StockData {
  ticker: string;
  name: string;
  sector: string | null;
  industry?: string | null;
  price: number | null;
  price_change_1d: number | null;
  price_change_1m: number | null;
  market_cap: number | null;
  revenue_ttm: number | null;
  eps_ttm: number | null;
  pe_ratio: number | null;
  forward_pe: number | null;
  enterprise_value: number | null;
  ev_ebitda: number | null;
  price_to_book: number | null;
  price_to_sales: number | null;
  roe: number | null;
  roa: number | null;
  profit_margin: number | null;
  operating_margin_ttm: number | null;
  beta: number | null;
  dividend_yield: number | null;
}

interface PeerData {
  ticker: string;
  name: string;
  sector: string | null;
  industry: string | null;
  price: number | null;
  price_change_1d: number | null;
  market_cap: number | null;
  pe_ratio: number | null;
  forward_pe: number | null;
}

interface WatchlistExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  watchlist: WatchlistWithItems;
}

type ExportFormat = "csv" | "pdf";
type ExportStatus = "idle" | "loading" | "success" | "error";

export function WatchlistExportDialog({
  open,
  onOpenChange,
  watchlist,
}: WatchlistExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [stockData, setStockData] = useState<Map<string, StockData>>(new Map());
  const [peerData, setPeerData] = useState<Map<string, PeerData[]>>(new Map());
  const [dataLoading, setDataLoading] = useState(false);
  const [loadingPhrase, setLoadingPhrase] = useState("");
  
  // PDF chart options
  const [includePriceChart, setIncludePriceChart] = useState(true);
  const [includeComparisonCharts, setIncludeComparisonCharts] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);

  // Rotating loading phrases
  useEffect(() => {
    if (!dataLoading) return;

    const phrases = [
      "Gathering stock data...",
      "Fetching peer companies...",
      "Analyzing metrics...",
      "Almost there...",
      "Final touches...",
      "Structuring data...",
    ];

    let index = 0;
    setLoadingPhrase(phrases[0]);

    const interval = setInterval(() => {
      index = (index + 1) % phrases.length;
      setLoadingPhrase(phrases[index]);
    }, 3500);

    return () => clearInterval(interval);
  }, [dataLoading]);

  // Fetch stock data and peers when dialog opens
  useEffect(() => {
    if (!open || watchlist.items.length === 0) return;

    let cancelled = false;

    const fetchData = async () => {
      setDataLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
        const tickers = watchlist.items.map((i) => cleanTicker(i.ticker));

        // Fetch stock data
        const tickersParam = tickers.join(",");
        const stockRes = await fetch(
          `${baseUrl}/api/companies/batch?tickers=${encodeURIComponent(tickersParam)}&exchange=us`
        );
        
        if (stockRes.ok) {
          const data = await stockRes.json();
          const results = data.companies || [];
          const stockMap = new Map<string, StockData>();

          for (const result of results) {
            if (!result?.company?.ticker) continue;
            const { company, metrics } = result;
            const ticker = cleanTicker(company.ticker);

            stockMap.set(ticker, {
              ticker,
              name: company.name || "",
              sector: company.sector || null,
              industry: company.industry || null,
              price: metrics?.price ?? null,
              price_change_1d: metrics?.refund_1d_p ?? null,
              price_change_1m: metrics?.refund_1m_p ?? null,
              market_cap: metrics?.market_cap ?? null,
              revenue_ttm: metrics?.revenue_ttm ?? null,
              eps_ttm: metrics?.eps_ttm ?? null,
              pe_ratio: metrics?.pe_ratio ?? null,
              forward_pe: metrics?.forward_pe ?? null,
              enterprise_value: metrics?.enterprise_value ?? null,
              ev_ebitda: metrics?.ev_ebitda ?? null,
              price_to_book: metrics?.price_to_book ?? null,
              price_to_sales: metrics?.price_to_sales ?? null,
              roe: metrics?.roe ?? null,
              roa: metrics?.roa ?? null,
              profit_margin: metrics?.profit_margin ?? null,
              operating_margin_ttm: metrics?.operating_margin_ttm ?? null,
              beta: metrics?.beta ?? null,
              dividend_yield: metrics?.dividend_yield ?? null,
            });
          }

          if (!cancelled) setStockData(stockMap);
        }

        // Fetch peer data for each stock
        const peerMap = new Map<string, PeerData[]>();
        for (const ticker of tickers.slice(0, 10)) {
          try {
            const peerRes = await fetch(`${baseUrl}/api/company/${ticker}/peers`);
            if (peerRes.ok) {
              const peers = await peerRes.json();
              if (Array.isArray(peers)) {
                peerMap.set(
                  ticker,
                  peers.slice(0, 5).map((p: any) => ({
                    ticker: cleanTicker(p.ticker || ""),
                    name: p.name || "",
                    sector: p.sector || null,
                    industry: p.industry || null,
                    price: p.price ?? null,
                    price_change_1d: p.refund_1d_p ?? null,
                    market_cap: p.market_capitalization ?? null,
                    pe_ratio: p.pe_ratio ?? null,
                    forward_pe: p.forward_pe ?? null,
                  }))
                );
              }
            }
          } catch {
            // Skip failed peer fetches
          }
        }

        if (!cancelled) setPeerData(peerMap);
      } catch (err) {
        console.error("Error fetching export data:", err);
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [open, watchlist.items]);

  const formatNumber = (val: number | null, decimals = 2): string => {
    if (val == null) return "";
    return val.toFixed(decimals);
  };

  const formatMarketCap = (val: number | null): string => {
    if (val == null) return "";
    if (val >= 1e12) return `${(val / 1e12).toFixed(2)}T`;
    if (val >= 1e9) return `${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `${(val / 1e6).toFixed(2)}M`;
    return val.toLocaleString();
  };

  const generateCSV = (): string => {
    const lines: string[] = [];
    const exportDate = new Date().toISOString();

    // Metadata section (optional)
    if (includeMetadata) {
      lines.push("# WATCHLIST EXPORT");
      lines.push(`# Watchlist Name: ${watchlist.name}`);
      lines.push(`# Description: ${watchlist.description || ""}`);
      lines.push(`# Export Date: ${exportDate}`);
      lines.push(`# Total Stocks: ${watchlist.items.length}`);
      lines.push(`# Color: ${watchlist.color}`);
      lines.push("");
    }

    // Stock data section
    lines.push("## STOCKS");
    const stockHeaders = [
      "Type",
      "Ticker",
      "Name",
      "Sector",
      "Industry",
      "Price",
      "Change_1D_Pct",
      "Change_1M_Pct",
      "Market_Cap",
      "Revenue_TTM",
      "EPS_TTM",
      "PE_Ratio",
      "Forward_PE",
      "Enterprise_Value",
      "EV_EBITDA",
      "Price_To_Book",
      "Price_To_Sales",
      "ROE",
      "ROA",
      "Profit_Margin",
      "Operating_Margin",
      "Beta",
      "Dividend_Yield",
      "Notes",
      "Added_Date",
    ];
    lines.push(stockHeaders.join(","));

    for (const item of watchlist.items) {
      const ticker = cleanTicker(item.ticker);
      const data = stockData.get(ticker);
      const notes = (item.notes || "").replace(/"/g, '""');
      const addedDate = item.added_at
        ? new Date(item.added_at).toISOString().split("T")[0]
        : "";

      const row = [
        "STOCK",
        ticker,
        `"${(data?.name || "").replace(/"/g, '""')}"`,
        `"${data?.sector || ""}"`,
        `"${data?.industry || ""}"`,
        formatNumber(data?.price ?? null),
        formatNumber(data?.price_change_1d ?? null),
        formatNumber(data?.price_change_1m ?? null),
        formatNumber(data?.market_cap ?? null, 0),
        formatNumber(data?.revenue_ttm ?? null, 0),
        formatNumber(data?.eps_ttm ?? null),
        formatNumber(data?.pe_ratio ?? null),
        formatNumber(data?.forward_pe ?? null),
        formatNumber(data?.enterprise_value ?? null, 0),
        formatNumber(data?.ev_ebitda ?? null),
        formatNumber(data?.price_to_book ?? null),
        formatNumber(data?.price_to_sales ?? null),
        formatNumber(data?.roe ?? null),
        formatNumber(data?.roa ?? null),
        formatNumber(data?.profit_margin ?? null),
        formatNumber(data?.operating_margin_ttm ?? null),
        formatNumber(data?.beta ?? null),
        formatNumber(data?.dividend_yield ?? null),
        `"${notes}"`,
        addedDate,
      ];
      lines.push(row.join(","));
    }

    // Peers section
    lines.push("");
    lines.push("## PEERS");
    const peerHeaders = [
      "Type",
      "Parent_Ticker",
      "Ticker",
      "Name",
      "Sector",
      "Industry",
      "Price",
      "Change_1D_Pct",
      "Market_Cap",
      "PE_Ratio",
      "Forward_PE",
    ];
    lines.push(peerHeaders.join(","));

    const peerEntries = Array.from(peerData.entries());
    for (const [parentTicker, peers] of peerEntries) {
      for (const peer of peers) {
        const row = [
          "PEER",
          parentTicker,
          peer.ticker,
          `"${(peer.name || "").replace(/"/g, '""')}"`,
          `"${peer.sector || ""}"`,
          `"${peer.industry || ""}"`,
          formatNumber(peer.price),
          formatNumber(peer.price_change_1d),
          formatNumber(peer.market_cap, 0),
          formatNumber(peer.pe_ratio),
          formatNumber(peer.forward_pe),
        ];
        lines.push(row.join(","));
      }
    }

    return lines.join("\n");
  };

  const generatePDF = async () => {
    // Dynamic import for PDF generation
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Helper function to add header and footer watermarks
    const addWatermarks = () => {
      // Header watermark
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.setFont("helvetica", "italic");
      const headerText = "Sourced from MarketView360";
      const headerWidth = doc.getTextWidth(headerText);
      const headerX = pageWidth - headerWidth - 14;
      doc.text(headerText, headerX, 10);
      doc.setTextColor(59, 130, 246); // brand blue for link
      doc.textWithLink("MarketView360", headerX + doc.getTextWidth("Sourced from "), 10, {
        url: "https://www.marketview360.io/"
      });
      
      // Footer watermark
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.setFont("helvetica", "italic");
      const footerText = "Exported from MarketView360";
      const footerWidth = doc.getTextWidth(footerText);
      const footerX = (pageWidth - footerWidth) / 2;
      doc.text("Exported from ", footerX, pageHeight - 8);
      doc.setTextColor(59, 130, 246);
      doc.textWithLink("MarketView360", footerX + doc.getTextWidth("Exported from "), pageHeight - 8, {
        url: "https://www.marketview360.io/"
      });
      doc.setTextColor(0, 0, 0); // Reset to black
      doc.setFont("helvetica", "normal");
    };
    
    // Add watermarks to first page
    addWatermarks();
    
    let y = 20;

    // Title and metadata (optional)
    if (includeMetadata) {
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(watchlist.name, pageWidth / 2, y, { align: "center" });
      y += 10;

      // Metadata
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`Exported: ${new Date().toLocaleDateString()}`, pageWidth / 2, y, {
        align: "center",
      });
      y += 5;
      if (watchlist.description) {
        doc.text(watchlist.description, pageWidth / 2, y, { align: "center" });
        y += 5;
      }
      doc.text(`${watchlist.items.length} stocks`, pageWidth / 2, y, {
        align: "center",
      });
      y += 15;
    }

    // Stocks table header
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Watchlist Stocks", 14, y);
    y += 8;

    // Table headers
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    const headers = ["Ticker", "Name", "Sector", "Price", "1D %", "Mkt Cap", "P/E"];
    const colWidths = [18, 45, 35, 20, 18, 25, 18];
    let x = 14;
    for (let i = 0; i < headers.length; i++) {
      doc.text(headers[i], x, y);
      x += colWidths[i];
    }
    y += 5;

    // Draw header line
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageWidth - 14, y);
    y += 4;

    // Stock rows
    doc.setFont("helvetica", "normal");
    for (const item of watchlist.items) {
      if (y > 270) {
        doc.addPage();
        addWatermarks();
        y = 20;
      }

      const ticker = cleanTicker(item.ticker);
      const data = stockData.get(ticker);

      x = 14;
      doc.text(ticker, x, y);
      x += colWidths[0];
      doc.text((data?.name || "").substring(0, 25), x, y);
      x += colWidths[1];
      doc.text((data?.sector || "—").substring(0, 18), x, y);
      x += colWidths[2];
      doc.text(data?.price != null ? `$${data.price.toFixed(2)}` : "—", x, y);
      x += colWidths[3];

      // Color change percentage
      const change1d = data?.price_change_1d;
      if (change1d != null) {
        doc.setTextColor(change1d >= 0 ? 0 : 200, change1d >= 0 ? 150 : 0, 0);
        doc.text(`${change1d >= 0 ? "+" : ""}${change1d.toFixed(2)}%`, x, y);
        doc.setTextColor(0, 0, 0);
      } else {
        doc.text("—", x, y);
      }
      x += colWidths[4];
      doc.text(formatMarketCap(data?.market_cap ?? null), x, y);
      x += colWidths[5];
      doc.text(data?.pe_ratio != null ? data.pe_ratio.toFixed(2) : "—", x, y);

      y += 5;
    }

    // Peers section
    if (peerData.size > 0) {
      y += 10;
      if (y > 240) {
        doc.addPage();
        addWatermarks();
        y = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Peer Companies", 14, y);
      y += 8;

      const peerEntriesPDF = Array.from(peerData.entries());
      for (const [parentTicker, peers] of peerEntriesPDF) {
        if (peers.length === 0) continue;

        // Check if we need a new page for the section header
        if (y > 255) {
          doc.addPage();
          addWatermarks();
          y = 20;
        }

        // Section header for each stock's peers
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(60, 60, 60);
        doc.text(`Peers for ${parentTicker}`, 14, y);
        y += 6;

        // Table headers
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        const peerHeaders = ["Ticker", "Company Name", "Sector", "Price", "1D %", "Mkt Cap", "P/E"];
        const peerColWidths = [18, 45, 32, 20, 18, 25, 18];
        let peerX = 14;
        for (let i = 0; i < peerHeaders.length; i++) {
          doc.text(peerHeaders[i], peerX, y);
          peerX += peerColWidths[i];
        }
        y += 4;

        // Draw header line
        doc.setDrawColor(200, 200, 200);
        doc.line(14, y, pageWidth - 14, y);
        y += 4;

        // Peer rows
        doc.setFont("helvetica", "normal");
        for (const peer of peers.slice(0, 5)) {
          if (y > 270) {
            doc.addPage();
            addWatermarks();
            y = 20;
            
            // Redraw headers on new page
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            peerX = 14;
            for (let i = 0; i < peerHeaders.length; i++) {
              doc.text(peerHeaders[i], peerX, y);
              peerX += peerColWidths[i];
            }
            y += 4;
            doc.setDrawColor(200, 200, 200);
            doc.line(14, y, pageWidth - 14, y);
            y += 4;
            doc.setFont("helvetica", "normal");
          }

          peerX = 14;
          doc.text(peer.ticker, peerX, y);
          peerX += peerColWidths[0];
          doc.text((peer.name || "").substring(0, 25), peerX, y);
          peerX += peerColWidths[1];
          doc.text((peer.sector || "—").substring(0, 18), peerX, y);
          peerX += peerColWidths[2];
          doc.text(peer.price != null ? `$${peer.price.toFixed(2)}` : "—", peerX, y);
          peerX += peerColWidths[3];

          // Color change percentage
          const peerChange1d = peer.price_change_1d;
          if (peerChange1d != null) {
            doc.setTextColor(peerChange1d >= 0 ? 0 : 200, peerChange1d >= 0 ? 150 : 0, 0);
            doc.text(`${peerChange1d >= 0 ? "+" : ""}${peerChange1d.toFixed(2)}%`, peerX, y);
            doc.setTextColor(0, 0, 0);
          } else {
            doc.text("—", peerX, y);
          }
          peerX += peerColWidths[4];
          doc.text(formatMarketCap(peer.market_cap ?? null), peerX, y);
          peerX += peerColWidths[5];
          doc.text(peer.pe_ratio != null ? peer.pe_ratio.toFixed(2) : "—", peerX, y);

          y += 5;
        }
        y += 5; // Extra space between different stocks' peer tables
      }
    }

    // Price Comparison Chart (if selected)
    if (includePriceChart && watchlist.items.length > 1) {
      doc.addPage();
      addWatermarks();
      y = 20;

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Price Comparison", 14, y);
      y += 10;

      // Draw a simple bar chart for prices
      const chartWidth = pageWidth - 28;
      const barHeight = 12;
      const maxPrice = Math.max(
        ...Array.from(stockData.values()).map((d) => d.price || 0)
      );

      doc.setFontSize(8);
      for (const item of watchlist.items.slice(0, 10)) {
        const ticker = cleanTicker(item.ticker);
        const data = stockData.get(ticker);
        const price = data?.price || 0;
        const barWidth = maxPrice > 0 ? (price / maxPrice) * (chartWidth - 60) : 0;

        // Ticker label
        doc.setFont("helvetica", "bold");
        doc.text(ticker, 14, y + barHeight / 2 + 2);

        // Bar
        doc.setFillColor(59, 130, 246); // brand blue
        doc.rect(50, y, barWidth, barHeight - 2, "F");

        // Price label
        doc.setFont("helvetica", "normal");
        doc.text(`$${price.toFixed(2)}`, 52 + barWidth, y + barHeight / 2 + 2);

        y += barHeight + 4;
      }
    }

    // Metrics Comparison Charts (if selected)
    if (includeComparisonCharts && watchlist.items.length > 1) {
      doc.addPage();
      addWatermarks();
      y = 20;

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Metrics Comparison", 14, y);
      y += 15;

      const metrics = [
        { key: "pe_ratio", label: "P/E Ratio", color: [59, 130, 246] },
        { key: "market_cap", label: "Market Cap (B)", divisor: 1e9, color: [16, 185, 129] },
        { key: "dividend_yield", label: "Dividend Yield %", color: [245, 158, 11] },
      ];

      const chartWidth = (pageWidth - 42) / 3;

      for (let m = 0; m < metrics.length; m++) {
        const metric = metrics[m];
        const startX = 14 + m * (chartWidth + 7);

        // Metric title
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(metric.label, startX, y);

        let chartY = y + 8;
        const barHeight = 8;

        // Get max value for this metric
        const values = Array.from(stockData.values()).map((d) => {
          const val = (d as any)[metric.key] as number | null;
          return metric.divisor ? (val || 0) / metric.divisor : val || 0;
        });
        const maxVal = Math.max(...values, 0.01);

        doc.setFontSize(6);
        for (const item of watchlist.items.slice(0, 8)) {
          const ticker = cleanTicker(item.ticker);
          const data = stockData.get(ticker);
          let val = (data as any)?.[metric.key] as number | null;
          if (metric.divisor && val) val = val / metric.divisor;

          const barWidth = maxVal > 0 ? ((val || 0) / maxVal) * (chartWidth - 25) : 0;

          // Ticker
          doc.setFont("helvetica", "normal");
          doc.text(ticker.substring(0, 4), startX, chartY + barHeight / 2 + 1);

          // Bar
          doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
          doc.rect(startX + 18, chartY, Math.max(barWidth, 1), barHeight - 2, "F");

          // Value
          doc.text(
            val != null ? val.toFixed(2) : "—",
            startX + 20 + Math.max(barWidth, 1),
            chartY + barHeight / 2 + 1
          );

          chartY += barHeight + 2;
        }
      }
    }

    return doc;
  };

  const handleExport = async () => {
    setStatus("loading");
    setStatusMessage(
      format === "csv" ? "Generating CSV..." : "Generating PDF..."
    );

    try {
      if (format === "csv") {
        const csv = generateCSV();
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${watchlist.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const doc = await generatePDF();
        doc.save(
          `${watchlist.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`
        );
      }

      setStatus("success");
      setStatusMessage("Export completed successfully!");

      setTimeout(() => {
        onOpenChange(false);
        setStatus("idle");
        setStatusMessage("");
      }, 1500);
    } catch (err) {
      console.error("Export error:", err);
      setStatus("error");
      setStatusMessage(
        err instanceof Error ? err.message : "Failed to export watchlist"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-brand" />
            Export Watchlist
          </DialogTitle>
          <DialogDescription>
            Export &quot;{watchlist.name}&quot; with all stock data and peer companies.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Data loading indicator */}
          {dataLoading && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <Loader2 className="w-4 h-4 animate-spin text-brand" />
              <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                {loadingPhrase}
              </span>
            </div>
          )}

          {/* Format selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat("csv")}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all ${
                  format === "csv"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-md"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    format === "csv"
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  <FileSpreadsheet className="w-7 h-7" />
                </div>
                <div className="text-center">
                  <div className={`font-semibold text-sm ${
                    format === "csv" ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"
                  }`}>
                    CSV
                  </div>
                  <div className="text-xs text-slate-500">
                    For import
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all ${
                  format === "pdf"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    format === "pdf"
                      ? "bg-blue-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  <FileText className="w-7 h-7" />
                </div>
                <div className="text-center">
                  <div className={`font-semibold text-sm ${
                    format === "pdf" ? "text-blue-700 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"
                  }`}>
                    PDF
                  </div>
                  <div className="text-xs text-slate-500">For viewing</div>
                </div>
              </button>
            </div>
          </div>

          {/* Metadata Toggle */}
          <div className="space-y-2.5 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-start gap-3">
              <Checkbox
                id="include-metadata"
                checked={includeMetadata}
                onCheckedChange={(checked) => setIncludeMetadata(checked === true)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label
                  htmlFor="include-metadata"
                  className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer font-medium block"
                >
                  Include Metadata
                </Label>
                <p className="text-xs text-slate-500 mt-1">Watchlist name, description, colors, dates</p>
              </div>
            </div>
            {!includeMetadata && (
              <div className="flex items-start gap-2 p-2 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <strong>Note:</strong> Removing metadata makes the export unsuitable for re-importing but ideal for external analysis tools.
                </p>
              </div>
            )}
          </div>

          {/* PDF Chart Options */}
          {format === "pdf" && (
            <div className="space-y-2.5 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Include Charts
              </p>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="price-chart"
                    checked={includePriceChart}
                    onCheckedChange={(checked) => setIncludePriceChart(checked === true)}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor="price-chart"
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-medium">
                      <TrendingUp className="w-4 h-4 text-brand" />
                      Price Comparison
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Bar chart comparing stock prices</p>
                  </Label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="comparison-charts"
                    checked={includeComparisonCharts}
                    onCheckedChange={(checked) => setIncludeComparisonCharts(checked === true)}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor="comparison-charts"
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-medium">
                      <BarChart3 className="w-4 h-4 text-brand" />
                      Metrics Comparison
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">P/E, Market Cap, Dividend charts</p>
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Export contents info */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                  This export includes:
                </p>
                <ul className="space-y-0.5 text-xs">
                  <li>• {watchlist.items.length} stocks with full metrics</li>
                  <li>• Peer companies for each stock</li>
                  <li>• Current prices and changes</li>
                  {includeMetadata && (
                    <li>• Watchlist metadata and notes</li>
                  )}
                  {format === "pdf" && (includePriceChart || includeComparisonCharts) && (
                    <li className="text-blue-600 dark:text-blue-400">• Visual comparison charts</li>
                  )}
                </ul>
                {format === "csv" && includeMetadata && (
                  <p className="mt-2 text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ CSV can be re-imported to restore this watchlist
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status message */}
          {status !== "idle" && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                status === "loading"
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : status === "success"
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
              }`}
            >
              {status === "loading" && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {status === "success" && <CheckCircle className="w-4 h-4" />}
              {status === "error" && <AlertCircle className="w-4 h-4" />}
              {statusMessage}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={status === "loading"}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={status === "loading" || dataLoading}
            className="gap-2"
          >
            {status === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export {format.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
