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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  Legend,
  Area,
  AreaChart,
  ComposedChart,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DollarSign,
  BarChart3,
  Wallet,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Real column names from income_statement_annual/quarterly
interface IncomeRow {
  date: string;
  filing_date: string | null;
  currency: string | null;
  total_revenue: number | null;
  cost_of_revenue: number | null;
  gross_profit: number | null;
  operating_income: number | null;
  ebit: number | null;
  ebitda: number | null;
  net_income: number | null;
  net_income_from_continuing_ops: number | null;
  income_before_tax: number | null;
  income_tax_expense: number | null;
  interest_expense: number | null;
  depreciation_and_amortization: number | null;
  research_development: number | null;
  selling_general_administrative: number | null;
  net_income_applicable_to_common_shares: number | null;
}

// Real column names from balance_sheet_annual/quarterly
interface BalanceRow {
  date: string;
  filing_date: string | null;
  currency: string | null;
  total_assets: number | null;
  total_current_assets: number | null;
  cash_and_equivalents: number | null;
  net_receivables: number | null;
  inventory: number | null;
  total_liabilities: number | null;
  total_current_liabilities: number | null;
  short_term_debt: number | null;
  long_term_debt: number | null;
  total_stockholder_equity: number | null;
  retained_earnings: number | null;
  net_debt: number | null;
  net_working_capital: number | null;
  goodwill: number | null;
  intangible_assets: number | null;
  property_plant_equipment_net: number | null;
  common_stock_shares_outstanding: number | null;
}

// Real column names from cash_flow_annual/quarterly
interface CashFlowRow {
  date: string;
  filing_date: string | null;
  currency: string | null;
  total_cash_from_operating_activities: number | null;
  capital_expenditures: number | null;
  total_cashflows_from_investing_activities: number | null;
  total_cash_from_financing_activities: number | null;
  free_cash_flow: number | null;
  dividends_paid: number | null;
  net_borrowings: number | null;
  stock_based_compensation: number | null;
  depreciation: number | null;
  change_in_working_capital: number | null;
  begin_period_cash_flow: number | null;
  end_period_cash_flow: number | null;
}

interface FinancialsResponse {
  ticker: string;
  income: { annual: IncomeRow[]; quarterly: IncomeRow[] };
  balance: { annual: BalanceRow[]; quarterly: BalanceRow[] };
  cashflow: { annual: CashFlowRow[]; quarterly: CashFlowRow[] };
}

interface MetricsProps {
  price?: number | null;
  market_capitalization?: number | null;
  pe_ratio?: number | null;
  eps_ttm?: number | null;
  revenue_ttm?: number | null;
  earnings_ttm?: number | null;
  net_margin?: number | null;
  roe?: number | null;
  roa?: number | null;
}

interface FinancialsPageContentProps {
  ticker: string;
  metrics: MetricsProps | null;
}

const COLORS = {
  primary: "#0087f6", // brand
  success: "#279b48", // growth
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  pink: "#ec4899",
  slate: "#64748b",
};

