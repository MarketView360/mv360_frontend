"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface NewsArticle {
    date: string;
    title: string;
    content: string;
    link: string;
    symbols?: string[];
}

function formatNewsDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function getNewsSource(link: string): string {
    try {
        const url = new URL(link);
        return url.hostname.replace(/^www\./, "");
    } catch {
        return "News";
    }
}

export function NewsFeed({
    ticker,
    limit = 10,
    initialData
}: {
    ticker: string;
    limit?: number;
    initialData?: NewsArticle[];
}) {
    const [news, setNews] = useState<NewsArticle[]>(initialData || []);
    const [loading, setLoading] = useState(!initialData);

    useEffect(() => {
        if (initialData) return;
        async function loadNews() {
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
            const params = new URLSearchParams({ ticker: ticker.toUpperCase(), limit: limit.toString() });

            try {
                const res = await fetch(`${baseUrl}/api/news?${params.toString()}`);
                if (res.ok) {
                    const data = (await res.json()) as NewsArticle[];
                    setNews(data);
                }
            } catch (err) {
                console.error("Failed to load news:", err);
            } finally {
                setLoading(false);
            }
        }
        loadNews();
    }, [ticker, limit]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Latest News</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="h-16 bg-slate-50 dark:bg-slate-900/50 animate-pulse rounded-lg" />
                        <div className="h-16 bg-slate-50 dark:bg-slate-900/50 animate-pulse rounded-lg" />
                        <div className="h-16 bg-slate-50 dark:bg-slate-900/50 animate-pulse rounded-lg" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Latest News</CardTitle>
            </CardHeader>
            <CardContent>
                {news && news.length > 0 ? (
                    <div className="space-y-4">
                        {news.map((article) => (
                            <a
                                key={article.link || `${article.title}-${article.date}`}
                                href={article.link}
                                target="_blank"
                                rel="noreferrer"
                                className="block pb-3 border-b border-slate-200 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/60 rounded-md px-2 -mx-2 transition-colors"
                            >
                                <h4 className="text-sm font-medium mb-1 text-slate-900 dark:text-white line-clamp-2">
                                    {article.title}
                                </h4>
                                <p className="text-xs text-muted-foreground mb-1">
                                    {formatNewsDate(article.date)} • {getNewsSource(article.link)}
                                </p>
                                {article.content && (
                                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                                        {article.content}
                                    </p>
                                )}
                            </a>
                        ))}
                        {limit <= 3 && (
                            <div className="pt-1 border-t border-dashed border-slate-200 dark:border-slate-700 mt-1">
                                <Link
                                    href={`/company/${ticker.toLowerCase()}/news`}
                                    className="text-xs text-brand hover:underline"
                                >
                                    Show all news for {ticker}
                                </Link>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        No recent news available.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
