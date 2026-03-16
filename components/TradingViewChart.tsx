"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
    createChart,
    ColorType,
    IChartApi,
    UTCTimestamp,
    CrosshairMode,
    AreaSeries,
    CandlestickSeries,
    HistogramSeries,
    LineSeries,
} from "lightweight-charts";

export interface ChartDataPoint {
    time: number; // Unix timestamp
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

export interface RiskZone {
    startTime: number;
    endTime: number;
    type: "overbought" | "oversold" | "high-volatility";
}

export interface ChartOverlay {
    id: string;
    label: string;
    color: string;
    lineWidth?: 1 | 2 | 3 | 4;
    /** 0=solid 1=dotted 2=dashed 3=large-dashed 4=sparse-dotted */
    lineStyle?: 0 | 1 | 2 | 3 | 4;
    data: Array<{ time: UTCTimestamp; value: number }>;
}

export interface OscillatorLine {
    data: Array<{ time: UTCTimestamp; value: number }>;
    color: string;
    lineWidth?: 1 | 2;
}

export interface OscillatorHistogramBar {
    time: UTCTimestamp;
    value: number;
    color: string;
}

export interface OscillatorPaneConfig {
    label: string;
    lines: OscillatorLine[];
    histogram?: OscillatorHistogramBar[];
    refLines?: Array<{ price: number; color: string; label?: string }>;
}

interface TradingViewChartProps {
    data: ChartDataPoint[];
    colors?: {
        backgroundColor?: string;
        lineColor?: string;
        textColor?: string;
        areaTopColor?: string;
        areaBottomColor?: string;
        upColor?: string;
        downColor?: string;
        wickUpColor?: string;
        wickDownColor?: string;
    };
    chartType?: "area" | "candlestick";
    /** Pixel height. Pass 0 to auto-fill the parent container height. */
    height?: number;
    showVolume?: boolean;
    showDetailedTooltip?: boolean;
    onPointClick?: (index: number, data: ChartDataPoint) => void;
    areaStyle?: "area" | "line";
    riskZones?: RiskZone[];
    showRiskZones?: boolean;
    showBaselineMarker?: boolean;
    baselinePrice?: number;
    /** Price-level overlay lines (MAs, Bollinger Bands, etc.) */
    overlays?: ChartOverlay[];
    /** Generic oscillator pane shown below the main chart (replaces rsiData) */
    oscillatorPane?: OscillatorPaneConfig;
    /** Always reserve space for the sub-panel even when no oscillator is active */
    reserveSubPanel?: boolean;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
    data,
    colors = {},
    chartType = "area",
    height = 300,
    showVolume = true,
    showDetailedTooltip = true,
    onPointClick,
    areaStyle = "area",
    riskZones = [],
    showRiskZones = false,
    showBaselineMarker = false,
    baselinePrice,
    overlays = [],
    oscillatorPane,
    reserveSubPanel = false,
}) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const rsiContainerRef = useRef<HTMLDivElement>(null);
    const rsiChartRef = useRef<IChartApi | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const overlaySeriesRef = useRef<any[]>([]);
    // Tracks the user-selected visible time range so overlay mutations never
    // reset the viewport. Initialised from the data range; updated on user pan/zoom.
    const visibleRangeRef = useRef<{ from: UTCTimestamp; to: UTCTimestamp } | null>(null);
    const [hoverInfo, setHoverInfo] = React.useState<{
        time: UTCTimestamp;
        open: number;
        high: number;
        low: number;
        close: number;
        volume?: number;
        changeFromPrevPct?: number | null;
    } | null>(null);

    const isDark = typeof window !== "undefined" && document.documentElement.classList.contains("dark");

    const {
        backgroundColor = "transparent",
        lineColor = "#2962FF",
        textColor = isDark ? "#94a3b8" : "#64748b",
        areaTopColor = "#2962FF",
        areaBottomColor = "rgba(41, 98, 255, 0.28)",
        upColor = "#26a69a",
        downColor = "#ef5350",
        wickUpColor = "#26a69a",
        wickDownColor = "#ef5350",
    } = colors;

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
                attributionLogo: false,
            },
            width: chartContainerRef.current.clientWidth,
            height: height === 0 ? (chartContainerRef.current.clientHeight || 300) : height,
            grid: {
                vertLines: { color: isDark ? "#334155" : "#e2e8f0" },
                horzLines: { color: isDark ? "#334155" : "#e2e8f0" },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
            },
            rightPriceScale: {
                borderColor: isDark ? "#475569" : "#cbd5e1",
            },
            timeScale: {
                borderColor: isDark ? "#475569" : "#cbd5e1",
                timeVisible: true,
                fixLeftEdge: true,
                fixRightEdge: true,
                visible: true,
                borderVisible: true,
            },
        });

        chartRef.current = chart;

        const uniqueData = Array.from(new Map(data.map(item => [item.time, item])).values())
            .sort((a, b) => a.time - b.time);

        // Main Series - v5 uses addSeries with imported series type
        let mainSeries: ReturnType<typeof chart.addSeries> | null = null;
        if (chartType === "area") {
            const areaSeries = chart.addSeries(AreaSeries, {
                lineColor,
                topColor: areaStyle === "line" ? "transparent" : areaTopColor,
                bottomColor: areaStyle === "line" ? "transparent" : areaBottomColor,
            });
            areaSeries.setData(
                uniqueData.map((d) => ({
                    time: d.time as UTCTimestamp,
                    value: d.close,
                }))
            );
            mainSeries = areaSeries;
        } else {
            const candlestickSeries = chart.addSeries(CandlestickSeries, {
                upColor,
                downColor,
                borderVisible: false,
                wickUpColor,
                wickDownColor,
            });
            candlestickSeries.setData(
                uniqueData.map((d) => ({
                    time: d.time as UTCTimestamp,
                    open: d.open,
                    high: d.high,
                    low: d.low,
                    close: d.close,
                }))
            );
            mainSeries = candlestickSeries;
        }

        // Volume Series - using distinct colors from candlesticks
        if (showVolume && uniqueData.some((d) => d.volume !== undefined)) {
            const volumeSeries = chart.addSeries(HistogramSeries, {
                priceFormat: {
                    type: "volume",
                },
                priceScaleId: "", // Overlay on main chart
            });
            volumeSeries.priceScale().applyOptions({
                scaleMargins: {
                    top: 0.8, // Push volume to bottom
                    bottom: 0,
                },
            });

            // Use blue/purple colors for volume to differentiate from green/red candlesticks
            const volumeUpColor = isDark ? "rgba(59, 130, 246, 0.5)" : "rgba(37, 99, 235, 0.5)"; // blue
            const volumeDownColor = isDark ? "rgba(168, 85, 247, 0.5)" : "rgba(147, 51, 234, 0.5)"; // purple

            volumeSeries.setData(
                uniqueData.map((d) => ({
                    time: d.time as UTCTimestamp,
                    value: d.volume || 0,
                    color: d.close >= d.open ? volumeUpColor : volumeDownColor,
                }))
            );
        }

        chart.timeScale().fitContent();

        // Store the data-driven visible range so the overlay effect can restore
        // it reliably (fitContent may be async, so we derive from the data).
        if (uniqueData.length >= 2) {
            visibleRangeRef.current = {
                from: uniqueData[0].time as UTCTimestamp,
                to: uniqueData[uniqueData.length - 1].time as UTCTimestamp,
            };
        }

        // Keep the ref updated when the user pans/zooms manually.
        const handleVisibleTimeRangeChange = (range: any) => {
            if (range) {
                visibleRangeRef.current = {
                    from: range.from as UTCTimestamp,
                    to: range.to as UTCTimestamp,
                };
            }
        };
        chart.timeScale().subscribeVisibleTimeRangeChange(handleVisibleTimeRangeChange);

        // Risk zone markers (feature-detected for safety)
        if (showRiskZones && riskZones.length > 0 && mainSeries && (mainSeries as any).setMarkers) {
            const markers = riskZones.flatMap((zone) => {
                const color = zone.type === "overbought"
                    ? "rgba(239, 68, 68, 0.7)"  // red
                    : zone.type === "oversold"
                        ? "rgba(34, 197, 94, 0.7)"   // green
                        : "rgba(251, 191, 36, 0.7)"; // amber for high-volatility
                const shape = zone.type === "high-volatility" ? "circle" : "arrowDown";
                const text = zone.type === "overbought"
                    ? "OB"
                    : zone.type === "oversold"
                        ? "OS"
                        : "HV";

                return [{
                    time: zone.startTime as UTCTimestamp,
                    position: "aboveBar" as const,
                    color,
                    shape: shape as "circle" | "arrowDown",
                    text,
                }];
            });

            if (markers.length > 0) {
                (mainSeries as any).setMarkers(markers);
            }
        }

        // Baseline price line for % change mode
        if (showBaselineMarker && baselinePrice !== undefined && mainSeries) {
            try {
                (mainSeries as any).createPriceLine({
                    price: baselinePrice,
                    color: isDark ? "rgba(148, 163, 184, 0.5)" : "rgba(100, 116, 139, 0.5)",
                    lineWidth: 1,
                    lineStyle: 2, // Dashed
                    axisLabelVisible: true,
                    title: "Start (0.00%)",
                });
            } catch {
                // createPriceLine not available in this version
            }
        }

        // Click handler for What-If simulation
        const handleChartClick = (param: any) => {
            if (!param.time || !chartContainerRef.current) return;
            const clickedTime = param.time as number;
            const index = uniqueData.findIndex((d) => d.time === clickedTime);
            if (index !== -1 && onPointClick) {
                onPointClick(index, uniqueData[index]);
            }
        };
        if (onPointClick) {
            chart.subscribeClick(handleChartClick);
        }

        const handleCrosshairMove = (param: any) => {
            if (!param.time || !param.point || !chartContainerRef.current) {
                setHoverInfo(null);
                return;
            }

            const hoveredTime = (param.time as UTCTimestamp) as number;
            const index = uniqueData.findIndex((d) => d.time === hoveredTime);
            if (index === -1) {
                setHoverInfo(null);
                return;
            }

            const current = uniqueData[index];
            const prev = index > 0 ? uniqueData[index - 1] : undefined;

            let changeFromPrevPct: number | null = null;
            if (prev && prev.close && current.close) {
                changeFromPrevPct = ((current.close - prev.close) / prev.close) * 100;
            }

            setHoverInfo({
                time: current.time as UTCTimestamp,
                open: current.open,
                high: current.high,
                low: current.low,
                close: current.close,
                volume: current.volume,
                changeFromPrevPct,
            });
        };
        if (showDetailedTooltip && mainSeries) {
            chart.subscribeCrosshairMove(handleCrosshairMove);
        }

        let isDisposed = false;
        // Remove nested useEffect
        const observer = new ResizeObserver((entries) => {
            if (isDisposed) return;
            for (const entry of entries) {
                const { width, height: rectHeight } = entry.contentRect;
                if (width > 0) {
                    if (chartRef.current) {
                        try {
                            chartRef.current.applyOptions({
                                width,
                                ...(height === 0 && rectHeight > 0 ? { height: rectHeight } : {})
                            });
                        } catch (e) { /* ignore disposed */ }
                    }
                    if (rsiChartRef.current && rsiContainerRef.current) {
                        try {
                            rsiChartRef.current.applyOptions({
                                width: rsiContainerRef.current.clientWidth,
                            });
                        } catch (e) { /* ignore disposed */ }
                    }
                }
            }
        });

        observer.observe(chartContainerRef.current);

        return () => {
            isDisposed = true;
            observer.disconnect();
            chart.timeScale().unsubscribeVisibleTimeRangeChange(handleVisibleTimeRangeChange);
            if (onPointClick) chart.unsubscribeClick(handleChartClick);
            if (showDetailedTooltip && mainSeries) chart.unsubscribeCrosshairMove(handleCrosshairMove);
            // Null refs BEFORE remove() so any in-flight RAF paint bails out
            overlaySeriesRef.current = [];
            const c = chartRef.current;
            chartRef.current = null;
            if (c) {
                // Delay remove slightly to allow any pending ResizeObserver/RAF callbacks to gracefully exit
                setTimeout(() => {
                    try { c.remove(); } catch { /* already disposed */ }
                }, 0);
            }
        };
    }, [
        data,
        backgroundColor,
        lineColor,
        textColor,
        areaTopColor,
        areaBottomColor,
        upColor,
        downColor,
        wickUpColor,
        wickDownColor,
        chartType,
        height,
        isDark,
        showVolume,
        showDetailedTooltip,
        onPointClick,
        areaStyle,
        riskZones,
        showRiskZones,
        showBaselineMarker,
        baselinePrice,
    ]);

    // --- Overlay series (add/remove without recreating the whole chart) ---
    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;

        try {
            for (const s of overlaySeriesRef.current) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                try { chart.removeSeries(s as any); } catch { /* already removed */ }
            }
            overlaySeriesRef.current = [];
            for (const overlay of overlays) {
                if (!overlay.data?.length) continue;
                const s = chart.addSeries(LineSeries, {
                    color: overlay.color,
                    lineWidth: overlay.lineWidth ?? 1,
                    lineStyle: overlay.lineStyle ?? 0,
                    crosshairMarkerVisible: false,
                    priceLineVisible: false,
                    lastValueVisible: false,
                });
                const uniqueSortedOverlayData = Array.from(
                    new Map(overlay.data.filter((d) => d.value != null && !Number.isNaN(d.value)).map(d => [d.time, d])).values()
                ).sort((a, b) => (a.time as number) - (b.time as number));
                s.setData(uniqueSortedOverlayData);
                overlaySeriesRef.current.push(s);
            }
            if (visibleRangeRef.current) {
                chart.timeScale().setVisibleRange(visibleRangeRef.current);
            }
        } catch { /* chart was disposed between render and effect */ }

        return () => {
            const c = chartRef.current;
            if (!c) return;
            for (const s of overlaySeriesRef.current) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                try { c.removeSeries(s as any); } catch { }
            }
            overlaySeriesRef.current = [];
        };
    }, [overlays]);

    // --- Generic oscillator pane (synced sub-chart below the main chart) ---
    useEffect(() => {
        let handleMainRangeChange: ((range: any) => void) | undefined;
        let handleOscRangeChange: ((range: any) => void) | undefined;
        
        const hasData = oscillatorPane && oscillatorPane.lines.some((l) => l.data.length > 0);
        if (hasData && rsiContainerRef.current) {
            if (rsiChartRef.current) {
                const oldChart = rsiChartRef.current;
                rsiChartRef.current = null;
                setTimeout(() => { try { oldChart.remove(); } catch {} }, 0);
            }
            const oscChart = createChart(rsiContainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: "transparent" },
                    textColor: isDark ? "#94a3b8" : "#64748b",
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    attributionLogo: false,
                },
                width: rsiContainerRef.current.clientWidth || chartContainerRef.current?.clientWidth || 800,
                height: 131,
                grid: {
                    vertLines: { color: isDark ? "#334155" : "#e2e8f0" },
                    horzLines: { color: isDark ? "#334155" : "#e2e8f0" },
                },
                crosshair: { mode: CrosshairMode.Normal },
                rightPriceScale: {
                    borderColor: isDark ? "#475569" : "#cbd5e1",
                    scaleMargins: { top: 0.1, bottom: 0.1 },
                },
                timeScale: {
                    borderColor: isDark ? "#475569" : "#cbd5e1",
                    visible: true,
                    timeVisible: true,
                },
                handleScale: false,
                handleScroll: false,
            });
            rsiChartRef.current = oscChart;

            // Add line series for each defined line
            let firstSeries: ReturnType<typeof oscChart.addSeries> | null = null;
            const allTimes = Array.from(new Set(data.map(d => d.time))).sort((a, b) => a - b);

            for (const line of oscillatorPane!.lines) {
                const s = oscChart.addSeries(LineSeries, {
                    color: line.color,
                    lineWidth: line.lineWidth ?? 1,
                    crosshairMarkerVisible: true,
                    priceLineVisible: false,
                    lastValueVisible: true,
                });

                const lineMap = new Map();
                for (const d of line.data) {
                    if (d.value != null && !Number.isNaN(d.value)) {
                        lineMap.set(d.time, d.value);
                    }
                }

                const paddedLineData = allTimes.map(time => {
                    if (lineMap.has(time)) {
                        return { time: time as UTCTimestamp, value: lineMap.get(time) as number };
                    }
                    return { time: time as UTCTimestamp };
                });

                s.setData(paddedLineData);
                if (!firstSeries) firstSeries = s;
            }

            // Add histogram (e.g. MACD histogram bars)
            if (oscillatorPane!.histogram && oscillatorPane!.histogram.length > 0) {
                const histSeries = oscChart.addSeries(HistogramSeries, {
                    priceScaleId: 'right',
                    priceLineVisible: false,
                    lastValueVisible: false,
                });

                const histMap = new Map();
                for (const d of oscillatorPane!.histogram) {
                    if (d.value != null && !Number.isNaN(d.value)) {
                        histMap.set(d.time, { value: d.value, color: d.color });
                    }
                }

                const paddedHistData = allTimes.map(time => {
                    if (histMap.has(time)) {
                        const hd = histMap.get(time);
                        return { time: time as UTCTimestamp, value: hd.value as number, color: hd.color as string };
                    }
                    return { time: time as UTCTimestamp };
                });

                histSeries.setData(paddedHistData as any);
            }

            // Add reference lines on the first line series
            if (firstSeries && oscillatorPane!.refLines) {
                for (const ref of oscillatorPane!.refLines) {
                    try {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (firstSeries as any).createPriceLine({
                            price: ref.price,
                            color: ref.color,
                            lineWidth: 1,
                            lineStyle: 2,
                            axisLabelVisible: false,
                            title: ref.label ?? '',
                        });
                    } catch { /* price lines may not be available */ }
                }
            }

            // Sync time scale with main chart
            let syncing = false;
            const mainChart = chartRef.current;
            
            handleMainRangeChange = (range: any) => {
                if (syncing || !range || !rsiChartRef.current) return;
                syncing = true;
                rsiChartRef.current.timeScale().setVisibleLogicalRange(range);
                syncing = false;
            };

            handleOscRangeChange = (range: any) => {
                if (syncing || !range || !chartRef.current) return;
                syncing = true;
                chartRef.current.timeScale().setVisibleLogicalRange(range);
                syncing = false;
            };

            if (mainChart) {
                mainChart.timeScale().subscribeVisibleLogicalRangeChange(handleMainRangeChange);
                oscChart.timeScale().subscribeVisibleLogicalRangeChange(handleOscRangeChange);
            }
        } else if (!hasData && rsiChartRef.current) {
            const c = rsiChartRef.current;
            rsiChartRef.current = null;
            setTimeout(() => { try { c.remove(); } catch {} }, 0);
        }
        return () => {
            const mainChart = chartRef.current;
            const c = rsiChartRef.current;
            
            // Clean up sync listeners before destroying
            if (mainChart && c && handleMainRangeChange && handleOscRangeChange) {
                try { mainChart.timeScale().unsubscribeVisibleLogicalRangeChange(handleMainRangeChange); } catch {}
                try { c.timeScale().unsubscribeVisibleLogicalRangeChange(handleOscRangeChange); } catch {}
            }
            
            if (c) {
                rsiChartRef.current = null;
                setTimeout(() => { try { c.remove(); } catch {} }, 0);
            }
        };
    }, [oscillatorPane, isDark]);

    // Handle theme changes
    useEffect(() => {
        if (!chartRef.current) return;
        try {
            chartRef.current.applyOptions({
                layout: {
                    textColor: isDark ? "#94a3b8" : "#64748b",
                },
                grid: {
                    vertLines: { color: isDark ? "#334155" : "#e2e8f0" },
                    horzLines: { color: isDark ? "#334155" : "#e2e8f0" },
                },
                rightPriceScale: {
                    borderColor: isDark ? "#475569" : "#cbd5e1",
                },
                timeScale: {
                    borderColor: isDark ? "#475569" : "#cbd5e1",
                },
            });
        } catch { /* chart disposed */ }
    }, [isDark]);

    const formatNumber = (value: number | undefined) => {
        if (value == null || Number.isNaN(value)) return "—";
        return value.toFixed(2);
    };

    const formatPercent = (value: number | null | undefined) => {
        if (value == null || Number.isNaN(value)) return null;
        const fixed = value.toFixed(2);
        const sign = value > 0 ? "+" : "";
        return `${sign}${fixed}%`;
    };

    const formatDate = (ts: UTCTimestamp) => {
        const d = new Date((ts as number) * 1000);
        return d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
        });
    };

    const hasOscillator = oscillatorPane && oscillatorPane.lines.some((l) => l.data.length > 0);

    return (
        <div className={cn("w-full flex flex-col", height === 0 ? "flex-1 min-h-0" : "")}>
            <div ref={chartContainerRef} className={cn("w-full relative", height === 0 ? "flex-1 min-h-0" : "")}>
                {showDetailedTooltip && hoverInfo && (
                    <div className="pointer-events-none absolute top-3 left-3 z-10 rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white/75 dark:bg-slate-900/75 backdrop-blur-sm shadow-lg px-3 py-2 text-[11px] space-y-1 min-w-[180px]">
                        <div className="font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-1 mb-1">
                            {formatDate(hoverInfo.time)}
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-slate-500 dark:text-slate-400">Open</span>
                            <span className="font-mono text-slate-900 dark:text-slate-50">{formatNumber(hoverInfo.open)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-slate-500 dark:text-slate-400">High</span>
                            <span className="font-mono text-slate-900 dark:text-slate-50">{formatNumber(hoverInfo.high)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-slate-500 dark:text-slate-400">Low</span>
                            <span className="font-mono text-slate-900 dark:text-slate-50">{formatNumber(hoverInfo.low)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-slate-500 dark:text-slate-400">Close</span>
                            <span className="font-mono text-slate-900 dark:text-slate-50">{formatNumber(hoverInfo.close)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-slate-500 dark:text-slate-400">Volume</span>
                            <span className="font-mono text-slate-900 dark:text-slate-50">
                                {hoverInfo.volume != null ? hoverInfo.volume.toLocaleString() : "—"}
                            </span>
                        </div>
                        {formatPercent(hoverInfo.changeFromPrevPct) && (
                            <div className="flex justify-between gap-4 pt-1 border-t border-slate-100 dark:border-slate-800 mt-1">
                                <span className="text-slate-500 dark:text-slate-400">Change vs prev</span>
                                <span
                                    className={
                                        (hoverInfo.changeFromPrevPct ?? 0) > 0
                                            ? "font-mono text-emerald-600 dark:text-emerald-400"
                                            : (hoverInfo.changeFromPrevPct ?? 0) < 0
                                                ? "font-mono text-red-600 dark:text-red-400"
                                                : "font-mono text-slate-600 dark:text-slate-300"
                                    }
                                >
                                    {formatPercent(hoverInfo.changeFromPrevPct)}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Sub-panel: active oscillator or placeholder */}
            {(hasOscillator || reserveSubPanel) && (
                <div className="border-t border-slate-200 dark:border-slate-700 shrink-0" style={{ height: 155 }}>
                    {hasOscillator ? (
                        <>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 px-2 pt-1 font-medium tracking-wide h-[24px]">{oscillatorPane!.label}</div>
                            <div ref={rsiContainerRef} className="w-full" style={{ height: 131 }} />
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center text-[11px] text-slate-500 dark:text-slate-600 gap-2">
                            <span>No indicator selected — choose one in</span>
                            <span className="font-medium text-slate-400 dark:text-slate-500">Chart Settings → Oscillator</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
