"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const BACKEND_URL =
  (process.env.NEXT_PUBLIC_BACKEND_URL as string | undefined) ??
  "http://localhost:4000";

interface SectorData {
  sector: string;
  change_1d: number;
  change_1w: number;
  change_1m: number;
  market_cap: number;
  stock_count: number;
  advancers: number;
  decliners: number;
}

export function SectorPerformance() {
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/market/sectors`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSectors(data);
    } catch (err) {
      console.error("[SectorPerformance] Error:", err);
      setError("Unable to load sector data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const maxChange = sectors.length > 0
    ? Math.max(...sectors.map((s) => Math.abs(s.change_1d)), 0.01)
    : 1;

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-slate-800 dark:text-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            Sector Performance (1D)
          </div>
          {!loading && (
            <button
              type="button"
              onClick={() => void fetchData()}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="h-6 w-6 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-brand animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <p className="text-sm text-slate-500">{error}</p>
            <button
              type="button"
              onClick={() => void fetchData()}
              className="text-xs text-brand hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sectors.map((sector) => (
              <div key={sector.sector} className="group flex items-center gap-3 text-sm">
                <span className="w-32 truncate text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                  {sector.sector}
                </span>

                {/* Bar container */}
                <div className="flex-1 flex items-center h-6 relative">
                  {/* Center Line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />

                  {sector.change_1d >= 0 ? (
                    // Positive bar (right of center)
                    <div
                      className="h-4 bg-emerald-500 rounded-r-sm ml-[50%]"
                      style={{ width: `${(sector.change_1d / maxChange) * 50}%` }}
                    />
                  ) : (
                    // Negative bar (left of center)
                    <div
                      className="h-4 bg-rose-500 rounded-l-sm ml-auto mr-[50%]"
                      style={{ width: `${(Math.abs(sector.change_1d) / maxChange) * 50}%` }}
                    />
                  )}
                </div>

                <span
                  className={cn(
                    "w-12 text-right font-mono text-xs",
                    sector.change_1d >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  )}
                >
                  {sector.change_1d > 0 ? "+" : ""}
                  {sector.change_1d.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
