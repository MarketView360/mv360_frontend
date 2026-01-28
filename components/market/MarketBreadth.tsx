"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function MarketBreadth() {
    // Mock data for breadth - in real app would come from API
    const breadth = {
        advancing: 2450,
        declining: 1840,
        unchanged: 120,
        total: 4410
    };

    const advPercent = (breadth.advancing / breadth.total) * 100;
    const decPercent = (breadth.declining / breadth.total) * 100;
    const uncPercent = (breadth.unchanged / breadth.total) * 100;
    const adRatio = (breadth.advancing / breadth.declining).toFixed(2);
    const isBullish = breadth.advancing > breadth.declining;

    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardContent className="p-4">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Market Breadth
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                        US Market
                    </span>
                </div>

                {/* Gauge Visual */}
                <div className="h-3 flex w-full rounded-full overflow-hidden mb-3">
                    <div
                        style={{ width: `${advPercent}%` }}
                        className="bg-emerald-500 hover:bg-emerald-400 transition-colors"
                    />
                    <div
                        style={{ width: `${uncPercent}%` }}
                        className="bg-slate-300 dark:bg-slate-600"
                    />
                    <div
                        style={{ width: `${decPercent}%` }}
                        className="bg-rose-500 hover:bg-rose-400 transition-colors"
                    />
                </div>

                {/* Stats Row - Compact Horizontal */}
                <div className="flex items-center justify-between text-center mb-2">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="font-bold text-base">{breadth.advancing.toLocaleString()}</span>
                        <span className="text-[10px] text-muted-foreground">Adv</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Minus className="w-3.5 h-3.5" />
                        <span className="font-semibold text-base">{breadth.unchanged}</span>
                        <span className="text-[10px] text-muted-foreground">Unch</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span className="font-bold text-base">{breadth.declining.toLocaleString()}</span>
                        <span className="text-[10px] text-muted-foreground">Dec</span>
                    </div>
                </div>

                {/* Footer Row */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">
                        A/D Ratio: <span className="font-semibold text-slate-900 dark:text-slate-200">{adRatio}</span>
                    </span>
                    <span className={`font-medium ${isBullish ? "text-emerald-500" : "text-rose-500"}`}>
                        {isBullish ? "Bullish" : "Bearish"}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
