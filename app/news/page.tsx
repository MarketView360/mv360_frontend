"use client";

import { Suspense, useState } from "react";
import { NewsHeader } from "./NewsHeaderNew";
import { NewsGrid } from "./NewsGridNew";
import { NewsSkeleton, NewsHeaderSkeleton } from "./NewsSkeletonNew";
import { ScrollToTopFab } from "./ScrollToTopFab";
import { SortOption } from "./NewsFilters";
import { BreakingNewsCarousel } from "@/components/news/BreakingNewsCarousel";
import { NewsSidebar } from "@/components/news/NewsSidebar";
import { MyWatchlistsNews } from "@/components/news/MyWatchlistsNews";

export default function NewsPage() {
  const [sort, setSort] = useState<SortOption>("latest");

  return (
    <main className="min-h-full bg-slate-50 dark:bg-slate-950">
      <BreakingNewsCarousel />
      <Suspense fallback={<NewsHeaderSkeleton />}>
        <NewsHeader onSortChange={setSort} currentSort={sort} />
      </Suspense>
      <section className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            {/* Watchlist News Section */}
            <MyWatchlistsNews />
            
            {/* Main News Grid */}
            <Suspense fallback={<NewsSkeleton />}>
              <NewsGrid sort={sort} />
            </Suspense>
          </div>
          <aside className="hidden lg:block lg:col-span-1">
            <NewsSidebar />
          </aside>
        </div>
      </section>
      <ScrollToTopFab />
    </main>
  );
}