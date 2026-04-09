"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { ContentGate } from "@/components/company/ContentGate";

interface EconomicEvent {
    time: string;
    currency: string;
    event: string;
    actual?: string;
    forecast?: string;
    previous?: string;
    impact: "High" | "Medium" | "Low";
}

const EVENTS: EconomicEvent[] = [
    { time: "08:30", currency: "USD", event: "Core CPI (MoM)", actual: "0.3%", forecast: "0.3%", previous: "0.3%", impact: "High" },
    { time: "08:30", currency: "USD", event: "CPI (YoY)", actual: "3.4%", forecast: "3.2%", previous: "3.1%", impact: "High" },
    { time: "08:30", currency: "USD", event: "Initial Jobless Claims", actual: "202K", forecast: "210K", previous: "203K", impact: "Medium" },
];

function EconomicCalendarContent() {
    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardContent className="p-4">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            Economic Calendar
                        </span>
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                        Today
                    </span>
                </div>

                {/* Compact Events List */}
                <div className="space-y-2">
                    {EVENTS.map((event, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-[10px] font-mono text-muted-foreground w-10 flex-shrink-0">{event.time}</span>
                                <span className="text-xs font-medium text-slate-900 dark:text-slate-200 truncate">{event.event}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${event.impact === "High" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" :
                                        event.impact === "Medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                            "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                    }`}>
                                    {event.impact}
                                </span>
                            </div>
                            <div className="flex gap-3 text-[10px] text-muted-foreground flex-shrink-0">
                                <span>A: <span className="font-medium text-slate-900 dark:text-slate-200">{event.actual || "--"}</span></span>
                                <span>F: {event.forecast || "--"}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                    <button className="text-[11px] text-brand hover:underline font-medium">View Full Calendar</button>
                </div>
            </CardContent>
        </Card>
    );
}

export function EconomicCalendar() {
    return (
        <ContentGate feature="Economic Calendar" status="coming-soon" compact>
            <EconomicCalendarContent />
        </ContentGate>
    );
}
