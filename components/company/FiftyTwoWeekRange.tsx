import React from "react";
import { cn } from "@/lib/utils";

interface FiftyTwoWeekRangeProps {
    low: number;
    high: number;
    current: number;
    className?: string;
}

export function FiftyTwoWeekRange({ low, high, current, className }: FiftyTwoWeekRangeProps) {
    // Ensure valid range values
    const safeLow = Math.min(low, high, current);
    const safeHigh = Math.max(low, high, current);

    if (safeHigh === safeLow) return null;

    // Calculate percentage position
    const percentage = Math.min(
        Math.max(((current - safeLow) / (safeHigh - safeLow)) * 100, 0),
        100
    );

    return (
        <div className={cn("w-full max-w-[200px]", className)}>
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5 font-medium">
                <span>Low: ${safeLow.toFixed(2)}</span>
                <span>High: ${safeHigh.toFixed(2)}</span>
            </div>
            <div className="relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                <div
                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                />
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-slate-900 border-2 border-brand rounded-full shadow-sm z-10 transition-all duration-1000 ease-out group"
                    style={{ left: `calc(${percentage}% - 8px)` }}
                >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap transition-opacity">
                        ${current.toFixed(2)}
                    </div>
                </div>
            </div>
            <div className="mt-1 text-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">52 Week Range</span>
            </div>
        </div>
    );
}
