"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getBulkRealTimePrices } from "@/lib/eodhd";

// --- Mock Data Structure (to keep sectors) ---
const SECTORS = [
  {
    sector: "Technology",
    tickers: [
      "AAPL.US",
      "MSFT.US",
      "NVDA.US",
      "GOOGL.US",
      "META.US",
      "AVGO.US",
      "ADBE.US",
      "CRM.US",
    ],
  },
  {
    sector: "Finance",
    tickers: ["JPM.US", "V.US", "MA.US", "BAC.US", "WFC.US"],
  },
  {
    sector: "Healthcare",
    tickers: ["LLY.US", "UNH.US", "JNJ.US", "MRK.US", "ABBV.US"],
  },
  {
    sector: "Consumer",
    tickers: ["AMZN.US", "TSLA.US", "WMT.US", "PG.US", "COST.US"],
  },
  {
    sector: "Energy",
    tickers: ["XOM.US", "CVX.US", "COP.US"],
  },
];

interface MarketItem {
  ticker: string;
  change: number;
  size: number;
}

interface SectorData {
  sector: string;
  stocks: MarketItem[];
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

export default function MarketHeatmap({ sector, refreshToken }: MarketHeatmapProps) {
  const [marketData, setMarketData] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [universe, setUniverse] = useState<Universe>("popular");
  const router = useRouter();

  // Helper: group screener rows into SectorData[]
  const buildSectorsFromRows = (rows: ScreenerRow[]): SectorData[] => {
    const bySector = new Map<string, MarketItem[]>();

    for (const row of rows) {
      const sec = row.sector || "Other";
      const change = row.refund_1d_p ?? 0;
      const mcap = row.market_capitalization ?? 0;

      const sizeBase = mcap > 0 ? Math.log10(mcap) : 1;
      const size = 40 + sizeBase * 6 + Math.abs(change) * 1.5;

      const item: MarketItem = {
        ticker: row.code,
        change,
        size,
      };

      const bucket = bySector.get(sec) ?? [];
      bucket.push(item);
      bySector.set(sec, bucket);
    }

    return Array.from(bySector.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([sectorName, stocks]) => ({ sector: sectorName, stocks }));
  };

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
            return { ticker: ticker.replace(".US", ""), change: 0, size: 50 };

          const change = stock.change_p || 0;
          return {
            ticker: stock.code,
            change,
            size: 50 + Math.abs(change) * 10,
          };
        });
        return { sector: sectorDef.sector, stocks };
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
  }, [universe, sector, refreshToken]);

  const getColor = (change: number) => {
    if (change >= 3) return "bg-emerald-600";
    if (change >= 1) return "bg-emerald-500";
    if (change > 0) return "bg-emerald-400";
    if (change === 0) return "bg-slate-400";
    if (change <= -3) return "bg-rose-600";
    if (change <= -1) return "bg-rose-500";
    return "bg-rose-400";
  };

  return (
    <Card className="h-full border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="pb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-xl font-bold font-heading text-slate-900 dark:text-white">
            Market Heatmap
          </CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visualize breadth and rotation across the market. Click a tile to open the company page.
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900 px-2 py-1 gap-1">
            {UNIVERSE_OPTIONS.map((u) => (
              <button
                key={u.value}
                type="button"
                onClick={() => setUniverse(u.value)}
                className={cn(
                  "px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                  universe === u.value
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border border-slate-900 dark:border-white"
                    : "bg-transparent border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
                aria-pressed={universe === u.value}
              >
                {u.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-emerald-500" />
              <span>Strong gainers</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-slate-400" />
              <span>Flat</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-rose-500" />
              <span>Decliners</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[600px] p-4 pt-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-500 dark:text-slate-400 text-sm">
            <div className="h-10 w-10 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-brand animate-spin" />
            <span>Loading market data…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              {error}
            </p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-wrap gap-2 content-start overflow-y-auto">
            {marketData
              .filter((group) => {
                if (!sector) return true;
                const token = String(sector).replace(/-/g, " ").toLowerCase();
                return group.sector.toLowerCase().includes(token);
              })
              .map((secGroup) => (
              <div
                key={secGroup.sector}
                className="grow min-w-[200px] flex flex-col gap-1"
              >
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 px-1">
                  {secGroup.sector}
                </div>
                <div className="flex flex-wrap gap-1 h-full">
                  {secGroup.stocks.map((stock) => (
                    <button
                      key={stock.ticker}
                      type="button"
                      onClick={() => router.push(`/company/${stock.ticker}`)}
                      className={cn(
                        "relative flex flex-col items-center justify-center p-2 rounded-md text-white transition-all hover:brightness-110 cursor-pointer group overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand focus-visible:ring-offset-slate-950",
                        getColor(stock.change)
                      )}
                      style={{
                        flexGrow: stock.size,
                        minWidth: "60px",
                        minHeight: "60px",
                      }}
                    >
                      <span className="font-bold text-sm z-10">
                        {stock.ticker}
                      </span>
                      <span className="text-xs font-medium z-10">
                        {stock.change > 0 ? "+" : ""}
                        {stock.change.toFixed(2)}%
                      </span>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
