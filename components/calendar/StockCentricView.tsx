import React from "react";
import { StockEvent, StockEventCard } from "./StockEventCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StockCentricViewProps {
    events: StockEvent[];
    onEventClick?: (event: StockEvent) => void;
}

export const StockCentricView: React.FC<StockCentricViewProps> = ({ events, onEventClick }) => {
    const groupedByStock = events.reduce((acc, event) => {
        const symbol = event.symbol;
        if (!acc[symbol]) acc[symbol] = [];
        acc[symbol].push(event);
        return acc;
    }, {} as Record<string, StockEvent[]>);

    const sortedSymbols = Object.keys(groupedByStock).sort((a, b) => {
        // High importance stocks first
        const aHigh = groupedByStock[a].some(e => e.importance === 'high');
        const bHigh = groupedByStock[b].some(e => e.importance === 'high');
        if (aHigh && !bHigh) return -1;
        if (!aHigh && bHigh) return 1;
        return a.localeCompare(b);
    });

    return (
        <div className="space-y-12">
            {sortedSymbols.map((symbol) => (
                <div key={symbol} className="bg-white dark:bg-slate-900/40 rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand font-black text-xl">
                            {symbol[0]}
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                                {symbol}
                            </h3>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                {groupedByStock[symbol].length} Upcoming Events
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {groupedByStock[symbol]
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
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
