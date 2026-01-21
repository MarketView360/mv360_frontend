"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Filter,
  X,
  Calendar,
  Tag,
  ChevronDown,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SortOption = "latest" | "oldest" | "relevance";

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
  const qLower = query.toLowerCase();
  return Object.entries(POPULAR_TICKERS)
    .filter(([ticker, name]) =>
      ticker.startsWith(q) || name.toLowerCase().includes(qLower)
    )
    .slice(0, 5)
    .map(([ticker, name]) => ({ ticker, name }));
}

interface NewsFiltersProps {
  onSortChange?: (sort: SortOption) => void;
  currentSort?: SortOption;
}

export function NewsFilters({ onSortChange, currentSort = "latest" }: NewsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [tickerInput, setTickerInput] = useState("");
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [tickerFilterEnabled, setTickerFilterEnabled] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const [tickerSuggestions, setTickerSuggestions] = useState<
    { ticker: string; name: string }[]
  >([]);
  const [showTickerSuggestions, setShowTickerSuggestions] = useState(false);

  useEffect(() => {
    const ticker = searchParams.get("ticker");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (ticker) {
      setSelectedTickers(ticker.split(",").filter(Boolean));
      setTickerFilterEnabled(true);
    }
    if (from) setFromDate(from);
    if (to) setToDate(to);
  }, [searchParams]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!tickerFilterEnabled) {
      setTickerSuggestions([]);
      setShowTickerSuggestions(false);
      return;
    }

    if (!tickerInput.trim()) {
      setTickerSuggestions([]);
      return;
    }

    setTickerSuggestions(searchTickers(tickerInput.trim()));
  }, [tickerInput, tickerFilterEnabled]);

  const addTicker = (value?: string) => {
    const ticker = (value ?? tickerInput).trim().toUpperCase();
    if (ticker && !selectedTickers.includes(ticker)) {
      setSelectedTickers([...selectedTickers, ticker]);
      setTickerInput("");
      setTickerSuggestions([]);
      setShowTickerSuggestions(false);
    }
  };

  const removeTicker = (ticker: string) => {
    setSelectedTickers(selectedTickers.filter((t) => t !== ticker));
  };

  const handleApplyFilters = () => {
    const sp = new URLSearchParams(searchParams.toString());
    
    sp.delete("ticker");
    sp.delete("from");
    sp.delete("to");

    if (tickerFilterEnabled && selectedTickers.length > 0) {
      sp.set("ticker", selectedTickers.join(","));
    }
    if (fromDate) sp.set("from", fromDate);
    if (toDate) sp.set("to", toDate);

    router.replace(`/news?${sp.toString()}`);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedTickers([]);
    setTickerFilterEnabled(false);
    setFromDate("");
    setToDate("");
    
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("ticker");
    sp.delete("from");
    sp.delete("to");
    router.replace(`/news?${sp.toString()}`);
  };

  const activeFilterCount = [
    tickerFilterEnabled && selectedTickers.length > 0,
    fromDate,
    toDate,
  ].filter(Boolean).length;

  return (
    <div className="flex items-center gap-2">
      {/* Sort dropdown */}
      <Select
        value={currentSort}
        onValueChange={(value) => onSortChange?.(value as SortOption)}
      >
        <SelectTrigger className="w-[140px] h-9 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <ArrowUpDown className="h-3.5 w-3.5 mr-2 text-slate-500" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="latest">Latest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
          <SelectItem value="relevance">Relevance</SelectItem>
        </SelectContent>
      </Select>

      {/* Filters button */}
      <div className="relative z-30" ref={panelRef}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-9 px-3 gap-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700",
            isOpen && "ring-2 ring-brand/20 border-brand"
          )}
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-slate-900 text-white dark:bg-brand dark:text-white">
              {activeFilterCount}
            </Badge>
          )}
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </Button>

        {/* Filter panel */}
        {isOpen && (
          <div
            className={cn(
              "absolute right-0 top-full mt-2 w-80 rounded-xl border shadow-2xl z-[60]",
              "bg-white dark:bg-slate-900",
              "border-slate-200 dark:border-slate-700",
              "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
            )}
          >
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900 dark:text-white">
                  Filters
                </h4>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-7 text-xs text-slate-500 hover:text-danger"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>

            <div className="p-4 space-y-5">
              {/* Ticker Filter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Tag className="h-4 w-4 text-slate-400" />
                    Filter by Tickers
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tickerFilterEnabled}
                      onChange={(e) => setTickerFilterEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand"></div>
                  </label>
                </div>

                {tickerFilterEnabled && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Add ticker (e.g., AAPL)"
                          value={tickerInput}
                          onChange={(e) => {
                            setTickerInput(e.target.value.toUpperCase());
                            setShowTickerSuggestions(true);
                          }}
                          onFocus={() => {
                            if (tickerSuggestions.length > 0) {
                              setShowTickerSuggestions(true);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addTicker();
                            }
                          }}
                          className="pl-9 h-9 text-sm"
                        />

                        {showTickerSuggestions &&
                          tickerSuggestions.length > 0 && (
                            <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
                              {tickerSuggestions.map((s) => (
                                <button
                                  key={s.ticker}
                                  type="button"
                                  onClick={() => addTicker(s.ticker)}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                  <span className="font-medium text-slate-900 dark:text-white">
                                    {s.ticker}
                                  </span>
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                    {s.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addTicker()}
                        disabled={!tickerInput.trim()}
                        className="h-9 px-3"
                      >
                        Add
                      </Button>
                    </div>

                    {selectedTickers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTickers.map((ticker) => (
                          <Badge
                            key={ticker}
                            variant="secondary"
                            className="h-6 gap-1 pr-1 bg-brand/10 text-brand border-brand/20"
                          >
                            {ticker}
                            <button
                              onClick={() => removeTicker(ticker)}
                              className="ml-0.5 p-0.5 rounded hover:bg-brand/20 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500">From</span>
                    <Input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500">To</span>
                    <Input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApplyFilters}
                className="
                  bg-slate-900 text-white hover:bg-slate-800
                  dark:bg-brand dark:text-white dark:hover:bg-brand/90
                "
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
