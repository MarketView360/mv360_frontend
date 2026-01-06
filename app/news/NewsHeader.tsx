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
  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

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
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur sticky top-16 z-10">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-6 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <PiNewspaper className="text-brand" />
            Market News
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time market headlines with advanced filtering
          </p>
        </div>

        <form
          className="flex flex-col md:flex-row gap-2 w-full xl:w-auto"
          onSubmit={(e) => {
            e.preventDefault();
            const ticker = tickerRef.current?.value.trim().toUpperCase() || "";
            const q = qRef.current?.value.trim() || "";
            const from = fromRef.current?.value || "";
            const to = toRef.current?.value || "";
            
            const sp = new URLSearchParams();
            if (ticker) sp.set("ticker", ticker);
            if (q) sp.set("q", q);
            if (from) sp.set("from", from);
            if (to) sp.set("to", to);
            
            router.replace(`/news?${sp.toString()}`);
          }}
        >
          <div className="flex gap-2">
            <input
              ref={tickerRef}
              name="ticker"
              defaultValue={searchParams.get("ticker") ?? ""}
              placeholder="Ticker (e.g. AAPL)"
              className="w-32 md:w-40 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <input
              ref={qRef}
              name="q"
              defaultValue={searchParams.get("q") ?? ""}
              placeholder="Headline keywords"
              className="flex-1 md:w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          
          <div className="flex gap-2">
             <input
              ref={fromRef}
              name="from"
              type="date"
              defaultValue={searchParams.get("from") ?? ""}
              className="w-full md:w-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand text-slate-500 dark:text-slate-400"
            />
            <span className="self-center text-slate-400 dark:text-slate-600">-</span>
            <input
              ref={toRef}
              name="to"
              type="date"
              defaultValue={searchParams.get("to") ?? ""}
              className="w-full md:w-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand text-slate-500 dark:text-slate-400"
            />
            <Button type="submit" size="sm" className="px-4 shrink-0">
              <FiSearch className="mr-2" />
              Search
            </Button>
          </div>
        </form>
      </div>
    </header>
  );
}