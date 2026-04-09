"use client";

import { useEffect, useState } from "react";
import { usePortfolio } from "@/providers/PortfolioProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const PERIODS = [
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function PortfolioValueChart() {
  const { chartData, loadChartData, summary } = usePortfolio();
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await loadChartData(selectedPeriod);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedPeriod, loadChartData]);

  // Calculate change over period
  const firstValue = chartData.length > 0 ? chartData[0].totalValue : 0;
  const lastValue = chartData.length > 0 ? chartData[chartData.length - 1].totalValue : 0;
  const periodChange = lastValue - firstValue;
  const periodChangePercent = firstValue > 0 ? (periodChange / firstValue) * 100 : 0;

  // Calculate chart dimensions
  const maxValue = Math.max(...chartData.map((d) => d.totalValue), 1);
  const minValue = Math.min(...chartData.map((d) => d.totalValue), 0);
  const range = maxValue - minValue || 1;

  // Generate SVG path
  const generatePath = () => {
    if (chartData.length < 2) return "";

    const width = 100;
    const height = 100;
    const padding = 5;

    const points = chartData.map((d, i) => {
      const x = padding + (i / (chartData.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((d.totalValue - minValue) / range) * (height - 2 * padding);
      return `${x},${y}`;
    });

    return `M ${points.join(" L ")}`;
  };

  // Generate area path (for gradient fill)
  const generateAreaPath = () => {
    if (chartData.length < 2) return "";

    const width = 100;
    const height = 100;
    const padding = 5;

    const points = chartData.map((d, i) => {
      const x = padding + (i / (chartData.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((d.totalValue - minValue) / range) * (height - 2 * padding);
      return `${x},${y}`;
    });

    return `M ${padding},${height - padding} L ${points.join(" L ")} L ${100 - padding},${height - padding} Z`;
  };

  const isPositive = periodChange >= 0;
  const strokeColor = isPositive ? "#10b981" : "#ef4444";
  const fillColor = isPositive ? "url(#greenGradient)" : "url(#redGradient)";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Portfolio Value</CardTitle>
        <div className="flex gap-1">
          {PERIODS.map((period) => (
            <Button
              key={period.days}
              variant={selectedPeriod === period.days ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setSelectedPeriod(period.days)}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : chartData.length < 2 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-muted-foreground">Not enough data</p>
            <p className="text-sm text-muted-foreground mt-1">
              Chart will appear after more daily snapshots
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current value and change */}
            <div>
              <p className="text-2xl font-bold">
                {formatCurrency(summary?.totalPortfolioValue || lastValue)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    isPositive ? "text-emerald-600" : "text-red-600"
                  )}
                >
                  {isPositive ? "+" : ""}
                  {formatCurrency(periodChange)} ({periodChangePercent.toFixed(2)}%)
                </span>
                <span className="text-sm text-muted-foreground">
                  past {PERIODS.find((p) => p.days === selectedPeriod)?.label}
                </span>
              </div>
            </div>

            {/* SVG Chart */}
            <div className="h-32 w-full">
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                <defs>
                  <linearGradient id="greenGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="redGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={generateAreaPath()} fill={fillColor} />
                <path
                  d={generatePath()}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>

            {/* Date range */}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {new Date(chartData[0]?.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span>
                {new Date(chartData[chartData.length - 1]?.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
