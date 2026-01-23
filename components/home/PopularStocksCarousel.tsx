"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown, Activity } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface Stock {
    ticker: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    marketCap: string;
    sparkline: number[];
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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

type FilterType = "gainers" | "losers" | "active";

const filterTabs: { label: string; value: FilterType; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: "Gainers", value: "gainers", icon: ArrowUp },
    { label: "Losers", value: "losers", icon: ArrowDown },
    { label: "Most Active", value: "active", icon: Activity },
];

// Format market cap similar to company pages
function formatMarketCap(value: number | null | undefined): string {
    if (!value || value === 0) return "N/A";

    const absValue = Math.abs(value);
    if (absValue >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (absValue >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (absValue >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (absValue >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
}

// Fetch real price history for sparkline
async function fetchPriceHistory(ticker: string): Promise<number[]> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/prices/${encodeURIComponent(ticker)}`);
        if (!response.ok) {
            console.warn(`Failed to fetch prices for ${ticker}`);
            return [];
        }

        const data = await response.json();
        const prices = data.prices || [];

        // Get last 20 days of prices for the sparkline
        const recentPrices = prices.slice(-20).map((p: any) => p.adj_close ?? p.close ?? 0);

        return recentPrices.filter((p: number) => p > 0);
    } catch (error) {
        console.error(`Error fetching price history for ${ticker}:`, error);
        return [];
    }
}

// Transform screener row to base stock data (without sparkline)
function transformScreenerRow(row: ScreenerRow): Omit<Stock, 'sparkline'> {
    const price = row.adjusted_close ?? 0;
    const changePercent = row.refund_1d_p ?? row.price_change_1d ?? 0;
    const change = price * (changePercent / 100);
    const marketCap = formatMarketCap(row.market_capitalization ?? row.market_cap);

    return {
        ticker: row.code,
        name: row.name,
        price,
        change,
        changePercent,
        marketCap,
    };
}

export function PopularStocksCarousel() {
    const [filter, setFilter] = useState<FilterType>("gainers");
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStocks() {
            setLoading(true);
            setError(null);

            try {
                // 1. Determine sort order based on filter
                let sort = "";
                switch (filter) {
                    case "gainers":
                        sort = "refund_1d_p.desc";
                        break;
                    case "losers":
                        sort = "refund_1d_p.asc";
                        break;
                    case "active":
                        sort = "volume.desc";
                        break;
                }

                // 2. Fetch top stocks from screener
                const response = await fetch(`${BACKEND_URL}/api/run-query`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sort,
                        limit: 6,
                        exchange: "us",
                    }),
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch stocks");
                }

                const json = await response.json() as { data?: ScreenerRow[] };
                const baseStocks = (json.data ?? [])
                    .filter(row => row.adjusted_close && row.adjusted_close > 0)
                    .map(transformScreenerRow)
                    .slice(0, 6);

                // 3. Fetch price history for each stock in parallel
                const stocksWithSparklines = await Promise.all(
                    baseStocks.map(async (stock) => {
                        const priceHistory = await fetchPriceHistory(stock.ticker);

                        // If we have real data, use it; otherwise create a simple fallback
                        const sparkline = priceHistory.length >= 5
                            ? priceHistory
                            : [stock.price, stock.price, stock.price]; // Flat line fallback

                        return {
                            ...stock,
                            sparkline,
                        };
                    })
                );

                setStocks(stocksWithSparklines);
            } catch (err) {
                console.error("Error fetching stocks:", err);
                setError("Unable to load stocks");
                setStocks([]);
            } finally {
                setLoading(false);
            }
        }

        fetchStocks();
    }, [filter]);

    return (
        <div className="w-full">
            {/* Filter Tabs */}
            <div className="flex items-center justify-center mb-6">
                <div className="flex gap-2">
                    {filterTabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.value}
                                onClick={() => setFilter(tab.value)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === tab.value
                                    ? "bg-brand text-white shadow-md shadow-brand/25"
                                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Stock Cards Grid - 6 items */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="w-full p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                                <div className="flex-1">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-2" />
                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                                </div>
                            </div>
                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-2" />
                            <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <p className="text-slate-500 dark:text-slate-400">{error}</p>
                </div>
            ) : stocks.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-slate-500 dark:text-slate-400">No stocks available</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stocks.map((stock) => (
                        <StockCard key={stock.ticker} stock={stock} />
                    ))}
                </div>
            )}
        </div>
    );
}

function StockCard({ stock }: { stock: Stock }) {
    const isPositive = stock.change >= 0;

    // Convert sparkline to chart data
    const chartData = stock.sparkline.map((value) => ({ value }));

    return (
        <Link
            href={`/company/${stock.ticker}`}
            className="w-full p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand dark:hover:border-brand hover:shadow-lg transition-all card-hover"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand/10 to-brand/5 dark:from-brand/20 dark:to-brand/10 flex items-center justify-center font-bold text-sm text-brand">
                    {stock.ticker.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white font-mono-numbers text-base">
                        {stock.ticker}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {stock.name}
                    </p>
                </div>
            </div>

            {/* Price */}
            <div className="mb-4">
                <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono-numbers">
                    ${stock.price.toFixed(2)}
                </p>
                <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? "text-growth-600 dark:text-growth-400" : "text-danger-600 dark:text-danger-400"
                    }`}>
                    {isPositive ? (
                        <TrendingUp className="w-4 h-4" />
                    ) : (
                        <TrendingDown className="w-4 h-4" />
                    )}
                    <span>
                        {isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
                    </span>
                </div>
            </div>

            {/* Sparkline */}
            <div className="h-16 -mx-1 mb-3">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id={`gradient-${stock.ticker}`} x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="0%"
                                    stopColor={isPositive ? "#10b981" : "#ef4444"}
                                    stopOpacity={0.4}
                                />
                                <stop
                                    offset="100%"
                                    stopColor={isPositive ? "#10b981" : "#ef4444"}
                                    stopOpacity={0.05}
                                />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={isPositive ? "#10b981" : "#ef4444"}
                            strokeWidth={2.5}
                            fill={`url(#gradient-${stock.ticker})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Market Cap */}
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Market Cap: {stock.marketCap}
            </p>
        </Link>
    );
}
