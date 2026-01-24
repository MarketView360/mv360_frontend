"use client";

import * as React from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  UTCTimestamp,
  CrosshairMode,
  AreaSeries,
  CandlestickSeries,
  HistogramSeries,
} from "lightweight-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Camera,
  Maximize2,
  Minimize2,
  Settings2,
  BarChart3,
  CandlestickChart,
  TrendingUp,
  X,
} from "lucide-react";
import { useChartPreferences } from "@/hooks/useChartPreferences";

export interface ChartDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface PriceData {
  date: string;
  price: number;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
  drawdown?: number;
}

interface AdvancedPriceChartProps {
  data: PriceData[];
  ticker?: string;
}

const RANGE_OPTIONS = [
  { label: "1M", days: 21 },
  { label: "3M", days: 63 },
  { label: "6M", days: 126 },
  { label: "1Y", days: 252 },
  { label: "3Y", days: 252 * 3 },
  { label: "5Y", days: 252 * 5 },
  { label: "10Y", days: 252 * 10 },
  { label: "Max", days: Infinity },
];

export function AdvancedPriceChart({ data, ticker }: AdvancedPriceChartProps) {
  const chartContainerRef = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<IChartApi | null>(null);

  const { preferences, setShowVolume, setShowAnimations, isLoaded } = useChartPreferences();

  const [range, setRange] = React.useState("1Y");
  const [chartType, setChartType] = React.useState<"area" | "candlestick">("area");
  const [showVolume, setShowVolumeLocal] = React.useState(true);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isDark, setIsDark] = React.useState(false);

  // Sync with preferences when loaded
  React.useEffect(() => {
    if (isLoaded) {
      setShowVolumeLocal(preferences.showVolume);
      setChartType(preferences.defaultChartType);
      setRange(preferences.defaultRange);
    }
  }, [isLoaded, preferences.showVolume, preferences.defaultChartType, preferences.defaultRange]);

  // Detect dark mode
  React.useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Enhanced color scheme for better visibility
  const colors = React.useMemo(() => ({
    background: "transparent",
    text: isDark ? "#cbd5e1" : "#334155",
    grid: isDark ? "#334155" : "#e2e8f0",
    border: isDark ? "#475569" : "#cbd5e1",
    // Area chart colors
    lineColor: isDark ? "#3b82f6" : "#2563eb",
    areaTop: isDark ? "rgba(59, 130, 246, 0.4)" : "rgba(37, 99, 235, 0.3)",
    areaBottom: isDark ? "rgba(59, 130, 246, 0.0)" : "rgba(37, 99, 235, 0.0)",
    // Candlestick colors - more vibrant and visible
    upColor: isDark ? "#22c55e" : "#16a34a",
    downColor: isDark ? "#ef4444" : "#dc2626",
    upWick: isDark ? "#22c55e" : "#16a34a",
    downWick: isDark ? "#ef4444" : "#dc2626",
    // Volume colors
    volumeUp: isDark ? "rgba(34, 197, 94, 0.5)" : "rgba(22, 163, 74, 0.4)",
    volumeDown: isDark ? "rgba(239, 68, 68, 0.5)" : "rgba(220, 38, 38, 0.4)",
  }), [isDark]);

  // Filter data by range
  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    const rangeConfig = RANGE_OPTIONS.find((r) => r.label === range);
    if (!rangeConfig || rangeConfig.days === Infinity) return data;
    if (data.length <= rangeConfig.days) return data;
    return data.slice(-rangeConfig.days);
  }, [data, range]);

  // Convert to chart format
  const chartData = React.useMemo(() => {
    return filteredData.map((d) => ({
      time: new Date(d.date).getTime() / 1000,
      open: d.open ?? d.price,
      high: d.high ?? d.price,
      low: d.low ?? d.price,
      close: d.close ?? d.price,
      volume: d.volume ?? 0,
    }));
  }, [filteredData]);

  // Create and update chart
  React.useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

    // Clean up existing chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: colors.background },
        textColor: colors.text,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      },
      width: chartContainerRef.current.clientWidth,
      height: isFullscreen ? window.innerHeight - 120 : 380,
      grid: {
        vertLines: { color: colors.grid, style: 1 },
        horzLines: { color: colors.grid, style: 1 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: isDark ? "#64748b" : "#94a3b8",
          width: 1,
          style: 2,
          labelBackgroundColor: isDark ? "#334155" : "#f1f5f9",
        },
        horzLine: {
          color: isDark ? "#64748b" : "#94a3b8",
          width: 1,
          style: 2,
          labelBackgroundColor: isDark ? "#334155" : "#f1f5f9",
        },
      },
      rightPriceScale: {
        borderColor: colors.border,
        scaleMargins: {
          top: 0.1,
          bottom: showVolume ? 0.25 : 0.1,
        },
      },
      timeScale: {
        borderColor: colors.border,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        barSpacing: 6,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
    });

    chartRef.current = chart;

    // Deduplicate and sort data
    const uniqueData = Array.from(
      new Map(chartData.map((item) => [item.time, item])).values()
    ).sort((a, b) => a.time - b.time);

    // Add main series
    if (chartType === "area") {
      const areaSeries = chart.addSeries(AreaSeries, {
        lineColor: colors.lineColor,
        topColor: colors.areaTop,
        bottomColor: colors.areaBottom,
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBackgroundColor: colors.lineColor,
        priceLineVisible: true,
        lastValueVisible: true,
      });
      areaSeries.setData(
        uniqueData.map((d) => ({
          time: d.time as UTCTimestamp,
          value: d.close,
        }))
      );
      mainSeriesRef.current = areaSeries;
    } else {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: colors.upColor,
        downColor: colors.downColor,
        borderVisible: false,
        wickUpColor: colors.upWick,
        wickDownColor: colors.downWick,
        priceLineVisible: true,
        lastValueVisible: true,
      });
      candleSeries.setData(
        uniqueData.map((d) => ({
          time: d.time as UTCTimestamp,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }))
      );
      mainSeriesRef.current = candleSeries;
    }

    // Add volume series if enabled
    if (showVolume && uniqueData.some((d) => d.volume > 0)) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.85, bottom: 0 },
        borderVisible: false,
      });
      volumeSeries.setData(
        uniqueData.map((d) => ({
          time: d.time as UTCTimestamp,
          value: d.volume,
          color: d.close >= d.open ? colors.volumeUp : colors.volumeDown,
        }))
      );
      volumeSeriesRef.current = volumeSeries;
    }

    // Fit content with animation preference
    if (preferences.showAnimations) {
      chart.timeScale().fitContent();
    } else {
      chart.timeScale().fitContent();
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: isFullscreen ? window.innerHeight - 120 : 380,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [chartData, chartType, showVolume, colors, isDark, isFullscreen, preferences.showAnimations]);

  // Take snapshot
  const handleSnapshot = React.useCallback(() => {
    if (!chartContainerRef.current) return;

    const canvas = chartContainerRef.current.querySelector("canvas");
    if (!canvas) return;

    try {
      const link = document.createElement("a");
      link.download = `${ticker || "chart"}-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Failed to take snapshot:", e);
    }
  }, [ticker]);

  // Toggle fullscreen
  const toggleFullscreen = React.useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Handle volume toggle
  const handleVolumeToggle = React.useCallback((checked: boolean) => {
    setShowVolumeLocal(checked);
    setShowVolume(checked);
  }, [setShowVolume]);

  // Handle animation toggle
  const handleAnimationToggle = React.useCallback((checked: boolean) => {
    setShowAnimations(checked);
  }, [setShowAnimations]);

  const containerClasses = isFullscreen
    ? "fixed inset-0 z-50 bg-white dark:bg-slate-900 p-4"
    : "";

  return (
    <div className={containerClasses}>
      <Card className={cn(
        "w-full border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 transition-colors duration-200",
        isFullscreen && "h-full border-0 shadow-none"
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-200">
              {ticker && <span className="text-brand mr-2">{ticker}</span>}
              Price Chart
            </CardTitle>

            {/* Chart Type Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setChartType("area")}
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        chartType === "area"
                          ? "bg-white dark:bg-slate-700 text-brand shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      )}
                    >
                      <TrendingUp className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Area Chart</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setChartType("candlestick")}
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        chartType === "candlestick"
                          ? "bg-white dark:bg-slate-700 text-brand shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      )}
                    >
                      <CandlestickChart className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Candlestick Chart</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Range Selector */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
              {RANGE_OPTIONS.map((r) => (
                <button
                  key={r.label}
                  onClick={() => setRange(r.label)}
                  className={cn(
                    "px-2 py-1 text-xs font-medium rounded-md transition-colors",
                    range === r.label
                      ? "bg-brand text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Chart Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={showVolume}
                  onCheckedChange={handleVolumeToggle}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Show Volume
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={preferences.showAnimations}
                  onCheckedChange={handleAnimationToggle}
                >
                  Enable Animations
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Snapshot Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSnapshot}>
                    <Camera className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save Snapshot</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Fullscreen Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFullscreen}>
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Close button in fullscreen */}
            {isFullscreen && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFullscreen}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className={cn("p-4", isFullscreen && "h-[calc(100%-80px)]")}>
          {chartData.length === 0 ? (
            <div className="h-[380px] flex items-center justify-center text-slate-500 dark:text-slate-400">
              No price data available
            </div>
          ) : (
            <div
              ref={chartContainerRef}
              className={cn("w-full", isFullscreen ? "h-full" : "h-[380px]")}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
