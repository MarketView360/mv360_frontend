"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Newspaper,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Clock,
  Info,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { CompanyLogo } from "@/components/company/CompanyLogo";

function generateNewsSlug(title: string, link: string): string {
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const hash = link
    .split("")
    .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
  const hashStr = Math.abs(hash).toString(36).slice(0, 6);
  return `${titleSlug}-${hashStr}`;
}

function cacheNewsArticle(slug: string, item: { title: string; content: string; date: string; link: string; symbols?: string[] }) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(`article_${slug}`, JSON.stringify(item));
  }
}

type ScreenerRow = {
  code: string;
  name: string;
  adjusted_close: number | null;
  refund_1d_p: number | null;
  price_change_1d?: number | null;
  market_capitalization?: number | null;
  market_cap?: number | null;
};

type NewsItem = {
  date: string;
  title: string;
  content: string;
  link: string;
  symbols?: string[];
};

type MarketIndex = {
  name: string;
  symbol: string;
  value: string;
  change: string;
  changePercent: number;
  isPositive: boolean;
};

const BACKEND_URL =
  (process.env.NEXT_PUBLIC_BACKEND_URL as string | undefined) ??
  "http://localhost:4000";
type MarketOverviewProps = {
  refreshToken?: number;
  hideRefresh?: boolean;
};

