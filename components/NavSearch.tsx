"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { createClient } from "@/lib/supabase/client";
import { usePlatform } from "@/hooks/usePlatform";

interface Suggestion { ticker: string; name: string; }

export function NavSearch() {
  const router = useRouter();
  const { isMac } = usePlatform();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef(createClient());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced Supabase search
  useEffect(() => {
    if (!value.trim()) { setSuggestions([]); return; }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const sanitized = value.replace(/[%_\\]/g, "");
        const { data, error } = await supabaseRef.current
          .from("companies")
          .select("code, name")
          .or(`code.ilike.%${sanitized}%,name.ilike.%${sanitized}%`)
          .limit(6);
        if (!error && data) {
          setSuggestions(data.map((r) => ({ ticker: r.code.replace(/\.US$/i, "").toUpperCase(), name: r.name })));
        }
      } catch { /* ignore */ }
      finally { setSearchLoading(false); }
    }, 200);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [value]);

  const showSuggestions = open && value.length > 0;

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

  // Global shortcut: Cmd/Ctrl + K focuses the nav search
  useEffect(() => {
    function onShortcut(e: KeyboardEvent) {
      const isModifier = isMac ? e.metaKey : e.ctrlKey;
      if (isModifier && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }

    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, [isMac]);

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
    <div ref={wrapperRef} className="relative w-fit">
      <form onSubmit={handleSubmit} className="relative group w-64 lg:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-brand transition-colors" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setOpen(true)}
          className={cn(
            "flex h-9 w-full rounded-full border border-slate-200 dark:border-slate-800",
            "bg-slate-50 dark:bg-slate-900 pl-9 pr-20 py-1 text-sm shadow-sm",
            "transition-all focus-visible:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand",
            "placeholder:text-slate-400 dark:placeholder:text-slate-500",
            "dark:text-white"
          )}
          placeholder="Search ticker..."
          aria-autocomplete="list"
        />
        {/* Keyboard shortcut hint */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex">
          <KbdGroup>
            <Kbd className="h-5 px-1.5">{isMac ? "⌘" : "Ctrl"}</Kbd>
            <Kbd className="h-5 px-1.5">K</Kbd>
          </KbdGroup>
        </div>
      </form>

      {showSuggestions && (
        <div className="absolute top-full mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg z-[100] overflow-hidden">
          {searchLoading && suggestions.length === 0 ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-brand" />
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((s, i) => (
              <button
                key={s.ticker}
                type="button"
                onClick={() => handleSelect(s.ticker)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition",
                  "hover:bg-slate-100 dark:hover:bg-slate-800",
                  i === activeIndex && "bg-brand/10 dark:bg-brand/20"
                )}
              >
                <CompanyLogo ticker={s.ticker} name={s.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-slate-900 dark:text-white">{s.ticker}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate block">{s.name}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="px-3 py-4 text-center text-xs text-slate-400">No results</div>
          )}
          {/* Search for option */}
          <button
            type="button"
            onClick={() => handleSelect(value.trim().toUpperCase())}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition",
              "hover:bg-slate-100 dark:hover:bg-slate-800 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50",
              activeIndex === suggestions.length && "bg-brand/10 dark:bg-brand/20"
            )}
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            <span className="text-xs text-slate-700 dark:text-slate-300">
              Search for <span className="font-semibold text-slate-900 dark:text-white">&quot;{value.trim().toUpperCase()}&quot;</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
