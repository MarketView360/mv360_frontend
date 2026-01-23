import { Skeleton } from "@/components/ui/skeleton";

export function NewsSkeleton({ cards = 8 }: { cards?: number }) {
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="break-inside-avoid mb-4 rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/50">
          <div className="flex items-center gap-2 mb-3">
             <Skeleton className="h-4 w-16" />
             <Skeleton className="h-3 w-3 rounded-full" />
             <Skeleton className="h-3 w-12" />
          </div>
          
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-3/4 mb-4" />
          
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-2/3 mb-4" />
          
          <div className="flex items-center justify-between mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-10 rounded-md" />
              <Skeleton className="h-5 w-10 rounded-md" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}