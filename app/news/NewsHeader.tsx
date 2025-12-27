"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { PiNewspaper } from "react-icons/pi";
import { Button } from "@/components/ui/button";

export function NewsHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tickerRef = useRef<HTMLInputElement>(null);
  const qRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        (document.activeElement === tickerRef.current ? qRef : tickerRef).current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <PiNewspaper className="text-brand" />
            Market News
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Filter by ticker or search headlines
          </p>
        </div>

        <form
          className="flex flex-col md:flex-row w-full md:w-auto gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const ticker = tickerRef.current?.value.trim().toUpperCase() || "";
            const q = qRef.current?.value.trim() || "";
            const sp = new URLSearchParams();
            if (ticker) sp.set("ticker", ticker);
            if (q) sp.set("q", q);
            router.replace(`/news?${sp.toString()}`);
          }}
        >
          <div className="relative">
            <label htmlFor="ticker-input" className="sr-only">Filter by ticker symbol</label>
            <input
              id="ticker-input"
              ref={tickerRef}
              name="ticker"
              defaultValue={searchParams.get("ticker") ?? ""}
              placeholder="Ticker (e.g. AAPL)"
              className="w-full md:w-40 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            />
          </div>
          <div className="relative">
            <label htmlFor="headline-search" className="sr-only">Search headlines by keyword</label>
            <input
              id="headline-search"
              ref={qRef}
              name="q"
              defaultValue={searchParams.get("q") ?? ""}
              placeholder="Headline keywords"
              className="w-full md:w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            />
          </div>
          <Button type="submit" size="sm" className="px-4">
            <FiSearch className="mr-2" />
            Search
          </Button>
        </form>
      </div>
    </header>
  );
}