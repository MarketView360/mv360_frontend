"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Rocket, TrendingUp, DollarSign, SplitSquareVertical } from "lucide-react";
import { StockEvent } from "@/components/calendar/StockEventCard";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function StockEventsCalendar() {
    const [events, setEvents] = useState<StockEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                // Try high+medium importance first
                let res = await fetch(`${API_URL}/events?from=${today}&to=${nextMonth}&importance=high`);
                let data: StockEvent[] = res.ok ? await res.json() : [];

                if (data.length === 0) {
                    res = await fetch(`${API_URL}/events?from=${today}&to=${nextMonth}&importance=medium`);
                    data = res.ok ? await res.json() : [];
                }

                // Fall back to all events if still empty
                if (data.length === 0) {
                    res = await fetch(`${API_URL}/events?from=${today}&to=${nextMonth}`);
                    data = res.ok ? await res.json() : [];
                }

                // Sort: high > medium > low, then by date
                const importanceOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
                data.sort((a, b) => {
                    const imp = (importanceOrder[a.importance] ?? 2) - (importanceOrder[b.importance] ?? 2);
                    if (imp !== 0) return imp;
                    return a.date.localeCompare(b.date);
                });

                setEvents(data.slice(0, 6));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'earnings': return <TrendingUp className="w-3 h-3" />;
            case 'dividend': return <DollarSign className="w-3 h-3" />;
            case 'split': return <SplitSquareVertical className="w-3 h-3" />;
            case 'ipo': return <Rocket className="w-3 h-3" />;
            default: return null;
        }
    };

    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 h-full flex flex-col hover:border-brand/30 transition-colors">
            <CardContent className="p-5 flex flex-col h-full flex-grow">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-brand/10 rounded-lg">
                            <Calendar className="w-4 h-4 text-brand" />
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                            Upcoming Market Events
                        </span>
                    </div>
                </div>

                {/* Compact Events List */}
                <div className="space-y-1 flex-grow">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="h-5 w-5 rounded-full border-2 border-brand border-t-transparent animate-spin" />
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-xs text-center py-6 text-slate-500 font-medium font-sans">
                            No high-impact events scheduled soon.
                        </div>
                    ) : (
                        events.map((event, idx) => (
                            <div 
                                key={event.id || idx} 
                                className="group flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg px-2 -mx-2 transition-all cursor-pointer" 
                                onClick={() => router.push('/calendar')}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-sm font-black text-slate-900 dark:text-white w-12 flex-shrink-0 group-hover:text-brand transition-colors">
                                        {event.symbol}
                                    </span>
                                    <div className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase flex-shrink-0">
                                        {getIcon(event.event_type)}
                                        {event.event_type}
                                    </div>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-medium">
                                        {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        {event.time && ` • ${event.time === 'BMO' ? 'Pre' : event.time === 'AMC' ? 'Post' : 'Day'}`}
                                    </span>
                                </div>
                                {event.event_type === 'earnings' && (
                                    <div className="flex text-[11px] text-slate-500 flex-shrink-0 bg-white dark:bg-slate-950 px-2 py-0.5 rounded shadow-sm border border-slate-100 dark:border-slate-800">
                                        <span className="font-medium">Est: <span className="font-bold text-slate-900 dark:text-slate-200">{event.estimate != null ? `$${event.estimate.toFixed(2)}` : "--"}</span></span>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-center mt-auto">
                    <button 
                        onClick={() => router.push('/calendar')} 
                        className="text-xs text-brand hover:text-brand/80 font-bold tracking-tight transition-colors"
                    >
                        Launch Equity Intelligence Calendar →
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}
