import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { CompanyChartsSwitcher, type PriceHistoryPoint } from "@/components/company/CompanyChartsSwitcher";
import { CompanyDescriptionModal } from "@/components/company/CompanyDescriptionModal";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { CompanyNavigation } from "@/components/company/CompanyNavigation";
import { FiftyTwoWeekRange } from "@/components/company/FiftyTwoWeekRange";
import { KeyMetrics } from "@/components/company/KeyMetrics";
import { NewsFeed, type NewsArticle } from "@/components/company/NewsFeed";
import { PeerComparison } from "@/components/company/PeerComparison";
import { UsdValue } from "@/components/company/UsdValue";

// --- Types & Interfaces ---

interface RatioItem {
  label: string;
  value: string;
}

interface ValuationMetric {
  label: string;
  value: number | null;
}

interface ValuationHistoryPoint {
  date: string;
  price: number | null;
  pe_ratio: number | null;
  forward_pe: number | null;
}

interface CompanyViewModel {
  ticker: string;
  name: string;
  exchange: string | null;
  sector: string | null;
  industry: string | null;
  country: string | null;
  currency: string | null;
  description: string | null;
  ipoDate: string | null;
  employees: number | null;
  website: string | null;
  price: number | null;
  changePercent: number | null;
  week52High: number | null;
  week52Low: number | null;
  priceHistory: PriceHistoryPoint[];
  ratios: RatioItem[];
  rawMetrics: Record<string, unknown>;
  snapshotDate: string | null;
  valuationMetrics: ValuationMetric[];
  valuationHistory: ValuationHistoryPoint[];
  revenueTtm: number | null;
  earningsTtm: number | null;
  netMargin: number | null;
  opm: number | null;
  analystData: {
    rating: number | null;
    targetPrice: number | null;
    currentPrice: number | null;
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
    strongSell: number;
  } | null;
}

interface DetailItemProps {
  label: string;
  value?: string | number | null;
  className?: string;
  children?: React.ReactNode;
}

interface AnalystData {
  rating: number | null;
  targetPrice: number | null;
  currentPrice: number | null;
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
}

// --- Zod Schemas ---

const CompanySchema = z.object({
  id: z.union([z.string(), z.number()]),
  ticker: z.string(),
  name: z.string(),
  exchange: z.string().nullable(),
  sector: z.string().nullable(),
  industry: z.string().nullable(),
  country: z.string().nullable().optional(),
  currency: z.string().nullable().optional(),
  description: z.string().nullable(),
  ipo_date: z.string().nullable(),
  employees: z.number().nullable(),
  website: z.string().nullable().optional(),
});

