"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { createClient } from "@/lib/supabase/client";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
type RecentItem = { ticker: string; name: string; timestamp: number };

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */
const MAX_RECENTS = 5;
const SEARCH_DEBOUNCE_MS = 300;

/* ------------------------------------------------------------------ */
/* Hooks                                                              */
/* ------------------------------------------------------------------ */
function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw));
    } catch {
      /* ignore malformed JSON */
    }
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const nextValue = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        window.localStorage.setItem(key, JSON.stringify(nextValue));
        return nextValue;
      });
    },
    [key]
  );

  return [value, update] as const;
}

/* ------------------------------------------------------------------ */
/* Types for search results                                           */
/* ------------------------------------------------------------------ */
type SearchResult = { ticker: string; name: string };

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useLocalStorage<RecentItem[]>("search-recent", []);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef(createClient());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced Supabase search
  useEffect(() => {
    if (!query.trim() || query.length < 1) {
      setSuggestions([]);
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const sanitized = query.replace(/[%_\\]/g, "");
        const { data, error } = await supabaseRef.current
          .from("companies")
          .select("code, name")
          .or(`code.ilike.%${sanitized}%,name.ilike.%${sanitized}%`)
          .limit(10);
        if (!error && data) {
          setSuggestions(
            data.map((r) => ({
              ticker: r.code.replace(/\.US$/i, "").toUpperCase(),
              name: r.name,
            }))
          );
        }
      } catch { /* ignore */ }
      finally { setSearchLoading(false); }
    }, SEARCH_DEBOUNCE_MS);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [query]);

  const showSuggestions = open && query.length > 0;
  const showRecents = open && !query;

  /* ------------------ actions --------------------------------------- */
  const handleSelect = useCallback(
    (ticker: string) => {
      setQuery(ticker);
      setOpen(false);
      const selectedSuggestion = suggestions.find(s => s.ticker === ticker);
      setRecent((prev) => {
        const filtered = prev.filter((r) => r.ticker !== ticker);
        return [
          { ticker, name: selectedSuggestion?.name ?? ticker, timestamp: Date.now() },
          ...filtered,
        ].slice(0, MAX_RECENTS);
      });
      router.push(`/company/${ticker}`);
    },
    [router, setRecent, suggestions]
  );

  /* ------------------ keyboard navigation ------------------------- */
  const items = showSuggestions
    ? suggestions.map((s) => s.ticker)
    : showRecents
      ? recent.map((r) => r.ticker)
      : [];

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % items.length);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + items.length) % items.length);
      }
      if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        handleSelect(items[activeIndex]);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [items, activeIndex, handleSelect]);

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  /* ------------------ click outside -------------------------------- */
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ticker = query.trim().toUpperCase();
    if (!ticker) return;
    handleSelect(ticker);
  };

  const clearRecents = () => setRecent([]);

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto z-40">

      {/* glow */}
      <div className="absolute -inset-1 bg-brand/20 rounded-full opacity-20 group-hover:opacity-30 blur transition duration-200 pointer-events-none" />

      {/* input */}
      <form onSubmit={handleSubmit} className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-brand transition-colors pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          className={cn(
            "flex h-12 w-full rounded-full border border-slate-200 dark:border-slate-800",
            "bg-white dark:bg-slate-900 pl-11 pr-24 py-2 text-base dark:text-white",
            "placeholder:text-slate-400 dark:placeholder:text-slate-500",
            "focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand",
            "transition-all shadow-sm hover:shadow-md"
          )}
          placeholder="Search ticker, company or index..."
          aria-autocomplete="list"
        />
        {query && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="absolute right-20 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
            onClick={() => setQuery("")}
            aria-label="Clear query"
          >
            <X className="h-4 w-4 text-slate-400" />
          </Button>
        )}
        <button
          type="submit"
          className="absolute right-1 top-1 h-10 px-6 rounded-full text-white text-sm font-medium shadow-sm hover:shadow-md hover:opacity-90 transition-all"
          style={{ backgroundColor: '#0087f6' }}
        >
          Search
        </button>
      </form>

      {/* dropdown */}
      {(showSuggestions || showRecents) && (
        <div
          id="search-dropdown"
          className="absolute top-full mt-6 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-50 overflow-hidden"
        >
          {showRecents && (
            <>
              <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Recent</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearRecents}>
                  Clear
                </Button>
              </div>
              {recent.map((r, i) => (
                <ResultRow
                  key={r.ticker}
                  ticker={r.ticker}
                  name={r.name}
                  icon={<Clock className="h-4 w-4" />}
                  selected={i === activeIndex}
                  onClick={() => handleSelect(r.ticker)}
                />
              ))}
            </>
          )}

          {showSuggestions && (
            <>
              {searchLoading && suggestions.length === 0 ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-4 h-4 animate-spin text-brand mr-2" />
                  <span className="text-sm text-slate-400">Searching...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <>
                  <div className="px-4 pt-3 pb-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Results</span>
                  </div>
                  {suggestions.map((s, i) => (
                    <ResultRow
                      key={s.ticker}
                      ticker={s.ticker}
                      name={s.name}
                      icon={null}
                      selected={i === activeIndex}
                      onClick={() => handleSelect(s.ticker)}
                    />
                  ))}
                </>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-slate-400">
                  No results for &quot;{query}&quot;
                </div>
              )}
              {/* Search for option */}
              <ResultRow
                ticker={query.trim().toUpperCase()}
                name=""
                icon={<ExternalLink className="h-4 w-4" />}
                selected={activeIndex === suggestions.length}
                onClick={() => handleSelect(query.trim().toUpperCase())}
                isSearchOption
              />
            </>
          )}

          {!showSuggestions && !showRecents && (
            <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              No results
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-component: result row                                          */
/* ------------------------------------------------------------------ */
function ResultRow({
  ticker,
  name,
  icon,
  selected,
  onClick,
  isSearchOption = false,
}: {
  ticker: string;
  name: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  isSearchOption?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition",
        "hover:bg-slate-100 dark:hover:bg-slate-800",
        selected && "bg-brand/10 dark:bg-brand/20",
        isSearchOption && "border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
      )}
      aria-selected={selected}
    >
      {isSearchOption ? (
        <>
          <span className="text-slate-400 dark:text-slate-500">{icon}</span>
          <div className="flex-1">
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Search for <span className="font-semibold text-slate-900 dark:text-white">&quot;{ticker}&quot;</span>
            </span>
          </div>
        </>
      ) : (
        <>
          <CompanyLogo ticker={ticker} name={name} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-white">{ticker}</span>
              {icon && <span className="text-slate-400 dark:text-slate-500">{icon}</span>}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate block">{name}</span>
          </div>
        </>
      )}
    </button>
  );
}