"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getBulkRealTimePrices } from "@/lib/eodhd";
import { Treemap, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

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
  name: string;
  ticker: string;
  change: number;
  size: number;
  sector: string;
}

interface TreemapNode {
  name: string;
  children?: TreemapNode[] | MarketItem[];
  sector?: string;
  size?: number;
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
  price_change_1d?: number | null;
  market_capitalization: number | null;
  market_cap?: number | null;
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

const getColor = (change: number) => {
  if (change >= 3) return "#059669"; // emerald-600
  if (change >= 1) return "#10b981"; // emerald-500
  if (change > 0) return "#34d399"; // emerald-400
  if (change === 0) return "#94a3b8"; // slate-400
  if (change <= -3) return "#e11d48"; // rose-600
  if (change <= -1) return "#f43f5e"; // rose-500
  return "#fb7185"; // rose-400
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPositive = data.change >= 0;
    return (
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-xl text-white min-w-[160px]">
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-lg">{data.ticker}</span>
          <span className={cn("text-sm font-bold", isPositive ? "text-emerald-400" : "text-rose-400")}>
            {isPositive ? "+" : ""}{data.change.toFixed(2)}%
          </span>
        </div>
        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">{data.sector}</div>
        <div className="space-y-1 pt-2 border-t border-slate-800">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Market Cap</span>
            <span className="font-medium">
              {data.size >= 1e12
                ? `$${(data.size / 1e12).toFixed(2)}T`
                : data.size >= 1e9
                  ? `$${(data.size / 1e9).toFixed(2)}B`
                  : `$${(data.size / 1e6).toFixed(2)}M`}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomTreemapCell = (props: any) => {
  const { x, y, width, height, ticker, change, root, name, sector } = props;

  // Don't render if too small
  if (width < 20 || height < 20) return null;

  const isSectorLabel = childrenCount(props) > 0;

  if (isSectorLabel) {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: 'transparent',
            stroke: 'rgba(255,255,255,0.1)',
            strokeWidth: 1,
          }}
        />
        {width > 60 && height > 20 && (
          <text
            x={x + 4}
            y={y + 14}
            fill="currentColor"
            className="text-[10px] font-bold uppercase tracking-wider opacity-40 pointer-events-none text-slate-500 dark:text-slate-400"
          >
            {name}
          </text>
        )}
      </g>
    );
  }

  return (
    <g
      className="cursor-pointer transition-all hover:brightness-110"
      onClick={() => {
        if (props.onClick) props.onClick(ticker);
      }}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: getColor(change),
          stroke: 'rgba(0,0,0,0.2)',
          strokeWidth: 1,
        }}
      />
      {width > 35 && height > 35 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - (height > 50 ? 6 : 0)}
            textAnchor="middle"
            fill="#fff"
            className={cn(
              "font-bold pointer-events-none",
              width > 60 ? "text-sm" : "text-[10px]"
            )}
          >
            {ticker}
          </text>
          {height > 50 && (
            <text
              x={x + width / 2}
              y={y + height / 2 + 12}
              textAnchor="middle"
              fill="#fff"
              className={cn(
                "font-medium pointer-events-none",
                width > 60 ? "text-xs" : "text-[8px]"
              )}
            >
              {change > 0 ? "+" : ""}{change.toFixed(1)}%
            </text>
          )}
        </>
      )}
    </g>
  );
};

const childrenCount = (props: any) => {
  return props.children ? props.children.length : 0;
};

export default function MarketHeatmap({ sector, refreshToken }: MarketHeatmapProps) {
  const [marketData, setMarketData] = useState<TreemapNode>({ name: "root", children: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [universe, setUniverse] = useState<Universe>("popular");
  const router = useRouter();

  const handleTickerClick = (ticker: string) => {
    router.push(`/company/${ticker}`);
  };

  // Helper: group screener rows into TreemapNode structure
  const buildSectorsFromRows = useCallback((rows: ScreenerRow[]): TreemapNode => {
    const bySector = new Map<string, MarketItem[]>();

    for (const row of rows) {
      const sec = row.sector || "Other";
      const change = row.refund_1d_p ?? row.price_change_1d ?? 0;
      const mcap = row.market_capitalization ?? row.market_cap ?? 0;

      const item: MarketItem = {
        name: row.code,
        ticker: row.code,
        change,
        size: mcap || 1,
        sector: sec,
      };

      const bucket = bySector.get(sec) ?? [];
      bucket.push(item);
      bySector.set(sec, bucket);
    }

    const children = Array.from(bySector.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([sectorName, stocks]) => ({
        name: sectorName,
        children: stocks.sort((a, b) => b.size - a.size)
      }));

    return { name: "market", children };
  }, []);

  useEffect(() => {
    const fetchBackendData = async (): Promise<TreemapNode | null> => {
      try {
        const config = UNIVERSE_OPTIONS.find((u) => u.value === universe) ??
          UNIVERSE_OPTIONS[0];

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

        if (!res.ok) return null;

        const json = (await res.json()) as { data?: ScreenerRow[] };
        let rows = json.data ?? [];

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
          filtered = rows.filter((r) => {
            const mcap = r.market_capitalization ?? r.market_cap ?? 0;
            if (universe === "small") return mcap > 0 && mcap <= 20_000_000_000;
            return mcap > 0 && mcap <= 2_000_000_000;
          });
        }
        if (!filtered.length) filtered = rows;

        return buildSectorsFromRows(filtered);
      } catch (e) {
        return null;
      }
    };

    const fetchFallbackData = async (): Promise<TreemapNode> => {
      const allTickers = SECTORS.flatMap((s) => s.tickers);
      const data = await getBulkRealTimePrices(allTickers);

      const children = SECTORS.map((sectorDef) => {
        const stocks = sectorDef.tickers.map((ticker) => {
          const stock = data.find(
            (d) => d.code === ticker.replace(".US", "") || d.code === ticker
          );
          const change = stock?.change_p || 0;
          return {
            name: ticker.replace(".US", ""),
            ticker: ticker.replace(".US", ""),
            change,
            size: (100 + Math.random() * 900) * 1e9,
            sector: sectorDef.sector,
          } as MarketItem;
        });
        return { name: sectorDef.sector, children: stocks.sort((a, b) => b.size - a.size) };
      });

      return { name: "market", children };
    };

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const backend = await fetchBackendData();
        if (backend && backend.children?.length) {
          setMarketData(backend);
        } else {
          const fallback = await fetchFallbackData();
          setMarketData(fallback);
          setError("Showing a curated set of large caps while full market data is unavailable.");
        }
      } catch (e) {
        const fallback = await fetchFallbackData();
        setMarketData(fallback);
        setError("Unable to load full market universe. Showing a curated fallback heatmap instead.");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [universe, sector, refreshToken, buildSectorsFromRows]);

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
        ) : error && !marketData.children?.length ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">{error}</p>
          </div>
        ) : (
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={marketData.children as any}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#1e293b"
                content={<CustomTreemapCell onClick={handleTickerClick} />}
              >
                <RechartsTooltip content={<CustomTooltip />} />
              </Treemap>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Warning message if using fallback */}
      {error && !loading && (
        <div className="px-4 py-2 bg-amber-900/20 border-t border-amber-800/30">
          <p className="text-xs text-amber-400/80 text-center">{error}</p>
        </div>
      )}
    </div>
  );
}
