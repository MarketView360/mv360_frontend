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
import { MarketBreadth } from "@/components/market/MarketBreadth";
import { GlobalMarkets } from "@/components/market/GlobalMarkets";
import { SectorPerformance } from "@/components/market/SectorPerformance";
import { EconomicCalendar } from "@/components/market/EconomicCalendar";
import MarketOverview from "@/components/MarketOverview";

// Simple Kbd component since it was missing
const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
    {children}
  </kbd>
);

const KbdGroup = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("flex items-center gap-1", className)}>
    {children}
  </div>
);

export default function MarketPage() {
  const [sector, setSector] = useState<string>("");
  const [refreshToken, setRefreshToken] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Simulate loading effect
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [refreshToken, sector]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans">
      {/* Content */}
      <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12 py-8 md:py-10 space-y-8">
        {/* Top bar: last updated, sector filter, refresh */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Market Overview
            </h1>
          </div>
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

        {/* New Row: Breadth & Global Markets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <MarketBreadth />
          </div>
          <div className="lg:col-span-2">
            <GlobalMarkets />
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

        {/* New Row: Sector Perf & Economic Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <SectorPerformance />
          </div>
          <div>
            <EconomicCalendar />
          </div>
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
            </div>
          ) : (
            <MarketOverview refreshToken={refreshToken} />
          )}
        </div>
      </div>
    </div >
  );
}

