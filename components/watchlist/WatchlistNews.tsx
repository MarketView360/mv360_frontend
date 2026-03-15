"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper, Loader2, ExternalLink, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { WatchlistWithItems } from "@/providers/WatchlistProvider";

interface NewsArticle {
  id?: string;
  title: string;
  content?: string;
  summary?: string;
  link: string;
  url?: string;
  source?: string;
  date: string;
  published_at?: string;
  symbols?: string[];
  tickers?: string[];
  image_url?: string;
}

interface WatchlistNewsProps {
  watchlist: WatchlistWithItems;
}

const formatTimeAgo = (dateStr: string): string => {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Unknown';
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

export function WatchlistNews({ watchlist }: WatchlistNewsProps) {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (watchlist.items.length === 0) {
      setNews([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
        
        // Get tickers from watchlist
        const tickers = watchlist.items.map(i => i.ticker.replace(/\.US$/i, '').toUpperCase());
        
        // Fetch news for all tickers
        const tickerParam = tickers.join(',');
        const res = await fetch(`${baseUrl}/api/news?tickers=${encodeURIComponent(tickerParam)}&limit=10`);
        
        if (cancelled) return;
        
        if (res.ok) {
          const data = await res.json();
          const articles = data.articles || data || [];
          // Deduplicate by link/url and filter invalid articles
          const seen = new Set<string>();
          const unique = articles.filter((article: NewsArticle) => {
            const articleUrl = article.link || article.url;
            if (!articleUrl || !article.title) return false;
            if (seen.has(articleUrl)) return false;
            seen.add(articleUrl);
            return true;
          });
          setNews(unique);
        }
      } catch (err) {
        if (!cancelled) console.error("Error loading news:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [watchlist.items]);

  if (watchlist.items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-brand" />
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Latest News
            </h3>
            {!loading && news.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {news.length}
              </Badge>
            )}
          </div>
          <Link 
            href="/news"
            className="text-xs text-brand hover:text-brand/80 font-medium transition-colors"
          >
            View all news →
          </Link>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          News related to stocks in this watchlist
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-brand" />
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          No recent news for stocks in this watchlist
        </div>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {news.slice(0, 5).map((article, idx) => (
            <a
              key={article.link || idx}
              href={article.link || article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
            >
              <div className="flex gap-4">
                {article.image_url && (
                  <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
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
                  {(article.summary || article.content) && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                      {article.summary || article.content?.substring(0, 150)}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {article.source && <span className="font-medium">{article.source}</span>}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(article.date || article.published_at || '')}</span>
                    </div>
                    {(article.symbols || article.tickers) && (article.symbols || article.tickers)!.length > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          {(article.symbols || article.tickers)!.slice(0, 3).map((ticker) => (
                            <Badge key={ticker} variant="secondary" className="text-[10px] px-1 py-0">
                              {ticker}
                            </Badge>
                          ))}
                          {(article.symbols || article.tickers)!.length > 3 && (
                            <span className="text-[10px]">+{(article.symbols || article.tickers)!.length - 3}</span>
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
