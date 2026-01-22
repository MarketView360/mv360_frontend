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
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-500" />
                    Global Markets
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {["Americas", "Europe", "Asia-Pacific"].map((region) => {
                        const regionIndices = INDICES.filter(i => i.region === region);
                        if (!regionIndices.length) return null;

                        return (
                            <div key={region} className="space-y-2">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{region}</h4>
                                <div className="space-y-1">
                                    {regionIndices.map((index) => (
                                        <div key={index.symbol} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md px-2 -mx-2 transition-colors">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm text-slate-900 dark:text-slate-200">{index.name}</span>
                                                    {!index.status && ( // Placeholder for now
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                    <span>{index.price.toLocaleString()}</span>
                                                    <span className={index.status === "Open" ? "text-emerald-500" : "text-slate-400"}>
                                                        {index.status === "Open" ? "• Market Open" : "• Closed"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={`text-right ${index.change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                                                <div className="text-sm font-semibold">
                                                    {index.change > 0 ? "+" : ""}{index.changePercent.toFixed(2)}%
                                                </div>
                                                <div className="text-xs">
                                                    {index.change > 0 ? "+" : ""}{index.change.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
