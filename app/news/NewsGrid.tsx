"use client";

import { useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";
import { PiNewspaper } from "react-icons/pi";
import NewsCard from "./NewsCard";
import { NewsSkeleton } from "./NewsSkeleton";
import { useInView } from "react-intersection-observer";

const PAGE_SIZE = 20;

export function NewsGrid() {
  const searchParams = useSearchParams();
  const ticker = searchParams.get("ticker") ?? undefined;
  const q = searchParams.get("q") ?? undefined;

  const [pages, setPages] = useState<any[][]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  const { ref, inView } = useInView({ threshold: 0 });

  const fetchPage = async (p: number) => {

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
    const sp = new URLSearchParams();
    if (ticker) sp.set("ticker", ticker);
    if (q) sp.set("q", q);
    sp.set("page", String(p));
    sp.set("limit", String(PAGE_SIZE));

    const res = await fetch(`${baseUrl}/api/news?${sp.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data;
  };

  useEffect(() => {
    // reset on filter change
    setPages([]);
    setPage(1);
    setHasMore(true);
    setInitialLoading(true);
    fetchPage(1)
      .then((rows) => {
        setPages(rows.length ? [rows] : []);
        if (!rows.length || rows.length < PAGE_SIZE) {
          setHasMore(false);
        }
      })
      .finally(() => setInitialLoading(false));
  }, [ticker, q]);

  useEffect(() => {
    if (initialLoading || !hasMore || !inView) return;

    fetchPage(page + 1).then((rows) => {
      if (!rows.length) setHasMore(false);
      else {
        setPages((prev) => [...prev, rows]);
        setPage((p) => p + 1);
      }
    });
  }, [inView, page, hasMore, ticker, q, initialLoading]);

  const flat = pages.flat();

  if (initialLoading) {
    return <NewsSkeleton cards={8} />;
  }

  if (!flat.length) return <EmptyState />;

  return (
    <>
      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4">
        {flat.map((article) => (
          <NewsCard key={article.link} article={article} />
        ))}
      </div>
      {hasMore && (
        <div ref={ref} className="mt-6">
          <NewsSkeleton cards={4} />
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