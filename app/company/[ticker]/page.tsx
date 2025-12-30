// app/company/[ticker]/page.tsx
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { z } from "zod";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { Progress } from "@/components/ui/progress";
import { CompanyChartsSwitcher, type PriceHistoryPoint } from "@/components/company/CompanyChartsSwitcher";
import { CompanyNavigation } from "@/components/company/CompanyNavigation";
import { UsdValue } from "@/components/company/UsdValue";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { CompanyDescriptionModal } from "@/components/company/CompanyDescriptionModal";
import { FinancialsSection } from "@/components/company/FinancialsSection";
import { TechnicalsSection } from "@/components/company/TechnicalsSection";

import { TrendingUp, Activity, FileText, Info } from "lucide-react";
import { PeerComparison } from "@/components/company/PeerComparison";
import { NewsFeed, type NewsArticle } from "@/components/company/NewsFeed";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Schemas for API validation
const CompanySchema = z.object({
  id: z.string(),
  ticker: z.string(),
  name: z.string(),
  exchange: z.string().nullable(),
  sector: z.string().nullable(),
  industry: z.string().nullable(),
  country: z.string().nullable(),
  currency: z.string().nullable(),
  description: z.string().nullable(),
  ipo_date: z.string().nullable(),
  employees: z.number().nullable(),
  website: z.string().nullable(),
});

const MetricsSchema = z.object({
  date: z.string(),
  price: z.number().nullable(),
  market_capitalization: z.number().nullable(),
  volume: z.number().nullable(),
  avg_volume_200d: z.number().nullable(),
  refund_1d_p: z.number().nullable(),
  refund_5d_p: z.number().nullable(),
  pe_ratio: z.number().nullable(),
  forward_pe: z.number().nullable(),
  peg: z.number().nullable(),
  pb: z.number().nullable(),
  dividend_yield: z.number().nullable(),
  ev_ebitda: z.number().nullable(),
  price_to_sales: z.number().nullable(),
  ev_sales: z.number().nullable(),
  price_to_cash_flow: z.number().nullable(),
  roe: z.number().nullable(),
  roa: z.number().nullable(),
  opm: z.number().nullable(),
  net_margin: z.number().nullable(),
  beta: z.number().nullable(),
  sma20: z.number().nullable(),
  sma50: z.number().nullable(),
  sma200: z.number().nullable(),
  current_ratio: z.number().nullable(),
  quick_ratio: z.number().nullable(),
  debt_to_equity: z.number().nullable(),
  lt_debt_to_equity: z.number().nullable(),
  eps_ttm: z.number().nullable(),
  diluted_eps_ttm: z.number().nullable(),
  revenue_ttm: z.number().nullable(),
  earnings_ttm: z.number().nullable(),
  perf_3y_p: z.number().nullable(),
  perf_5y_p: z.number().nullable(),
});

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
  price: z.number().nullable(),
  pe_ratio: z.number().nullable(),
  forward_pe: z.number().nullable(),
});

const ValuationHistoryResponseSchema = z.array(ValuationHistoryPointSchema);

