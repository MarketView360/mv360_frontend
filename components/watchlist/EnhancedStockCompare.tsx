"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { 
  X, Loader2, Settings2, BarChart3, TrendingUp, TrendingDown,
  ChevronDown, ChevronUp, Info 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { createClient } from "@/lib/supabase/client";
import { cleanTicker, LINE_COLORS } from "@/lib/watchlist-utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface CompanyMetrics {
  code: string;
  name: string;
  sector: string | null;
  price: number | null;
  price_change_1d: number | null;
  price_change_1m: number | null;
  market_cap: number | null;
  revenue_ttm: number | null;
  eps_ttm: number | null;
  pe_ratio: number | null;
  enterprise_value: number | null;
  roe: number | null;
  roa: number | null;
}

interface MetricConfig {
  key: keyof CompanyMetrics;
  label: string;
  format: (val: number | null) => string;
  category: string;
}

const DEFAULT_METRICS: MetricConfig[] = [
  { key: "price", label: "Price", format: (v) => v != null ? `$${v.toFixed(2)}` : "—", category: "Price" },
  { key: "price_change_1d", label: "1D Change", format: (v) => v != null ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` : "—", category: "Price" },
  { key: "price_change_1m", label: "1M Change", format: (v) => v != null ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` : "—", category: "Price" },
  { key: "revenue_ttm", label: "Revenue", format: (v) => v != null ? `$${(v / 1e9).toFixed(2)}B` : "—", category: "Fundamentals" },
  { key: "eps_ttm", label: "EPS", format: (v) => v != null ? `$${v.toFixed(2)}` : "—", category: "Fundamentals" },
  { key: "pe_ratio", label: "P/E", format: (v) => v != null ? v.toFixed(2) : "—", category: "Valuation" },
  { key: "enterprise_value", label: "EV", format: (v) => v != null ? `$${(v / 1e9).toFixed(2)}B` : "—", category: "Valuation" },
  { key: "roe", label: "ROE", format: (v) => v != null ? `${v.toFixed(2)}%` : "—", category: "Profitability" },
  { key: "roa", label: "ROA", format: (v) => v != null ? `${v.toFixed(2)}%` : "—", category: "Profitability" },
];

const ALL_AVAILABLE_METRICS: MetricConfig[] = [
  ...DEFAULT_METRICS,
  { key: "market_cap", label: "Market Cap", format: (v) => v != null ? `$${(v / 1e9).toFixed(2)}B` : "—", category: "Valuation" },
];

// Metrics that should show in bar charts (numeric values that make sense to compare)
const CHART_METRICS = ['revenue_ttm', 'eps_ttm', 'pe_ratio', 'enterprise_value', 'roe', 'roa', 'price_change_1d', 'price_change_1m'];

// Simple local checkbox control (since there is no shared Checkbox component)
function MetricCheckbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`flex items-center justify-center w-5 h-5 rounded border-2 text-xs font-bold transition-all duration-150 ${
        checked
          ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
          : "border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-800 hover:border-indigo-400"
      }`}
      aria-pressed={checked}
      aria-checked={checked}
      role="checkbox"
    >
      {checked && <span>✓</span>}
    </button>
  );
}

interface EnhancedStockCompareProps {
  tickers: string[];
  onRemoveTicker: (ticker: string) => void;
  onClear: () => void;
}

