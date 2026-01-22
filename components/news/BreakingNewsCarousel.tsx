"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface BreakingNewsItem {
    id: string;
    title: string;
    link: string;
    time: string;
}

const BREAKING_NEWS: BreakingNewsItem[] = [
    { id: "1", title: "Fed Holds Rates Steady, Signals Cuts in 2026", link: "#", time: "10m ago" },
    { id: "2", title: "Tech Sector Rallies as AI Earnings Beat Expectations", link: "#", time: "32m ago" },
    { id: "3", title: "Oil Prices Surge Amid Middle East Tensions", link: "#", time: "1h ago" },
];

export function BreakingNewsCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % BREAKING_NEWS.length);
        }, 5000); // Rotate every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const next = () => setCurrentIndex((prev) => (prev + 1) % BREAKING_NEWS.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + BREAKING_NEWS.length) % BREAKING_NEWS.length);

    const currentItem = BREAKING_NEWS[currentIndex];

    return (
        <div className="bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800">
            <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                    <Badge variant="destructive" className="shrink-0 gap-1.5 animate-pulse">
                        <AlertCircle className="w-3 h-3" />
                        BREAKING
                    </Badge>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        <span className="text-slate-500 dark:text-slate-400 text-xs shrink-0 font-normal">
                            {currentItem.time} •
                        </span>
                        <a href={currentItem.link} className="hover:underline truncate">
                            {currentItem.title}
                        </a>
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-4">
                    <button onClick={prev} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <ChevronLeft className="w-4 h-4 text-slate-500" />
                    </button>
                    <button onClick={next} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                </div>
            </div>
        </div>
    );
}