// API Service Layer
const api = {
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000",

  async fetchCompany(ticker: string) {
    const res = await fetch(
      `${this.baseUrl}/api/company/${encodeURIComponent(ticker)}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
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
        next: { revalidate: 300 }, // Cache for 5 minutes
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

// Loading Components
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
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

// Main Page Component
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
        {/* Sticky Header */}
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

              <div id="financials" className="scroll-mt-32">
                {/* Financial Statements - New Component */}
                <FinancialsSection ticker={ticker} />
              </div>

              <div id="technicals" className="scroll-mt-32">
                {/* Technical Indicators - New Component */}
                <TechnicalsSection ticker={ticker} currentPrice={data.price} />
              </div>

              <div id="peers" className="scroll-mt-32">
                {/* Peer Comparison */}
                <PeerComparison
                  ticker={ticker}
                  sector={data.sector}
                  exchange={data.exchange}
                  initialData={await fetchPeers(ticker, data.exchange)}
                />
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <CompanyProfile data={data} />
              <AnalystRatings ticker={ticker} />
              <RecentFilings ticker={ticker} />
              <div id="news" className="scroll-mt-32">
                <NewsFeed ticker={ticker} limit={3} initialData={await fetchNews(ticker)} />
              </div>
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

// Helper types and transformation
type CompanyResponse = Awaited<ReturnType<typeof api.fetchCompany>>;
type PricesResponse = Awaited<ReturnType<typeof api.fetchPrices>>;
type Metrics = z.infer<typeof MetricsSchema> | null;

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
  priceHistory: PriceHistoryPoint[];
  ratios: RatioItem[];
  valuationMetrics: ValuationMetric[];
  valuationHistory: ValuationHistoryPoint[];
  revenueTtm: number | null;
  earningsTtm: number | null;
  netMargin: number | null;
  opm: number | null;
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
    priceHistory,
    ratios: buildRatios(metrics),
    valuationMetrics: buildValuationMetrics(metrics),
    valuationHistory,
    revenueTtm: metrics?.revenue_ttm ?? null,
    earningsTtm: metrics?.earnings_ttm ?? null,
    netMargin: metrics?.net_margin ?? null,
    opm: metrics?.opm ?? null,
  } as CompanyViewModel;
}

function buildRatios(metrics: Metrics): RatioItem[] {
  if (!metrics) return [];

  const items: RatioItem[] = [
    { label: "Market Cap", value: formatMetrics.marketCap(metrics.market_capitalization) },
    { label: "P/E", value: formatMetrics.number(metrics.pe_ratio) },
    { label: "Forward P/E", value: formatMetrics.number(metrics.forward_pe) },
    { label: "P/S", value: formatMetrics.number(metrics.price_to_sales) },
    { label: "P/B", value: formatMetrics.number(metrics.pb) },
    { label: "Dividend Yield", value: formatMetrics.percentage(metrics.dividend_yield) },
    { label: "ROE", value: formatMetrics.percentage(metrics.roe) },
    { label: "ROA", value: formatMetrics.percentage(metrics.roa) },
    { label: "Operating Margin", value: formatMetrics.percentage(metrics.opm) },
    { label: "Net Margin", value: formatMetrics.percentage(metrics.net_margin) },
    { label: "Beta", value: formatMetrics.number(metrics.beta) },
    { label: "Current Ratio", value: formatMetrics.number(metrics.current_ratio) },
    { label: "Quick Ratio", value: formatMetrics.number(metrics.quick_ratio) },
    { label: "Debt/Equity", value: formatMetrics.number(metrics.debt_to_equity) },
  ];

  return items;
}

function buildValuationMetrics(metrics: Metrics): ValuationMetric[] {
  if (!metrics) return [];

  return [
    { label: "P/E", value: metrics.pe_ratio },
    { label: "Forward P/E", value: metrics.forward_pe },
    { label: "P/S", value: metrics.price_to_sales },
    { label: "P/B", value: metrics.pb },
    { label: "EV/EBITDA", value: metrics.ev_ebitda },
  ];
}

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

// Component: Page Header
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

// Component: Breadcrumb
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

// Component: Page Actions (placeholder for now)
function PageActions() {
  return <div />;
}

// Component: Company Hero
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
  );
}



// Component: Key Metrics Card
function KeyMetricsCard({ metrics }: { metrics: RatioItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand" />
          Key Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {metrics.map((metric, i) => (
            <MetricItem key={i} {...metric} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricItem({ label, value }: RatioItem) {
  return (
    <div className="group relative p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-brand transition-colors bg-white dark:bg-slate-900">
      <div className="absolute inset-y-0 left-0 w-1 bg-brand rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-lg font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

// Component: Company Profile
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

interface DetailItemProps {
  label: string;
  value?: string | number | null;
  className?: string;
  children?: React.ReactNode;
}

function DetailItem({ label, value, className, children }: DetailItemProps) {
  return (
    <div className={className}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-slate-900 dark:text-white">
        {children || value || "—"}
      </div>
    </div>
  );
}

// Component: Analyst Ratings
async function AnalystRatings({ ticker }: { ticker: string }) {
  const ratings = await fetchAnalystRatings(ticker);

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
                <p>Consensus rating based on aggregate analyst price targets and recommendations over the last 90 days.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-center py-4">
            <div className="text-3xl font-bold mb-2">
              {ratings?.consensus ?? "—"}
            </div>
            <Progress value={ratings?.buyPercent ?? 0} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Component: Recent Filings
interface Filing {
  id: number;
  type: string;
  date: string;
}

async function RecentFilings({ ticker }: { ticker: string }) {
  const filings = await fetchFilings(ticker);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Filings</CardTitle>
          <Badge variant="outline">SEC</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filings?.slice(0, 3).map((filing: Filing) => (
            <div key={filing.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground/60" />
                <span className="text-sm font-medium">{filing.type}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {filing.date}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
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

// Component: Financial Statements
function FinancialStatements({ data }: { data: CompanyViewModel }) {
  const rows = [
    {
      label: "Revenue (TTM)",
      value:
        data.revenueTtm != null
          ? `$${data.revenueTtm.toLocaleString()}`
          : "—",
    },
    {
      label: "Earnings (TTM)",
      value:
        data.earningsTtm != null
          ? `$${data.earningsTtm.toLocaleString()}`
          : "—",
    },
    {
      label: "Net Margin (TTM)",
      value:
        data.netMargin != null
          ? `${(data.netMargin * 100).toFixed(2)}%`
          : "—",
    },
    {
      label: "Operating Margin (TTM)",
      value:
        data.opm != null ? `${(data.opm * 100).toFixed(2)}%` : "—",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Statements</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="income">
          <TabsList>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
            <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          </TabsList>
          <TabsContent value="income">
            <div className="mt-4">
              <table className="w-full text-sm">
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.label} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <td className="py-2 text-slate-500 dark:text-slate-400">{row.label}</td>
                      <td className="py-2 text-right font-medium text-slate-900 dark:text-white">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="balance">
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
              Balance sheet level data will be available once statement-level
              ingestion is implemented.
            </p>
          </TabsContent>
          <TabsContent value="cashflow">
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
              Cash flow statement data will be available once statement-level
              ingestion is implemented.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
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
  } catch (e) {
    return [];
  }
}

// Placeholder data fetchers (replace with actual API calls)
async function fetchAnalystRatings(ticker: string) {
  console.debug("fetchAnalystRatings", ticker);
  // Simulate API call
  return { consensus: "Buy", buyPercent: 75 };
}

async function fetchFilings(ticker: string) {
  console.debug("fetchFilings", ticker);
  return [
    { id: 1, type: "10-Q", date: "2024-10-15" },
    { id: 2, type: "8-K", date: "2024-10-10" },
  ];
}

function formatNewsDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getNewsSource(link: string): string {
  try {
    const url = new URL(link);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "News";
  }
}

// Error Boundary
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

// Add error boundary wrapper
export function ErrorBoundary({ error }: { error: Error }) {
  return <CompanyError error={error} />;
}