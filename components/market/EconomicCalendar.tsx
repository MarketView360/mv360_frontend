"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { ContentGate } from "@/components/company/ContentGate"; // Reusing this generic gate

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
    { time: "08:30", currency: "USD", event: "Core CPI (MoM) (Dec)", actual: "0.3%", forecast: "0.3%", previous: "0.3%", impact: "High" },
    { time: "08:30", currency: "USD", event: "CPI (YoY) (Dec)", actual: "3.4%", forecast: "3.2%", previous: "3.1%", impact: "High" },
    { time: "08:30", currency: "USD", event: "Initial Jobless Claims", actual: "202K", forecast: "210K", previous: "203K", impact: "Medium" },
    { time: "10:30", currency: "USD", event: "Natural Gas Storage", actual: "-140B", forecast: "-119B", previous: "-14B", impact: "Low" },
    { time: "13:00", currency: "USD", event: "30-Year Bond Auction", actual: "4.229%", forecast: "", previous: "4.347%", impact: "Medium" },
];

function EconomicCalendarContent() {
    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    Economic Calendar
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {EVENTS.map((event, idx) => (
                        <div key={idx} className="flex items-start justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                            <div className="flex gap-3">
                                <div className="flex flex-col items-center min-w-[3rem]">
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{event.time}</span>
                                    <span className="text-[10px] text-muted-foreground">{event.currency}</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{event.event}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${event.impact === "High" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" :
                                                event.impact === "Medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                                    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                            }`}>
                                            {event.impact}
                                        </span>
                                    </div>
                                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                                        <span>Act: <span className="text-slate-900 dark:text-slate-200 font-medium">{event.actual || "--"}</span></span>
                                        <span>Fcst: {event.forecast || "--"}</span>
                                        <span>Prev: {event.previous || "--"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="pt-2 text-center">
                        <button className="text-xs text-brand hover:underline font-medium">View Full Calendar</button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function EconomicCalendar() {
    return (
        <ContentGate feature="Economic Calendar" tier="pro">
            <EconomicCalendarContent />
        </ContentGate>
    );
}
