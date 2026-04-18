"use client";

import React, { useState } from "react";
import { MarketBreadth } from "@/components/market/MarketBreadth";
import { GlobalMarkets } from "@/components/market/GlobalMarkets";
import { SectorPerformance } from "@/components/market/SectorPerformance";
import { StockEventsCalendar } from "@/components/market/StockEventsCalendar";
import MarketOverview from "@/components/MarketOverview";
import { MarketHeatmapNew } from "@/components/MarketHeatmapNew";
import { GoogleAdSlot, GoogleAdInline } from "@/components/GoogleAdSlot";

export default function MarketPage() {
  const [refreshToken] = useState<number>(0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans">
      {/* Content */}
      <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12 py-8 md:py-10 space-y-6">
        {/* Page title */}
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Market Overview
          </h1>
        </div>

        {/* Top: Global Markets Ticker */}
        <div className="w-full">
          <GlobalMarkets />
        </div>

        {/* FULL WIDTH HEATMAP SECTION - New redesigned component */}
        <div className="w-full">
          <MarketHeatmapNew />
        </div>

        {/* Ad Placement - After heatmap, before market breadth */}
        <GoogleAdInline />

        {/* Secondary Row: Market Breadth + Stock Events Calendar side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MarketBreadth />
          <StockEventsCalendar />
        </div>

        {/* Sector Performance Section */}
        <div>
          <SectorPerformance />
        </div>

        {/* Ad Placement - After sector performance, before overview */}
        <GoogleAdSlot />

        {/* Overview: Indices, Movers, News stacked */}
        <div>
          <MarketOverview refreshToken={refreshToken} />
        </div>
      </div>
    </div>
  );
}
