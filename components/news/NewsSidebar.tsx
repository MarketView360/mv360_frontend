"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BookOpen, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, parseISO, isValid } from "date-fns";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

interface NewsItem {
    title: string;
    link: string;
    date: string;
    content?: string;
    symbols?: string[];
}

function generateNewsSlug(title: string, link: string): string {
    const titleSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60);
    const hash = link
        .split("")
        .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
    const hashStr = Math.abs(hash).toString(36).slice(0, 6);
    return `${titleSlug}-${hashStr}`;
}

function formatTimeAgo(dateStr: string): string {
    try {
        const date = parseISO(dateStr);
        if (!isValid(date)) return dateStr;
        let relative = formatDistanceToNow(date, { addSuffix: true });
        return relative.replace(/^about\s+/i, "");
    } catch {
        return dateStr;
    }
}

function extractTrendingTickers(articles: NewsItem[]): string[] {
    const tickerCount: Record<string, number> = {};
    for (const article of articles) {
        if (article.symbols) {
            for (const sym of article.symbols) {
                const t = sym.replace(/\.US$/i, "");
                tickerCount[t] = (tickerCount[t] || 0) + 1;
            }
        }
    }
    return Object.entries(tickerCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([ticker]) => ticker);
}

export function NewsSidebar() {
    const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNews() {
            try {
                const res = await fetch(`${BACKEND_URL}/api/news?limit=20`);
                if (!res.ok) throw new Error("Failed");
                const data = await res.json();
                const items = Array.isArray(data) ? data : data.items || [];
                setLatestNews(items);
            } catch {
                setLatestNews([]);
            } finally {
                setLoading(false);
            }
        }
        fetchNews();
    }, []);

    const trendingTickers = extractTrendingTickers(latestNews);
    const topArticles = latestNews.slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Trending Tickers */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-brand" />
                        Trending in News
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                        </div>
                    ) : trendingTickers.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {trendingTickers.map((ticker) => (
                                <Link key={ticker} href={`/company/${ticker}`}>
                                    <Badge
                                        variant="secondary"
                                        className="font-medium cursor-pointer hover:bg-brand/10 hover:text-brand transition-colors"
                                    >
                                        {ticker}
                                    </Badge>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 text-center py-2">No trending tickers</p>
                    )}
                </CardContent>
            </Card>

            {/* Latest Headlines */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-brand" />
                        Latest Headlines
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    {loading ? (
                        <div className="space-y-3">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="space-y-1.5 animate-pulse">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                                </div>
                            ))}
                        </div>
                    ) : topArticles.length > 0 ? (
                        <div className="space-y-4">
                            {topArticles.map((article, index) => {
                                const slug = generateNewsSlug(article.title, article.link);
                                return (
                                    <Link
                                        key={article.link}
                                        href={`/news/${slug}`}
                                        onClick={() => {
                                            if (typeof window !== "undefined") {
                                                sessionStorage.setItem(`article_${slug}`, JSON.stringify(article));
                                            }
                                        }}
                                        className="group block"
                                    >
                                        <div className="flex gap-3">
                                            <span className="text-xl font-bold text-slate-200 dark:text-slate-700 group-hover:text-brand transition-colors shrink-0">
                                                {index + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug group-hover:text-brand transition-colors line-clamp-2">
                                                    {article.title}
                                                </h4>
                                                <span className="text-xs text-slate-400 mt-1 block">
                                                    {formatTimeAgo(article.date)}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 text-center py-2">No recent headlines</p>
                    )}
                </CardContent>
            </Card>

            {/* Newsletter Promo */}
            <div className="rounded-xl bg-gradient-to-br from-brand/10 to-brand/5 dark:from-brand/20 dark:to-transparent p-5 border border-brand/10 dark:border-brand/20">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Daily Market Brief</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
                    Get the most important market news delivered to your inbox before the bell.
                </p>
                <button className="w-full py-2 px-4 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors shadow-sm">
                    Subscribe Free
                </button>
            </div>
        </div>
    );
}
