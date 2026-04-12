import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock, DollarSign, SplitSquareVertical, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

export type StockEvent = {
    id: string;
    symbol: string;
    event_type: 'earnings' | 'dividend' | 'split' | 'ipo';
    date: string;
    time?: string;
    importance: 'high' | 'medium' | 'low';
    actual?: number;
    estimate?: number;
    sentiment?: 'bullish' | 'bearish' | 'neutral';
    metadata?: any;
};

interface StockEventCardProps {
    event: StockEvent;
    onClick?: () => void;
}

const getEventIcon = (type: string) => {
    switch (type) {
        case 'earnings': return <TrendingUp className="h-4 w-4" />;
        case 'dividend': return <DollarSign className="h-4 w-4" />;
        case 'split': return <SplitSquareVertical className="h-4 w-4" />;
        case 'ipo': return <Rocket className="h-4 w-4" />;
        default: return <Clock className="h-4 w-4" />;
    }
};

const getImportanceColor = (importance: string) => {
    switch (importance) {
        case 'high': return "bg-rose-500 hover:bg-rose-600 text-white border-none";
        case 'medium': return "bg-amber-500 hover:bg-amber-600 text-white border-none";
        default: return "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none";
    }
};

export const StockEventCard: React.FC<StockEventCardProps> = ({ event, onClick }) => {
    const isEarnings = event.event_type === 'earnings';
    const surprise = event.metadata?.surprise_percent;

    return (
        <Card 
            className={cn(
                "group overflow-hidden transition-all hover:shadow-lg dark:hover:shadow-brand/10 border-slate-200 dark:border-slate-800 cursor-pointer",
                event.importance === 'high' && "ring-1 ring-brand/30"
            )}
            onClick={onClick}
        >
            <CardContent className="p-0">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                                {event.symbol}
                            </span>
                            <Badge className={cn("text-[10px] uppercase font-bold px-1.5 py-0", getImportanceColor(event.importance))}>
                                {event.importance}
                            </Badge>
                        </div>
                        <div className="text-brand dark:text-brand-light">
                            {getEventIcon(event.event_type)}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 mb-3">
                        <div className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                            {event.event_type} {event.time && `• ${event.time}`}
                        </div>
                    </div>

                    {isEarnings && (
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="space-y-1">
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">Actual</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                    {event.actual != null ? `$${event.actual.toFixed(2)}` : '--'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">Estimate</p>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    {event.estimate != null ? `$${event.estimate.toFixed(2)}` : '--'}
                                </p>
                            </div>
                        </div>
                    )}

                    {event.event_type === 'dividend' && (
                        <div className="mt-2">
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">Dividend</p>
                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                {event.actual != null ? `$${event.actual.toFixed(4)}` : '--'}
                            </p>
                        </div>
                    )}

                    {event.event_type === 'split' && (
                        <div className="mt-2">
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">Ratio</p>
                            <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                {event.metadata?.split_ratio || '--'}
                            </p>
                        </div>
                    )}
                </div>

                {isEarnings && surprise != null && (
                    <div className={cn(
                        "px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between",
                        event.sentiment === 'bullish' ? "bg-emerald-50/50 dark:bg-emerald-950/10" : "bg-rose-50/50 dark:bg-rose-950/10"
                    )}>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Surprise</span>
                        <span className={cn(
                            "text-xs font-bold flex items-center gap-0.5",
                            event.sentiment === 'bullish' ? "text-emerald-600" : "text-rose-600"
                        )}>
                            {event.sentiment === 'bullish' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {surprise > 0 ? '+' : ''}{surprise.toFixed(1)}%
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
