"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, TrendingDown, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type EarningsEvent = {
    symbol: string;
    name: string;
    date: string;
    time: "BMO" | "AMC" | "DMH"; // Before Market Open, After Market Close, During Market Hours
    estimatedEPS: number | null;
    actualEPS?: number | null;
    surprise?: number | null;
};

// Mock data for demonstration
const generateMockEarnings = (weekOffset: number): EarningsEvent[] => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);

    const companies = [
        { symbol: "AAPL", name: "Apple Inc." },
        { symbol: "MSFT", name: "Microsoft Corporation" },
        { symbol: "GOOGL", name: "Alphabet Inc." },
        { symbol: "AMZN", name: "Amazon.com Inc." },
        { symbol: "META", name: "Meta Platforms Inc." },
        { symbol: "NVDA", name: "NVIDIA Corporation" },
        { symbol: "TSLA", name: "Tesla Inc." },
        { symbol: "JPM", name: "JPMorgan Chase & Co." },
        { symbol: "V", name: "Visa Inc." },
        { symbol: "JNJ", name: "Johnson & Johnson" },
        { symbol: "WMT", name: "Walmart Inc." },
        { symbol: "PG", name: "Procter & Gamble Co." },
        { symbol: "MA", name: "Mastercard Inc." },
        { symbol: "UNH", name: "UnitedHealth Group" },
        { symbol: "HD", name: "The Home Depot Inc." },
    ];

    const times: ("BMO" | "AMC" | "DMH")[] = ["BMO", "AMC", "DMH"];

    return companies.slice(0, 10 + Math.floor(Math.random() * 5)).map((company, index) => {
        const eventDate = new Date(startOfWeek);
        eventDate.setDate(startOfWeek.getDate() + (index % 5));

        return {
            symbol: company.symbol,
            name: company.name,
            date: eventDate.toISOString().split("T")[0],
            time: times[index % 3],
            estimatedEPS: Math.round((Math.random() * 5 + 0.5) * 100) / 100,
            actualEPS: weekOffset < 0 ? Math.round((Math.random() * 5 + 0.3) * 100) / 100 : undefined,
            surprise: weekOffset < 0 ? Math.round((Math.random() * 20 - 10) * 10) / 10 : undefined,
        };
    });
};

const getTimeLabel = (time: string) => {
    switch (time) {
        case "BMO":
            return { label: "Before Market", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" };
        case "AMC":
            return { label: "After Market", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" };
        case "DMH":
            return { label: "During Hours", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" };
        default:
            return { label: "Unknown", color: "bg-slate-100 text-slate-700" };
    }
};

const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "short" });
};

export default function EarningsPage() {
    const router = useRouter();
    const [weekOffset, setWeekOffset] = useState(0);
    const [earnings, setEarnings] = useState<EarningsEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setEarnings(generateMockEarnings(weekOffset));
            setLoading(false);
        }, 500);
    }, [weekOffset]);

    const getWeekRange = () => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 4);

        return {
            start: startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            end: endOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        };
    };

    const groupedByDate = earnings.reduce((acc, event) => {
        if (!acc[event.date]) {
            acc[event.date] = [];
        }
        acc[event.date].push(event);
        return acc;
    }, {} as Record<string, EarningsEvent[]>);

    const weekRange = getWeekRange();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
            <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <Calendar className="h-8 w-8 text-brand" />
                            Earnings Calendar
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Track upcoming and past earnings reports for major companies
                        </p>
                    </div>

                    {/* Week Navigation */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setWeekOffset(weekOffset - 1)}
                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="text-center min-w-[180px]">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                                {weekRange.start} - {weekRange.end}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                {weekOffset === 0 ? "This Week" : weekOffset === -1 ? "Last Week" : weekOffset === 1 ? "Next Week" : `${Math.abs(weekOffset)} weeks ${weekOffset > 0 ? "ahead" : "ago"}`}
                            </div>
                        </div>
                        <button
                            onClick={() => setWeekOffset(weekOffset + 1)}
                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setWeekOffset(0)}
                            className="px-3 py-2 text-sm font-medium rounded-lg bg-brand text-white hover:bg-brand/90 transition-colors"
                        >
                            Today
                        </button>
                    </div>
                </div>

                {/* Earnings Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader className="pb-2">
                                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {[0, 1, 2].map((j) => (
                                        <div key={j} className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-2" />
                                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {Object.entries(groupedByDate)
                            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                            .map(([date, events]) => (
                                <Card key={date} className="border-slate-200 dark:border-slate-800">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                            <span className="text-brand">{getDayName(date)}</span>
                                            <span className="text-slate-500 dark:text-slate-400">
                                                {new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                            </span>
                                            <Badge variant="outline" className="ml-auto text-[10px]">
                                                {events.length}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {events.map((event) => {
                                            const timeInfo = getTimeLabel(event.time);
                                            return (
                                                <button
                                                    key={event.symbol}
                                                    onClick={() => router.push(`/company/${event.symbol}`)}
                                                    className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-bold text-slate-900 dark:text-white">
                                                            {event.symbol}
                                                        </span>
                                                        <Badge className={cn("text-[9px] px-1.5 py-0", timeInfo.color)}>
                                                            {timeInfo.label}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">
                                                        {event.name}
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-slate-500 dark:text-slate-400">
                                                            Est. EPS: <span className="font-medium text-slate-700 dark:text-slate-300">${event.estimatedEPS?.toFixed(2) ?? "-"}</span>
                                                        </span>
                                                        {event.actualEPS !== undefined && (
                                                            <span className={cn(
                                                                "font-medium flex items-center gap-0.5",
                                                                (event.surprise ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                                                            )}>
                                                                {(event.surprise ?? 0) >= 0 ? (
                                                                    <TrendingUp className="h-3 w-3" />
                                                                ) : (
                                                                    <TrendingDown className="h-3 w-3" />
                                                                )}
                                                                {(event.surprise ?? 0) >= 0 ? "+" : ""}{event.surprise?.toFixed(1)}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </CardContent>
                                </Card>
                            ))}
                    </div>
                )}

                {/* Legend */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Earnings Release Time:</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        BMO - Before Market Open
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                        AMC - After Market Close
                    </Badge>
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        DMH - During Market Hours
                    </Badge>
                </div>
            </div>
        </div>
    );
}