export default function MarketOverview({
  refreshToken,
  hideRefresh = false,
}: MarketOverviewProps) {
  const router = useRouter();
  const [gainers, setGainers] = useState<ScreenerRow[]>([]);
  const [losers, setLosers] = useState<ScreenerRow[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Transform indices API response to MarketIndex format
  const buildIndicesFromAPI = (
    apiData: { name: string; symbol: string; price: number | null; changePercent: number | null }[]
  ): MarketIndex[] => {
    return apiData.map((idx) => {
      const price = idx.price ?? 0;
      const change = idx.changePercent ?? 0;
      const isPositive = change >= 0;

      return {
        name: idx.name,
        symbol: idx.symbol,
        value: price > 0 ? `$${price.toFixed(2)}` : "—",
        change: `${isPositive ? "+" : ""}${change.toFixed(2)}%`,
        changePercent: change,
        isPositive,
      };
    });
  };

  const fetchData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [gainersRes, losersRes, newsRes, indicesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/run-query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sort: "refund_1d_p.desc",
            limit: 10,
            exchange: "us",
          }),
        }),
        fetch(`${BACKEND_URL}/api/run-query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sort: "refund_1d_p.asc",
            limit: 10,
            exchange: "us",
          }),
        }),
        fetch(`${BACKEND_URL}/api/news?limit=3`),
        fetch(`${BACKEND_URL}/api/indices`),
      ]);

      if (!gainersRes.ok || !losersRes.ok || !newsRes.ok) {
        throw new Error("Failed to load market overview data");
      }

      const gainersJson = (await gainersRes.json()) as {
        data?: ScreenerRow[];
      };
      const losersJson = (await losersRes.json()) as {
        data?: ScreenerRow[];
      };
      const newsJson = (await newsRes.json()) as NewsItem[];

      // Parse indices data
      let indicesData: { name: string; symbol: string; price: number | null; changePercent: number | null }[] = [];
      if (indicesRes.ok) {
        try {
          indicesData = await indicesRes.json();
        } catch {
          indicesData = [];
        }
      }

      const gainersData = gainersJson.data ?? [];
      const losersData = losersJson.data ?? [];

      setGainers(gainersData);
      setLosers(losersData);
      setNews(newsJson ?? []);
      setIndices(buildIndicesFromAPI(indicesData));
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
      setError("Unable to load live market overview right now.");
      setIndices([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    // Prevent abuse: ignore if already refreshing or if last refresh was < 5s ago
    if (isRefreshing) return;
    if (lastUpdated && Date.now() - lastUpdated.getTime() < 5000) return;
    void fetchData(true);
  }, [fetchData, isRefreshing, lastUpdated]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Use Cmd/Ctrl + Shift + R to avoid conflicting with browser reload
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "r"
      ) {
        e.preventDefault();
        handleRefresh();
      }
    },
    [handleRefresh]
  );

  // Initial load + refreshToken changes
  useEffect(() => {
    void fetchData();
  }, [fetchData, refreshToken]);

  // Keyboard shortcut listener
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Note: autoRefresh background polling is disabled to avoid continuous requests.

  const formatChange = (value: number | null | undefined) => {
    if (value === null || value === undefined || Number.isNaN(value))
      return "-";
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  const formatPrice = (value: number | null | undefined) => {
    if (value === null || value === undefined || Number.isNaN(value))
      return "-";
    return value.toFixed(2);
  };

  const gainersToShow = gainers.slice(0, 5);
  const losersToShow = losers
    .slice(0, 5)
    // losers query is asc (worst first). Keep as-is for display.
    .filter((row) => (row.refund_1d_p ?? row.price_change_1d) !== null);

  return (
    <div className="space-y-6">
      {/* Market snapshot / status */}
      {!hideRefresh && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {loading && (
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Refreshing…
              </span>
            )}
            {error && <span className="text-sm text-rose-500">{error}</span>}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8"
            >
              <RefreshCw
                className={cn("h-3 w-3 mr-1.5", isRefreshing && "animate-spin")}
              />
              Refresh
              <KbdGroup className="ml-2">
                <Kbd>⌘</Kbd>
                <Kbd>⇧</Kbd>
                <Kbd>R</Kbd>
              </KbdGroup>
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Movers */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 h-full">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <TrendingUp className="w-5 h-5 text-brand" />
                Market Movers
              </CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button aria-label="Movers info" className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    <p>
                      Movers are calculated using end-of-day adjusted closing prices from the latest two trading sessions.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
                {[0, 1].map((col) => (
                  <div key={col} className="p-4 space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="space-y-1 w-1/2">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" />
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                        </div>
                        <div className="space-y-1 w-1/3 text-right ml-auto">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 ml-auto" />
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-14 ml-auto" />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
                {/* Gainers */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                        Top Gainers
                      </h4>
                      <Badge
                        variant="outline"
                        className="text-[10px] h-4 bg-emerald-50 text-emerald-600 border-emerald-200"
                      >
                        1D
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {gainersToShow.length === 0 && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                        No gainers data available.
                      </div>
                    )}
                    {gainersToShow.map((stock) => (
                      <button
                        key={stock.code}
                        type="button"
                        onClick={() => router.push(`/company/${stock.code}`)}
                        className="w-full flex items-center gap-2.5 rounded-md px-2 py-2 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <CompanyLogo ticker={stock.code} name={stock.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-white truncate">
                            {stock.code}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {stock.name}
                          </div>
                        </div>
                        <div className="text-right w-20 shrink-0">
                          <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatChange(stock.refund_1d_p ?? stock.price_change_1d)}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            ${formatPrice(stock.adjusted_close)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Losers */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
                        Top Losers
                      </h4>
                      <Badge
                        variant="outline"
                        className="text-[10px] h-4 bg-rose-50 text-rose-600 border-rose-200"
                      >
                        1D
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {losersToShow.length === 0 && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                        No losers data available.
                      </div>
                    )}
                    {losersToShow.map((stock) => (
                      <button
                        key={stock.code}
                        type="button"
                        onClick={() => router.push(`/company/${stock.code}`)}
                        className="w-full flex items-center gap-2.5 rounded-md px-2 py-2 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <CompanyLogo ticker={stock.code} name={stock.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-white truncate">
                            {stock.code}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {stock.name}
                          </div>
                        </div>
                        <div className="text-right w-20 shrink-0">
                          <div className="font-semibold text-rose-600 dark:text-rose-400">
                            {formatChange(stock.refund_1d_p ?? stock.price_change_1d)}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            ${formatPrice(stock.adjusted_close)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* News */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 h-full">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Newspaper className="w-5 h-5 text-brand" />
              Market News
            </CardTitle>
            <button
              type="button"
              onClick={() => router.push("/news")}
              className="text-[11px] font-medium text-brand hover:text-brand/80 underline-offset-2 hover:underline"
            >
              View full news
            </button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                    </div>
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {news.length === 0 && !error && (
                  <div className="p-6 text-center">
                    <Newspaper className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No news available.
                    </p>
                  </div>
                )}
                {news.map((item, i) => {
                  const newsSlug = generateNewsSlug(item.title, item.link);
                  return (
                  <Link
                    key={i}
                    href={`/news/${newsSlug}`}
                    onClick={() => cacheNewsArticle(newsSlug, item)}
                    className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer group border-l-2 border-transparent hover:border-brand/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] h-4 bg-brand/10 text-brand border-brand/20"
                        >
                          {item.symbols?.[0] ?? "Market"}
                        </Badge>
                        {item.symbols && item.symbols.length > 1 && (
                          <span className="text-[10px] text-slate-400">
                            +{item.symbols.length - 1} more
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(item.date).toLocaleString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                          month: "short",
                          day: "2-digit",
                        })}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm mb-2 text-slate-900 dark:text-white group-hover:text-brand transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                    {item.content && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {item.content}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                      <span>Read more</span>
                      <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