export function EnhancedStockCompare({ tickers, onRemoveTicker, onClear }: EnhancedStockCompareProps) {
  const [metricsData, setMetricsData] = useState<Map<string, CompanyMetrics>>(new Map());
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [priceRange, setPriceRange] = useState<'3M' | '6M' | '1Y' | '5Y' | '10Y'>('1Y');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('watchlist_compare_metrics');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Fall through to default
        }
      }
    }
    return DEFAULT_METRICS.map(m => m.key);
  });

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
        
        // Use batch endpoint for better performance
        const tickersParam = cleanedTickers.join(',');
        const url = `${baseUrl}/api/companies/batch?tickers=${encodeURIComponent(tickersParam)}&exchange=us`;
        console.log('[EnhancedStockCompare] Fetching from:', url);
        
        const res = await fetch(url);
        
        if (!res.ok) {
          console.error('[EnhancedStockCompare] Fetch failed:', res.status, res.statusText);
          throw new Error(`Failed to fetch batch data: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('[EnhancedStockCompare] Raw response:', data);
        const results = data.companies || [];
        console.log('[EnhancedStockCompare] Received companies:', results.length);
        
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
            sector: company.sector,
            price: metrics?.price != null ? Number(metrics.price) : null,
            price_change_1d: metrics?.refund_1d_p != null ? Number(metrics.refund_1d_p) : null,
            price_change_1m: metrics?.refund_1m_p != null ? Number(metrics.refund_1m_p) : null,
            market_cap: metrics?.market_cap != null ? Number(metrics.market_cap) : null,
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

  // Fetch price history for line chart
  useEffect(() => {
    if (cleanedTickers.length === 0) {
      setPriceHistory([]);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoadingPrices(true);
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
        
        // Calculate date based on selected range
        const fromDate = new Date();
        const rangeDays = {
          '3M': 90,
          '6M': 180,
          '1Y': 365,
          '5Y': 365 * 5,
          '10Y': 365 * 10,
        };
        fromDate.setDate(fromDate.getDate() - rangeDays[priceRange]);
        const fromDateStr = fromDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Fetch price data for each ticker
        const promises = cleanedTickers.map(async (ticker) => {
          try {
            const res = await fetch(`${baseUrl}/api/prices/${encodeURIComponent(ticker)}?from=${fromDateStr}`);
            if (res.ok) {
              const data = await res.json();
              return { ticker, prices: data.prices || [] };
            }
            return { ticker, prices: [] };
          } catch (err) {
            console.error(`Failed to fetch prices for ${ticker}:`, err);
            return { ticker, prices: [] };
          }
        });

        const results = await Promise.all(promises);
        
        if (cancelled) return;

        // Transform data for multi-line chart
        const dateMap = new Map<string, any>();
        
        for (const { ticker, prices } of results) {
          for (const price of prices) {
            const date = price.date;
            if (!dateMap.has(date)) {
              dateMap.set(date, { date });
            }
            // API returns adj_close (mapped from adjusted_close)
            dateMap.get(date)[ticker] = price.adj_close ?? price.adjusted_close ?? price.close;
          }
        }

        const chartData = Array.from(dateMap.values())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setPriceHistory(chartData);
      } catch (err) {
        if (!cancelled) console.error("Error fetching price history:", err);
      } finally {
        if (!cancelled) setLoadingPrices(false);
      }
    })();

    return () => { cancelled = true; };
  }, [cleanedTickers, priceRange]);

  const activeMetrics = useMemo(() => {
    return ALL_AVAILABLE_METRICS.filter(m => selectedMetrics.includes(m.key));
  }, [selectedMetrics]);

  const handleToggleMetric = (metricKey: string) => {
    const newSelection = selectedMetrics.includes(metricKey)
      ? selectedMetrics.filter(k => k !== metricKey)
      : [...selectedMetrics, metricKey];
    setSelectedMetrics(newSelection);
    if (typeof window !== 'undefined') {
      localStorage.setItem('watchlist_compare_metrics', JSON.stringify(newSelection));
    }
  };

  const chartDataByMetric = useMemo(() => {
    const result: Record<string, any[]> = {};
    
    // Create chart data for numeric metrics that have values
    const numericMetrics = CHART_METRICS;
    
    for (const metricKey of numericMetrics) {
      if (!selectedMetrics.includes(metricKey)) continue;
      
      const chartData: any[] = [];
      for (const ticker of cleanedTickers) {
        const data = metricsData.get(ticker);
        if (data) {
          const value = data[metricKey as keyof CompanyMetrics];
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
        result[metricKey] = chartData;
      }
    }
    
    return result;
  }, [metricsData, selectedMetrics, cleanedTickers]);

  if (tickers.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        Select stocks to compare
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 flex-1">
          <BarChart3 className="w-4 h-4 text-brand" />
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
            Compare {tickers.length} {tickers.length === 1 ? 'Stock' : 'Stocks'}
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={() => setShowCustomize(true)}
        >
          <Settings2 className="w-3.5 h-3.5" />
          Customize
        </Button>
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
          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Company
                  </th>
                  {activeMetrics.map((metric) => (
                    <th key={metric.key} className="text-right px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {metric.label}
                    </th>
                  ))}
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {cleanedTickers.map((ticker, idx) => {
                  const data = metricsData.get(ticker);
                  if (!data) return null;

                  return (
                    <tr
                      key={ticker}
                      className={`${idx % 2 === 0 ? '' : 'bg-slate-50/30 dark:bg-slate-800/10'} hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors`}
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <CompanyLogo ticker={ticker} name={data.name} size="sm" />
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900 dark:text-white truncate">
                              {data.code}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                              {data.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      {activeMetrics.map((metric) => {
                        const value = data[metric.key];
                        const formatted = metric.format(value as number);
                        const isChange = metric.key.includes('change');
                        const numValue = typeof value === 'number' ? value : null;
                        
                        return (
                          <td key={metric.key} className="text-right px-3 py-3">
                            {isChange && numValue != null ? (
                              <span className={`inline-flex items-center gap-1 ${numValue >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                {numValue >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                <span className="font-medium font-mono">{formatted}</span>
                              </span>
                            ) : (
                              <span className="font-mono text-slate-700 dark:text-slate-300">{formatted}</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-3 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => onRemoveTicker(ticker)}
                        >
                          <X className="w-3.5 h-3.5 text-slate-400" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Price Line Chart */}
          {priceHistory.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand" />
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                    Price History
                  </h4>
                </div>
                <div className="flex gap-1">
                  {(['3M', '6M', '1Y', '5Y', '10Y'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setPriceRange(range)}
                      className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                        priceRange === range
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-lg p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={priceHistory} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      stroke="#cbd5e1"
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      stroke="#cbd5e1"
                      width={60}
                      tickFormatter={(value) => `$${value.toFixed(0)}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                    />
                    <Legend />
                    {cleanedTickers.map((ticker, index) => (
                      <Line
                        key={ticker}
                        type="monotone"
                        dataKey={ticker}
                        stroke={LINE_COLORS[index % LINE_COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                        name={ticker}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Visual Charts */}
          {Object.keys(chartDataByMetric).length > 0 && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                <BarChart3 className="w-4 h-4 text-brand" />
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Metric Comparison
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(chartDataByMetric).map(([metricKey, data]) => {
                  const metric = ALL_AVAILABLE_METRICS.find(m => m.key === metricKey);
                  if (!metric || data.length === 0) return null;

                  return (
                    <div key={metricKey} className="bg-slate-50/50 dark:bg-slate-800/30 rounded-lg p-4">
                      <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
                        {metric.label}
                      </h5>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis 
                            dataKey="ticker" 
                            tick={{ fontSize: 10, fill: '#64748b' }}
                            stroke="#cbd5e1"
                          />
                          <YAxis 
                            tick={{ fontSize: 10, fill: '#64748b' }}
                            stroke="#cbd5e1"
                            width={70}
                            tickFormatter={(value) => {
                              if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
                              if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
                              if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
                              return value.toFixed(1);
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                            formatter={(value: number) => [metric.format(value), metric.label]}
                          />
                          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
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
            </div>
          )}
        </>
      )}

      {/* Customize Metrics Dialog */}
      <Dialog open={showCustomize} onOpenChange={setShowCustomize}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customize Metrics</DialogTitle>
            <DialogDescription>
              Select which metrics to display in the comparison table and charts.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {['Price', 'Fundamentals', 'Valuation', 'Profitability'].map(category => {
              const categoryMetrics = ALL_AVAILABLE_METRICS.filter(m => m.category === category);
              
              return (
                <div key={category} className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {category}
                  </h4>
                  {categoryMetrics.map(metric => (
                    <button
                      key={metric.key}
                      type="button"
                      onClick={() => handleToggleMetric(metric.key)}
                      className="w-full flex items-center gap-2 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-left"
                    >
                      <MetricCheckbox
                        checked={selectedMetrics.includes(metric.key)}
                        onToggle={() => handleToggleMetric(metric.key)}
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {metric.label}
                      </span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCustomize(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
