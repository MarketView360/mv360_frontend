"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const POPULAR_TICKERS: Record<string, string> = {
  AAPL: "Apple Inc.",
  MSFT: "Microsoft Corporation",
  GOOGL: "Alphabet Inc.",
  AMZN: "Amazon.com Inc.",
  TSLA: "Tesla Inc.",
  NVDA: "NVIDIA Corporation",
  META: "Meta Platforms Inc.",
  JPM: "JPMorgan Chase & Co.",
  V: "Visa Inc.",
  WMT: "Walmart Inc.",
  JNJ: "Johnson & Johnson",
  MA: "Mastercard Inc.",
  HD: "The Home Depot Inc.",
  PG: "Procter & Gamble Co.",
  BAC: "Bank of America Corp.",
  DIS: "The Walt Disney Company",
  NFLX: "Netflix Inc.",
  INTC: "Intel Corporation",
  AMD: "Advanced Micro Devices",
  CRM: "Salesforce Inc.",
};

function searchTickers(query: string) {
  const q = query.toUpperCase();
  return Object.entries(POPULAR_TICKERS)
    .filter(([ticker, name]) =>
      ticker.startsWith(q) || name.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5)
    .map(([ticker, name]) => ({ ticker, name }));
}

export function NavSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const suggestions = searchTickers(value);
  const showSuggestions = open && value.length > 0 && suggestions.length > 0;

  const handleSelect = useCallback(
    (ticker: string) => {
      setValue("");
      setOpen(false);
      router.push(`/company/${ticker}`);
    },
    [router]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ticker = value.trim().toUpperCase();
    if (!ticker) return;
    handleSelect(ticker);
  };

  // Keyboard navigation
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % suggestions.length);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
      }
      if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        handleSelect(suggestions[activeIndex].ticker);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, suggestions, activeIndex, handleSelect]);

  // Click outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Reset active index when suggestions change
  useEffect(() => {
    setActiveIndex(-1);
  }, [value]);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-sm">
      <form onSubmit={handleSubmit} className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-brand transition-colors" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setOpen(true)}
          className={cn(
            "flex h-9 w-64 lg:w-80 rounded-full border border-slate-200 dark:border-slate-800",
            "bg-slate-50 dark:bg-slate-900 pl-9 pr-4 py-1 text-sm shadow-sm",
            "transition-all focus-visible:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand",
            "placeholder:text-slate-400 dark:placeholder:text-slate-500",
            "dark:text-white"
          )}
          placeholder="Search ticker..."
          aria-autocomplete="list"
        />
      </form>

      {showSuggestions && (
        <div className="absolute top-full mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg z-50 overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={s.ticker}
              type="button"
              onClick={() => handleSelect(s.ticker)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition",
                "hover:bg-slate-100 dark:hover:bg-slate-800",
                i === activeIndex && "bg-brand/10 dark:bg-brand/20"
              )}
            >
              <TrendingUp className="h-3 w-3 text-slate-400" />
              <span className="font-medium text-slate-900 dark:text-white">{s.ticker}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
