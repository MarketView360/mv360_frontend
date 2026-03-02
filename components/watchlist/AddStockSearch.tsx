"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plus, Loader2, X } from "lucide-react";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { createClient } from "@/lib/supabase/client";
import { cleanTicker } from "@/lib/watchlist-utils";

interface SearchResult {
  code: string;
  name: string;
  sector?: string | null;
}

interface AddStockSearchProps {
  existingTickers: string[];
  onAdd: (ticker: string) => Promise<boolean>;
  placeholder?: string;
}

export function AddStockSearch({
  existingTickers,
  onAdd,
  placeholder = "Search by ticker or company name...",
}: AddStockSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingTicker, setAddingTicker] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabaseRef = useRef(createClient());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const existingSet = new Set(existingTickers.map((t) => cleanTicker(t)));

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Search debounce
  useEffect(() => {
    if (!query.trim() || query.length < 1) {
      setResults([]);
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const sanitized = query.replace(/[%_\\]/g, "");
        const { data, error } = await supabaseRef.current
          .from("companies")
          .select("code, name, sector")
          .or(`code.ilike.%${sanitized}%,name.ilike.%${sanitized}%`)
          .limit(10);
        if (!error && data) {
          setResults(
            data.map((r) => ({
              code: r.code,
              name: r.name,
              sector: r.sector || null,
            }))
          );
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query]);

  const handleAdd = async (code: string) => {
    const cleaned = cleanTicker(code);
    if (existingSet.has(cleaned) || addingTicker === code) return;

    setAddingTicker(code);
    const ok = await onAdd(code);
    setAddingTicker(null);

    if (ok) {
      // Remove from results
      setResults((prev) => prev.filter((r) => r.code !== code));
      // If no results left, clear
      if (results.length <= 1) {
        setQuery("");
        setShowDropdown(false);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            if (query.trim()) setShowDropdown(true);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-8 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors"
        />
        {query && (
          <button
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            onClick={() => {
              setQuery("");
              setResults([]);
              setShowDropdown(false);
              inputRef.current?.focus();
            }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (query.trim().length > 0) && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-80 overflow-y-auto">
          {loading && results.length === 0 ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-4 h-4 animate-spin text-brand mr-2" />
              <span className="text-sm text-slate-400">Searching...</span>
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="py-6 text-center">
              <p className="text-sm text-slate-400">No results for &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="py-1">
              {results.map((result) => {
                const isExisting = existingSet.has(cleanTicker(result.code));
                const isAdding = addingTicker === result.code;

                return (
                  <button
                    key={result.code}
                    type="button"
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      isExisting
                        ? "opacity-60 bg-slate-50 dark:bg-slate-800 cursor-default"
                        : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    }`}
                    onClick={() => {
                      if (!isExisting && !isAdding) handleAdd(result.code);
                    }}
                    disabled={isExisting || isAdding}
                  >
                    <CompanyLogo ticker={result.code} name={result.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {result.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {cleanTicker(result.code)}
                        </span>
                        {result.sector && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                            &bull; {result.sector}
                          </span>
                        )}
                      </div>
                    </div>
                    {isExisting ? (
                      <span className="text-[11px] text-slate-400 font-medium px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 shrink-0">
                        Added
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-brand bg-brand/10 px-2.5 py-1.5 rounded-lg shrink-0">
                        {isAdding ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Plus className="w-3 h-3" />
                        )}
                        Add
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
