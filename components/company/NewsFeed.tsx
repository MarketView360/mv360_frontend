"use client";

import { useAuth } from "@/providers/AuthProvider";
import { Lock } from "lucide-react";
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useMemo } from 'react';

// Define the NewsArticle interface
export interface NewsArticle {
    date: string;
    link: string;
    title: string;
    content?: string;
}

// Slug generation must match news/[slug]/page.tsx exactly
const generateSlugFromArticle = (article: NewsArticle) => {
    const titleSlug = article.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 60);

    const hash = article.link
        .split('')
        .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
    const hashStr = Math.abs(hash).toString(36).slice(0, 6);

    return `${titleSlug}-${hashStr}`;
};

const cacheArticleForDetail = (slug: string, article: NewsArticle) => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem(`article_${slug}`, JSON.stringify(article));
    }
};

const formatNewsDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const getNewsSource = (link: string) => {
    try {
        const url = new URL(link);
        return url.hostname.replace('www.', '');
    } catch {
        return 'Source';
    }
};

const cleanInlineLinks = (content: string) => {
    // Basic implementation to strip markdown links or HTML tags if needed
    // Assuming content is plaintext or simple markdown
    return content;
};

export function NewsFeed({
    ticker,
    limit = 10,
    initialData,
    mode = "list",
}: {
    ticker: string;
    limit?: number;
    initialData?: NewsArticle[] | null;
    mode?: "list" | "cards";
}) {
    const { session } = useAuth();
    const isPro = session?.tier === "premium" || session?.tier === "max" || session?.tier === "pro" || session?.tier === "elite";

    // Since initialData is passed, we can use it directly or wrapped in Memo
    const news = initialData;
    const loading = !initialData;

    const normalizedTicker = ticker.toUpperCase();

    const sortedNews = useMemo(() => {
        if (!news) return [] as NewsArticle[];

        let filteredNews = news;

        // Filter for free users (7 days limit)
        if (!isPro) {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            filteredNews = news.filter(article => new Date(article.date) >= sevenDaysAgo);
        }

        // Limit the results
        return filteredNews.slice(0, limit);
    }, [news, isPro, limit]);

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
                            // Ensure slug is valid for URL
                            const validSlug = slug || 'news-item';
                            const href = `/news/${encodeURIComponent(validSlug)}`;

                            if (mode === "cards") {
                                return (
                                    <Link
                                        key={article.link}
                                        href={href}
                                        onClick={() => cacheArticleForDetail(validSlug, article)}
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
                                    key={article.link}
                                    href={href}
                                    onClick={() => cacheArticleForDetail(validSlug, article)}
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
                    <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground mb-4">
                            No recent news available for <span className="font-semibold text-slate-700 dark:text-slate-300">{ticker}</span>
                        </p>
                        <Link
                            href="/news"
                            className="text-sm text-brand hover:underline"
                        >
                            See news for other symbols →
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

