"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
} from "lucide-react";

// Types
interface HeatmapStock {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  market_cap: number;
  price: number | null;
  change_1d: number | null;
  change_1w: number | null;
  weight: number | null;
  volume: number | null;
}

interface HeatmapSector {
  sector: string;
  stocks: HeatmapStock[];
  totalMarketCap: number;
  avgChange: number;
  advancers: number;
  decliners: number;
}

interface HeatmapResponse {
  sectors: HeatmapSector[];
  summary: {
    totalStocks: number;
    advancers: number;
    decliners: number;
    unchanged: number;
    avgChange: number;
    topSector: { name: string; change: number } | null;
    weakestSector: { name: string; change: number } | null;
  };
  index: string;
  lastUpdated: string;
  hasPriceData: boolean;
}

interface TreemapNode {
  x: number;
  y: number;
  width: number;
  height: number;
  data: HeatmapStock;
  sector: string;
}

interface SectorRect {
  x: number;
  y: number;
  width: number;
  height: number;
  sector: string;
  avgChange: number;
}

// Proper squarified treemap - Bruls, Huizing, van Wijk algorithm
interface TreemapItem<T> {
  value: number;
  data: T;
}

function squarify<T>(
  items: TreemapItem<T>[],
  x: number,
  y: number,
  width: number,
  height: number
): { x: number; y: number; width: number; height: number; data: T }[] {
  const results: { x: number; y: number; width: number; height: number; data: T }[] = [];
  
  if (items.length === 0 || width <= 0 || height <= 0) return results;
  
  const totalValue = items.reduce((sum, item) => sum + item.value, 0);
  if (totalValue <= 0) return results;

  // Normalize values to area
  const scale = (width * height) / totalValue;
  const normalizedItems = items
    .filter(item => item.value > 0)
    .map(item => ({ ...item, area: item.value * scale }))
    .sort((a, b) => b.area - a.area);

  squarifyHelper(normalizedItems, [], x, y, width, height, results);
  
  return results;
}

function squarifyHelper<T>(
  children: (TreemapItem<T> & { area: number })[],
  row: (TreemapItem<T> & { area: number })[],
  x: number,
  y: number,
  width: number,
  height: number,
  results: { x: number; y: number; width: number; height: number; data: T }[]
): void {
  if (children.length === 0) {
    if (row.length > 0) {
      layoutRowHelper(row, x, y, width, height, results);
    }
    return;
  }

  const child = children[0];
  const restChildren = children.slice(1);
  
  if (row.length === 0) {
    squarifyHelper(restChildren, [child], x, y, width, height, results);
    return;
  }

  const newRow = [...row, child];
  const shortSide = Math.min(width, height);
  
  if (worstAspectRatio(newRow, shortSide) <= worstAspectRatio(row, shortSide)) {
    squarifyHelper(restChildren, newRow, x, y, width, height, results);
  } else {
    // Layout current row
    const rowArea = row.reduce((sum, r) => sum + r.area, 0);
    
    if (width >= height) {
      // Vertical strip on left
      const rowWidth = rowArea / height;
      layoutRowHelper(row, x, y, rowWidth, height, results);
      squarifyHelper(children, [], x + rowWidth, y, width - rowWidth, height, results);
    } else {
      // Horizontal strip on top
      const rowHeight = rowArea / width;
      layoutRowHelper(row, x, y, width, rowHeight, results);
      squarifyHelper(children, [], x, y + rowHeight, width, height - rowHeight, results);
    }
  }
}

function worstAspectRatio(row: { area: number }[], sideLength: number): number {
  if (row.length === 0 || sideLength <= 0) return Infinity;
  
  const totalArea = row.reduce((sum, r) => sum + r.area, 0);
  const rowWidth = totalArea / sideLength;
  
  let worst = 0;
  for (const item of row) {
    const itemHeight = item.area / rowWidth;
    const ratio = Math.max(rowWidth / itemHeight, itemHeight / rowWidth);
    worst = Math.max(worst, ratio);
  }
  
  return worst;
}

