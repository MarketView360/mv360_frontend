"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Newspaper, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewsCard, Article } from "./NewsCardNew";
import { NewsSkeleton } from "./NewsSkeletonNew";
import { ExternalLinkWarning, useExternalLinkWarning } from "./ExternalLinkWarning";
import { useNewsPreferences, PaginationStyle } from "@/hooks/useNewsPreferences";
import { SortOption } from "./NewsFilters";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

interface NewsGridProps {
  sort?: SortOption;
}

export function NewsGrid({ sort = "latest" }: NewsGridProps) {
  const searchParams = useSearchParams();
  const { preferences, isLoaded: prefsLoaded } = useNewsPreferences();
  
  const ticker = searchParams.get("ticker") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;

  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { warningState, showWarning, setWarningOpen, confirmNavigation } =
    useExternalLinkWarning();

  const uniqueArticles = (existing: Article[], incoming: Article[]) => {
    const existingLinks = new Set(existing.map((a) => a.link));
    return [...existing, ...incoming.filter((a) => !existingLinks.has(a.link))];
  };

  const fetchPage = useCallback(
    async (p: number) => {
      const baseUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const sp = new URLSearchParams();
      if (ticker) sp.set("ticker", ticker);
      if (q) sp.set("q", q);
      if (from) sp.set("from", from);
      if (to) sp.set("to", to);
      sp.set("page", String(p));
      sp.set("limit", String(PAGE_SIZE));
      sp.set("sort", sort);

      try {
        const res = await fetch(`${baseUrl}/api/news?${sp.toString()}`);
        if (!res.ok) return { items: [], total: 0 };
        const data = await res.json();
        
        if (Array.isArray(data)) {
          return { items: data, total: data.length > 0 ? 100 : 0 };
        }
        return {
          items: data.items || data.articles || [],
          total: data.total || data.totalCount || 0,
        };
      } catch (e) {
        console.error("Failed to fetch news", e);
        return { items: [], total: 0 };
      }
    },
    [ticker, q, from, to, sort]
  );

  useEffect(() => {
    setArticles([]);
    setPage(1);
    setHasMore(true);
    setInitialLoading(true);

    fetchPage(1).then(({ items, total }) => {
      setArticles(items);
      setTotalPages(Math.ceil(total / PAGE_SIZE) || 1);
      if (!items.length || items.length < PAGE_SIZE) {
        setHasMore(false);
      }
      setInitialLoading(false);
    });
  }, [fetchPage]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const { items } = await fetchPage(nextPage);
      if (!items.length) {
        setHasMore(false);
      } else {
        setArticles((prev) => uniqueArticles(prev, items));
        setPage(nextPage);
        if (items.length < PAGE_SIZE) setHasMore(false);
      }
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setInitialLoading(true);
    setPage(newPage);

    const { items } = await fetchPage(newPage);
    setArticles(items);
    setInitialLoading(false);
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!prefsLoaded || initialLoading) {
    return <NewsSkeleton cards={PAGE_SIZE} />;
  }

  if (!articles.length) return <EmptyState />;

  const paginationStyle: PaginationStyle = preferences.paginationStyle;

  return (
    <>
      {/* News Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {articles.map((article, index) => (
          <NewsCard
            key={article.link}
            article={article}
            index={index}
            onExternalLinkClick={showWarning}
          />
        ))}
      </div>

      {/* Pagination */}
      {paginationStyle === "infinite" ? (
        <InfiniteScrollPagination
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={handleLoadMore}
          totalLoaded={articles.length}
        />
      ) : (
        <NumberedPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* External Link Warning */}
      <ExternalLinkWarning
        open={warningState.open}
        onOpenChange={setWarningOpen}
        url={warningState.url}
        onConfirm={confirmNavigation}
      />
    </>
  );
}

function InfiniteScrollPagination({
  hasMore,
  loadingMore,
  onLoadMore,
  totalLoaded,
}: {
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  totalLoaded: number;
}) {
  return (
    <div className="mt-10 flex flex-col items-center gap-4">
      {hasMore ? (
        <Button
          variant="outline"
          size="lg"
          onClick={onLoadMore}
          disabled={loadingMore}
          className={cn(
            "min-w-[200px] h-12 gap-2",
            "border-slate-200 dark:border-slate-700",
            "hover:border-brand hover:bg-brand/5 dark:hover:border-brand dark:hover:bg-brand/10"
          )}
        >
          {loadingMore ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Load More News"
          )}
        </Button>
      ) : (
        <div className="text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You&apos;ve seen all {totalLoaded} articles
          </p>
          <div className="mt-2 h-1 w-20 mx-auto rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      )}
    </div>
  );
}

function NumberedPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      if (currentPage > 3) pages.push("...");
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (currentPage < totalPages - 2) pages.push("...");
      
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="mt-10 flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-9 w-9"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getPageNumbers().map((pageNum, idx) =>
        pageNum === "..." ? (
          <span
            key={`ellipsis-${idx}`}
            className="px-2 text-slate-400 dark:text-slate-500"
          >
            ...
          </span>
        ) : (
          <Button
            key={pageNum}
            variant={currentPage === pageNum ? "default" : undefined}
            size="sm"
            onClick={() => onPageChange(pageNum as number)}
            className={cn(
              "h-9 w-9 p-0",
              currentPage === pageNum
                ? "bg-brand hover:bg-brand/90 text-white"
                : "!bg-slate-900 !text-white hover:!bg-slate-800 dark:!bg-white dark:!text-slate-900 dark:hover:!bg-slate-100"
            )}
          >
            {pageNum}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
        <Newspaper className="h-10 w-10 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        No articles found
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
        We couldn&apos;t find any news matching your filters. Try adjusting your
        search or clearing the filters.
      </p>
    </div>
  );
}