const MetricsSchema = z.object({
  snapshot_date: z.string().optional(),
  date: z.string().optional(),
  price: z.number().nullable().optional(),
  market_capitalization: z.number().nullable().optional(),
  volume: z.number().nullable().optional(),
  avg_volume_200d: z.number().nullable().optional(),
  refund_1d_p: z.number().nullable().optional(),
  refund_5d_p: z.number().nullable().optional(),
  pe_ratio: z.number().nullable().optional(),
  trailing_pe: z.number().nullable().optional(),
  forward_pe: z.number().nullable().optional(),
  peg: z.number().nullable().optional(),
  pb: z.number().nullable().optional(),
  price_book_mrq: z.number().nullable().optional(),
  dividend_yield: z.number().nullable().optional(),
  ev_ebitda: z.number().nullable().optional(),
  price_to_sales: z.number().nullable().optional(),
  price_sales_ttm: z.number().nullable().optional(),
  ev_sales: z.number().nullable().optional(),
  ev_revenue: z.number().nullable().optional(),
  price_to_cash_flow: z.number().nullable().optional(),
  roe: z.number().nullable().optional(),
  return_on_equity_ttm: z.number().nullable().optional(),
  roa: z.number().nullable().optional(),
  return_on_assets_ttm: z.number().nullable().optional(),
  opm: z.number().nullable().optional(),
  operating_margin: z.number().nullable().optional(),
  operating_margin_ttm: z.number().nullable().optional(),
  net_margin: z.number().nullable().optional(),
  profit_margin: z.number().nullable().optional(),
  beta: z.number().nullable().optional(),
  sma20: z.number().nullable().optional(),
  sma50: z.number().nullable().optional(),
  day_50_ma: z.number().nullable().optional(),
  sma200: z.number().nullable().optional(),
  day_200_ma: z.number().nullable().optional(),
  week_52_high: z.number().nullable().optional(),
  week_52_low: z.number().nullable().optional(),
  current_ratio: z.number().nullable().optional(),
  quick_ratio: z.number().nullable().optional(),
  debt_to_equity: z.number().nullable().optional(),
  lt_debt_to_equity: z.number().nullable().optional(),
  eps_ttm: z.number().nullable().optional(),
  earnings_share: z.number().nullable().optional(),
  diluted_eps_ttm: z.number().nullable().optional(),
  revenue_ttm: z.number().nullable().optional(),
  earnings_ttm: z.number().nullable().optional(),
  perf_3y_p: z.number().nullable().optional(),
  perf_5y_p: z.number().nullable().optional(),
  enterprise_value: z.number().nullable().optional(),
  shares_outstanding: z.number().nullable().optional(),
  shares_float: z.number().nullable().optional(),
  analyst_target_price: z.number().nullable().optional(),
  analyst_rating: z.number().nullable().optional(),
  analyst_strong_buy: z.number().nullable().optional(),
  analyst_buy: z.number().nullable().optional(),
  analyst_hold: z.number().nullable().optional(),
  analyst_sell: z.number().nullable().optional(),
  analyst_strong_sell: z.number().nullable().optional(),
}).passthrough();

const PriceSchema = z.object({
  date: z.string(),
  open: z.number().nullable(),
  high: z.number().nullable(),
  low: z.number().nullable(),
  close: z.number().nullable(),
  adj_close: z.number().nullable(),
  volume: z.number().nullable(),
});

const ValuationHistoryPointSchema = z.object({
  date: z.string(),
  price: z.number().optional().nullable().transform(val => val ?? null),
  pe_ratio: z.number().optional().nullable().transform(val => val ?? null),
  forward_pe: z.number().optional().nullable().transform(val => val ?? null),
});

const ValuationHistoryResponseSchema = z.array(ValuationHistoryPointSchema);

// --- API Service Layer ---

