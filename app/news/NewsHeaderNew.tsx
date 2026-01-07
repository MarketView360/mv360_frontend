"use client";

import { useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewsFilters, SortOption } from "./NewsFilters";
import { cn } from "@/lib/utils";

interface NewsHeaderProps {
  onSortChange?: (sort: SortOption) => void;
  currentSort?: SortOption;
}

export function NewsHeader({ onSortChange, currentSort }: NewsHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchRef.current?.value.trim() || "";
    
    const sp = new URLSearchParams(searchParams.toString());
    if (query) {
      sp.set("q", query);
    } else {
      sp.delete("q");
    }
    
    router.replace(`/news?${sp.toString()}`);
  };

  return (
    <header
      className={cn(
        "relative z-20",
        "border-b border-slate-200 dark:border-slate-800",
        "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md"
      )}
    >
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8 py-5">
        {/* Top row: Title and description */}
        <div className="flex flex-col gap-4 mb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand/10 dark:bg-brand/20">
              <Newspaper className="h-6 w-6 text-brand" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Market News
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Stay informed with curated market headlines
              </p>
            </div>
          </div>
        </div>

        {/* Bottom row: Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                ref={searchRef}
                name="q"
                defaultValue={searchParams.get("q") ?? ""}
                placeholder="Search headlines, keywords..."
                className={cn(
                  "pl-10 pr-24 h-10",
                  "bg-slate-50 dark:bg-slate-800/50",
                  "border-slate-200 dark:border-slate-700",
                  "focus:bg-white dark:focus:bg-slate-800",
                  "placeholder:text-slate-400 dark:placeholder:text-slate-500"
                )}
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 px-3 text-xs
                           bg-slate-900 text-white hover:bg-slate-800
                           dark:bg-brand dark:text-white dark:hover:bg-brand/90"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Filters and sort */}
          <NewsFilters onSortChange={onSortChange} currentSort={currentSort} />
        </div>

        {/* Active filters display */}
        <ActiveFiltersBar />
      </div>
    </header>
  );
}

function ActiveFiltersBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const query = searchParams.get("q");
  const ticker = searchParams.get("ticker");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const hasFilters = query || ticker || from || to;

  if (!hasFilters) return null;

  const removeFilter = (key: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete(key);
    router.replace(`/news?${sp.toString()}`);
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div className="flex items-center flex-wrap gap-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">
          Active:
        </span>
        
        {query && (
          <FilterTag label={`"${query}"`} onRemove={() => removeFilter("q")} />
        )}
        
        {ticker && (
          <FilterTag
            label={`Tickers: ${ticker}`}
            onRemove={() => removeFilter("ticker")}
          />
        )}
        
        {from && (
          <FilterTag label={`From: ${from}`} onRemove={() => removeFilter("from")} />
        )}
        
        {to && (
          <FilterTag label={`To: ${to}`} onRemove={() => removeFilter("to")} />
        )}
      </div>
    </div>
  );
}

function FilterTag({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
          <path d="M3.05 3.05a.75.75 0 011.06 0L6 4.94l1.89-1.89a.75.75 0 111.06 1.06L7.06 6l1.89 1.89a.75.75 0 11-1.06 1.06L6 7.06 4.11 8.95a.75.75 0 01-1.06-1.06L4.94 6 3.05 4.11a.75.75 0 010-1.06z" />
        </svg>
      </button>
    </span>
  );
}
