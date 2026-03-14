"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, AlertCircle, RefreshCw } from "lucide-react";

const BACKEND_URL =
  (process.env.NEXT_PUBLIC_BACKEND_URL as string | undefined) ??
  "http://localhost:4000";

interface BreadthResponse {
  advancing: number;
  declining: number;
  unchanged: number;
  total: number;
}

export function MarketBreadth() {
  const [breadth, setBreadth] = useState<BreadthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBreadth = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${BACKEND_URL}/api/market/breadth`);
        if (!res.ok) throw new Error("Failed to fetch market breadth");
        const data = (await res.json()) as BreadthResponse;
        setBreadth(data);
      } catch (err) {
        console.error("[MarketBreadth] Error:", err);
        setError("Unable to load market breadth");
      } finally {
        setLoading(false);
      }
    };

    void fetchBreadth();
  }, []);

  const adv = breadth?.advancing ?? 0;
  const dec = breadth?.declining ?? 0;
  const unc = breadth?.unchanged ?? 0;
  const total = breadth?.total && breadth.total > 0 ? breadth.total : adv + dec + unc;

  const advPercent = total > 0 ? (adv / total) * 100 : 0;
  const decPercent = total > 0 ? (dec / total) * 100 : 0;
  const uncPercent = total > 0 ? (unc / total) * 100 : 0;
  const adRatio = dec > 0 ? (adv / dec).toFixed(2) : "-";
  const isBullish = adv > dec;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-3 w-full rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-10 w-16" />
            <Skeleton className="h-10 w-16" />
            <Skeleton className="h-10 w-16" />
          </div>
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  const hasData = adv > 0 || dec > 0 || unc > 0;

  if (error || !hasData) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
          <AlertCircle size={20} strokeWidth={1.5} aria-hidden="true" />
          <p className="text-sm">Breadth data unavailable</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setError(null); setLoading(true); }}
            className="h-7 gap-1.5 text-xs"
          >
            <RefreshCw size={12} strokeWidth={1.75} aria-hidden="true" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Market Breadth
          </span>
          <span className="text-[10px] font-medium text-muted-foreground px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">
            US Market
          </span>
        </div>

        {/* Gauge Visual */}
        <div className="h-3 flex w-full rounded-full overflow-hidden mb-3">
          <div
            style={{ width: `${advPercent}%` }}
            className="bg-emerald-500 hover:bg-emerald-400 transition-colors"
          />
          <div
            style={{ width: `${uncPercent}%` }}
            className="bg-slate-300 dark:bg-slate-600"
          />
          <div
            style={{ width: `${decPercent}%` }}
            className="bg-rose-500 hover:bg-rose-400 transition-colors"
          />
        </div>

        {/* Stats Row - Compact Horizontal */}
        <div className="flex items-center justify-between text-center mb-2">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="font-bold text-base">{adv.toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground">Adv</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Minus className="w-3.5 h-3.5" />
            <span className="font-semibold text-base">{unc}</span>
            <span className="text-[10px] text-muted-foreground">Unch</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
            <TrendingDown className="w-3.5 h-3.5" />
            <span className="font-bold text-base">{dec.toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground">Dec</span>
          </div>
        </div>

        {/* Footer Row */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
          <span className="text-muted-foreground">
            A/D Ratio:{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              {adRatio}
            </span>
          </span>
          <Badge
            variant={isBullish ? "default" : "destructive"}
            className="text-xs"
          >
            {isBullish ? "Bullish" : "Bearish"} · {adRatio}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
