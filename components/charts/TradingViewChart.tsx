"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
    createChart,
    ColorType,
    IChartApi,
    ISeriesApi,
    Time,
    CrosshairMode,
    LineStyle,
    CandlestickSeries,
    LineSeries,
    AreaSeries,
    HistogramSeries,
} from "lightweight-charts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CandlestickChart, LineChart, BarChart3 } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface OHLCData {
    time: string; // YYYY-MM-DD format
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

export interface SimpleData {
    time: string;
    value: number;
    volume?: number;
}

export type ChartType = "candlestick" | "line" | "area";

export interface TradingViewChartProps {
    /** OHLC data for candlestick charts */
    ohlcData?: OHLCData[];
    /** Simple price data for line/area charts */
    lineData?: SimpleData[];
    /** Chart type: candlestick, line, or area */
    chartType?: ChartType;
    /** Show volume histogram */
    showVolume?: boolean;
    /** Height of the chart container */
    height?: number;
    /** Additional CSS classes */
    className?: string;
    /** Chart title */
    title?: string;
    /** Time range options */
    timeRanges?: string[];
    /** Current selected time range */
    selectedRange?: string;
    /** Callback when time range changes */
    onRangeChange?: (range: string) => void;
    /** Show chart type toggle */
    showChartTypeToggle?: boolean;
    /** Allow user to change chart type */
    onChartTypeChange?: (type: ChartType) => void;
    /** Watermark text */
    watermark?: string;
    /** Loading state */
    loading?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// THEME COLORS
// ═══════════════════════════════════════════════════════════════════════════════

const CHART_COLORS = {
    light: {
        background: "#ffffff",
        textColor: "#333333",
        gridColor: "#f0f3fa",
        borderColor: "#e1e4ea",
        upColor: "#26a69a",
        downColor: "#ef5350",
        volumeUp: "rgba(38, 166, 154, 0.5)",
        volumeDown: "rgba(239, 83, 80, 0.5)",
        lineColor: "#2962ff",
        areaTopColor: "rgba(41, 98, 255, 0.28)",
        areaBottomColor: "rgba(41, 98, 255, 0.05)",
        crosshairColor: "#758696",
    },
    dark: {
        background: "#131722",
        textColor: "#d1d4dc",
        gridColor: "#1e222d",
        borderColor: "#2a2e39",
        upColor: "#089981",
        downColor: "#f23645",
        volumeUp: "rgba(8, 153, 129, 0.5)",
        volumeDown: "rgba(242, 54, 69, 0.5)",
        lineColor: "#2962ff",
        areaTopColor: "rgba(41, 98, 255, 0.56)",
        areaBottomColor: "rgba(41, 98, 255, 0.04)",
        crosshairColor: "#758696",
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function TradingViewChart({
    ohlcData,
    lineData,
    chartType = "candlestick",
    showVolume = true,
    height = 400,
    className,
    title,
    timeRanges = ["1D", "1W", "1M", "3M", "1Y", "5Y", "MAX"],
    selectedRange = "1Y",
    onRangeChange,
    showChartTypeToggle = true,
    onChartTypeChange,
    loading = false,
}: TradingViewChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
    const areaSeriesRef = useRef<ISeriesApi<"Area"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

    const [isDarkMode, setIsDarkMode] = useState(false);
    const [internalChartType, setInternalChartType] = useState<ChartType>(chartType);

    // Detect dark mode
    useEffect(() => {
        const checkDarkMode = () => {
            const isDark = document.documentElement.classList.contains("dark");
            setIsDarkMode(isDark);
        };

        checkDarkMode();

        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    const colors = useMemo(() => (isDarkMode ? CHART_COLORS.dark : CHART_COLORS.light), [isDarkMode]);

    // Convert data to TradingView format
    const formattedOhlcData = useMemo(() => {
        if (!ohlcData) return [];
        return ohlcData.map((d) => ({
            time: d.time as Time,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
        }));
    }, [ohlcData]);

    const formattedLineData = useMemo(() => {
        if (lineData) {
            return lineData.map((d) => ({
                time: d.time as Time,
                value: d.value,
            }));
        }
        // Convert OHLC to line data using close prices
        if (ohlcData) {
            return ohlcData.map((d) => ({
                time: d.time as Time,
                value: d.close,
            }));
        }
        return [];
    }, [lineData, ohlcData]);

    const volumeData = useMemo(() => {
        const data = ohlcData || lineData;
        if (!data) return [];

        return data.map((d, i) => {
            const volume = d.volume ?? 0;
            let color = colors.volumeUp;

            if (ohlcData && i > 0) {
                color = ohlcData[i].close >= ohlcData[i].open ? colors.volumeUp : colors.volumeDown;
            } else if (lineData && i > 0) {
                color = lineData[i].value >= lineData[i - 1].value ? colors.volumeUp : colors.volumeDown;
            }

            return {
                time: d.time as Time,
                value: volume,
                color,
            };
        });
    }, [ohlcData, lineData, colors]);

    // Initialize chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: colors.background },
                textColor: colors.textColor,
            },
            grid: {
                vertLines: { color: colors.gridColor },
                horzLines: { color: colors.gridColor },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: {
                    width: 1,
                    color: colors.crosshairColor,
                    style: LineStyle.Dashed,
                    labelBackgroundColor: colors.crosshairColor,
                },
                horzLine: {
                    width: 1,
                    color: colors.crosshairColor,
                    style: LineStyle.Dashed,
                    labelBackgroundColor: colors.crosshairColor,
                },
            },
            rightPriceScale: {
                borderColor: colors.borderColor,
                scaleMargins: {
                    top: 0.1,
                    bottom: showVolume ? 0.25 : 0.1,
                },
            },
            timeScale: {
                borderColor: colors.borderColor,
                timeVisible: true,
                secondsVisible: false,
            },
            width: chartContainerRef.current.clientWidth,
            height: height,
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
                horzTouchDrag: true,
                vertTouchDrag: true,
            },
            handleScale: {
                axisPressedMouseMove: true,
                mouseWheel: true,
                pinch: true,
            },
        });

        chartRef.current = chart;

        // Handle resize
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                });
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
            chartRef.current = null;
            candlestickSeriesRef.current = null;
            lineSeriesRef.current = null;
            areaSeriesRef.current = null;
            volumeSeriesRef.current = null;
        };
    }, [colors, height, showVolume]);

    // Update chart colors when theme changes
    useEffect(() => {
        if (!chartRef.current) return;

        chartRef.current.applyOptions({
            layout: {
                background: { type: ColorType.Solid, color: colors.background },
                textColor: colors.textColor,
            },
            grid: {
                vertLines: { color: colors.gridColor },
                horzLines: { color: colors.gridColor },
            },
            rightPriceScale: {
                borderColor: colors.borderColor,
            },
            timeScale: {
                borderColor: colors.borderColor,
            },
        });

        // Update candlestick colors
        if (candlestickSeriesRef.current) {
            candlestickSeriesRef.current.applyOptions({
                upColor: colors.upColor,
                downColor: colors.downColor,
                borderUpColor: colors.upColor,
                borderDownColor: colors.downColor,
                wickUpColor: colors.upColor,
                wickDownColor: colors.downColor,
            });
        }

        // Update line colors
        if (lineSeriesRef.current) {
            lineSeriesRef.current.applyOptions({
                color: colors.lineColor,
            });
        }

        // Update area colors
        if (areaSeriesRef.current) {
            areaSeriesRef.current.applyOptions({
                lineColor: colors.lineColor,
                topColor: colors.areaTopColor,
                bottomColor: colors.areaBottomColor,
            });
        }
    }, [colors]);

    // Update series data
    useEffect(() => {
        if (!chartRef.current) return;

        // Clear existing series
        if (candlestickSeriesRef.current) {
            chartRef.current.removeSeries(candlestickSeriesRef.current);
            candlestickSeriesRef.current = null;
        }
        if (lineSeriesRef.current) {
            chartRef.current.removeSeries(lineSeriesRef.current);
            lineSeriesRef.current = null;
        }
        if (areaSeriesRef.current) {
            chartRef.current.removeSeries(areaSeriesRef.current);
            areaSeriesRef.current = null;
        }
        if (volumeSeriesRef.current) {
            chartRef.current.removeSeries(volumeSeriesRef.current);
            volumeSeriesRef.current = null;
        }

        // Add volume series first (so it appears behind price)
        if (showVolume && volumeData.length > 0) {
            const volumeSeries = chartRef.current.addSeries(HistogramSeries, {
                priceFormat: {
                    type: "volume",
                },
                priceScaleId: "",
            });
            volumeSeries.priceScale().applyOptions({
                scaleMargins: {
                    top: 0.85,
                    bottom: 0,
                },
            });
            volumeSeries.setData(volumeData);
            volumeSeriesRef.current = volumeSeries;
        }

        // Add main price series based on chart type
        switch (internalChartType) {
            case "candlestick":
                if (formattedOhlcData.length > 0) {
                    const candleSeries = chartRef.current.addSeries(CandlestickSeries, {
                        upColor: colors.upColor,
                        downColor: colors.downColor,
                        borderUpColor: colors.upColor,
                        borderDownColor: colors.downColor,
                        wickUpColor: colors.upColor,
                        wickDownColor: colors.downColor,
                    });
                    candleSeries.setData(formattedOhlcData);
                    candlestickSeriesRef.current = candleSeries;
                }
                break;

            case "line":
                if (formattedLineData.length > 0) {
                    const lineSeries = chartRef.current.addSeries(LineSeries, {
                        color: colors.lineColor,
                        lineWidth: 2,
                        crosshairMarkerVisible: true,
                        crosshairMarkerRadius: 4,
                    });
                    lineSeries.setData(formattedLineData);
                    lineSeriesRef.current = lineSeries;
                }
                break;

            case "area":
                if (formattedLineData.length > 0) {
                    const areaSeries = chartRef.current.addSeries(AreaSeries, {
                        lineColor: colors.lineColor,
                        topColor: colors.areaTopColor,
                        bottomColor: colors.areaBottomColor,
                        lineWidth: 2,
                        crosshairMarkerVisible: true,
                        crosshairMarkerRadius: 4,
                    });
                    areaSeries.setData(formattedLineData);
                    areaSeriesRef.current = areaSeries;
                }
                break;
        }

        // Fit content
        chartRef.current.timeScale().fitContent();
    }, [internalChartType, formattedOhlcData, formattedLineData, volumeData, showVolume, colors]);

    // Handle chart type change
    const handleChartTypeChange = useCallback(
        (type: ChartType) => {
            setInternalChartType(type);
            onChartTypeChange?.(type);
        },
        [onChartTypeChange]
    );

    // Loading state
    if (loading) {
        return (
            <div
                className={cn("relative rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900", className)}
                style={{ height }}
            >
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />
                </div>
            </div>
        );
    }

    return (
        <div className={cn("relative rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden", className)}>
            {/* Header */}
            {(title || showChartTypeToggle || timeRanges.length > 0) && (
                <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
                    {title && (
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
                    )}

                    <div className="flex items-center gap-2">
                        {/* Chart Type Toggle */}
                        {showChartTypeToggle && (
                            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-7 w-7 p-0",
                                        internalChartType === "candlestick" && "bg-white dark:bg-slate-700 shadow-sm"
                                    )}
                                    onClick={() => handleChartTypeChange("candlestick")}
                                    title="Candlestick"
                                >
                                    <CandlestickChart className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-7 w-7 p-0",
                                        internalChartType === "line" && "bg-white dark:bg-slate-700 shadow-sm"
                                    )}
                                    onClick={() => handleChartTypeChange("line")}
                                    title="Line"
                                >
                                    <LineChart className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-7 w-7 p-0",
                                        internalChartType === "area" && "bg-white dark:bg-slate-700 shadow-sm"
                                    )}
                                    onClick={() => handleChartTypeChange("area")}
                                    title="Area"
                                >
                                    <BarChart3 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {/* Time Range Selector */}
                        {timeRanges.length > 0 && onRangeChange && (
                            <div className="flex items-center gap-1">
                                {timeRanges.map((range) => (
                                    <Button
                                        key={range}
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "h-7 px-2 text-xs",
                                            selectedRange === range
                                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                                : "text-slate-600 dark:text-slate-400"
                                        )}
                                        onClick={() => onRangeChange(range)}
                                    >
                                        {range}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Chart Container */}
            <div ref={chartContainerRef} style={{ height }} />
        </div>
    );
}

export default TradingViewChart;
