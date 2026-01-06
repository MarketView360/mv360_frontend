import { Suspense } from "react";
import { NewsHeader } from "./NewsHeader";
import { NewsGrid } from "./NewsGrid";
import { NewsSkeleton } from "./NewsSkeleton";

export const metadata = {
  title: "Market News | Acme Investor",
  description: "Real-time market headlines with company filtering",
};

function NewsHeaderSkeleton() {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="h-9 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-2" />
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-10 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-10 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </div>
    </header>
  );
}

export default function NewsPage() {
  return (
    <main className="min-h-full bg-slate-50 dark:bg-slate-950">
      <Suspense fallback={<NewsHeaderSkeleton />}>
        <NewsHeader />
      </Suspense>
      <section className="mx-auto max-w-[1400px] px-4 md:px-8 py-8">
        <Suspense fallback={<NewsSkeleton />}>
          <NewsGrid />
        </Suspense>
      </section>
    </main>
  );
}