"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface BreakingNewsItem {
    id: string;
    title: string;
    link: string;
    time: string;
    date?: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);

    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "yesterday";
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
}

export function BreakingNewsCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [breakingNews, setBreakingNews] = useState<BreakingNewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNews() {
            try {
                const response = await fetch(`${BACKEND_URL}/api/news?limit=3`);

                if (!response.ok) {
                    throw new Error("Failed to fetch news");
                }

                const newsData = await response.json();

                const formattedNews: BreakingNewsItem[] = newsData.map((item: any, index: number) => ({
                    id: String(index + 1),
                    title: item.title,
                    link: item.link,
                    time: formatTimeAgo(item.date),
                    date: item.date,
                }));

                setBreakingNews(formattedNews);
            } catch (error) {
                console.error("Error fetching breaking news:", error);
                // Fallback to default message on error
                setBreakingNews([{
                    id: "1",
                    title: "Stay updated with the latest market news",
                    link: "/news",
                    time: "now",
                }]);
            } finally {
                setLoading(false);
            }
        }

        fetchNews();
    }, []);

    useEffect(() => {
        if (breakingNews.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
        }, 5000); // Rotate every 5 seconds
        return () => clearInterval(interval);
    }, [breakingNews.length]);

    const next = () => setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + breakingNews.length) % breakingNews.length);

    if (loading || breakingNews.length === 0) {
        return null; // Don't show anything while loading or if no news
    }

    const currentItem = breakingNews[currentIndex];

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
                        <a href={currentItem.link} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                            {currentItem.title}
                        </a>
                    </div>
                </div>

                {breakingNews.length > 1 && (
                    <div className="flex items-center gap-1 shrink-0 ml-4">
                        <button onClick={prev} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" aria-label="Previous news">
                            <ChevronLeft className="w-4 h-4 text-slate-500" />
                        </button>
                        <button onClick={next} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" aria-label="Next news">
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
