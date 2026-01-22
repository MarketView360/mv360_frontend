"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-slate-800 dark:text-slate-100 flex items-center justify-between">
                    <span>Market Breadth</span>
                    <span className="text-xs font-normal text-muted-foreground px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                        US Market
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Gauge Visual */}
                    <div className="h-4 flex w-full rounded-full overflow-hidden">
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

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="space-y-1">
                            <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                <TrendingUp className="w-4 h-4" />
                                <span className="font-semibold text-lg">{breadth.advancing}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Advancing</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400">
                                <Minus className="w-4 h-4" />
                                <span className="font-semibold text-lg">{breadth.unchanged}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Unchanged</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center justify-center gap-1.5 text-rose-600 dark:text-rose-400">
                                <TrendingDown className="w-4 h-4" />
                                <span className="font-semibold text-lg">{breadth.declining}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Declining</p>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-muted-foreground">
                        <span>A/D Ratio: <span className="font-medium text-slate-900 dark:text-slate-200">{(breadth.advancing / breadth.declining).toFixed(2)}</span></span>
                        <span className={breadth.advancing > breadth.declining ? "text-emerald-500" : "text-rose-500"}>
                            {breadth.advancing > breadth.declining ? "Bullish Sentiment" : "Bearish Sentiment"}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
