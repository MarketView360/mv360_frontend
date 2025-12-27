"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getBulkRealTimePrices } from "@/lib/eodhd";
import { ChevronRight } from "lucide-react";

// --- Mock Data Structure (to keep sectors) ---
const SECTORS = [
  {
    sector: "Electronic Technology",
    tickers: ["NVDA.US", "AAPL.US", "AVGO.US"],
  },
  {
    sector: "Technology Services",
    tickers: ["GOOGL.US", "MSFT.US", "META.US", "NFLX.US", "CRM.US", "ADBE.US"],
  },
  {
    sector: "Finance",
    tickers: ["BRK-B.US", "JPM.US", "V.US", "MA.US", "BAC.US", "WFC.US"],
  },
  {
    sector: "Retail Trade",
    tickers: ["AMZN.US", "WMT.US", "COST.US", "HD.US"],
  },
  {
    sector: "Health Technology",
    tickers: ["LLY.US", "UNH.US", "JNJ.US", "MRK.US", "ABBV.US", "PFE.US"],
  },
  {
    sector: "Consumer Non-Durables",
    tickers: ["PG.US", "KO.US", "PEP.US"],
  },
  {
    sector: "Consumer Durables",
    tickers: ["TSLA.US", "GM.US", "F.US"],
  },
  {
    sector: "Energy Minerals",
    tickers: ["XOM.US", "CVX.US", "COP.US"],
  },
  {
    sector: "Utilities",
    tickers: ["NEE.US", "DUK.US", "SO.US"],
  },
  {
    sector: "Transportation",
    tickers: ["UNP.US", "UPS.US", "FDX.US"],
  },
  {
    sector: "Producer Manufacturing",
    tickers: ["CAT.US", "DE.US", "BA.US", "RTX.US"],
  },
  {
    sector: "Consumer Services",
    tickers: ["MCD.US", "SBUX.US", "DIS.US", "NKE.US"],
  },
];

interface MarketItem {
  ticker: string;
  change: number;
  marketCap: number;
}

interface SectorData {
  sector: string;
  stocks: MarketItem[];
  totalMarketCap: number;
}

type MarketHeatmapProps = {
  sector?: string;
  refreshToken?: number;
};

// Map external sector filter values (from dropdown) to internal labels
const SECTOR_FILTER_MAP: Record<string, string> = {
  technology: "Technology",
  healthcare: "Healthcare",
  financials: "Financials",
  consumer: "Consumer",
  energy: "Energy",
  industrials: "Industrials",
  utilities: "Utilities",
  materials: "Materials",
  "real-estate": "Real Estate",
  communication: "Communication Services",
};

type ScreenerRow = {
  code: string;
  sector: string | null;
  refund_1d_p: number | null;
  market_capitalization: number | null;
};

type Universe = "popular" | "small" | "micro" | "all";

const UNIVERSE_OPTIONS: { value: Universe; label: string; maxRows: number }[] = [
  { value: "popular", label: "Popular", maxRows: 80 },
  { value: "small", label: "Small", maxRows: 200 },
  { value: "micro", label: "Micro", maxRows: 400 },
  { value: "all", label: "All tickers", maxRows: 1200 },
];

const BACKEND_URL =
  (process.env.NEXT_PUBLIC_BACKEND_URL as string | undefined) ??
  "http://localhost:4000";

// Color mapping based on percentage change
const getHeatmapColor = (change: number): string => {
  if (change >= 2) return "bg-[#00873c]"; // Deep green
  if (change >= 1) return "bg-[#1a9850]"; // Green
  if (change >= 0.5) return "bg-[#3faf5a]"; // Light green
  if (change > 0) return "bg-[#60bf6e]"; // Very light green
  if (change === 0) return "bg-[#4a4a4a]"; // Gray
  if (change > -0.5) return "bg-[#d16060]"; // Very light red
  if (change > -1) return "bg-[#c94545]"; // Light red
  if (change > -2) return "bg-[#b52f2f]"; // Red
  return "bg-[#991f1f]"; // Deep red
};