const formatCurrency = (value: number | null): string => {
  if (value === null) return "—";
  const absValue = Math.abs(value);
  if (absValue >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (absValue >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (absValue >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (absValue >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};

const formatPercent = (value: number | null): string => {
  if (value === null) return "—";
  return `${(value * 100).toFixed(2)}%`;
};

const formatNumber = (value: number | null, decimals = 2): string => {
  if (value === null) return "—";
  return value.toFixed(decimals);
};

const formatQuarter = (dateStr: string): string => {
  const date = new Date(dateStr);
  const quarter = Math.ceil((date.getMonth() + 1) / 3);
  return `Q${quarter} ${date.getFullYear()}`;
};

const formatYear = (dateStr: string): string => {
  return new Date(dateStr).getFullYear().toString();
};

export function FinancialsPageContent({ ticker, metrics }: Readonly<FinancialsPageContentProps>) {
  const [financials, setFinancials] = useState<FinancialsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodType, setPeriodType] = useState<"quarterly" | "annual">("quarterly");

  useEffect(() => {
    const fetchFinancials = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
        const res = await fetch(
          `${baseUrl}/api/company/${encodeURIComponent(ticker)}/financials?type=all&limit=20`
        );
        if (!res.ok) throw new Error("Failed to fetch financials");
        const data: FinancialsResponse = await res.json();
        setFinancials(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchFinancials();
  }, [ticker]);

  const income = useMemo(() => (
    periodType === "annual" ? (financials?.income.annual ?? []) : (financials?.income.quarterly ?? [])
  ), [financials, periodType]);

  const balance = useMemo(() => (
    periodType === "annual" ? (financials?.balance.annual ?? []) : (financials?.balance.quarterly ?? [])
  ), [financials, periodType]);

  const cashflow = useMemo(() => (
    periodType === "annual" ? (financials?.cashflow.annual ?? []) : (financials?.cashflow.quarterly ?? [])
  ), [financials, periodType]);

  // Data arrives desc from API — sort asc for charts, keep desc for tables
  const incomeAsc = useMemo(() => [...income].sort((a, b) => a.date.localeCompare(b.date)), [income]);
  const balanceAsc = useMemo(() => [...balance].sort((a, b) => a.date.localeCompare(b.date)), [balance]);
  const cashflowAsc = useMemo(() => [...cashflow].sort((a, b) => a.date.localeCompare(b.date)), [cashflow]);

  const hasData = income.length > 0 || balance.length > 0 || cashflow.length > 0;

  if (loading) return <LoadingSkeleton />;

  if (error || !hasData) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No Financial Data Available
            </h3>
            <p className="text-sm text-slate-500">
              {error || "Financial statements for this company have not been synced yet."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Financial Statements
        </h2>
        <Select value={periodType} onValueChange={(v) => setPeriodType(v as "quarterly" | "annual")}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="annual">Annual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Financial Highlights */}
      <KeyHighlights
        latestIncome={income[0] ?? null}
        previousIncome={income[1] ?? null}
        latestBalance={balance[0] ?? null}
        latestCashflow={cashflow[0] ?? null}
        metrics={metrics}
        periodType={periodType}
      />

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab incomeAsc={incomeAsc} cashflowAsc={cashflowAsc} periodType={periodType} />
        </TabsContent>

        <TabsContent value="income">
          <IncomeStatementTab incomeAsc={incomeAsc} income={income} periodType={periodType} />
        </TabsContent>

        <TabsContent value="balance">
          <BalanceSheetTab balanceAsc={balanceAsc} balance={balance} periodType={periodType} />
        </TabsContent>

        <TabsContent value="cashflow">
          <CashFlowTab cashflowAsc={cashflowAsc} cashflow={cashflow} periodType={periodType} />
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

// Key Highlights Component
function KeyHighlights({
  latestIncome,
  previousIncome,
  latestBalance,
  latestCashflow,
  metrics,
  periodType,
}: Readonly<{
  latestIncome: IncomeRow | null;
  previousIncome: IncomeRow | null;
  latestBalance: BalanceRow | null;
  latestCashflow: CashFlowRow | null;
  metrics: MetricsProps | null;
  periodType: string;
}>) {
  const calcChange = (current: number | null, previous: number | null) => {
    if (!current || !previous || previous === 0) return null;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const highlights = [
    {
      label: "Revenue",
      value: formatCurrency(latestIncome?.total_revenue ?? null),
      change: calcChange(latestIncome?.total_revenue ?? null, previousIncome?.total_revenue ?? null),
      bgColor: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
    },
    {
      label: "Net Income",
      value: formatCurrency(latestIncome?.net_income ?? null),
      change: calcChange(latestIncome?.net_income ?? null, previousIncome?.net_income ?? null),
      bgColor: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
    },
    {
      label: "Free Cash Flow",
      value: formatCurrency(latestCashflow?.free_cash_flow ?? null),
      change: null,
      bgColor: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
    },
    {
      label: "Total Assets",
      value: formatCurrency(latestBalance?.total_assets ?? null),
      change: null,
      bgColor: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {highlights.map((h) => (
        <Card key={h.label} className={`${h.bgColor} backdrop-blur-sm`}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{h.label}</span>
              {h.change !== null && (
                <Badge
                  variant="outline"
                  className={`text-xs ${h.change >= 0
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}
                >
                  {h.change >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                  {Math.abs(h.change).toFixed(1)}%
                </Badge>
              )}
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">{h.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Overview Tab
function OverviewTab({ incomeAsc, cashflowAsc, periodType }: Readonly<{ incomeAsc: IncomeRow[]; cashflowAsc: CashFlowRow[]; periodType: string }>) {
  const fmt = (d: string) => periodType === "quarterly" ? formatQuarter(d) : formatYear(d);

  const chartData = incomeAsc.map((f) => ({
    period: fmt(f.date),
    revenue: f.total_revenue ? f.total_revenue / 1e9 : 0,
    netIncome: f.net_income ? f.net_income / 1e9 : 0,
    grossProfit: f.gross_profit ? f.gross_profit / 1e9 : 0,
  }));

  // Compute margins from raw values
  const marginData = incomeAsc.map((f) => ({
    period: fmt(f.date),
    grossMargin: f.gross_profit && f.total_revenue ? (f.gross_profit / f.total_revenue) * 100 : null,
    operatingMargin: f.operating_income && f.total_revenue ? (f.operating_income / f.total_revenue) * 100 : null,
    netMargin: f.net_income && f.total_revenue ? (f.net_income / f.total_revenue) * 100 : null,
  }));

  const cashFlowData = cashflowAsc.map((f) => ({
    period: fmt(f.date),
    operatingCF: f.total_cash_from_operating_activities ? f.total_cash_from_operating_activities / 1e9 : 0,
    investingCF: f.total_cashflows_from_investing_activities ? f.total_cashflows_from_investing_activities / 1e9 : 0,
    financingCF: f.total_cash_from_financing_activities ? f.total_cash_from_financing_activities / 1e9 : 0,
    freeCF: f.free_cash_flow ? f.free_cash_flow / 1e9 : 0,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue & Profitability */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue & Profitability</CardTitle>
          <CardDescription>Revenue, Gross Profit, and Net Income (Billions)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}B`, ""]} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="grossProfit" name="Gross Profit" fill={COLORS.success} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="netIncome" name="Net Income" stroke={COLORS.warning} strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Margin Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Margin Trends</CardTitle>
          <CardDescription>Gross, Operating, and Net Margin (%)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={marginData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v?.toFixed(2)}%`, ""]} />
                <Legend />
                <Area type="monotone" dataKey="grossMargin" name="Gross" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.3} />
                <Area type="monotone" dataKey="operatingMargin" name="Operating" stroke={COLORS.warning} fill={COLORS.warning} fillOpacity={0.3} />
                <Area type="monotone" dataKey="netMargin" name="Net" stroke={COLORS.success} fill={COLORS.success} fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow Breakdown */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Cash Flow Analysis</CardTitle>
          <CardDescription>Operating, Investing, Financing, and Free Cash Flow (Billions)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}B`, ""]} />
                <Legend />
                <ReferenceLine y={0} stroke="#94a3b8" />
                <Bar dataKey="operatingCF" name="Operating" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="investingCF" name="Investing" fill={COLORS.danger} radius={[4, 4, 0, 0]} />
                <Bar dataKey="financingCF" name="Financing" fill={COLORS.purple} radius={[4, 4, 0, 0]} />
                <Bar dataKey="freeCF" name="Free CF" fill={COLORS.success} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Income Statement Tab
function IncomeStatementTab({
  incomeAsc,
  income,
  periodType,
}: Readonly<{ incomeAsc: IncomeRow[]; income: IncomeRow[]; periodType: string }>) {
  const fmt = (d: string) => periodType === "quarterly" ? formatQuarter(d) : formatYear(d);
  const top5 = income.slice(0, 5);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Table */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Income Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2 text-left">Metric</th>
                  {top5.map((f) => (
                    <th key={f.date} className="py-2 text-right">{fmt(f.date)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <IncomeTableRow label="Revenue" rows={top5} field="total_revenue" format={formatCurrency} />
                <IncomeTableRow label="Cost of Revenue" rows={top5} field="cost_of_revenue" format={formatCurrency} />
                <IncomeTableRow label="Gross Profit" rows={top5} field="gross_profit" format={formatCurrency} highlight />
                <IncomeTableRow label="R&D Expenses" rows={top5} field="research_development" format={formatCurrency} />
                <IncomeTableRow label="SG&A Expenses" rows={top5} field="selling_general_administrative" format={formatCurrency} />
                <IncomeTableRow label="Operating Income" rows={top5} field="operating_income" format={formatCurrency} highlight />
                <IncomeTableRow label="EBITDA" rows={top5} field="ebitda" format={formatCurrency} />
                <IncomeTableRow label="Net Income" rows={top5} field="net_income" format={formatCurrency} highlight />
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown Pie */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Expense Breakdown</CardTitle>
          <CardDescription>Latest Period</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseBreakdownPie period={income[0] ?? null} />
        </CardContent>
      </Card>
    </div>
  );
}

function ExpenseBreakdownPie({ period }: Readonly<{ period: IncomeRow | null }>) {
  if (!period) return <div className="text-sm text-slate-500">No data</div>;
  const expenses = [
    { name: "Cost of Revenue", value: period.cost_of_revenue || 0, color: COLORS.primary },
    { name: "R&D", value: period.research_development || 0, color: COLORS.success },
    { name: "SG&A", value: period.selling_general_administrative || 0, color: COLORS.warning },
  ].filter((e) => e.value > 0);

  if (expenses.length === 0) {
    return <div className="text-sm text-slate-500">No expense data available</div>;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={expenses}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            label={(props) => `${props.name ?? ""}: ${(((props.percent as number | undefined) ?? 0) * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {expenses.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => formatCurrency(v)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Balance Sheet Tab
function BalanceSheetTab({
  balanceAsc,
  balance,
  periodType,
}: Readonly<{ balanceAsc: BalanceRow[]; balance: BalanceRow[]; periodType: string }>) {
  const fmt = (d: string) => periodType === "quarterly" ? formatQuarter(d) : formatYear(d);
  const chartData = balanceAsc.map((f) => ({
    period: fmt(f.date),
    assets: f.total_assets ? f.total_assets / 1e9 : 0,
    liabilities: f.total_liabilities ? f.total_liabilities / 1e9 : 0,
    equity: f.total_stockholder_equity ? f.total_stockholder_equity / 1e9 : 0,
  }));
  const top5 = balance.slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Balance Sheet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2 text-left">Metric</th>
                  {top5.map((f) => (
                    <th key={f.date} className="py-2 text-right">{fmt(f.date)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <BalanceTableRow label="Total Assets" rows={top5} field="total_assets" format={formatCurrency} highlight />
                <BalanceTableRow label="Current Assets" rows={top5} field="total_current_assets" format={formatCurrency} />
                <BalanceTableRow label="Cash & Equiv." rows={top5} field="cash_and_equivalents" format={formatCurrency} />
                <BalanceTableRow label="Total Liabilities" rows={top5} field="total_liabilities" format={formatCurrency} highlight />
                <BalanceTableRow label="Current Liabilities" rows={top5} field="total_current_liabilities" format={formatCurrency} />
                <BalanceTableRow label="Long Term Debt" rows={top5} field="long_term_debt" format={formatCurrency} />
                <BalanceTableRow label="Stockholder Equity" rows={top5} field="total_stockholder_equity" format={formatCurrency} highlight />
                <BalanceTableRow label="Net Debt" rows={top5} field="net_debt" format={formatCurrency} />
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assets vs Liabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="period" type="category" tick={{ fontSize: 10 }} width={60} />
                <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}B`, ""]} />
                <Legend />
                <Bar dataKey="assets" name="Assets" fill={COLORS.success} radius={[0, 4, 4, 0]} />
                <Bar dataKey="liabilities" name="Liabilities" fill={COLORS.danger} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Cash Flow Tab
function CashFlowTab({
  cashflowAsc,
  cashflow,
  periodType,
}: Readonly<{ cashflowAsc: CashFlowRow[]; cashflow: CashFlowRow[]; periodType: string }>) {
  const fmt = (d: string) => periodType === "quarterly" ? formatQuarter(d) : formatYear(d);
  const chartData = cashflowAsc.map((f) => ({
    period: fmt(f.date),
    operatingCF: f.total_cash_from_operating_activities ? f.total_cash_from_operating_activities / 1e9 : 0,
    capex: f.capital_expenditures ? Math.abs(f.capital_expenditures) / 1e9 : 0,
    freeCF: f.free_cash_flow ? f.free_cash_flow / 1e9 : 0,
  }));
  const top5 = cashflow.slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Cash Flow Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2 text-left">Metric</th>
                  {top5.map((f) => (
                    <th key={f.date} className="py-2 text-right">{fmt(f.date)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <CashFlowTableRow label="Operating Cash Flow" rows={top5} field="total_cash_from_operating_activities" format={formatCurrency} highlight />
                <CashFlowTableRow label="Investing Cash Flow" rows={top5} field="total_cashflows_from_investing_activities" format={formatCurrency} />
                <CashFlowTableRow label="Financing Cash Flow" rows={top5} field="total_cash_from_financing_activities" format={formatCurrency} />
                <CashFlowTableRow label="CapEx" rows={top5} field="capital_expenditures" format={formatCurrency} />
                <CashFlowTableRow label="Dividends Paid" rows={top5} field="dividends_paid" format={formatCurrency} />
                <CashFlowTableRow label="Free Cash Flow" rows={top5} field="free_cash_flow" format={formatCurrency} highlight />
                <CashFlowTableRow label="Stock-Based Comp" rows={top5} field="stock_based_compensation" format={formatCurrency} />
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">FCF Generation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}B`, ""]} />
                <Legend />
                <Bar dataKey="operatingCF" name="Op. CF" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="capex" name="CapEx" fill={COLORS.danger} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="freeCF" name="Free CF" stroke={COLORS.success} strokeWidth={2} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


// Typed table row helpers for each statement type
function IncomeTableRow({ label, rows, field, format, highlight = false }: Readonly<{ label: string; rows: IncomeRow[]; field: keyof IncomeRow; format: (v: number | null) => string; highlight?: boolean }>) {
  return (
    <tr className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${highlight ? "bg-slate-50/50 dark:bg-slate-800/30 font-medium" : ""}`}>
      <td className="py-2 text-slate-700 dark:text-slate-300">{label}</td>
      {rows.map((f) => (
        <td key={f.date} className="py-2 text-right text-slate-900 dark:text-white font-mono">
          {format(f[field] as number | null)}
        </td>
      ))}
    </tr>
  );
}

function BalanceTableRow({ label, rows, field, format, highlight = false }: Readonly<{ label: string; rows: BalanceRow[]; field: keyof BalanceRow; format: (v: number | null) => string; highlight?: boolean }>) {
  return (
    <tr className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${highlight ? "bg-slate-50/50 dark:bg-slate-800/30 font-medium" : ""}`}>
      <td className="py-2 text-slate-700 dark:text-slate-300">{label}</td>
      {rows.map((f) => (
        <td key={f.date} className="py-2 text-right text-slate-900 dark:text-white font-mono">
          {format(f[field] as number | null)}
        </td>
      ))}
    </tr>
  );
}

function CashFlowTableRow({ label, rows, field, format, highlight = false }: Readonly<{ label: string; rows: CashFlowRow[]; field: keyof CashFlowRow; format: (v: number | null) => string; highlight?: boolean }>) {
  return (
    <tr className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${highlight ? "bg-slate-50/50 dark:bg-slate-800/30 font-medium" : ""}`}>
      <td className="py-2 text-slate-700 dark:text-slate-300">{label}</td>
      {rows.map((f) => (
        <td key={f.date} className="py-2 text-right text-slate-900 dark:text-white font-mono">
          {format(f[field] as number | null)}
        </td>
      ))}
    </tr>
  );
}

export default FinancialsPageContent;
