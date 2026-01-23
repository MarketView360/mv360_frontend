import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function NewsSkeleton({ cards = 12 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex flex-col rounded-xl overflow-hidden",
            "border border-slate-200 dark:border-slate-800",
            "bg-white dark:bg-slate-900/80"
          )}
        >
          {/* Image skeleton */}
          <Skeleton className="aspect-video w-full" />

          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            {/* Meta info */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>

            {/* Content preview */}
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-5/6" />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-12 rounded-md" />
                <Skeleton className="h-5 w-12 rounded-md" />
              </div>
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function NewsHeaderSkeleton() {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8 py-5">
        {/* Top row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-36" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-10 flex-1 max-w-xl rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-[140px] rounded-md" />
            <Skeleton className="h-9 w-[100px] rounded-md" />
          </div>
        </div>
      </div>
    </header>
  );
}

export function ArticleDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-4xl px-4 md:px-6 py-8">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-3/4 mb-6" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="mx-auto max-w-4xl px-4 md:px-6 -mt-4">
        <Skeleton className="aspect-video w-full rounded-xl" />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 md:px-6 py-8">
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
          <Skeleton className="h-5 w-2/3" />
        </div>
      </div>
    </div>
  );
}
