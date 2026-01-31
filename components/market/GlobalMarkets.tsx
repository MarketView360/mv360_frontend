"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";

interface IndexData {
    name: string;
    symbol: string;
    price: number;
    change: number | null;
    changePercent: number | null;
    region: "Americas" | "Europe" | "Asia-Pacific";
    status: "Open" | "Closed";
}

const INDICES: IndexData[] = [
    { name: "S&P 500", symbol: "SPX", price: 6939.02, change: -9.02, changePercent: -0.13, region: "Americas", status: "Open" },
    { name: "Nasdaq 100", symbol: "NDX", price: 25740.00, change: null, changePercent: null, region: "Americas", status: "Open" },
    { name: "Dow 30", symbol: "DJI", price: 48892.47, change: 53.78, changePercent: 0.11, region: "Americas", status: "Open" },
    { name: "FTSE 100", symbol: "UKX", price: 9734.02, change: 59.38, changePercent: 0.61, region: "Europe", status: "Closed" },
    { name: "DAX", symbol: "DAX", price: 18345.10, change: null, changePercent: null, region: "Europe", status: "Closed" },
    { name: "Nikkei 225", symbol: "NI225", price: 53370.00, change: null, changePercent: null, region: "Asia-Pacific", status: "Closed" },
    { name: "Hang Seng", symbol: "HSI", price: 23543.86, change: -623.91, changePercent: -2.65, region: "Asia-Pacific", status: "Closed" },
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
                    {INDICES.map((index) => {
                        const hasChange = index.change !== null && index.changePercent !== null;
                        const isPositive = hasChange && index.change! >= 0;

                        return (
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
