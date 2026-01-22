"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTORS = [
    { name: "Technology", change: 1.45 },
    { name: "Communication Services", change: 0.92 },
    { name: "Consumer Discretionary", change: 0.65 },
    { name: "Financials", change: 0.23 },
    { name: "Industrials", change: 0.12 },
    { name: "Materials", change: -0.15 },
    { name: "Real Estate", change: -0.25 },
    { name: "Health Care", change: -0.45 },
    { name: "Consumer Staples", change: -0.55 },
    { name: "Utilities", change: -0.85 },
    { name: "Energy", change: -1.25 },
];

export function SectorPerformance() {
    const maxChange = Math.max(...SECTORS.map(s => Math.abs(s.change)));

    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-500" />
                    Sector Performance (1D)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {SECTORS.map((sector) => (
                        <div key={sector.name} className="group flex items-center gap-3 text-sm">
                            <span className="w-32 truncate text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                                {sector.name}
                            </span>

                            {/* Bar container */}
                            <div className="flex-1 flex items-center h-6 relative">
                                {/* Center Line */}
                                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />

                                {sector.change >= 0 ? (
                                    // Positive bar (right of center)
                                    <div
                                        className="h-4 bg-emerald-500 rounded-r-sm ml-[50%]"
                                        style={{ width: `${(sector.change / maxChange) * 50}%` }}
                                    />
                                ) : (
                                    // Negative bar (left of center)
                                    <div
                                        className="h-4 bg-rose-500 rounded-l-sm ml-auto mr-[50%]"
                                        style={{ width: `${(Math.abs(sector.change) / maxChange) * 50}%` }}
                                    />
                                )}
                            </div>

                            <span className={cn(
                                "w-12 text-right font-mono text-xs",
                                sector.change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                            )}>
                                {sector.change > 0 ? "+" : ""}{sector.change.toFixed(2)}%
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
