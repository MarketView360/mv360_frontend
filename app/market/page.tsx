"use client";

import React, { Suspense, useState, useEffect, useCallback } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import {
  Clock,
  Copy,
  Check,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MarketHeatmap from "@/components/MarketHeatmap";
import MarketOverview from "@/components/MarketOverview";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

const RANGE_OPTIONS = [
  { label: "1D", value: "1D" },
  { label: "1W", value: "1W" },
  { label: "1M", value: "1M" },
  { label: "3M", value: "3M" },
  { label: "1Y", value: "1Y" },
] as const;

type Range = typeof RANGE_OPTIONS[number]["value"];

/* ---------- main ---------- */
export default function MarketPage() {
  return (
    <Suspense fallback={<MarketPageSkeleton />}>
      <MarketPageContent />
    </Suspense>
  );
}

function MarketPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand" />
    </div>
  );
}

function MarketPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* URL state */
  const range = (searchParams.get("range") as Range) ?? "1D";
  const sector = searchParams.get("sector") ?? "";

  /* local state */
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);

  /* update URL */
  const setRange = useCallback(
    (r: Range) => {
      const params = new URLSearchParams(searchParams);
      params.set("range", r);
      router.replace(`/market?${params.toString()}`);
    },
    [router, searchParams]
  );

  const setSector = (s: string) => {
    const params = new URLSearchParams(searchParams);
    if (s) params.set("sector", s);
    else params.delete("sector");
    router.replace(`/market?${params.toString()}`);
  };

  /* keyboard shortcuts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        const idx = RANGE_OPTIONS.findIndex((o) => o.value === range);
        const next = RANGE_OPTIONS[(idx + 1) % RANGE_OPTIONS.length].value;
        setRange(next);
      }
      if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        document.getElementById("sector-picker")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [range, setRange]);

  /* copy link */
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* skeleton while loading (simulate fetch) */
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [range, sector]);

  /* breadcrumbs */
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Markets", href: "/market" },
    { name: range, href: `/market?range=${range}` },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 font-sans transition-colors duration-300">
      {/* Breadcrumbs + Copy Link */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12 py-4 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="h-4 w-4" />}
                <a
                  href={crumb.href}
                  className={cn(
                    "hover:text-brand transition-colors",
                    i === breadcrumbs.length - 1 && "text-slate-900 dark:text-white font-medium"
                  )}
                >
                  {crumb.name}
                </a>
              </React.Fragment>
            ))}
          </nav>
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            Copy link
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12 py-8 md:py-10 lg:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                Live market snapshot
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading tracking-tight text-slate-900 dark:text-white">
                  Market Overview
                </h1>
                <p className="mt-3 text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  Monitor broad market breadth, sector rotation and real-time movers in a single, focused view
                  built for active screening and analysis.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 bg-white/60 dark:bg-transparent">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                  US session
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 bg-white/60 dark:bg-transparent">
                  1D change focus
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 bg-white/60 dark:bg-transparent">
                  Press <kbd className="px-1 border rounded">R</kbd> to cycle range
                </span>
              </div>
            </div>

            {/* Range picker */}
            <div className="flex items-center gap-2" aria-label="Performance range selector">
              {RANGE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setRange(o.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                    range === o.value
                      ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-sm"
                      : "bg-white/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12 py-8 md:py-10 space-y-8">
        {/* Top bar: last updated, sector filter, refresh */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <Clock className="h-4 w-4" />
            <span>Last updated: just now</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="sector-picker" className="text-sm text-slate-600 dark:text-slate-300">
                Sector
              </label>
              <select
                id="sector-picker"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className={cn(
                  "h-9 rounded-lg border border-slate-200 dark:border-slate-700",
                  "bg-white dark:bg-slate-900 px-3 py-1 text-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                )}
              >
                <option value="">All sectors</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="financials">Financials</option>
                <option value="consumer">Consumer</option>
                <option value="industrials">Industrials</option>
                <option value="energy">Energy</option>
                <option value="utilities">Utilities</option>
                <option value="materials">Materials</option>
                <option value="real-estate">Real Estate</option>
                <option value="communication">Communication</option>
              </select>
            </div>
            <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshToken((t) => t + 1)}
            className="h-8"
          >
            <RefreshCw className={cn("h-3 w-3 mr-1.5")} />
            Refresh
            <KbdGroup className="ml-2">
              <Kbd>⌘</Kbd>
              <Kbd>⇧</Kbd>
              <Kbd>R</Kbd>
            </KbdGroup>
          </Button>
        </div>
      </div>

      {/* Heatmap */}
      <div>
        {loading ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="h-8 w-1/3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-64 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
          </div>
        ) : (
          <MarketHeatmap sector={sector || undefined} refreshToken={refreshToken} />
        )}
      </div>

      {/* Overview: Indices, Movers, News stacked */}
      <div>
        {loading ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4">
              <div className="h-6 w-1/3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
              <div className="h-20 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4">
              <div className="h-6 w-1/3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
              <div className="h-32 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
            </div>
);

export default function MarketPage() {
return (
<Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand" /></div>}>
<MarketPageContent />
</Suspense>
);
}