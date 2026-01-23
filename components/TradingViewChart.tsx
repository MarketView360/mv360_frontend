"use client";

import React, { useEffect, useRef, useState } from "react";
import {
    createChart,
    ColorType,
    IChartApi,
    Time,
    UTCTimestamp,
    DeepPartial,
    ChartOptions,
    CrosshairMode,
} from "lightweight-charts";

export interface ChartDataPoint {
    time: number; // Unix timestamp
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
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
    height?: number;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
    data,
    colors = {},
    chartType = "area",
    height = 300,
}) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);

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

        const handleResize = () => {
            chartRef.current?.applyOptions({ width: chartContainerRef.current!.clientWidth });
        };

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
            },
            width: chartContainerRef.current.clientWidth,
            height: height,
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
            },
        });

        chartRef.current = chart;

        const uniqueData = Array.from(new Map(data.map(item => [item.time, item])).values())
            .sort((a, b) => a.time - b.time);

        // Main Series
        if (chartType === "area") {
            const areaSeries = (chart as any).addAreaSeries({
                lineColor,
                topColor: areaTopColor,
                bottomColor: areaBottomColor,
            });
            areaSeries.setData(
                uniqueData.map((d) => ({
                    time: d.time as UTCTimestamp,
                    value: d.close,
                }))
            );
        } else {
            const candlestickSeries = (chart as any).addCandlestickSeries({
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
        }

        // Volume Series
        if (uniqueData.some((d) => d.volume !== undefined)) {
            const volumeSeries = (chart as any).addHistogramSeries({
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
            volumeSeries.setData(
                uniqueData.map((d) => ({
                    time: d.time as UTCTimestamp,
                    value: d.volume || 0,
                    color: d.close >= d.open ? upColor : downColor,
                }))
            );
        }

        chart.timeScale().fitContent();

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
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
    ]);

    // Handle theme changes
    useEffect(() => {
        if (!chartRef.current) return;
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
    }, [isDark]);

    return <div ref={chartContainerRef} className="w-full relative" />;
};
