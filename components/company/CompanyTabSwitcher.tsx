"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { BarChart3, TrendingUp, DollarSign, Users } from "lucide-react";
import { KeyMetrics } from "@/components/company/KeyMetrics";
import { TechnicalsSection } from "@/components/company/TechnicalsSection";
import { FinancialsPageContent } from "@/components/company/FinancialsPageContent";
import { OwnershipSection } from "@/components/company/OwnershipSection";
import { type PriceHistoryPoint } from "@/components/company/CompanyChartsSwitcher";
import dynamic from "next/dynamic";

const CompanyChartsSwitcher = dynamic(
  () => import("@/components/company/CompanyChartsSwitcher").then((mod) => mod.CompanyChartsSwitcher),
  { ssr: false, loading: () => <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl animate-pulse" /> }
);

interface ValuationMetric {
  label: string;
  value: number | null;
}

interface ValuationHistoryPoint {
  date: string;
  price: number | null;
  pe_ratio: number | null;
}

interface CompanyTabSwitcherProps {
  ticker: string;
  metrics: Record<string, unknown>;
  snapshotDate?: string | null;
  sector?: string | null;
  price?: number | null;
  priceHistory: PriceHistoryPoint[];
  valuationMetrics: ValuationMetric[];
  valuationHistory: ValuationHistoryPoint[];
}

type Tab = "fundamentals" | "technicals" | "financials" | "ownership";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "fundamentals", label: "Fundamentals", icon: <BarChart3 className="w-4 h-4" /> },
  { id: "technicals", label: "Technicals", icon: <TrendingUp className="w-4 h-4" /> },
  { id: "financials", label: "Financials", icon: <DollarSign className="w-4 h-4" /> },
  { id: "ownership", label: "Ownership", icon: <Users className="w-4 h-4" /> },
];

export function CompanyTabSwitcher({
  ticker,
  metrics,
  snapshotDate,
  sector,
  price,
  priceHistory,
  valuationMetrics,
  valuationHistory,
}: CompanyTabSwitcherProps) {
  const [activeTab, setActiveTab] = useState<Tab>("fundamentals");

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 flex gap-1 shadow-sm w-fit mx-auto lg:w-full">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "fundamentals" && (
        <div className="space-y-8">
          {/* Price chart stays on fundamentals tab */}
          <CompanyChartsSwitcher
            priceHistory={priceHistory}
            valuationMetrics={valuationMetrics}
            valuationHistory={valuationHistory}
            ticker={ticker}
          />
          <KeyMetrics
            metrics={metrics}
            snapshotDate={snapshotDate ?? undefined}
            sector={sector}
          />
        </div>
      )}

      {activeTab === "technicals" && (
        <TechnicalsSection ticker={ticker} currentPrice={price} />
      )}

      {activeTab === "financials" && (
        <FinancialsPageContent ticker={ticker} metrics={metrics as Parameters<typeof FinancialsPageContent>[0]["metrics"]} />
      )}

      {activeTab === "ownership" && (
        <OwnershipSection ticker={ticker} />
      )}
    </div>
  );
}