const api = {
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000",

  async fetchCompany(ticker: string) {
    const res = await fetch(
      `${this.baseUrl}/api/company/${encodeURIComponent(ticker)}`,
      {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    return z.object({ company: CompanySchema.nullable(), metrics: MetricsSchema.nullable() }).parse(data);
  },

  async fetchPrices(ticker: string) {
    const res = await fetch(
      `${this.baseUrl}/api/prices/${encodeURIComponent(ticker)}`,
      {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    return z.object({
      ticker: z.string(),
      exchange: z.string().optional(),
      prices: z.array(PriceSchema),
    }).parse(data);
  },
};

type CompanyResponse = Awaited<ReturnType<typeof api.fetchCompany>>;
type PricesResponse = Awaited<ReturnType<typeof api.fetchPrices>>;
type Metrics = z.infer<typeof MetricsSchema> | null;

async function fetchValuationHistory(ticker: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
  const res = await fetch(
    `${baseUrl}/api/company/${encodeURIComponent(ticker)}/valuations`,
    { next: { revalidate: 900 } },
  );

  if (!res.ok) {
    console.error("Failed to fetch valuation history", res.status, res.statusText);
    return [] as ValuationHistoryPoint[];
  }

  try {
    const json = await res.json();
    return ValuationHistoryResponseSchema.parse(json) as ValuationHistoryPoint[];
  } catch (e) {
    console.error("Failed to parse valuation history", e);
    return [] as ValuationHistoryPoint[];
  }
}

async function fetchNews(ticker: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
  const params = new URLSearchParams({ ticker: ticker.toUpperCase(), limit: "10" });

  try {
    const res = await fetch(`${baseUrl}/api/news?${params.toString()}`, {
      next: { revalidate: 900 },
    });
    if (!res.ok) {
      console.error("Failed to fetch news from backend", res.status, res.statusText);
      return [] as NewsArticle[];
    }
    const data = (await res.json()) as NewsArticle[];
    return data;
  } catch (error) {
    console.error("Error fetching news from backend", error);
    return [] as NewsArticle[];
  }
}

async function fetchPeers(ticker: string, exchange: string | null) {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
  const params = new URLSearchParams();
  if (exchange) {
    params.set("exchange", exchange);
  }

  try {
    const res = await fetch(
      `${baseUrl}/api/company/${encodeURIComponent(ticker)}/peers?${params.toString()}`,
      { next: { revalidate: 900 } }
    );
    if (res.ok) return await res.json();
    return [];
  } catch {
    return [];
  }
}

// --- Transformations & Helpers ---

const formatMetrics = {
  marketCap: (n: number | null) => {
    if (n == null) return "—";
    const abs = Math.abs(n);
    if (abs >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toLocaleString()}`;
  },
  number: (n: number | null, decimals = 2) => (n == null ? "—" : n.toFixed(decimals)),
  percentage: (n: number | null, decimals = 2) =>
    n == null ? "—" : `${(n * 100).toFixed(decimals)}%`,
};

function buildRatios(metrics: Metrics): RatioItem[] {
  if (!metrics) return [];

  // Handle both old and new API field names with fallbacks
  const m = metrics as Record<string, unknown>;
  const items: RatioItem[] = [
    { label: "Market Cap", value: formatMetrics.marketCap((m.market_capitalization ?? m.market_cap) as number | null) },
    { label: "P/E", value: formatMetrics.number((m.pe_ratio ?? m.trailing_pe) as number | null) },
    { label: "Forward P/E", value: formatMetrics.number(m.forward_pe as number | null) },
    { label: "P/S", value: formatMetrics.number((m.price_to_sales ?? m.price_sales_ttm) as number | null) },
    { label: "P/B", value: formatMetrics.number((m.pb ?? m.price_book_mrq) as number | null) },
    { label: "Dividend Yield", value: formatMetrics.percentage(m.dividend_yield as number | null) },
    { label: "ROE", value: formatMetrics.percentage((m.roe ?? m.return_on_equity_ttm) as number | null) },
    { label: "ROA", value: formatMetrics.percentage((m.roa ?? m.return_on_assets_ttm) as number | null) },
    { label: "Operating Margin", value: formatMetrics.percentage((m.opm ?? m.operating_margin ?? m.operating_margin_ttm) as number | null) },
    { label: "Net Margin", value: formatMetrics.percentage((m.net_margin ?? m.profit_margin) as number | null) },
    { label: "Beta", value: formatMetrics.number(m.beta as number | null) },
    { label: "Current Ratio", value: formatMetrics.number(m.current_ratio as number | null) },
    { label: "Quick Ratio", value: formatMetrics.number(m.quick_ratio as number | null) },
    { label: "Debt/Equity", value: formatMetrics.number(m.debt_to_equity as number | null) },
  ];

  return items;
}

function buildValuationMetrics(metrics: Metrics): ValuationMetric[] {
  if (!metrics) return [];

  const m = metrics as Record<string, unknown>;
  return [
    { label: "P/E", value: (m.pe_ratio ?? m.trailing_pe ?? null) as number | null },
    { label: "Forward P/E", value: (m.forward_pe ?? null) as number | null },
    { label: "P/S", value: (m.price_to_sales ?? m.price_sales_ttm ?? null) as number | null },
    { label: "P/B", value: (m.pb ?? m.price_book_mrq ?? null) as number | null },
    { label: "EV/EBITDA", value: (m.ev_ebitda ?? null) as number | null },
  ];
}

function buildAnalystData(metrics: Metrics, currentPrice: number | null) {
  if (!metrics) return null;

  const m = metrics as Record<string, unknown>;
  const strongBuy = (m.analyst_strong_buy as number | null) ?? 0;
  const buy = (m.analyst_buy as number | null) ?? 0;
  const hold = (m.analyst_hold as number | null) ?? 0;
  const sell = (m.analyst_sell as number | null) ?? 0;
  const strongSell = (m.analyst_strong_sell as number | null) ?? 0;

  const rating = (m.analyst_rating as number | null) ?? null;
  const targetPrice = (m.analyst_target_price as number | null) ?? null;

  if (
    strongBuy + buy + hold + sell + strongSell === 0 &&
    rating == null &&
    targetPrice == null
  ) {
    return null;
  }

  return {
    rating,
    targetPrice,
    currentPrice,
    strongBuy,
    buy,
    hold,
    sell,
    strongSell,
  };
}

function transformData(
  companyData: CompanyResponse,
  pricesData: PricesResponse,
  valuationHistory: ValuationHistoryPoint[],
) {
  const company = companyData!.company!;
  const metrics = companyData!.metrics;
  const prices = pricesData?.prices || [];

  const priceHistory: PriceHistoryPoint[] = prices.map((p) => ({
    date: p.date,
    price: p.adj_close ?? p.close ?? 0,
    open: p.open ?? null,
    high: p.high ?? null,
    low: p.low ?? null,
    close: p.close ?? null,
    volume: p.volume ?? null,
  }));

  const latestPrice = priceHistory[priceHistory.length - 1]?.price ?? null;

  return {
    ticker: company.ticker,
    name: company.name,
    exchange: company.exchange,
    sector: company.sector,
    industry: company.industry,
    country: company.country,
    currency: company.currency,
    description: company.description,
    ipoDate: company.ipo_date,
    employees: company.employees,
    website: company.website,
    price: latestPrice ?? metrics?.price ?? null,
    changePercent: metrics?.refund_1d_p ?? null,
    week52High: metrics?.week_52_high ?? null,
    week52Low: metrics?.week_52_low ?? null,
    priceHistory,
    ratios: buildRatios(metrics),
    rawMetrics: (metrics as Record<string, unknown>) ?? {},
    snapshotDate: metrics?.snapshot_date ?? null,
    valuationMetrics: buildValuationMetrics(metrics),
    valuationHistory,
    revenueTtm: metrics?.revenue_ttm ?? null,
    earningsTtm: metrics?.earnings_ttm ?? null,
    netMargin: metrics?.net_margin ?? metrics?.profit_margin ?? null,
    opm: metrics?.opm ?? metrics?.operating_margin ?? metrics?.operating_margin_ttm ?? null,
    analystData: buildAnalystData(metrics, latestPrice ?? metrics?.price ?? null),
  } as CompanyViewModel;
}

// --- Components ---

function PageSkeleton() {
  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950">
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 animate-pulse bg-white dark:bg-slate-900" />
      <div className="mx-auto max-w-[1600px] py-8 px-4 md:px-8 lg:px-12 space-y-8">
        <div className="flex flex-col md:flex-row gap-6">
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="h-12 border-y border-slate-200 dark:border-slate-800 animate-pulse" />
        <div className="grid gap-8">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    </div>
  );
}

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700 ${className}`} />;
}

export default async function CompanyPage({
  params,
}: {
  params: { ticker: string };
}) {
  const ticker = params.ticker?.toUpperCase?.() ?? "";

  return (
    <Suspense fallback={<PageSkeleton />}>
      <CompanyContent ticker={ticker} />
    </Suspense>
  );
}

// Separate component for async data fetching
async function CompanyContent({ ticker }: { ticker: string }) {
  try {
    const [companyData, pricesData, valuationHistory] = await Promise.all([
      api.fetchCompany(ticker),
      api.fetchPrices(ticker),
      fetchValuationHistory(ticker),
    ]);

    if (!companyData?.company) {
      notFound();
    }

    const data = transformData(companyData, pricesData, valuationHistory);

    return (
      <div className="min-h-full bg-slate-50 dark:bg-slate-950 pb-20">
        <PageHeader ticker={ticker} />

        <div className="mx-auto max-w-[1600px] py-6 px-4 md:px-8 lg:px-12 space-y-8">
          {/* Hero Section */}
          <CompanyHero data={data} />

          {/* Navigation Tabs */}
          <CompanyNavigation ticker={ticker} currentTab="overview" />

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Left Column - Main Content */}
            <div className="xl:col-span-3 space-y-10">
              <div id="overview" className="scroll-mt-32">
                {/* Charts: Price vs Valuations */}
                <CompanyChartsSwitcher
                  priceHistory={data.priceHistory}
                  valuationMetrics={data.valuationMetrics}
                  valuationHistory={data.valuationHistory}
                />
              </div>

              {/* Key Metrics Grid */}
              <KeyMetrics
                metrics={data.rawMetrics}
                snapshotDate={data.snapshotDate ?? undefined}
                sector={data.sector}
              />

              <div id="peers" className="scroll-mt-32">
                {/* Peer Comparison */}
                <PeerComparison
                  ticker={ticker}
                  sector={data.sector}
                  exchange={data.exchange}
                  initialData={await fetchPeers(ticker, data.exchange)}
                />
              </div>

              {/* News Section - Full Width Below Peers */}
              <div id="news" className="scroll-mt-32">
                <NewsFeed
                  ticker={ticker}
                  limit={6}
                  initialData={await fetchNews(ticker)}
                  mode="cards"
                />
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <CompanyProfile data={data} />
              <AnalystRatings metrics={data.analystData} />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to load company data:", error);
    notFound();
  }
}

function CompanyHero({ data }: { data: CompanyViewModel }) {
  const isPositive = (data.changePercent ?? 0) >= 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-lg">
      <div className="absolute inset-x-0 top-0 h-1 bg-brand" />
      <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
        <div className="flex items-start gap-4">
          <CompanyLogo ticker={data.ticker} name={data.name} />
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {data.name}
            </h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <Badge variant="secondary" className="font-semibold">
                {data.ticker}
              </Badge>
              <span className="text-sm text-muted-foreground">{data.exchange ?? "US"}</span>
              <span className="text-sm text-muted-foreground/60">•</span>
              <span className="text-sm text-muted-foreground">{data.sector ?? "Sector"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end gap-6">
          {/* 52-Week Range Visualization */}
          {data.week52High && data.week52Low && data.price && (
            <FiftyTwoWeekRange
              high={data.week52High}
              low={data.week52Low}
              current={data.price}
              className="hidden md:block" // Hide on small screens if too cramped
            />
          )}

          <div className="flex flex-col items-end">
            <div className="flex items-baseline gap-3">
              <UsdValue
                amount={data.price}
                className="text-4xl font-bold text-slate-900 dark:text-white"
              />

              <Badge
                variant="outline"
                className={`text-lg font-semibold ${isPositive
                  ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900"
                  : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900"
                  }`}
              >
                {isPositive ? "+" : ""}
                {data.changePercent != null
                  ? `${data.changePercent.toFixed(2)}%`
                  : "—"}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground mt-1">Market Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageHeader({ ticker }: { ticker: string }) {
  return (
    <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-[1600px] py-3 px-4 md:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <Breadcrumb ticker={ticker} />
          <PageActions />
        </div>
      </div>
    </div>
  );
}

function Breadcrumb({ ticker }: { ticker: string }) {
  const items = [
    { label: "Home", href: "/" },
    { label: "Screener", href: "/screens" },
    { label: ticker, active: true },
  ];

  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          {item.href ? (
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-brand transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 dark:text-white font-medium">
              {item.label}
            </span>
          )}
          {!item.active && <span className="text-muted-foreground/60">/</span>}
        </div>
      ))}
    </nav>
  );
}

function PageActions() {
  return <div />;
}

function CompanyProfile({ data }: { data: CompanyViewModel }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CompanyDescriptionModal name={data.name} description={data.description} />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <DetailItem label="Sector" value={data.sector} />
          <DetailItem label="Industry" value={data.industry} />
          <DetailItem label="Employees" value={data.employees?.toLocaleString()} />
          <DetailItem label="Founded" value={data.ipoDate ? new Date(data.ipoDate).getFullYear() : null} />
          <DetailItem label="Country" value={data.country} className="col-span-2" />
          <DetailItem label="Website" value={data.website} className="col-span-2">
            {data.website && (
              <a href={data.website} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                {data.website}
              </a>
            )}
          </DetailItem>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailItem({ label, value, className, children }: DetailItemProps) {
  const displayValue = value === null || value === undefined || value === "" ? "Not available" : value;
  return (
    <div className={className}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-slate-900 dark:text-white">
        {children || displayValue}
      </div>
    </div>
  );
}

function AnalystRatings({ metrics }: { metrics: AnalystData | null }) {
  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analyst Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400">No analyst data available.</p>
        </CardContent>
      </Card>
    );
  }

  const total = metrics.strongBuy + metrics.buy + metrics.hold + metrics.sell + metrics.strongSell;
  const buyShare = total > 0 ? (metrics.strongBuy + metrics.buy) / total : 0;

  const barPercent =
    metrics.rating != null
      ? Math.min(Math.max((metrics.rating / 5) * 100, 0), 100)
      : buyShare * 100;

  const getConsensus = (rating: number | null) => {
    if (rating == null) return "N/A";
    if (rating >= 4) return "Strong Buy";
    if (rating >= 3) return "Buy";
    if (rating >= 2) return "Hold";
    if (rating >= 1) return "Sell";
    return "Strong Sell";
  };

  // Calculate upside/downside percentage
  const upsidePercent =
    metrics.targetPrice != null && metrics.currentPrice != null && metrics.currentPrice > 0
      ? ((metrics.targetPrice - metrics.currentPrice) / metrics.currentPrice) * 100
      : null;

  const isUpside = upsidePercent != null && upsidePercent >= 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Analyst Ratings</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground/60 hover:text-brand transition-colors">
                  <Info className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px] text-xs">
                <p>Consensus rating based on aggregate analyst recommendations.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-brand mb-1">
              {getConsensus(metrics.rating)}
            </div>
            {metrics.targetPrice && (
              <div className="text-sm space-y-0.5">
                <div className="text-muted-foreground">
                  Target: <span className="font-semibold text-slate-900 dark:text-white">${metrics.targetPrice.toFixed(2)}</span>
                  {upsidePercent != null && (
                    <span
                      className={`ml-1.5 font-semibold ${
                        isUpside
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      ({isUpside ? "+" : ""}{upsidePercent.toFixed(1)}%)
                    </span>
                  )}
                </div>
                {total > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Based on {total} analyst{total !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            )}
          </div>
          <Progress value={barPercent} className="h-2" />
          <div className="grid grid-cols-5 gap-1 text-center text-xs">
            <div>
              <div className="font-semibold text-red-600">{metrics.strongSell}</div>
              <div className="text-muted-foreground">Strong Sell</div>
            </div>
            <div>
              <div className="font-semibold text-red-500">{metrics.sell}</div>
              <div className="text-muted-foreground">Sell</div>
            </div>
            <div>
              <div className="font-semibold text-slate-500">{metrics.hold}</div>
              <div className="text-muted-foreground">Hold</div>
            </div>
            <div>
              <div className="font-semibold text-green-500">{metrics.buy}</div>
              <div className="text-muted-foreground">Buy</div>
            </div>
            <div>
              <div className="font-semibold text-green-600">{metrics.strongBuy}</div>
              <div className="text-muted-foreground">Strong Buy</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CompanyError({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Failed to load company data</h1>
        <p className="text-slate-600">Please check the ticker symbol and try again.</p>
        <p className="text-xs text-slate-400">{error.message}</p>
        <Link href="/screens">
          <Button>Back to Screener</Button>
        </Link>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <CompanyError error={error} />;
}