import { useAuth } from "@/providers/AuthProvider";
import { Lock } from "lucide-react";
// ... existing imports

export function NewsFeed({
    ticker,
    limit = 10,
    initialData,
    mode = "list",
}: {
        // ...
    }) {
    const { session } = useAuth();
    const isPro = session?.tier === "pro" || session?.tier === "elite";

    // ... existing state ...

    // ... useEffect ...

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

        // Prefer articles that explicitly reference this ticker
        const scored = filteredNews.map((article) => {
            // ... existing logic ...

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
