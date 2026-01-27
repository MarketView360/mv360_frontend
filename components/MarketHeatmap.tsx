"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getBulkRealTimePrices } from "@/lib/eodhd";
import { Treemap, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

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
}

type MarketHeatmapProps = {
  sector?: string;
  refreshToken?: number;
};

// Map external sector filter values (from dropdown) to actual database sector names
const SECTOR_FILTER_MAP: Record<string, string> = {
  technology: "Technology",
  healthcare: "Healthcare",
  financials: "Financial Services",
  consumer: "Consumer Cyclical",  // Note: DB also has "Consumer Defensive"
  energy: "Energy",
  industrials: "Industrials",
  utilities: "Utilities",
  materials: "Basic Materials",
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
  // Exact TradingView Heatmap Colors
  if (change >= 3.0) return "#00a96eff"; // Bright Green (Strong buy/gain)
  if (change >= 0.1) return "#00897bff"; // Standard Green
  if (change > -0.1 && change < 0.1) return "#434651ff"; // Neutral Dark Grey
  if (change <= -3.0) return "#d50000ff"; // Bright Red (Strong sell/loss)
  if (change <= -0.1) return "#f44336ff"; // Standard Red
  return "#434651ff"; // Fallback Neutral
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPositive = data.change >= 0;
    const isNeutral = Math.abs(data.change) < 0.1;

    let colorClass = isPositive ? "text-[#00a96e]" : "text-[#f44336]";
    if (isNeutral) colorClass = "text-slate-400";

    return (
      <div className="bg-[#131722] border border-[#2a2e39] p-3 rounded-none shadow-2xl text-white min-w-[180px] z-50">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="font-bold text-lg block">{data.ticker}</span>
            <span className="text-xs text-slate-400 capitalize">{data.name?.toLowerCase()}</span>
          </div>
          <span className={cn("text-base font-bold font-mono", colorClass)}>
            {isPositive ? "+" : ""}{data.change.toFixed(2)}%
          </span>
        </div>
        <div className="text-[11px] bg-[#2a2e39] text-[#b2b5be] px-2 py-0.5 rounded-sm w-fit mb-2">{data.sector}</div>
        <div className="pt-2 border-t border-[#2a2e39]">
          <div className="flex justify-between text-xs text-[#b2b5be]">
            <span>Market Cap</span>
            <span className="font-mono">
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTreemapCell = (props: any) => {
  const { x, y, width, height, ticker, change, name } = props;

  // TradingView Style Constants
  const GAP = 1; // Gap between cells

  // Adjusted coordinates for gap
  const padX = x + GAP;
  const padY = y + GAP;
  const padWidth = width - GAP * 2;
  const padHeight = height - GAP * 2;

  const isSectorLabel = childrenCount(props) > 0;

  if (isSectorLabel) {
    // Parent/Sector Node
    return (
      <g>
        <rect
          x={padX}
          y={padY}
          width={padWidth}
          height={padHeight}
          style={{
            fill: 'transparent',
            stroke: '#000000',
            strokeWidth: 3,
          }}
        />
      </g>
    );
  }

  // Leaf/Stock Node
  if (width < 10 || height < 10) return null;

  // Determine what to show based on tile size
  const showTicker = padWidth > 35 && padHeight > 25;
  const showChange = padWidth > 50 && padHeight > 40;

  // Calculate font sizes - more aggressive minimum sizes for legibility
  const tickerFontSize = Math.min(
    Math.max(padWidth / 4.5, 11),
    Math.max(padHeight / 3.5, 11),
    22
  );
  const changeFontSize = Math.min(tickerFontSize * 0.75, 14);

  return (
    <g
      className="cursor-pointer"
      onClick={() => {
        if (props.onClick) props.onClick(ticker);
      }}
    >
      <rect
        x={padX}
        y={padY}
        width={padWidth}
        height={padHeight}
        fill={getColor(change)}
        className="hover:brightness-110 transition-all"
      />

      {showTicker && (
        <foreignObject
          x={padX}
          y={padY}
          width={padWidth}
          height={padHeight}
          className="pointer-events-none"
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px',
            }}
          >
            <span
              style={{
                color: '#ffffff',
                fontSize: `${tickerFontSize}px`,
                fontWeight: 700,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                textAlign: 'center',
                lineHeight: 1.1,
                textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
              }}
            >
              {ticker}
            </span>
            {showChange && (
              <span
                style={{
                  color: '#ffffff',
                  fontSize: `${changeFontSize}px`,
                  fontWeight: 500,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  marginTop: '2px',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                }}
              >
                {change > 0 ? "+" : ""}{change.toFixed(2)}%
              </span>
            )}
          </div>
        </foreignObject>
      )}
    </g>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const buildSectorsFromRows = (rows: ScreenerRow[]): TreemapNode => {
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
  };

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
            // Explicitly select data to ensure we get what we need
            select: ["code", "sector", "market_cap", "price_change_1d"],
            sort: "market_cap.desc",
            limit: config.maxRows,
            exchange: "us",
            ...(query ? { query } : {}),
          }),
        });

        if (!res.ok) {
          console.error('[Heatmap] Backend fetch failed:', res.status, res.statusText);
          return null;
        }

        const json = (await res.json()) as { data?: ScreenerRow[] };
        let rows = json.data ?? [];

        console.log('[Heatmap] Backend response:', {
          rowCount: rows.length,
          sampleRow: rows[0],
          sampleChange: rows[0]?.price_change_1d
        });

        // Fallback search strategy if specific sector query returns empty
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
                select: ["code", "sector", "market_cap", "price_change_1d"],
                sort: "market_cap.desc",
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
      } catch {
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
      } catch {
        const fallback = await fetchFallbackData();
        setMarketData(fallback);
        setError("Unable to load full market universe. Showing a curated fallback heatmap instead.");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [universe, sector, refreshToken]);

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
      <CardContent className="h-[500px] p-4 pt-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-500 dark:text-slate-400 text-sm">
            <div className="h-10 w-10 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-brand animate-spin" />
            <span>Loading market data…</span>
          </div>
        ) : error && !marketData.children?.length ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">{error}</p>
          </div>
        ) : (
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={marketData.children as any} // eslint-disable-line @typescript-eslint/no-explicit-any
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
      </CardContent>
    </Card>
  );
}