function layoutRowHelper<T>(
  row: (TreemapItem<T> & { area: number })[],
  x: number,
  y: number,
  width: number,
  height: number,
  results: { x: number; y: number; width: number; height: number; data: T }[]
): void {
  if (row.length === 0) return;

  const totalArea = row.reduce((sum, r) => sum + r.area, 0);
  const isVertical = height >= width;
  
  let offset = 0;
  
  for (const item of row) {
    const ratio = item.area / totalArea;
    
    if (isVertical) {
      const itemHeight = height * ratio;
      results.push({
        x,
        y: y + offset,
        width,
        height: itemHeight,
        data: item.data,
      });
      offset += itemHeight;
    } else {
      const itemWidth = width * ratio;
      results.push({
        x: x + offset,
        y,
        width: itemWidth,
        height,
        data: item.data,
      });
      offset += itemWidth;
    }
  }
}

// Layout sectors and stocks
function layoutSectors(
  sectors: HeatmapSector[],
  width: number,
  height: number
): { sectorRects: SectorRect[]; stockNodes: TreemapNode[] } {
  const sectorRects: SectorRect[] = [];
  const stockNodes: TreemapNode[] = [];

  if (sectors.length === 0) return { sectorRects, stockNodes };

  // Layout sectors using squarified treemap
  const sectorItems = sectors.map(s => ({ value: s.totalMarketCap, data: s }));
  const sectorPositions = squarify(sectorItems, 0, 0, width, height);

  // Layout stocks within each sector
  for (const pos of sectorPositions) {
    sectorRects.push({
      x: pos.x,
      y: pos.y,
      width: pos.width,
      height: pos.height,
      sector: pos.data.sector,
      avgChange: pos.data.avgChange,
    });

    // Leave space for sector label
    const padding = 1;
    const labelHeight = 16;
    const innerX = pos.x + padding;
    const innerY = pos.y + labelHeight;
    const innerWidth = pos.width - padding * 2;
    const innerHeight = pos.height - labelHeight - padding;

    if (innerWidth > 5 && innerHeight > 5) {
      const stockItems = pos.data.stocks.map(stock => ({
        value: stock.market_cap,
        data: stock,
      }));
      
      const stockRects = squarify(stockItems, innerX, innerY, innerWidth, innerHeight);
      
      for (const rect of stockRects) {
        stockNodes.push({
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          data: rect.data,
          sector: rect.data.sector,
        });
      }
    }
  }

  return { sectorRects, stockNodes };
}

// Color functions
function getChangeColor(change: number | null): string {
  if (change === null) return "#374151"; // gray-700

  const absChange = Math.abs(change);

  if (absChange < 0.2) return "#374151"; // Flat - gray
  
  if (change > 0) {
    if (absChange >= 5) return "#047857"; // Extreme green
    if (absChange >= 3) return "#059669"; // Strong green
    if (absChange >= 2) return "#10b981"; // Medium green
    if (absChange >= 1) return "#34d399"; // Light green
    return "#6ee7b7"; // Very light green
  } else {
    if (absChange >= 5) return "#991b1b"; // Extreme red
    if (absChange >= 3) return "#b91c1c"; // Strong red
    if (absChange >= 2) return "#dc2626"; // Medium red
    if (absChange >= 1) return "#ef4444"; // Light red
    return "#f87171"; // Very light red
  }
}

function getTextColor(change: number | null): string {
  if (change === null) return "#9ca3af";
  const absChange = Math.abs(change);
  if (absChange < 0.2) return "#9ca3af";
  return "#ffffff";
}

// Format market cap
function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
}

