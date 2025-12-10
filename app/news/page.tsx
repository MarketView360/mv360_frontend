import { Suspense } from "react";
import { NewsHeader } from "./NewsHeader";
import { NewsGrid } from "./NewsGrid";
import { NewsSkeleton } from "./NewsSkeleton";

export const metadata = {
  title: "Market News | Acme Investor",
  description: "Real-time market headlines with company filtering",
};

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <NewsHeader />
      <section className="mx-auto max-w-[1400px] px-4 md:px-8 py-8">
        <Suspense fallback={<NewsSkeleton />}>
          <NewsGrid />
        </Suspense>
      </section>
    </main>
  );
}