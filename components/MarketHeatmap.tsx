"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getBulkRealTimePrices } from "@/lib/eodhd";
import { Treemap, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

// Logo.dev configuration (same as CompanyLogo component)
const LOGO_DEV_BASE = "https://img.logo.dev/ticker";
const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY;

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
  rawMarketCap: number; // Store raw market cap for tooltip display
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
  consumer: "Consumer Cyclical",
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
  { value: "small", label: "Small", maxRows: 150 },
  { value: "micro", label: "Micro", maxRows: 250 },
  { value: "all", label: "All tickers", maxRows: 400 },
];

const BACKEND_URL =
  (process.env.NEXT_PUBLIC_BACKEND_URL as string | undefined) ??
  "http://localhost:4000";

const getColor = (change: number) => {
  // TradingView-style gradient colors
  if (change >= 3.0) return "#089981"; // Bright Green (Strong gain)
  if (change >= 1.5) return "#26a69a"; // Medium Green
  if (change >= 0.1) return "#4db6ac"; // Light Green
  if (change > -0.1 && change < 0.1) return "#42454e"; // Neutral Dark Grey
  if (change <= -3.0) return "#f23645"; // Bright Red (Strong loss)
  if (change <= -1.5) return "#ef5350"; // Medium Red
  if (change <= -0.1) return "#e57373"; // Light Red
  return "#42454e"; // Fallback Neutral
};

// Helper to get logo URL
const getLogoUrl = (ticker: string): string | null => {
  if (!LOGO_DEV_TOKEN) return null;
  const cleanTicker = ticker?.replace(/\.US$/i, '') ?? '';
  const symbol = cleanTicker.toLowerCase();
  return `${LOGO_DEV_BASE}/${encodeURIComponent(symbol)}?token=${LOGO_DEV_TOKEN}`;
};

// Format market cap for display
const formatMarketCap = (mcap: number): string => {
  if (mcap >= 1e12) return `$${(mcap / 1e12).toFixed(2)}T`;
  if (mcap >= 1e9) return `$${(mcap / 1e9).toFixed(2)}B`;
  if (mcap >= 1e6) return `$${(mcap / 1e6).toFixed(2)}M`;
  return `$${mcap.toFixed(0)}`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPositive = data.change >= 0;
    const isNeutral = Math.abs(data.change) < 0.1;
    const logoUrl = getLogoUrl(data.ticker);

    let colorClass = isPositive ? "text-[#089981]" : "text-[#f23645]";
    if (isNeutral) colorClass = "text-slate-400";

    return (
      <div className="bg-[#131722] border border-[#2a2e39] p-3 rounded-lg shadow-2xl text-white min-w-[200px] z-50">
        <div className="flex items-center gap-3 mb-2">
          {logoUrl ? (
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt={`${data.ticker} logo`}
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.nextElementSibling) {
                    (target.nextElementSibling as HTMLElement).style.display = 'flex';
                  }
                }}
              />
              <div className="hidden w-full h-full items-center justify-center text-xl font-bold text-white bg-brand rounded-lg">
                {data.ticker?.[0] ?? "?"}
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-brand text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
              {data.ticker?.[0] ?? "?"}
            </div>
          )}
          <div className="flex-1">
            <span className="font-bold text-lg block">{data.ticker}</span>
            <span className="text-xs text-slate-400">{data.sector}</span>
          </div>
          <span className={cn("text-lg font-bold font-mono", colorClass)}>
            {isPositive ? "+" : ""}{data.change.toFixed(2)}%
          </span>
        </div>
        <div className="pt-2 border-t border-[#2a2e39] flex justify-between text-sm text-[#b2b5be]">
          <span>Market Cap</span>
          <span className="font-mono font-semibold text-white">
            {formatMarketCap(data.rawMarketCap || data.size)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTreemapCell = (props: any) => {
  const { x, y, width, height, ticker, change, sector } = props;

  const GAP = 0.5;
  const padX = x + GAP;
  const padY = y + GAP;
  const padWidth = Math.max(width - GAP * 2, 1);
  const padHeight = Math.max(height - GAP * 2, 1);

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
          }}
        />
      </g>
    );
  }

  // Tiny tiles - just show colored rect
  if (width < 20 || height < 20) {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={Math.max(width, 1)}
          height={Math.max(height, 1)}
          fill={getColor(change)}
        />
      </g>
    );
  }

  // Determine what to show based on tile size
  const showLogo = padWidth > 60 && padHeight > 60;
  const showTicker = padWidth > 35 && padHeight > 30;
  const showChange = padWidth > 50 && padHeight > 50;

  // Calculate sizes
  const logoSize = Math.min(Math.max(Math.min(padWidth, padHeight) * 0.35, 20), 48);
  const tickerFontSize = Math.min(Math.max(padWidth / 6, 10), 18);
  const changeFontSize = Math.min(tickerFontSize * 0.8, 14);

  const logoUrl = getLogoUrl(ticker);

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
              padding: '4px',
              gap: '2px',
            }}
          >
            {/* Logo */}
            {showLogo && logoUrl && (
              <div
                style={{
                  width: `${logoSize}px`,
                  height: `${logoSize}px`,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    padding: '3px',
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Ticker Symbol */}
            <span
              style={{
                color: '#ffffff',
                fontSize: `${tickerFontSize}px`,
                fontWeight: 700,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                textAlign: 'center',
                lineHeight: 1.1,
                textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
              }}
            >
              {ticker}
            </span>

            {/* Change Percentage */}
            {showChange && (
              <span
                style={{
                  color: '#ffffff',
                  fontSize: `${changeFontSize}px`,
                  fontWeight: 500,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
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

  // Logarithmic scaling to compress extreme size differences
  const scaleSize = (mcap: number): number => {
    if (mcap <= 0) return 1;
    // Use square root for gentler compression that still shows relative size
    return Math.sqrt(mcap / 1e6) * 10;
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
        size: scaleSize(mcap),
        rawMarketCap: mcap,
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

        // Fallback search strategy
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
          const mcap = (100 + Math.random() * 900) * 1e9;
          return {
            name: ticker.replace(".US", ""),
            ticker: ticker.replace(".US", ""),
            change,
            size: scaleSize(mcap),
            rawMarketCap: mcap,
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
              <span className="h-2 w-2 rounded-sm bg-[#089981]" />
              <span>Strong gainers</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-slate-500" />
              <span>Flat</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-[#f23645]" />
              <span>Decliners</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[700px] p-4 pt-0">
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
                stroke="none"
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
