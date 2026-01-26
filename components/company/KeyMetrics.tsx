"use client";

import React, { useMemo, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  Wallet,
  ShieldAlert,
  Users,
  ChevronDown,
  ChevronRight,
  Settings2,
  Info,
  Clock,
  Calendar,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  useMetricsPreferences,
  type MetricCategory,
} from "@/hooks/useMetricsPreferences";
import {
  CATEGORY_INFO,
  getMetricsByCategory,
  formatMetricValue,
  evaluateQuality,
  type MetricDefinition,
  type QualityLevel,
} from "@/lib/metricDefinitions";

// Mapping from TTM growth metrics to their Quarterly YoY equivalents.
// We only swap these growth metrics; quarterly definitions themselves are
// hidden from the list and used purely as alternate timeframes.
const TTM_TO_QUARTERLY_MAP: Record<string, string> = {
  revenue_growth_ttm_yoy: "quarterly_revenue_growth_yoy",
  eps_growth_ttm_yoy: "quarterly_earnings_growth_yoy",
};

// Map metric keys to the raw data keys from API
const METRIC_KEY_MAP: Record<string, string[]> = {
  market_cap: ["market_capitalization", "market_cap"],
  pe_ratio: ["pe_ratio", "trailing_pe"],
  forward_pe: ["forward_pe"],
  peg_ratio: ["peg_ratio", "peg"],
  price_to_sales: ["price_to_sales", "price_sales_ttm"],
  price_to_book: ["price_to_book", "pb", "price_book_mrq"],
  ev_ebitda: ["ev_ebitda"],
  ev_revenue: ["ev_revenue"],
  enterprise_value: ["enterprise_value"],
  roe: ["roe", "return_on_equity_ttm"],
  roa: ["roa", "return_on_assets_ttm"],
  profit_margin: ["profit_margin", "net_margin"],
  operating_margin: ["operating_margin", "operating_margin_ttm"],
  gross_margin: ["gross_margin"],
  revenue_ttm: ["revenue_ttm"],
  eps_ttm: ["eps_ttm", "earnings_share", "diluted_eps_ttm"],
  revenue_growth_ttm_yoy: ["revenue_growth_ttm_yoy"],
  eps_growth_ttm_yoy: ["eps_growth_ttm_yoy"],
  revenue_cagr_3y: ["revenue_cagr_3y"],
  eps_cagr_3y: ["eps_cagr_3y"],
  quarterly_revenue_growth_yoy: ["quarterly_revenue_growth_yoy"],
  quarterly_earnings_growth_yoy: ["quarterly_earnings_growth_yoy"],
  eps_estimate_current_year: ["eps_estimate_current_year"],
  eps_estimate_next_year: ["eps_estimate_next_year"],
  dividend_yield: ["dividend_yield"],
  forward_dividend_yield: ["forward_annual_dividend_yield"],
  payout_ratio: ["payout_ratio"],
  ex_dividend_date: ["ex_dividend_date"],
  beta: ["beta"],
  week_52_high: ["week_52_high"],
  week_52_low: ["week_52_low"],
  price_volatility_1y: ["price_volatility_1y"],
  max_drawdown_1y: ["max_drawdown_1y"],
  distance_from_52w_high: ["distance_from_52w_high"],
  distance_from_52w_low: ["distance_from_52w_low"],
  short_percent_float: ["short_percent_float", "short_percent"],
  debt_to_equity: ["debt_to_equity"],
  current_ratio: ["current_ratio"],
  quick_ratio: ["quick_ratio"],
  percent_insiders: ["percent_insiders"],
  percent_institutions: ["percent_institutions"],
  analyst_rating: ["analyst_rating"],
  analyst_target_price: ["analyst_target_price"],
  shares_outstanding: ["shares_outstanding"],
  shares_float: ["shares_float"],
};

