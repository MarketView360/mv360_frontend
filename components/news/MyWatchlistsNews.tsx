"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper, Loader2, ExternalLink, Clock, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useWatchlist } from "@/providers/WatchlistProvider";

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  published_at: string;
  tickers: string[];
  image_url?: string;
}

const formatTimeAgo = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export function MyWatchlistsNews() {
  const { watchlists, loading: watchlistsLoading } = useWatchlist();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (watchlistsLoading) return;

    // Collect all unique tickers from all watchlists
    const allTickers = new Set<string>();
    watchlists.forEach(wl => {
      wl.items.forEach(item => {
        allTickers.add(item.ticker.replace(/\.US$/i, '').toUpperCase());
      });
    });

    if (allTickers.size === 0) {
      setNews([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
        
        const tickerParam = Array.from(allTickers).join(',');
        const res = await fetch(`${baseUrl}/api/news?tickers=${encodeURIComponent(tickerParam)}&limit=20`);
        
        if (cancelled) return;
        
        if (res.ok) {
          const data = await res.json();
          setNews(data.articles || data || []);
        }
      } catch (err) {
        if (!cancelled) console.error("Error loading watchlist news:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [watchlists, watchlistsLoading]);

  const totalWatchlistStocks = watchlists.reduce((sum, wl) => sum + wl.items.length, 0);

  if (watchlistsLoading || loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-brand" />
        </div>
      </div>
    );
  }

  if (watchlists.length === 0 || totalWatchlistStocks === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
            <ListChecks className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
            No Watchlists Yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Create a watchlist to see personalized news
          </p>
          <Link 
            href="/watchlist"
            className="text-sm text-brand hover:text-brand/80 font-medium transition-colors"
          >
            Go to Watchlists →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-brand" />
            <h3 className="font-semibold text-slate-900 dark:text-white">
              From Your Watchlists
            </h3>
            {news.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {news.length}
              </Badge>
            )}
          </div>
          <Link 
            href="/watchlist"
            className="text-xs text-brand hover:text-brand/80 font-medium transition-colors"
          >
            Manage watchlists →
          </Link>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Latest news for {totalWatchlistStocks} stocks across {watchlists.length} {watchlists.length === 1 ? 'watchlist' : 'watchlists'}
        </p>
      </div>

      {/* Content */}
      {news.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          No recent news for stocks in your watchlists
        </div>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {news.map((article) => (
            <a
              key={article.id || article.url}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
            >
              <div className="flex gap-4">
                {article.image_url && (
                  <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={article.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-900 dark:text-white group-hover:text-brand transition-colors line-clamp-2 mb-1">
                    {article.title}
                  </h4>
                  {article.summary && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                      {article.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium">{article.source}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(article.published_at)}</span>
                    </div>
                    {article.tickers && article.tickers.length > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1 flex-wrap">
                          {article.tickers.slice(0, 4).map((ticker) => (
                            <Badge key={ticker} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {ticker}
                            </Badge>
                          ))}
                          {article.tickers.length > 4 && (
                            <span className="text-[10px]">+{article.tickers.length - 4}</span>
                          )}
                        </div>
                      </>
                    )}
                    <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
