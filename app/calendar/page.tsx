"use client";

import { useState, useEffect } from "react";
import { StockEvent } from "@/components/calendar/StockEventCard";
import { CalendarTimeline } from "@/components/calendar/CalendarTimeline";
import { StockCentricView } from "@/components/calendar/StockCentricView";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    Calendar, 
    List, 
    LayoutGrid, 
    Filter, 
    RefreshCcw, 
    ChevronLeft, 
    ChevronRight,
    Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function StockCalendarPage() {
    const [view, setView] = useState<'timeline' | 'stock'>('timeline');
    const [events, setEvents] = useState<StockEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [importanceFilter, setImportanceFilter] = useState("all");
    
    // Date range: Default to 7 days ago to 30 days ahead
    const [dateRange, setDateRange] = useState({
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    const fetchEvents = async () => {
        setLoading(true);
        try {
            let url = `${API_URL}/events?from=${dateRange.from}&to=${dateRange.to}`;
            if (typeFilter !== 'all') url += `&type=${typeFilter}`;
            if (importanceFilter !== 'all') url += `&importance=${importanceFilter}`;
            
            const res = await fetch(url);
            const data = await res.json();
            setEvents(data);
        } catch (error) {
            console.error("Failed to fetch events:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [dateRange, typeFilter, importanceFilter]);

    const filteredEvents = events.filter(e => 
        e.symbol.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-6 lg:px-12">
            <div className="max-w-[1600px] mx-auto">
                {/* Header Section */}
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-brand rounded-2xl text-white shadow-lg shadow-brand/20">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                                Equity Intelligence <span className="text-brand">Calendar</span>
                            </h1>
                        </div>
                        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                            Premium corporate events timeline for high-impact market analysis
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                            <Button 
                                variant={view === 'timeline' ? 'default' : 'ghost'} 
                                size="sm" 
                                onClick={() => setView('timeline')}
                                className="rounded-xl h-9 px-4 font-bold"
                            >
                                <List className="h-4 w-4 mr-2" />
                                Timeline
                            </Button>
                            <Button 
                                variant={view === 'stock' ? 'default' : 'ghost'} 
                                size="sm" 
                                onClick={() => setView('stock')}
                                className="rounded-xl h-9 px-4 font-bold"
                            >
                                <LayoutGrid className="h-4 w-4 mr-2" />
                                By Stock
                            </Button>
                        </div>

                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

                        <div className="flex items-center gap-2">
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[140px] rounded-2xl border-none bg-slate-50 dark:bg-slate-800 font-bold h-11">
                                    <SelectValue placeholder="Event Type" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800">
                                    <SelectItem value="all">All Events</SelectItem>
                                    <SelectItem value="earnings">Earnings</SelectItem>
                                    <SelectItem value="dividend">Dividends</SelectItem>
                                    <SelectItem value="split">Splits</SelectItem>
                                    <SelectItem value="ipo">IPOs</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={importanceFilter} onValueChange={setImportanceFilter}>
                                <SelectTrigger className="w-[140px] rounded-2xl border-none bg-slate-50 dark:bg-slate-800 font-bold h-11">
                                    <SelectValue placeholder="Importance" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800">
                                    <SelectItem value="all">All Levels</SelectItem>
                                    <SelectItem value="high">High Only</SelectItem>
                                    <SelectItem value="medium">Medium+</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={fetchEvents}
                            className="rounded-2xl h-11 w-11 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <RefreshCcw className={cn("h-5 w-5 text-slate-500", loading && "animate-spin")} />
                        </Button>
                    </div>
                </div>

                {/* Search & Stats Bar */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    <div className="lg:col-span-3 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input 
                            placeholder="Filter by symbol (e.g. AAPL, TSLA)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-14 pl-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-lg font-medium focus-visible:ring-brand"
                        />
                    </div>
                    <Card className="rounded-2xl border-brand/20 bg-brand/5 dark:bg-brand/10 border-dashed">
                        <CardContent className="h-full flex items-center justify-center p-0">
                            <div className="text-center">
                                <p className="text-[10px] uppercase font-black text-brand tracking-widest">Active Events</p>
                                <p className="text-3xl font-black text-slate-900 dark:text-white leading-none mt-1">
                                    {filteredEvents.length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                {loading && events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <RefreshCcw className="h-12 w-12 text-brand animate-spin" />
                        <p className="text-lg font-bold text-slate-500 animate-pulse">Analyzing equity timeline...</p>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
                        <Filter className="h-16 w-16 text-slate-300 mb-4" />
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">No events found</h3>
                        <p className="text-slate-500 font-medium">Try adjusting your filters or date range</p>
                    </div>
                ) : (
                    <div className="pb-24">
                        {view === 'timeline' ? (
                            <CalendarTimeline events={filteredEvents} />
                        ) : (
                            <StockCentricView events={filteredEvents} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
