"use client";

import { useEffect, useState, useCallback } from "react";

import { useSearchParams } from "next/navigation";
import { PiNewspaper, PiSpinnerGap } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import NewsCard from "./NewsCard";
import { NewsSkeleton } from "./NewsSkeleton";

const PAGE_SIZE = 20;

interface Article {
  link: string;
  title?: string;
  content?: string;
  date?: string;
  [key: string]: any;
}

export function NewsGrid() {
  const searchParams = useSearchParams();
  const ticker = searchParams.get("ticker") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;

  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Deduplication helper
  const uniqueArticles = (existing: Article[], incoming: Article[]) => {
    const existingLinks = new Set(existing.map(a => a.link));
    return [...existing, ...incoming.filter(a => !existingLinks.has(a.link))];
  };

  const fetchPage = useCallback(async (p: number) => {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
    const sp = new URLSearchParams();
    if (ticker) sp.set("ticker", ticker);
    if (q) sp.set("q", q);
    if (from) sp.set("from", from);
    if (to) sp.set("to", to);
    sp.set("page", String(p));
    sp.set("limit", String(PAGE_SIZE));

    try {
      const res = await fetch(`${baseUrl}/api/news?${sp.toString()}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : (data.items || []); // Handle different response shapes
    } catch (e) {
      console.error("Failed to fetch news", e);
      return [];
    }
  }, [ticker, q, from, to]);

  useEffect(() => {
    // reset on filter change
    setArticles([]);
    setPage(1);
    setHasMore(true);
    setInitialLoading(true);
    
    fetchPage(1)
      .then((rows) => {
        setArticles(rows);
        if (!rows.length || rows.length < PAGE_SIZE) {
          setHasMore(false);
        }
      })
      .finally(() => setInitialLoading(false));
  }, [fetchPage]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    
    try {
      const rows = await fetchPage(nextPage);
      if (!rows.length) {
        setHasMore(false);
      } else {
        setArticles(prev => uniqueArticles(prev, rows));
        setPage(nextPage);
        if (rows.length < PAGE_SIZE) setHasMore(false);
      }
    } finally {
      setLoadingMore(false);
    }
  };

  if (initialLoading) {
    return <NewsSkeleton cards={8} />;
  }

  if (!articles.length) return <EmptyState />;

  return (
    <>
      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4">
        {articles.map((article) => (
          <NewsCard key={article.link} article={article} />
        ))}
      </div>
      
      {hasMore && (
        <div className="mt-8 flex justify-center">
           <Button 
            variant="outline" 
            size="lg" 
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="min-w-[200px]"
          >
            {loadingMore ? (
              <>
                <PiSpinnerGap className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More News"
            )}
          </Button>
        </div>
      )}
      
      {!hasMore && articles.length > 0 && (
        <div className="mt-8 text-center text-sm text-slate-500">
          You&apos;ve reached the end of the list.
        </div>
      )}
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
      <PiNewspaper className="h-12 w-12 mb-4" />
      <p className="text-sm">No articles match your filters.</p>
    </div>
  );
}