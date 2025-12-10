import { Skeleton } from "@/components/ui/skeleton";

export function NewsSkeleton({ cards = 8 }: { cards?: number }) {
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="break-inside-avoid mb-4 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6 mt-2" />
          <Skeleton className="h-3 w-full mt-3" />
          <Skeleton className="h-3 w-4/5 mt-1" />
          <div className="flex items-center gap-2 mt-3">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-3 w-20 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}