"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";

interface IndexData {
    name: string;
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    region: "Americas" | "Europe" | "Asia-Pacific";
    status: "Open" | "Closed";
}

const INDICES: IndexData[] = [
    { name: "S&P 500", symbol: "SPX", price: 4783.45, change: 23.45, changePercent: 0.49, region: "Americas", status: "Open" },
    { name: "Nasdaq 100", symbol: "NDX", price: 16832.90, change: 145.20, changePercent: 0.87, region: "Americas", status: "Open" },
    { name: "Dow 30", symbol: "DJI", price: 37450.10, change: -45.30, changePercent: -0.12, region: "Americas", status: "Open" },
    { name: "FTSE 100", symbol: "UKX", price: 7682.50, change: 12.10, changePercent: 0.16, region: "Europe", status: "Closed" },
    { name: "DAX", symbol: "DAX", price: 16670.30, change: 85.40, changePercent: 0.51, region: "Europe", status: "Closed" },
    { name: "Nikkei 225", symbol: "NI225", price: 33350.80, change: -120.50, changePercent: -0.36, region: "Asia-Pacific", status: "Closed" },
    { name: "Hang Seng", symbol: "HSI", price: 16250.20, change: -245.10, changePercent: -1.49, region: "Asia-Pacific", status: "Closed" },
];

export function GlobalMarkets() {
    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 mb-6">
            <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-500" />
                    Global Markets
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {INDICES.map((index) => (
                        <div key={index.symbol} className="flex flex-col p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-xs text-slate-900 dark:text-slate-200">{index.name}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${index.status === "Open" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                                    {index.status === "Open" ? "Open" : "Closed"}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-lg font-bold text-slate-900 dark:text-white">
                                    {index.price.toLocaleString()}
                                </span>
                            </div>
                            <div className={`flex items-center text-xs font-medium ${index.change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                                <span>{index.change > 0 ? "+" : ""}{index.changePercent.toFixed(2)}%</span>
                                <span className="mx-1 opacity-50">|</span>
                                <span>{index.change > 0 ? "+" : ""}{index.change.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
