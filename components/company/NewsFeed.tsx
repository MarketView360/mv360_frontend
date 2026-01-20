"use client";

import React, { useEffect, useMemo, useState } from "react";
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

// Some feeds embed links using a custom inline-link markup like:
// ["inline-link" data-url="https://example.com"]>[example.com]
// or variants with extra text like ]to">[example.com]. Normalize these so
// we don't show the raw markup in previews.
function cleanInlineLinks(raw: string | undefined | null): string {
    if (!raw) return "";
    let text = raw;

    // Replace inline-link blocks with just their label (if present) or URL.
    // First handle the form that includes an explicit label at the end.
    text = text.replace(
        /\["inline-link"[\s\S]*?data-url="([^"\]]+)[^]]*]?[>]*\[([^\]]+)]/g,
        (_match, url, label) => (label || url),
    );

    // Then handle any remaining inline-link blocks without a trailing [label].
    text = text.replace(
        /\["inline-link"[\s\S]*?data-url="([^"\]]+)[^]]*]/g,
        (_match, url) => url,
    );

    return text.trim();
}

// Keep slug generation in sync with app/news/[slug]/page.tsx
function generateSlugFromArticle(article: NewsArticle & { slug?: string }): string {
    if (article.slug) return article.slug;

    const titleSlug = article.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60);

    const hash = (article.link || "")
        .split("")
        .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
    const hashStr = Math.abs(hash).toString(36).slice(0, 6);

    return `${titleSlug}-${hashStr}`;
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
    initialData,
    mode = "list",
}: {
    ticker: string;
    limit?: number;
    initialData?: NewsArticle[];
    /**
     * list  - full vertical list (used on dedicated company news page)
     * cards - compact card grid (used on company overview/market/home)
     */
    mode?: "list" | "cards";
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

    const normalizedTicker = ticker.toUpperCase();

    const sortedNews = useMemo(() => {
        if (!news) return [] as NewsArticle[];
        // Prefer articles that explicitly reference this ticker
        const scored = news.map((article) => {
            const symbols = (article.symbols || []).map((s) => s.toUpperCase());
            const inSymbols = symbols.includes(normalizedTicker);
            const titleMatches = article.title.toUpperCase().includes(normalizedTicker);
            const contentMatches = (article.content || "").toUpperCase().includes(normalizedTicker);

            let score = 0;
            if (inSymbols) score += 3;
            if (titleMatches) score += 2;
            if (contentMatches) score += 1;

            return { article, score };
        });

        scored.sort((a, b) => b.score - a.score);

        const prioritized = scored.map((s) => s.article);
        return mode === "cards" ? prioritized.slice(0, 4) : prioritized.slice(0, limit);
    }, [news, normalizedTicker, limit, mode]);

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

    const hasNews = sortedNews && sortedNews.length > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Latest News</CardTitle>
            </CardHeader>
            <CardContent>
                {hasNews ? (
                    <div className={mode === "cards" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                        {sortedNews.map((article) => {
                            const slug = generateSlugFromArticle(article);
                            const href = `/news/${encodeURIComponent(slug)}`;

                            if (mode === "cards") {
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className="block rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-brand hover:shadow-sm transition-colors"
                                    >
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-xs text-muted-foreground">
                                                    {formatNewsDate(article.date)} • {getNewsSource(article.link)}
                                                </p>
                                            </div>
                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
                                                {article.title}
                                            </h4>
                                            {article.content && (
                                                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                                                    {cleanInlineLinks(article.content)}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                );
                            }

                            return (
                                <Link
                                    key={href}
                                    href={href}
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
                                            {cleanInlineLinks(article.content)}
                                        </p>
                                    )}
                                </Link>
                            );
                        })}

                        <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-700 mt-1 col-span-full flex justify-end">
                            <Link
                                href={`/company/${ticker.toLowerCase()}/news`}
                                className="text-xs text-brand hover:underline"
                            >
                                Show all news for {ticker}
                            </Link>
                        </div>
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
