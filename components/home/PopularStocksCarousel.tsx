"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Users, ChevronLeft, ChevronRight, Flame, ArrowUp, ArrowDown, Activity } from "lucide-react";
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

// Sample data - in production this would come from an API
const sampleStocks: Stock[] = [
    { ticker: "AAPL", name: "Apple Inc.", price: 178.72, change: 2.34, changePercent: 1.33, marketCap: "$2.8T", sparkline: [170, 172, 171, 175, 174, 176, 178] },
    { ticker: "MSFT", name: "Microsoft", price: 378.91, change: 5.21, changePercent: 1.39, marketCap: "$2.8T", sparkline: [365, 368, 370, 372, 375, 377, 378] },
    { ticker: "NVDA", name: "NVIDIA Corp", price: 495.22, change: 12.45, changePercent: 2.58, marketCap: "$1.2T", sparkline: [470, 475, 480, 485, 488, 492, 495] },
    { ticker: "GOOGL", name: "Alphabet Inc", price: 141.80, change: -1.23, changePercent: -0.86, marketCap: "$1.8T", sparkline: [145, 144, 143, 142, 141, 142, 141] },
    { ticker: "AMZN", name: "Amazon.com", price: 178.25, change: 3.45, changePercent: 1.97, marketCap: "$1.8T", sparkline: [172, 174, 175, 176, 177, 177, 178] },
    { ticker: "META", name: "Meta Platforms", price: 505.95, change: 8.76, changePercent: 1.76, marketCap: "$1.3T", sparkline: [490, 493, 496, 500, 502, 504, 505] },
    { ticker: "TSLA", name: "Tesla Inc", price: 248.50, change: -5.30, changePercent: -2.09, marketCap: "$790B", sparkline: [260, 258, 255, 252, 250, 249, 248] },
    { ticker: "BRK.B", name: "Berkshire Hathaway", price: 408.32, change: 1.87, changePercent: 0.46, marketCap: "$890B", sparkline: [405, 406, 407, 407, 408, 408, 408] },
];

type FilterType = "trending" | "gainers" | "losers" | "active";

const filterTabs: { label: string; value: FilterType; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: "Trending", value: "trending", icon: Flame },
    { label: "Gainers", value: "gainers", icon: ArrowUp },
    { label: "Losers", value: "losers", icon: ArrowDown },
    { label: "Most Active", value: "active", icon: Activity },
];

export function PopularStocksCarousel() {
    const [filter, setFilter] = useState<FilterType>("trending");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Filter and sort stocks based on selected filter
    const filteredStocks = [...sampleStocks].sort((a, b) => {
        switch (filter) {
            case "gainers":
                return b.changePercent - a.changePercent;
            case "losers":
                return a.changePercent - b.changePercent;
            case "active":
                return 0; // Would sort by volume in production
            default:
                return 0;
        }
    });

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="w-full">
            {/* Filter Tabs */}
            <div className="flex items-center justify-between mb-6">
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

                {/* Scroll Controls */}
                <div className="hidden md:flex gap-2">
                    <button
                        onClick={() => scroll("left")}
                        className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Stock Cards Carousel */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {filteredStocks.map((stock) => (
                    <StockCard key={stock.ticker} stock={stock} />
                ))}
            </div>
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
            className="flex-shrink-0 w-[220px] p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand dark:hover:border-brand hover:shadow-lg transition-all card-hover snap-start"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-200">
                    {stock.ticker.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white font-mono-numbers">
                        {stock.ticker}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {stock.name}
                    </p>
                </div>
            </div>

            {/* Price */}
            <div className="mb-3">
                <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono-numbers">
                    ${stock.price.toFixed(2)}
                </p>
                <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-growth-600 dark:text-growth-400" : "text-danger-600 dark:text-danger-400"
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
            <div className="h-12 -mx-1">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id={`gradient-${stock.ticker}`} x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="0%"
                                    stopColor={isPositive ? "#22c55e" : "#ef4444"}
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="100%"
                                    stopColor={isPositive ? "#22c55e" : "#ef4444"}
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={isPositive ? "#22c55e" : "#ef4444"}
                            strokeWidth={2}
                            fill={`url(#gradient-${stock.ticker})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Market Cap */}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Market Cap: {stock.marketCap}
            </p>
        </Link>
    );
}

// Metrics component for the hero section
export function HeroMetrics() {
    const metrics = [
        { value: "50,000+", label: "Active Investors", icon: Users },
        { value: "2M+", label: "Stocks Screened Daily", icon: Activity },
        { value: "Real-time", label: "Market Data", icon: TrendingUp },
    ];

    return (
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            {metrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                    <div key={index} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Icon className="w-5 h-5 text-brand" />
                        <div>
                            <span className="font-bold text-slate-900 dark:text-white">{metric.value}</span>
                            <span className="text-sm ml-1">{metric.label}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
