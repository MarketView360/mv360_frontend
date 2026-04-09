"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { X, Loader2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cleanTicker, LINE_COLORS } from "@/lib/watchlist-utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { useTheme } from "@/app/providers";

interface CompanyMetrics {
  code: string;
  name: string;
  revenue_ttm: number | null;
  eps_ttm: number | null;
  pe_ratio: number | null;
  enterprise_value: number | null;
  roe: number | null;
  roa: number | null;
}

interface ComparisonChartsProps {
  tickers: string[];
  onClear: () => void;
}

const CHART_METRICS = [
  { key: 'revenue_ttm', label: 'Revenue (TTM)', format: (v: number) => `$${(v / 1e9).toFixed(2)}B` },
  { key: 'eps_ttm', label: 'EPS (TTM)', format: (v: number) => `$${v.toFixed(2)}` },
  { key: 'pe_ratio', label: 'P/E Ratio', format: (v: number) => v.toFixed(2) },
  { key: 'enterprise_value', label: 'Enterprise Value', format: (v: number) => `$${(v / 1e9).toFixed(2)}B` },
  { key: 'roe', label: 'ROE (%)', format: (v: number) => `${v.toFixed(2)}%` },
  { key: 'roa', label: 'ROA (%)', format: (v: number) => `${v.toFixed(2)}%` },
];

export function ComparisonCharts({ tickers, onClear }: ComparisonChartsProps) {
  const { isDark } = useTheme();
  const [metricsData, setMetricsData] = useState<Map<string, CompanyMetrics>>(new Map());
  const [loading, setLoading] = useState(false);
  const supabaseRef = useRef(createClient());
  const cleanedTickers = useMemo(() => tickers.map(t => cleanTicker(t)), [tickers]);

  useEffect(() => {
    if (cleanedTickers.length === 0) {
      setMetricsData(new Map());
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
        
        // Fetch data for each ticker from backend API
        const promises = cleanedTickers.map(async (ticker) => {
          try {
            const res = await fetch(`${baseUrl}/api/company/${encodeURIComponent(ticker)}`);
            if (res.ok) {
              return await res.json();
            }
            return null;
          } catch (err) {
            console.error(`Failed to fetch ${ticker}:`, err);
            return null;
          }
        });

        const results = await Promise.all(promises);
        
        if (cancelled) return;

        const map = new Map<string, CompanyMetrics>();
        for (const result of results) {
          if (!result?.company?.ticker) continue;
          const { company, metrics } = result;
          
          // Use cleaned ticker as map key for consistent lookup
          const cleanedTicker = cleanTicker(company.ticker);
          map.set(cleanedTicker, {
            code: company.ticker,
            name: company.name,
            revenue_ttm: metrics?.revenue_ttm != null ? Number(metrics.revenue_ttm) : null,
            eps_ttm: metrics?.eps_ttm != null ? Number(metrics.eps_ttm) : null,
            pe_ratio: metrics?.pe_ratio != null ? Number(metrics.pe_ratio) : null,
            enterprise_value: metrics?.enterprise_value != null ? Number(metrics.enterprise_value) : null,
            roe: metrics?.roe != null ? Number(metrics.roe) : null,
            roa: metrics?.roa != null ? Number(metrics.roa) : null,
          });
        }
        setMetricsData(map);
      } catch (err) {
        if (!cancelled) console.error("Error fetching metrics:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [cleanedTickers]);

  const chartDataByMetric = useMemo(() => {
    const result: Record<string, any[]> = {};

    for (const metric of CHART_METRICS) {
      const chartData: any[] = [];
      for (const ticker of cleanedTickers) {
        const data = metricsData.get(ticker);
        if (data) {
          const value = data[metric.key as keyof CompanyMetrics];
          if (typeof value === 'number' && !isNaN(value)) {
            chartData.push({
              ticker: data.code,
              name: data.name?.substring(0, 20) || data.code,
              value: value,
            });
          }
        }
      }

      if (chartData.length > 0) {
        result[metric.key] = chartData;
      }
    }

    return result;
  }, [metricsData, cleanedTickers]);

  if (tickers.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 mx-4 sm:mx-6 mt-2">
      <div className="py-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 flex-1">
            <BarChart3 className="w-4 h-4 text-brand" />
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
              Comparing {tickers.length} {tickers.length === 1 ? 'Stock' : 'Stocks'}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onClear}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-brand" />
          </div>
        ) : (
          <>
            {Object.keys(chartDataByMetric).length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No metrics available for comparison
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CHART_METRICS.map((metric) => {
                  const data = chartDataByMetric[metric.key];
                  if (!data || data.length === 0) return null;

                  return (
                    <div key={metric.key} className="bg-slate-50/50 dark:bg-slate-800/30 rounded-lg p-4">
                      <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
                        {metric.label}
                      </h5>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                          <XAxis
                            dataKey="ticker"
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            stroke="#cbd5e1"
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            stroke="#cbd5e1"
                            width={60}
                          />
                          <Tooltip
                            cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
                            contentStyle={{
                              backgroundColor: isDark ? "rgba(15, 23, 42, 0.7)" : "rgba(255, 255, 255, 0.7)",
                              backdropFilter: "blur(12px)",
                              WebkitBackdropFilter: "blur(12px)",
                              border: isDark ? "1px solid rgba(51, 65, 85, 0.5)" : "1px solid rgba(226, 232, 240, 0.5)",
                              borderRadius: "8px",
                              boxShadow: isDark ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              color: isDark ? "#f8fafc" : "#0f172a",
                            }}
                            itemStyle={{ color: isDark ? "#f8fafc" : "#0f172a", fontSize: "12px", fontWeight: "500" }}
                            labelStyle={{ color: isDark ? "#e2e8f0" : "#475569", marginBottom: "4px", fontSize: "12px", fontWeight: "600" }}
                            formatter={(value: number) => [metric.format(value), metric.label]}
                          />
                          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={LINE_COLORS[index % LINE_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
