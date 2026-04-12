import React from "react";
import { StockEvent, StockEventCard } from "./StockEventCard";
import { Badge } from "@/components/ui/badge";

interface CalendarTimelineProps {
    events: StockEvent[];
    onEventClick?: (event: StockEvent) => void;
}

export const CalendarTimeline: React.FC<CalendarTimelineProps> = ({ events, onEventClick }) => {
    const groupedByDate = events.reduce((acc, event) => {
        const date = event.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(event);
        return acc;
    }, {} as Record<string, StockEvent[]>);

    const sortedDates = Object.keys(groupedByDate).sort();

    return (
        <div className="space-y-12">
            {sortedDates.map((date) => (
                <div key={date} className="relative">
                    {/* Date Header */}
                    <div className="sticky top-0 z-10 flex items-center gap-4 py-4 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm">
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-slate-900 dark:text-white uppercase">
                                {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
                            </span>
                            <span className="text-sm font-bold text-brand">
                                {new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                        </div>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                        <Badge variant="outline" className="text-xs font-bold px-2 py-0.5 border-slate-300 dark:border-slate-700">
                            {groupedByDate[date].length} Events
                        </Badge>
                    </div>

                    {/* Events Grid for that Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                        {groupedByDate[date]
                            .sort((a, b) => {
                                // Sort by importance first
                                const impMap = { high: 0, medium: 1, low: 2 };
                                if (impMap[a.importance] !== impMap[b.importance]) {
                                    return impMap[a.importance] - impMap[b.importance];
                                }
                                return a.symbol.localeCompare(b.symbol);
                            })
                            .map((event) => (
                                <StockEventCard 
                                    key={event.id} 
                                    event={event} 
                                    onClick={() => onEventClick?.(event)} 
                                />
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
