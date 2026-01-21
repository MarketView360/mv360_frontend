"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Zap,
  Target,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TechnicalData {
  date: string;
  sma_20: number | null;
  sma_50: number | null;
  sma_200: number | null;
  ema_12: number | null;
  ema_26: number | null;
  rsi_14: number | null;
  macd: number | null;
  macd_signal: number | null;
  macd_histogram: number | null;
  bb_upper: number | null;
  bb_middle: number | null;
  bb_lower: number | null;
  atr_14: number | null;
  adx: number | null;
  stoch_k: number | null;
  stoch_d: number | null;
  obv: number | null;
  vwap: number | null;
  close_price: number | null;
}

interface TechnicalsPageContentProps {
  ticker: string;
  currentPrice: number | null;
}

const COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  pink: "#ec4899",
  cyan: "#06b6d4",
  slate: "#64748b",
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatNumber = (value: number | null | undefined, decimals = 2): string => {
  if (value == null || Number.isNaN(value)) return "—";
  return Number(value).toFixed(decimals);
};

export function TechnicalsPageContent({ ticker, currentPrice }: Readonly<TechnicalsPageContentProps>) {
  const [technicals, setTechnicals] = useState<TechnicalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"30" | "90" | "180" | "365">("90");

  useEffect(() => {
    const fetchTechnicals = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
        const res = await fetch(
          `${baseUrl}/api/company/${encodeURIComponent(ticker)}/technicals?limit=${timeRange}`
        );
        if (!res.ok) throw new Error("Failed to fetch technicals");
        const data = await res.json();
        setTechnicals(data.technicals || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchTechnicals();
  }, [ticker, timeRange]);

  const sortedData = useMemo(
    () => [...technicals].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [technicals]
  );

  const latestData = sortedData.at(-1);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || technicals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              Technical data isnt available yet
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {error
                ? "We werent able to load the latest technical indicators. Please try again in a moment."
                : "Were still preparing technical indicators for this company. Check back soon once market data has been processed."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Technical Analysis
        </h2>
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 Days</SelectItem>
            <SelectItem value="90">90 Days</SelectItem>
            <SelectItem value="180">6 Months</SelectItem>
            <SelectItem value="365">1 Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Signal Summary Cards */}
      <SignalSummary latestData={latestData} currentPrice={currentPrice} />

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trend">Trend</TabsTrigger>
          <TabsTrigger value="momentum">Momentum</TabsTrigger>
          <TabsTrigger value="volatility">Volatility</TabsTrigger>
          <TabsTrigger value="volume">Volume</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab data={sortedData} currentPrice={currentPrice} />
        </TabsContent>

        <TabsContent value="trend">
          <TrendTab data={sortedData} />
        </TabsContent>

        <TabsContent value="momentum">
          <MomentumTab data={sortedData} />
        </TabsContent>

        <TabsContent value="volatility">
          <VolatilityTab data={sortedData} />
        </TabsContent>

        <TabsContent value="volume">
          <VolumeTab data={sortedData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
      <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
    </div>
  );
}

// Signal Summary Component
function SignalSummary({
  latestData,
  currentPrice,
}: Readonly<{ latestData?: TechnicalData; currentPrice: number | null }>) {
  if (!latestData) return null;

  const rsiSignal = getRsiSignal(latestData.rsi_14);
  const macdSignal = getMacdSignal(latestData.macd, latestData.macd_signal);
  const trendSignal = getTrendSignal(currentPrice, latestData.sma_50, latestData.sma_200);
  const adxSignal = getAdxSignal(latestData.adx);

  const signals = [
    { label: "RSI (14)", value: formatNumber(latestData.rsi_14, 1), ...rsiSignal, icon: Activity },
    { label: "MACD", value: formatNumber(latestData.macd, 3), ...macdSignal, icon: BarChart3 },
    { label: "Trend", value: trendSignal.trend, ...trendSignal, icon: TrendingUp },
    { label: "ADX (14)", value: formatNumber(latestData.adx, 1), ...adxSignal, icon: Zap },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {signals.map((s) => (
        <Card key={s.label} className={`${s.bgColor} border-0`}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <Badge variant="outline" className={`text-xs ${s.badgeClass}`}>
                {s.signal}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function getRsiSignal(rsi: number | null) {
  if (rsi === null) return { signal: "N/A", color: "text-slate-600", bgColor: "bg-slate-50 dark:bg-slate-800", badgeClass: "bg-slate-100 text-slate-600" };
  if (rsi >= 70) return { signal: "Overbought", color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-950/30", badgeClass: "bg-red-100 text-red-700" };
  if (rsi <= 30) return { signal: "Oversold", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-950/30", badgeClass: "bg-green-100 text-green-700" };
  return { signal: "Neutral", color: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-950/30", badgeClass: "bg-amber-100 text-amber-700" };
}

function getMacdSignal(macd: number | null, signal: number | null) {
  if (macd === null || signal === null) return { signal: "N/A", color: "text-slate-600", bgColor: "bg-slate-50 dark:bg-slate-800", badgeClass: "bg-slate-100 text-slate-600" };
  if (macd > signal) return { signal: "Bullish", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-950/30", badgeClass: "bg-green-100 text-green-700" };
  return { signal: "Bearish", color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-950/30", badgeClass: "bg-red-100 text-red-700" };
}

function getTrendSignal(price: number | null, sma50: number | null, sma200: number | null) {
  if (price === null || sma50 === null || sma200 === null) {
    return { signal: "N/A", trend: "—", color: "text-slate-600", bgColor: "bg-slate-50 dark:bg-slate-800", badgeClass: "bg-slate-100 text-slate-600" };
  }
  if (price > sma50 && sma50 > sma200) {
    return { signal: "Strong Up", trend: "Uptrend", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-950/30", badgeClass: "bg-green-100 text-green-700" };
  }
  if (price < sma50 && sma50 < sma200) {
    return { signal: "Strong Down", trend: "Downtrend", color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-950/30", badgeClass: "bg-red-100 text-red-700" };
  }
  return { signal: "Mixed", trend: "Sideways", color: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-950/30", badgeClass: "bg-amber-100 text-amber-700" };
}

function getAdxSignal(adx: number | null) {
  if (adx === null) return { signal: "N/A", color: "text-slate-600", bgColor: "bg-slate-50 dark:bg-slate-800", badgeClass: "bg-slate-100 text-slate-600" };
  if (adx >= 25) return { signal: "Strong", color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-950/30", badgeClass: "bg-purple-100 text-purple-700" };
  return { signal: "Weak", color: "text-slate-600", bgColor: "bg-slate-50 dark:bg-slate-800", badgeClass: "bg-slate-100 text-slate-600" };
}

// Overview Tab
function OverviewTab({ data, currentPrice }: Readonly<{ data: TechnicalData[]; currentPrice: number | null }>) {
  const chartData = data.map((d) => ({
    date: formatDate(d.date),
    price: d.close_price,
    sma20: d.sma_20,
    sma50: d.sma_50,
    sma200: d.sma_200,
  }));

  const rsiData = data.map((d) => ({
    date: formatDate(d.date),
    rsi: d.rsi_14,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Price with Moving Averages */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Price with Moving Averages</CardTitle>
          <CardDescription>SMA 20, 50, and 200 day moving averages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [`$${v?.toFixed(2)}`, ""]} />
                <Legend />
                <Line type="monotone" dataKey="price" name="Price" stroke={COLORS.slate} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="sma20" name="SMA 20" stroke={COLORS.primary} strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="sma50" name="SMA 50" stroke={COLORS.warning} strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="sma200" name="SMA 200" stroke={COLORS.danger} strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* RSI */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">RSI (14)</CardTitle>
          <CardDescription>Relative Strength Index - Overbought &gt;70, Oversold &lt;30</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rsiData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [v?.toFixed(1), "RSI"]} />
                <ReferenceLine y={70} stroke={COLORS.danger} strokeDasharray="5 5" label={{ value: "70", fontSize: 10 }} />
                <ReferenceLine y={30} stroke={COLORS.success} strokeDasharray="5 5" label={{ value: "30", fontSize: 10 }} />
                <ReferenceLine y={50} stroke={COLORS.slate} strokeDasharray="3 3" />
                <Area type="monotone" dataKey="rsi" stroke={COLORS.purple} fill={COLORS.purple} fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Trend Tab
function TrendTab({ data }: Readonly<{ data: TechnicalData[] }>) {
  const macdData = data.map((d) => ({
    date: formatDate(d.date),
    macd: d.macd,
    signal: d.macd_signal,
    histogram: d.macd_histogram,
  }));

  const adxData = data.map((d) => ({
    date: formatDate(d.date),
    adx: d.adx,
  }));

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* MACD */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">MACD</CardTitle>
          <CardDescription>Moving Average Convergence Divergence (12, 26, 9)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={macdData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [v?.toFixed(3), ""]} />
                <Legend />
                <ReferenceLine y={0} stroke={COLORS.slate} />
                <Bar dataKey="histogram" name="Histogram" fill={COLORS.slate} opacity={0.5} />
                <Line type="monotone" dataKey="macd" name="MACD" stroke={COLORS.primary} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="signal" name="Signal" stroke={COLORS.danger} strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ADX */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ADX (14)</CardTitle>
          <CardDescription>Average Directional Index - Trend Strength (&gt;25 = Strong Trend)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={adxData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [v?.toFixed(1), "ADX"]} />
                <ReferenceLine y={25} stroke={COLORS.warning} strokeDasharray="5 5" label={{ value: "25", fontSize: 10 }} />
                <Area type="monotone" dataKey="adx" stroke={COLORS.cyan} fill={COLORS.cyan} fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Momentum Tab
function MomentumTab({ data }: Readonly<{ data: TechnicalData[] }>) {
  const stochData = data.map((d) => ({
    date: formatDate(d.date),
    k: d.stoch_k,
    d: d.stoch_d,
  }));

  const rsiData = data.map((d) => ({
    date: formatDate(d.date),
    rsi: d.rsi_14,
  }));

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Stochastic */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stochastic Oscillator</CardTitle>
          <CardDescription>%K and %D lines - Overbought &gt;80, Oversold &lt;20</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stochData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [v?.toFixed(1), ""]} />
                <Legend />
                <ReferenceLine y={80} stroke={COLORS.danger} strokeDasharray="5 5" />
                <ReferenceLine y={20} stroke={COLORS.success} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="k" name="%K" stroke={COLORS.primary} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="d" name="%D" stroke={COLORS.warning} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* RSI Detail */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">RSI (14) Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rsiData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [v?.toFixed(1), "RSI"]} />
                <ReferenceLine y={70} stroke={COLORS.danger} strokeDasharray="5 5" />
                <ReferenceLine y={30} stroke={COLORS.success} strokeDasharray="5 5" />
                <Area type="monotone" dataKey="rsi" stroke={COLORS.purple} fill={COLORS.purple} fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Volatility Tab
function VolatilityTab({ data }: Readonly<{ data: TechnicalData[] }>) {
  const bbData = data.map((d) => ({
    date: formatDate(d.date),
    price: d.close_price,
    upper: d.bb_upper,
    middle: d.bb_middle,
    lower: d.bb_lower,
  }));

  const atrData = data.map((d) => ({
    date: formatDate(d.date),
    atr: d.atr_14,
  }));

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Bollinger Bands */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bollinger Bands</CardTitle>
          <CardDescription>20-day SMA with 2 standard deviation bands</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bbData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [`$${v?.toFixed(2)}`, ""]} />
                <Legend />
                <Area type="monotone" dataKey="upper" name="Upper Band" stroke={COLORS.danger} fill={COLORS.danger} fillOpacity={0.1} />
                <Area type="monotone" dataKey="lower" name="Lower Band" stroke={COLORS.success} fill={COLORS.success} fillOpacity={0.1} />
                <Line type="monotone" dataKey="middle" name="Middle" stroke={COLORS.warning} strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="price" name="Price" stroke={COLORS.primary} strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ATR */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ATR (14)</CardTitle>
          <CardDescription>Average True Range - Volatility Indicator</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={atrData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [`$${v?.toFixed(2)}`, "ATR"]} />
                <Area type="monotone" dataKey="atr" stroke={COLORS.pink} fill={COLORS.pink} fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Volume Tab
function VolumeTab({ data }: Readonly<{ data: TechnicalData[] }>) {
  const obvData = data.map((d) => ({
    date: formatDate(d.date),
    obv: d.obv ? d.obv / 1e6 : null,
  }));

  const vwapData = data.map((d) => ({
    date: formatDate(d.date),
    price: d.close_price,
    vwap: d.vwap,
  }));

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* OBV */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">On-Balance Volume (OBV)</CardTitle>
          <CardDescription>Cumulative volume flow indicator (in millions)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={obvData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [`${v?.toFixed(2)}M`, "OBV"]} />
                <Area type="monotone" dataKey="obv" stroke={COLORS.cyan} fill={COLORS.cyan} fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* VWAP */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Price vs VWAP</CardTitle>
          <CardDescription>Volume Weighted Average Price</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vwapData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [`$${v?.toFixed(2)}`, ""]} />
                <Legend />
                <Line type="monotone" dataKey="price" name="Price" stroke={COLORS.primary} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="vwap" name="VWAP" stroke={COLORS.warning} strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TechnicalsPageContent;
