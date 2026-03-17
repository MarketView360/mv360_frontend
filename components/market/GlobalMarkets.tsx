"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Loader2 } from "lucide-react";

const BACKEND_URL =
  (process.env.NEXT_PUBLIC_BACKEND_URL as string | undefined) ??
  "http://localhost:4000";

interface IndexData {
    name: string;
    symbol: string;
    price: number;
    change: number | null;
    changePercent: number | null;
    status: "Open" | "Closed";
}

const FALLBACK_INDICES: IndexData[] = [
    { name: "S&P 500", symbol: "GSPC", price: 0, change: null, changePercent: null, status: "Closed" },
    { name: "Nasdaq 100", symbol: "NDX", price: 0, change: null, changePercent: null, status: "Closed" },
    { name: "Dow 30", symbol: "DJI", price: 0, change: null, changePercent: null, status: "Closed" },
    { name: "FTSE 100", symbol: "FTSE", price: 0, change: null, changePercent: null, status: "Closed" },
    { name: "DAX", symbol: "GDAXI", price: 0, change: null, changePercent: null, status: "Closed" },
    { name: "Nikkei 225", symbol: "N225", price: 0, change: null, changePercent: null, status: "Closed" },
    { name: "Hang Seng", symbol: "HSI", price: 0, change: null, changePercent: null, status: "Closed" },
];

export function GlobalMarkets() {
    const [indices, setIndices] = useState<IndexData[]>(FALLBACK_INDICES);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/market/global-indices`);
                if (!res.ok) throw new Error("Failed to fetch global indices");
                const data = await res.json();
                if (mounted && data && data.length > 0) {
                    setIndices(data);
                }
            } catch (error) {
                console.error("Failed to fetch global indices:", error);
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        void fetchData();

        // Refresh every minute
        const interval = setInterval(fetchData, 60000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 mb-6">
            <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-500" />
                    Global Markets
                    {isLoading && <Loader2 className="w-3 h-3 text-slate-400 animate-spin ml-1" />}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {indices.map((index) => {
                        const hasChange = index.change !== null && index.changePercent !== null && !isNaN(index.change);
                        const isPositive = hasChange && index.change! >= 0;

                        return (
                            <div key={index.symbol} className="flex flex-col p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-xs text-slate-900 dark:text-slate-200 truncate pr-2" title={index.name}>{index.name}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${index.status === "Open" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                                        {index.status === "Open" ? "Open" : "Closed"}
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                                        {index.price ? index.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"}
                                    </span>
                                </div>
                                <div className={`flex items-center text-xs font-medium ${!hasChange ? "text-slate-500" : isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                                    {hasChange ? (
                                        <>
                                            <span>{isPositive ? "+" : ""}{index.changePercent!.toFixed(2)}%</span>
                                            <span className="mx-1 opacity-50">|</span>
                                            <span>{isPositive ? "+" : ""}{index.change!.toFixed(2)}</span>
                                        </>
                                    ) : (
                                        <span>-</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
