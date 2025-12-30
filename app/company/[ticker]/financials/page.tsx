// app/company/[ticker]/financials/page.tsx
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { UsdValue } from "@/components/company/UsdValue";
import { FinancialsPageContent } from "@/components/company/FinancialsPageContent";
import { CompanyNavigation } from "@/components/company/CompanyNavigation";

// Schemas
const CompanySchema = z.object({
  id: z.string(),
  ticker: z.string(),
  name: z.string(),
  exchange: z.string().nullable(),
  sector: z.string().nullable(),
  industry: z.string().nullable(),
});

const MetricsSchema = z.object({
  price: z.number().nullable(),
  refund_1d_p: z.number().nullable(),
  market_capitalization: z.number().nullable(),
  pe_ratio: z.number().nullable(),
  eps_ttm: z.number().nullable(),
  revenue_ttm: z.number().nullable(),
  earnings_ttm: z.number().nullable(),
  net_margin: z.number().nullable(),
  roe: z.number().nullable(),
  roa: z.number().nullable(),
}).partial();

// API
const api = {
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000",

  async fetchCompany(ticker: string) {
    const res = await fetch(
      `${this.baseUrl}/api/company/${encodeURIComponent(ticker)}`,
      { next: { revalidate: 3600 }, headers: { "Content-Type": "application/json" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return z.object({ company: CompanySchema.nullable(), metrics: MetricsSchema.nullable() }).parse(data);
  },
};

// Loading skeleton
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 animate-pulse bg-white dark:bg-slate-900" />
      <div className="mx-auto max-w-[1600px] py-8 px-4 md:px-8 lg:px-12 space-y-8">
        <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-[600px] bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

export default async function FinancialsPage({
  params,
}: {
  params: { ticker: string };
}) {
  const ticker = params.ticker?.toUpperCase?.() ?? "";

  return (
    <Suspense fallback={<PageSkeleton />}>
      <FinancialsPageWrapper ticker={ticker} />
    </Suspense>
  );
}

async function FinancialsPageWrapper({ ticker }: { ticker: string }) {
  const companyData = await api.fetchCompany(ticker);

  if (!companyData?.company) {
    notFound();
  }

  const { company, metrics } = companyData;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-[1600px] py-3 px-4 md:px-8 lg:px-12">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-slate-500 hover:text-brand transition-colors">Home</Link>
            <span className="text-slate-400">/</span>
            <Link href="/screens" className="text-slate-500 hover:text-brand transition-colors">Screener</Link>
            <span className="text-slate-400">/</span>
            <Link href={`/company/${ticker}`} className="text-slate-500 hover:text-brand transition-colors">{ticker}</Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 dark:text-white font-medium">Financials</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] py-6 px-4 md:px-8 lg:px-12 space-y-6">
        {/* Company Header */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-lg">
          <div className="absolute inset-x-0 top-0 h-1 bg-brand" />
          <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
            <div className="flex items-start gap-4">
              <CompanyLogo ticker={company.ticker} name={company.name} />
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {company.name}
                </h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <Badge variant="secondary" className="font-semibold">{company.ticker}</Badge>
                  <span className="text-sm text-slate-500">{company.exchange ?? "US"}</span>
                  <span className="text-sm text-slate-500">•</span>
                  <span className="text-sm text-slate-500">{company.sector ?? "Sector"}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-baseline gap-3">
                <UsdValue amount={metrics?.price ?? null} className="text-3xl font-bold text-slate-900 dark:text-white" />
                {metrics?.refund_1d_p != null && (
                  <Badge
                    variant="outline"
                    className={`text-sm font-semibold ${metrics.refund_1d_p >= 0
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400"
                      : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400"
                      }`}
                  >
                    {metrics.refund_1d_p >= 0 ? "+" : ""}{metrics.refund_1d_p.toFixed(2)}%
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <CompanyNavigation ticker={ticker} currentTab="financials" />

        {/* Main Financials Content */}
        <FinancialsPageContent ticker={ticker} metrics={metrics} />
      </div>
    </div>
  );
}