const getTextColor = (change: number): string => {
  const absChange = Math.abs(change);
  if (absChange < 0.3) return "text-white/70";
  return "text-white";
};

// Company logo URL helper
const getLogoUrl = (ticker: string): string => {
  const cleanTicker = ticker.replace(".US", "").replace("-", ".");
  return `https://img.logo.dev/ticker/${cleanTicker}?token=pk_SbCCLZl-QeKIAV7b49kBSw`;
};

export default function MarketHeatmap({ sector, refreshToken }: MarketHeatmapProps) {
  const [marketData, setMarketData] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [universe, setUniverse] = useState<Universe>("popular");
  const router = useRouter();

  // Helper: group screener rows into SectorData[]
  const buildSectorsFromRows = useCallback((rows: ScreenerRow[]): SectorData[] => {
    const bySector = new Map<string, MarketItem[]>();

    for (const row of rows) {
      const sec = row.sector || "Other";
      const change = row.refund_1d_p ?? 0;
      const mcap = row.market_capitalization ?? 0;

      const item: MarketItem = {
        ticker: row.code,
        change,
        marketCap: mcap,
      };

      const bucket = bySector.get(sec) ?? [];
      bucket.push(item);
      bySector.set(sec, bucket);
    }

    return Array.from(bySector.entries())
      .map(([sectorName, stocks]) => ({
        sector: sectorName,
        stocks: stocks.sort((a, b) => b.marketCap - a.marketCap),
        totalMarketCap: stocks.reduce((sum, s) => sum + s.marketCap, 0),
      }))
      .sort((a, b) => b.totalMarketCap - a.totalMarketCap);
  }, []);

  useEffect(() => {
    const fetchBackendData = async (): Promise<SectorData[] | null> => {
      try {
        const config = UNIVERSE_OPTIONS.find((u) => u.value === universe) ??
          UNIVERSE_OPTIONS[0];

        // Build optional sector filter for backend query using canonical sector name
        let query: string | undefined;
        let usedEquality = false;
        if (sector) {
          const mappedSector = SECTOR_FILTER_MAP[sector];
          if (mappedSector) {
            query = `sector = "${mappedSector}"`;
            usedEquality = true;
          }
        }

        const res = await fetch(`${BACKEND_URL}/api/run-query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sort: "market_capitalization.desc",
            limit: config.maxRows,
            exchange: "us",
            ...(query ? { query } : {}),
          }),
        });

        if (!res.ok) {
          console.error("Backend heatmap fetch failed", res.status, res.statusText);
          return null;
        }

        const json = (await res.json()) as { data?: ScreenerRow[] };
        let rows = json.data ?? [];

        // If equality returned empty, retry with a broader 'match' token from dropdown
        if (!rows.length && usedEquality && sector) {
          const raw = String(sector).toLowerCase();
          const MATCH_TOKEN_MAP: Record<string, string> = {
            technology: "technology",
            healthcare: "healthcare",
            financials: "financial",
            consumer: "consumer",
            industrials: "industrial",
            energy: "energy",
            utilities: "utility",
            materials: "material",
            "real-estate": "real estate",
            communication: "communication",
          };
          const token = MATCH_TOKEN_MAP[raw] ?? raw.replace(/-/g, " ");
          if (token && token.length >= 3) {
            const res2 = await fetch(`${BACKEND_URL}/api/run-query`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sort: "market_capitalization.desc",
                limit: config.maxRows,
                exchange: "us",
                query: `sector match "${token}"`,
              }),
            });
            if (res2.ok) {
              const json2 = (await res2.json()) as { data?: ScreenerRow[] };
              rows = json2.data ?? [];
            }
          }
        }

        if (!rows.length) return null;

        let filtered = rows;
        if (universe === "small" || universe === "micro") {
          // Approx buckets by market cap
          filtered = rows.filter((r) => {
            const mcap = r.market_capitalization ?? 0;
            if (universe === "small") {
              return mcap > 0 && mcap <= 20_000_000_000; // <= $20B
            }
            return mcap > 0 && mcap <= 2_000_000_000; // <= $2B
          });
        }

        // If filter removed everything, fall back to original rows
        if (!filtered.length) filtered = rows;

        return buildSectorsFromRows(filtered);
      } catch (e) {
        console.error("Error loading backend heatmap data", e);
        return null;
      }
    };

    const fetchFallbackData = async (): Promise<SectorData[]> => {
      const allTickers = SECTORS.flatMap((s) => s.tickers);
      const data = await getBulkRealTimePrices(allTickers);

      const processedData = SECTORS.map((sectorDef) => {
        const stocks = sectorDef.tickers.map((ticker) => {
          const stock = data.find(
            (d) => d.code === ticker.replace(".US", "") || d.code === ticker
          );
          if (!stock)
            return { ticker: ticker.replace(".US", ""), change: 0, marketCap: 1000000000 };

          const change = stock.change_p || 0;
          return {
            ticker: stock.code,
            change,
            marketCap: 1000000000, // Default for fallback
          };
        });
        return {
          sector: sectorDef.sector,
          stocks,
          totalMarketCap: stocks.reduce((sum, s) => sum + s.marketCap, 0),
        };
      });

      return processedData;
    };

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const backend = await fetchBackendData();
        if (backend && backend.length) {
          setMarketData(backend);
        } else {
          const fallback = await fetchFallbackData();
          setMarketData(fallback);
          setError(
            "Showing a curated set of large caps while full market data is unavailable."
          );
        }
      } catch (e) {
        console.error("Heatmap data load failed", e);
        const fallback = await fetchFallbackData();
        setMarketData(fallback);
        setError(
          "Unable to load full market universe. Showing a curated fallback heatmap instead."
        );
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [universe, sector, refreshToken, buildSectorsFromRows]);

  // Filter sectors based on search
  const filteredData = useMemo(() => {
    if (!sector) return marketData;
    const token = String(sector).replace(/-/g, " ").toLowerCase();
    return marketData.filter((group) =>
      group.sector.toLowerCase().includes(token)
    );
  }, [marketData, sector]);

  // Calculate total market cap for sizing
  const totalMarketCap = useMemo(() => {
    return filteredData.reduce((sum, s) => sum + s.totalMarketCap, 0);
  }, [filteredData]);

  // Stock cell component
  const StockCell = ({ stock, sectorTotalCap }: { stock: MarketItem; sectorTotalCap: number }) => {
    const [imgError, setImgError] = useState(false);
    const relativeSize = sectorTotalCap > 0 ? (stock.marketCap / sectorTotalCap) : 0.2;

    // Determine cell size based on market cap
    const isLarge = relativeSize > 0.3;
    const isMedium = relativeSize > 0.15;

    return (
      <button
        type="button"
        onClick={() => router.push(`/company/${stock.ticker}`)}
        className={cn(
          "relative flex flex-col items-center justify-center rounded transition-all hover:brightness-125 hover:z-10 cursor-pointer overflow-hidden border border-black/20",
          getHeatmapColor(stock.change),
          isLarge ? "p-3" : isMedium ? "p-2" : "p-1"
        )}
        style={{
          flexGrow: Math.max(stock.marketCap / 1e9, 1),
          flexBasis: isLarge ? "120px" : isMedium ? "80px" : "50px",
          minWidth: isLarge ? "100px" : isMedium ? "60px" : "40px",
          minHeight: isLarge ? "80px" : isMedium ? "50px" : "35px",
        }}
        title={`${stock.ticker}: ${stock.change >= 0 ? "+" : ""}${stock.change.toFixed(2)}%`}
      >
        {/* Logo */}
        {(isLarge || isMedium) && !imgError && (
          <div className={cn(
            "relative mb-1",
            isLarge ? "w-8 h-8" : "w-5 h-5"
          )}>
            <Image
              src={getLogoUrl(stock.ticker)}
              alt={stock.ticker}
              fill
              className="object-contain rounded"
              onError={() => setImgError(true)}
              unoptimized
            />
          </div>
        )}

        {/* Ticker */}
        <span className={cn(
          "font-bold leading-tight",
          getTextColor(stock.change),
          isLarge ? "text-sm" : isMedium ? "text-xs" : "text-[10px]"
        )}>
          {stock.ticker}
        </span>

        {/* Change percentage */}
        <span className={cn(
          "font-medium leading-tight",
          getTextColor(stock.change),
          isLarge ? "text-xs" : isMedium ? "text-[10px]" : "text-[9px]"
        )}>
          {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}%
        </span>
      </button>
    );
  };

  // Sector component
  const SectorBlock = ({ sectorData }: { sectorData: SectorData }) => {
    const sectorWeight = totalMarketCap > 0 ? (sectorData.totalMarketCap / totalMarketCap) * 100 : 10;

    return (
      <div
        className="flex flex-col min-w-0"
        style={{
          flexGrow: Math.max(sectorWeight, 5),
          flexBasis: sectorWeight > 15 ? "300px" : sectorWeight > 8 ? "200px" : "150px",
        }}
      >
        {/* Sector header */}
        <div className="flex items-center gap-1 bg-[#1a1a1a] px-2 py-1.5 text-[11px] font-medium text-slate-300 truncate">
          <span className="truncate">{sectorData.sector}</span>
          <ChevronRight className="w-3 h-3 flex-shrink-0 text-slate-500" />
        </div>

        {/* Stocks grid */}
        <div className="flex flex-wrap flex-1 gap-px bg-[#1a1a1a] p-px">
          {sectorData.stocks.slice(0, 12).map((stock) => (
            <StockCell
              key={stock.ticker}
              stock={stock}
              sectorTotalCap={sectorData.totalMarketCap}
            />
          ))}
        </div>
      </div>
    );
  };

  // Color legend
  const ColorLegend = () => (
    <div className="flex items-center justify-center gap-1 py-3 bg-[#0f0f0f]">
      <div className="flex items-center h-4">
        {/* Gradient bar */}
        <div className="flex h-full">
          <div className="w-8 bg-[#991f1f]" />
          <div className="w-8 bg-[#b52f2f]" />
          <div className="w-8 bg-[#c94545]" />
          <div className="w-8 bg-[#d16060]" />
          <div className="w-6 bg-[#4a4a4a]" />
          <div className="w-8 bg-[#60bf6e]" />
          <div className="w-8 bg-[#3faf5a]" />
          <div className="w-8 bg-[#1a9850]" />
          <div className="w-8 bg-[#00873c]" />
        </div>
      </div>
      {/* Labels */}
      <div className="flex items-center text-[10px] text-slate-400 ml-3 gap-4">
        <span>-1.2%</span>
        <span>-0.8%</span>
        <span>-0.4%</span>
        <span>0%</span>
        <span>0.4%</span>
        <span>0.8%</span>
        <span>1.2%</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f] rounded-lg overflow-hidden border border-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-[#0f0f0f] border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white">Stock Heatmap</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click a tile to view company details
          </p>
        </div>

        {/* Universe toggle */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-700 bg-[#1a1a1a] p-0.5">
            {UNIVERSE_OPTIONS.map((u) => (
              <button
                key={u.value}
                type="button"
                onClick={() => setUniverse(u.value)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  universe === u.value
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            <div className="h-10 w-10 rounded-full border-2 border-slate-700 border-t-emerald-500 animate-spin" />
            <span className="text-sm">Loading market data…</span>
          </div>
        ) : error && filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center p-4">
            <p className="text-sm text-slate-400 max-w-xs">{error}</p>
          </div>
        ) : (
          <div className="flex flex-wrap h-full gap-px bg-[#1a1a1a] p-1 content-start">
            {filteredData.map((sectorData) => (
              <SectorBlock key={sectorData.sector} sectorData={sectorData} />
            ))}
          </div>
        )}
      </div>

      {/* Color legend */}
      {!loading && filteredData.length > 0 && <ColorLegend />}

      {/* Warning message if using fallback */}
      {error && filteredData.length > 0 && (
        <div className="px-4 py-2 bg-amber-900/20 border-t border-amber-800/30">
          <p className="text-xs text-amber-400/80 text-center">{error}</p>
        </div>
      )}
    </div>
  );
}