// Get raw value from metrics data
function getMetricValue(
  metricKey: string,
  data: Record<string, unknown>
): number | string | null {
  const possibleKeys = METRIC_KEY_MAP[metricKey] || [metricKey];
  for (const key of possibleKeys) {
    const val = data[key];
    if (val !== undefined && val !== null) {
      return val as number | string;
    }
  }
  return null;
}

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    return Number.isNaN(value) ? null : value;
  }
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function formatPayoutRatio(
  rawValue: number | string | null,
  allMetrics: Record<string, unknown>,
  definition: MetricDefinition,
): { value: string; suppressQuality: boolean } {
  const payout = toNumber(rawValue);

  const epsRaw =
    getMetricValue("diluted_eps_ttm", allMetrics) ??
    getMetricValue("eps_ttm", allMetrics);
  const eps = toNumber(epsRaw as number | string | null);

  // Case 3: Loss-making company - payout ratio is not meaningful
  if (eps != null && eps <= 0) {
    return {
      value: "N/A · Loss-making; payout ratio not meaningful",
      suppressQuality: true,
    };
  }

  const dividendYield = toNumber(
    getMetricValue("dividend_yield", allMetrics) as number | string | null,
  );
  const dividendPerShare = toNumber(
    getMetricValue("dividend_per_share", allMetrics) as number | string | null,
  );
  const hasDividendDate = !!getMetricValue("dividend_date", allMetrics);
  const hasDividend =
    (dividendYield ?? 0) > 0 ||
    (dividendPerShare ?? 0) > 0 ||
    hasDividendDate;

  // Case 1: No dividends paid at all
  if (!hasDividend && (payout === null || payout === 0)) {
    const base = formatMetricValue(0, definition);
    return {
      value: `${base} · No dividends paid in the last 12 months`,
      suppressQuality: true,
    };
  }

  // Case 2: Company paid dividends but payout ratio is missing / rounded down
  if (hasDividend && (payout === null || payout === 0)) {
    return {
      value: "N/A · Dividend data incomplete",
      suppressQuality: true,
    };
  }

  // Default: show normal payout ratio formatting
  return {
    value: formatMetricValue(rawValue, definition),
    suppressQuality: false,
  };
}

// Category icons
const CATEGORY_ICONS: Record<MetricCategory, React.ElementType> = {
  valuation: DollarSign,
  profitability: TrendingUp,
  growth: BarChart3,
  dividends: Wallet,
  risk: ShieldAlert,
  ownership: Users,
};

// Quality level colors
const QUALITY_COLORS: Record<QualityLevel, string> = {
  strong: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900",
  normal: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900",
  weak: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900",
  neutral: "text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700",
};

interface KeyMetricsProps {
  metrics: Record<string, unknown>;
  snapshotDate?: string;
  sector?: string | null;
}