// Stock tile component
function StockTile({
  node,
  onClick,
}: {
  node: TreemapNode;
  onClick: (ticker: string) => void;
}) {
  const stock = node.data;
  const [logoError, setLogoError] = useState(false);
  const bgColor = getChangeColor(stock.change_1d);
  const textColor = getTextColor(stock.change_1d);

  // Determine what to show based on tile size
  const minDim = Math.min(node.width, node.height);
  const showTicker = minDim > 25;
  const showChange = minDim > 40;
  const showName = minDim > 80 && node.width > 100;

  // Build logo URL similar to CompanyLogo component
  const cleanTicker = stock.ticker?.replace(/\.US$/i, "") ?? "";
  const symbol = cleanTicker.toLowerCase();
  const logoToken = process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY;
  const logoSrc = logoToken && symbol
    ? `https://img.logo.dev/ticker/${encodeURIComponent(symbol)}?token=${logoToken}`
    : null;

  // Only show logo when tile is reasonably large
  const showLogo = !!logoSrc && !logoError && minDim > 40;

  // Font sizes based on tile size
  const tickerSize = minDim > 100 ? "text-sm" : minDim > 60 ? "text-xs" : "text-[10px]";
  const changeSize = minDim > 100 ? "text-xs" : "text-[9px]";

  return (
    <TooltipProvider delayDuration={50}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="absolute cursor-pointer transition-all duration-150 hover:z-50 hover:brightness-125 hover:scale-[1.02] border border-black/30"
            style={{
              left: node.x,
              top: node.y,
              width: node.width,
              height: node.height,
              backgroundColor: bgColor,
            }}
            onClick={() => onClick(stock.ticker)}
          >
            {showLogo && (
              <div className="absolute left-0.5 top-0.5 z-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoSrc}
                  alt={`${stock.ticker} logo`}
                  className="w-4 h-4 object-contain opacity-80"
                  onError={() => setLogoError(true)}
                />
              </div>
            )}
            <div
              className="w-full h-full flex flex-col items-center justify-center p-0.5 overflow-hidden"
              style={{ color: textColor }}
            >
              {showTicker && (
                <span className={cn("font-bold leading-none truncate", tickerSize)}>
                  {stock.ticker}
                </span>
              )}
              {showChange && stock.change_1d !== null && (
                <span className={cn("font-medium leading-none", changeSize)}>
                  {stock.change_1d > 0 ? "+" : ""}
                  {stock.change_1d.toFixed(2)}%
                </span>
              )}
              {showName && (
                <span className="text-[8px] opacity-70 truncate max-w-full mt-0.5">
                  {stock.name.split(" ").slice(0, 2).join(" ")}
                </span>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-gray-900 border-gray-700 text-white p-3 z-[100]"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-sm">{stock.ticker}</div>
                <div className="text-xs text-gray-400 max-w-[200px] truncate">
                  {stock.name}
                </div>
              </div>
              <div
                className={cn(
                  "text-lg font-bold font-mono",
                  stock.change_1d !== null && stock.change_1d >= 0
                    ? "text-green-400"
                    : "text-red-400"
                )}
              >
                {stock.change_1d !== null
                  ? `${stock.change_1d > 0 ? "+" : ""}${stock.change_1d.toFixed(2)}%`
                  : "—"}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs pt-1 border-t border-gray-700">
              <div className="text-gray-400">Market Cap</div>
              <div className="font-mono text-right">{formatMarketCap(stock.market_cap)}</div>
              <div className="text-gray-400">1W Change</div>
              <div
                className={cn(
                  "font-mono text-right",
                  stock.change_1w !== null && stock.change_1w >= 0
                    ? "text-green-400"
                    : "text-red-400"
                )}
              >
                {stock.change_1w !== null
                  ? `${stock.change_1w > 0 ? "+" : ""}${stock.change_1w.toFixed(2)}%`
                  : "—"}
              </div>
              <div className="text-gray-400">Sector</div>
              <div className="text-right truncate">{stock.sector}</div>
              {stock.industry && (
                <>
                  <div className="text-gray-400">Industry</div>
                  <div className="text-right truncate max-w-[120px]">{stock.industry}</div>
                </>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Sector label component
function SectorLabel({ rect }: { rect: SectorRect }) {
  if (rect.width < 60 || rect.height < 20) return null;

  const changeColor = rect.avgChange >= 0 ? "text-green-400" : "text-red-400";

  return (
    <div
      className="absolute pointer-events-none z-20"
      style={{
        left: rect.x + 4,
        top: rect.y + 2,
      }}
    >
      <div className="flex items-center gap-2 bg-black/60 px-1.5 py-0.5 rounded text-xs">
        <span className="text-white font-semibold uppercase tracking-wider text-[10px]">
          {rect.sector}
        </span>
        <span className={cn("font-mono text-[10px]", changeColor)}>
          {rect.avgChange >= 0 ? "+" : ""}
          {rect.avgChange.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

// Main heatmap component
export function MarketHeatmapNew() {
  const router = useRouter();
  const [data, setData] = useState<HeatmapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sector options loaded from backend
  const [sectors, setSectors] = useState<string[]>([]);

  // Filter state - default to S&P 500 and Large Cap
  const [selectedIndex, setSelectedIndex] = useState<string>("sp500");
  const [selectedCap, setSelectedCap] = useState<"large" | "mid" | "small" | "all">("large");
  const [selectedSector, setSelectedSector] = useState<string | "all">("all");

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const params = new URLSearchParams();
      params.set("index", selectedIndex);
      params.set("cap", selectedCap);
      if (selectedSector !== "all") {
        params.set("sector", selectedSector);
      }

      const response = await fetch(`${backendUrl}/api/market/heatmap?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [selectedIndex, selectedCap, selectedSector]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load sectors list once for the sector filter
  useEffect(() => {
    const loadSectors = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
        const response = await fetch(`${backendUrl}/api/market/sectors`);
        if (!response.ok) {
          return;
        }
        const json = await response.json();

        // Extract sector names from the sector performance data
        if (Array.isArray(json)) {
          // If json is array of sector objects, extract the sector names
          const sectorNames = json.map((item: any) => 
            typeof item === 'string' ? item : item.sector
          ).filter(Boolean);
          setSectors(sectorNames as string[]);
        } else if (Array.isArray(json?.sectors)) {
          setSectors(json.sectors as string[]);
        }
      } catch {
        // ignore sector load errors; filter will just be minimal
      }
    };

    loadSectors();
  }, []);

  // Build treemap layout using proper squarified algorithm
  const { sectorRects, stockNodes } = useMemo(() => {
    if (!data?.sectors.length) {
      return { sectorRects: [], stockNodes: [] };
    }

    const containerWidth = 1200;
    const containerHeight = 650;

    return layoutSectors(data.sectors, containerWidth, containerHeight);
  }, [data]);

  const handleStockClick = useCallback(
    (ticker: string) => {
      router.push(`/company/${ticker}`);
    },
    [router]
  );

  // Index options
  const indexOptions = [
    { id: "sp500", name: "S&P 500" },
    { id: "russell2000", name: "Russell 2000" },
    { id: "nasdaq", name: "NASDAQ" },
  ];

  // Cap options
  const capOptions = [
    { id: "large", name: "Large Cap" },
    { id: "mid", name: "Mid Cap" },
    { id: "small", name: "Small Cap" },
    { id: "all", name: "All Caps" },
  ];

  return (
    <div className="bg-gray-950 rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white">Market Heatmap</h2>

          {/* Index selector */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            {indexOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedIndex(opt.id)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  selectedIndex === opt.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                )}
              >
                {opt.name}
              </button>
            ))}
          </div>

          {/* Cap selector */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            {capOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedCap(opt.id as typeof selectedCap)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  selectedCap === opt.id
                    ? "bg-emerald-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                )}
              >
                {opt.name}
              </button>
            ))}
          </div>

          {/* Sector selector */}
          <div className="flex items-center gap-2 ml-2">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value || "all")}
              className="bg-gray-800 text-xs text-gray-200 rounded-md px-2 py-1 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Sectors</option>
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
            {selectedSector !== "all" && (
              <button
                type="button"
                onClick={() => setSelectedSector("all")}
                className="text-[11px] text-gray-400 hover:text-white underline underline-offset-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          className="text-gray-400 hover:text-white"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Summary bar */}
      {data?.summary && (
        <div className="flex items-center gap-6 px-4 py-2 bg-gray-900/30 border-b border-gray-800 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-500 font-medium">{data.summary.advancers}</span>
            <span className="text-gray-500">advancing</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <span className="text-red-500 font-medium">{data.summary.decliners}</span>
            <span className="text-gray-500">declining</span>
          </div>
          <div className="flex items-center gap-2">
            <Minus className="w-4 h-4 text-gray-500" />
            <span className="text-gray-400 font-medium">{data.summary.unchanged}</span>
            <span className="text-gray-500">unchanged</span>
          </div>
          <div className="h-4 w-px bg-gray-700" />
          <div className="text-gray-400">
            Avg:{" "}
            <span
              className={cn(
                "font-mono font-medium",
                data.summary.avgChange >= 0 ? "text-green-400" : "text-red-400"
              )}
            >
              {data.summary.avgChange >= 0 ? "+" : ""}
              {data.summary.avgChange.toFixed(2)}%
            </span>
          </div>
          {data.summary.topSector && (
            <>
              <div className="h-4 w-px bg-gray-700" />
              <div className="text-gray-400">
                Top:{" "}
                <span className="text-green-400 font-medium">
                  {data.summary.topSector.name}
                </span>
              </div>
            </>
          )}
          {data.summary.weakestSector && (
            <div className="text-gray-400">
              Weak:{" "}
              <span className="text-red-400 font-medium">
                {data.summary.weakestSector.name}
              </span>
            </div>
          )}
          {!data.hasPriceData && (
            <div className="flex items-center gap-1 text-yellow-500">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">Price data unavailable</span>
            </div>
          )}
        </div>
      )}

      {/* Heatmap area */}
      <div className="relative" style={{ height: 650 }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950/80 z-50">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="text-gray-400 text-sm">Loading heatmap...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
              <p className="text-red-400">{error}</p>
              <Button onClick={fetchData} variant="outline" size="sm" className="mt-4">
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Empty state when no stocks for current filters */}
        {!loading && !error && data && data.summary.totalStocks === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
            <div className="text-center max-w-md px-4">
              <div className="text-gray-200 font-medium text-lg mb-2">No stocks match the current filters</div>
              <div className="text-sm text-gray-400">
                Try a different index (for example <span className="text-emerald-400 font-semibold">Russell 2000</span>)
                or change the market cap / sector filters.
              </div>
            </div>
          </div>
        )}

        {!loading && !error && data && data.summary.totalStocks > 0 && (
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={4}
            centerOnInit
            wheel={{ step: 0.1 }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                {/* Zoom controls */}
                <div className="absolute top-2 right-2 z-30 flex flex-col gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="w-8 h-8 bg-gray-800 hover:bg-gray-700"
                    onClick={() => zoomIn()}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="w-8 h-8 bg-gray-800 hover:bg-gray-700"
                    onClick={() => zoomOut()}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="w-8 h-8 bg-gray-800 hover:bg-gray-700"
                    onClick={() => resetTransform()}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>

                <TransformComponent
                  wrapperStyle={{ width: "100%", height: "100%" }}
                  contentStyle={{ width: 1200, height: 650 }}
                >
                  <div
                    className="relative bg-gray-950"
                    style={{ width: 1200, height: 650 }}
                  >
                    {/* Sector labels */}
                    {sectorRects.map((rect, i) => (
                      <SectorLabel key={`sector-${i}`} rect={rect} />
                    ))}

                    {/* Stock tiles */}
                    {stockNodes.map((node, i) => (
                      <StockTile
                        key={`stock-${i}`}
                        node={node}
                        onClick={handleStockClick}
                      />
                    ))}
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        )}
      </div>

      {/* Color legend */}
      <div className="flex items-center justify-center gap-4 px-4 py-3 bg-gray-900/30 border-t border-gray-800">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>-5%+</span>
          <div className="flex">
            <div className="w-6 h-4" style={{ backgroundColor: "#991b1b" }} />
            <div className="w-6 h-4" style={{ backgroundColor: "#b91c1c" }} />
            <div className="w-6 h-4" style={{ backgroundColor: "#dc2626" }} />
            <div className="w-6 h-4" style={{ backgroundColor: "#ef4444" }} />
            <div className="w-6 h-4" style={{ backgroundColor: "#f87171" }} />
            <div className="w-6 h-4" style={{ backgroundColor: "#374151" }} />
            <div className="w-6 h-4" style={{ backgroundColor: "#6ee7b7" }} />
            <div className="w-6 h-4" style={{ backgroundColor: "#34d399" }} />
            <div className="w-6 h-4" style={{ backgroundColor: "#10b981" }} />
            <div className="w-6 h-4" style={{ backgroundColor: "#059669" }} />
            <div className="w-6 h-4" style={{ backgroundColor: "#047857" }} />
          </div>
          <span>+5%+</span>
        </div>
        <div className="h-4 w-px bg-gray-700" />
        <div className="text-xs text-gray-500">
          Tile size = Market Cap • Click to view company • Scroll to zoom • Drag to pan
        </div>
      </div>
    </div>
  );
}

export default MarketHeatmapNew;