export function KeyMetrics({ metrics, snapshotDate, sector }: KeyMetricsProps) {
  const {
    preferences,
    isLoaded,
    toggleCategoryExpanded,
    setShowQualityTags,
    setShowDefinitionsOnHover,
    setShowAdvancedMetrics,
    expandAllCategories,
    collapseAllCategories,
    resetToDefaults,
  } = useMetricsPreferences();

  // Toggle between TTM and Quarterly view
  const [isQuarterlyMode, setIsQuarterlyMode] = useState(false);

  // Controls the "How we score metrics" explainer dialog
  const [showQualityExplainer, setShowQualityExplainer] = useState(false);

  // Process metrics by category
  const metricsByCategory = useMemo(() => {
    const categories: MetricCategory[] = [
      "valuation",
      "profitability",
      "growth",
      "dividends",
      "risk",
      "ownership",
    ];

    return categories.map((category) => {
      const definitions = getMetricsByCategory(category);
      const items = definitions
        .filter((def) => {
          // Filter out advanced metrics if not showing them
          if (def.isAdvanced && !preferences.showAdvancedMetrics) return false;

          // Quarterly growth metrics are surfaced via the TTM metrics when the
          // user flips the TTM/Quarterly toggle. We never want them to appear
          // as separate rows alongside the TTM versions.
          if (
            def.key === "quarterly_revenue_growth_yoy" ||
            def.key === "quarterly_earnings_growth_yoy"
          ) {
            return false;
          }

          // Hide gross margin for financial sectors where it is not meaningful
          if (
            def.key === "gross_margin" &&
            sector &&
            /bank|financial|nbfc|insurance/i.test(sector)
          ) {
            return false;
          }
          return true;
        })
        .map((def) => {
          // Check if we should use quarterly version of this metric
          let effectiveKey = def.key;
          let effectiveDefinition = def;

          if (isQuarterlyMode && TTM_TO_QUARTERLY_MAP[def.key]) {
            const quarterlyKey = TTM_TO_QUARTERLY_MAP[def.key];
            const quarterlyDef = getMetricsByCategory("growth").find(
              (d) => d.key === quarterlyKey
            );

            if (quarterlyDef) {
              effectiveKey = quarterlyKey;
              effectiveDefinition = quarterlyDef;
            }
          }

          const rawValue = getMetricValue(effectiveKey, metrics);

          let formattedValue: string;
          let suppressQuality = false;

          if (effectiveDefinition.key === "payout_ratio") {
            const result = formatPayoutRatio(rawValue, metrics, effectiveDefinition);
            formattedValue = result.value;
            suppressQuality = result.suppressQuality;
          } else {
            formattedValue = formatMetricValue(rawValue, effectiveDefinition);
          }

          const quality =
            !suppressQuality && typeof rawValue === "number"
              ? evaluateQuality(rawValue, effectiveDefinition.qualityRules)
              : undefined;

          return {
            definition: effectiveDefinition,
            rawValue,
            formattedValue,
            quality,
            originalKey: def.key, // Keep track of original key for filtering
          };
        })
        // Only include metrics that have values and pass additional semantic rules.
        .filter((item) => {
          const key = item.definition.key;

          if (item.rawValue === null) {
            return false;
          }

          // PEG visibility rules
          if (key === "peg_ratio") {
            const peg = toNumber(item.rawValue as number | string | null);
            if (peg === null || !Number.isFinite(peg) || peg <= 0) {
              return false;
            }

            const epsRaw = getMetricValue("eps_ttm", metrics);
            const eps = toNumber(epsRaw as number | string | null);
            if (eps != null && eps <= 0) {
              return false;
            }

            const growthRaw =
              getMetricValue("quarterly_earnings_growth_yoy", metrics) ??
              getMetricValue("quarterly_revenue_growth_yoy", metrics);
            const growth = toNumber(growthRaw as number | string | null);
            if (growth != null && growth <= 0) {
              return false;
            }
          }

          // Hide TTM YoY growth metrics when their values are null
          if (
            (key === "revenue_growth_ttm_yoy" || key === "eps_growth_ttm_yoy") &&
            item.rawValue === null
          ) {
            return false;
          }

          return true;
        });

      return {
        category,
        info: CATEGORY_INFO[category],
        items,
        // visibleCategories and expandedCategories are records keyed by category, not arrays
        isVisible: Boolean(preferences.visibleCategories[category]),
        isExpanded: Boolean(preferences.expandedCategories[category]),
      };
    });
  }, [preferences, metrics, sector, isQuarterlyMode]);

  // Don't render until preferences are loaded to avoid flash
  if (!isLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand" />
            Key Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const visibleCategories = metricsByCategory.filter(
    (cat) => cat.isVisible && cat.items.length > 0
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand" />
            Key Metrics
          </CardTitle>
          {snapshotDate && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setIsQuarterlyMode(!isQuarterlyMode)}
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all",
                      "border hover:bg-slate-100 dark:hover:bg-slate-800",
                      isQuarterlyMode
                        ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900"
                        : "bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                    )}
                  >
                    {isQuarterlyMode ? (
                      <>
                        <Calendar className="w-3 h-3" />
                        Quarterly
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        TTM
                      </>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[250px]">
                  <p className="text-xs">
                    {isQuarterlyMode ? (
                      <>
                        <strong>Quarterly View</strong>
                        <br />
                        Showing quarterly metrics where available.
                        <br />
                        Click to switch to TTM (Trailing Twelve Months) view.
                      </>
                    ) : (
                      <>
                        <strong>Trailing Twelve Months (TTM)</strong>
                        <br />
                        Most metrics are based on the last 4 quarters of data.
                        <br />
                        Click to switch to Quarterly view.
                      </>
                    )}
                    <br />
                    <span className="text-muted-foreground mt-1 block">
                      Last updated: {new Date(snapshotDate).toLocaleDateString()}
                    </span>
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Display Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={preferences.showQualityTags}
              onCheckedChange={setShowQualityTags}
            >
              Show quality indicators
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={preferences.showDefinitionsOnHover}
              onCheckedChange={setShowDefinitionsOnHover}
            >
              Show definitions on hover
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={preferences.showAdvancedMetrics}
              onCheckedChange={setShowAdvancedMetrics}
            >
              Show advanced metrics
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowQualityExplainer(true)}
              className="cursor-pointer text-xs"
            >
              <Info className="w-3 h-3 mr-2" />
              How we score metrics
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Categories</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-xs"
                onClick={expandAllCategories}
              >
                Expand All
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-xs"
                onClick={collapseAllCategories}
              >
                Collapse All
              </Button>
            </div>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-7 text-xs text-muted-foreground"
                onClick={resetToDefaults}
              >
                Reset to Defaults
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-4">
        {visibleCategories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No metrics available for this company.
          </p>
        ) : (
          visibleCategories.map(({ category, info, items, isExpanded }) => {
            const Icon = CATEGORY_ICONS[category];
            const displayItems = isExpanded ? items : items.slice(0, 4);
            const hasMore = items.length > 4;

            return (
              <div
                key={category}
                className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategoryExpanded(category)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-brand" />
                    <span className="font-medium text-sm text-slate-900 dark:text-white">
                      {info.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({items.length})
                    </span>
                  </div>
                  {hasMore && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {!isExpanded && (
                        <span>+{items.length - 4} more</span>
                      )}
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  )}
                </button>

                {/* Metrics Grid */}
                <div className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {displayItems.map((item) => (
                      <MetricCard
                        key={item.definition.key}
                        definition={item.definition}
                        formattedValue={item.formattedValue}
                        quality={item.quality}
                        showQualityTags={preferences.showQualityTags}
                        showDefinition={preferences.showDefinitionsOnHover}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>

      <QualityExplainerDialog
        open={showQualityExplainer}
        onOpenChange={setShowQualityExplainer}
      />
    </Card>
  );
}

interface MetricCardProps {
  definition: MetricDefinition;
  formattedValue: string;
  quality?: { level: QualityLevel; label: string };
  showQualityTags: boolean;
  showDefinition: boolean;
}

function MetricCard({
  definition,
  formattedValue,
  quality,
  showQualityTags,
  showDefinition,
}: MetricCardProps) {
  // Check if this is a quarterly metric
  const isQuarterlyMetric = definition.key.includes("quarterly");
  const content = (
    <div className="group relative p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-brand/60 transition-colors bg-white dark:bg-slate-900">
      {/* TTM/Quarterly indicator */}
      {(definition.isTTM || isQuarterlyMetric) && (
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  "absolute top-1 right-1 text-[9px] font-medium px-1 py-0.5 rounded",
                  isQuarterlyMetric
                    ? "text-blue-700 dark:text-blue-400 bg-blue-100/80 dark:bg-blue-900/80"
                    : "text-muted-foreground bg-slate-100/80 dark:bg-slate-800/80"
                )}
              >
                {isQuarterlyMetric ? "Q" : "TTM"}
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-[220px] bg-slate-900 text-slate-50 border border-slate-700 shadow-lg"
            >
              {isQuarterlyMetric ? (
                <>
                  <p className="text-[11px] font-semibold mb-1">Quarterly (Q)</p>
                  <p className="text-[11px] text-slate-100">
                    Based on the most recent quarter compared to the same quarter last year.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[11px] font-semibold mb-1">Trailing 12 Months (TTM)</p>
                  <p className="text-[11px] text-slate-100">
                    Based on the last 4 reported quarters, not a single fiscal year.
                  </p>
                </>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[11px] text-muted-foreground truncate">
              {definition.shortLabel || definition.label}
            </span>
            {showDefinition && (
              <Info className="w-3 h-3 text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            )}
          </div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
            {formattedValue}
          </div>
        </div>
      </div>

      {/* Quality Tag */}
      {showQualityTags && quality && (
        <div className="mt-1.5">
          <span
            className={cn(
              "inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded border",
              QUALITY_COLORS[quality.level]
            )}
          >
            {quality.label}
          </span>
        </div>
      )}
    </div>
  );

  if (showDefinition) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-[280px] bg-slate-900 text-slate-50 border border-slate-700 shadow-lg"
          >
            <p className="text-xs font-semibold mb-1 text-slate-50">
              {definition.label}
            </p>
            <p className="text-xs text-slate-100">
              {definition.definition}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

interface QualityExplainerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function QualityExplainerDialog({
  open,
  onOpenChange,
}: QualityExplainerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            How we score metrics
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-xs text-muted-foreground">
          <p>
            Each metric can have a quality tag like <strong>Strong</strong>,
            <strong> Normal</strong>, or <strong>Weak</strong>. These are
            computed from simple rule-based thresholds defined per metric.
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              <strong>Per-metric rules</strong>: for each metric we define
              numeric ranges (e.g. ROE &gt;= 20% = "Excellent").
            </li>
            <li>
              <strong>Directional logic</strong>: some metrics are "good when
              high" (margins, growth), others are "good when low" (valuation
              multiples, drawdowns).
            </li>
            <li>
              <strong>Neutral by default</strong>: if a value does not match any
              explicit rule, it defaults to a neutral label.
            </li>
          </ul>
          <p>
            These rules are static today (not sector-relative), but they are
            transparent and applied consistently across all companies.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
