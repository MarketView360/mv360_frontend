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
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
  ComposedChart,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  BarChart3,
  PieChartIcon,
  Wallet,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FinancialPeriod {
  period_end: string;
  period_type: string;
  revenue: number | null;
  cost_of_revenue: number | null;
  gross_profit: number | null;
  operating_income: number | null;
  net_income: number | null;
  ebitda: number | null;
  eps_basic: number | null;
  eps_diluted: number | null;
  gross_margin: number | null;
  operating_margin: number | null;
  net_margin: number | null;
  ebitda_margin: number | null;
  total_assets: number | null;
  total_liabilities: number | null;
  stockholder_equity: number | null;
  total_debt: number | null;
  cash_and_equivalents: number | null;
  current_assets: number | null;
  current_liabilities: number | null;
  operating_cf: number | null;
  investing_cf: number | null;
  financing_cf: number | null;
  free_cash_flow: number | null;
  capex: number | null;
  dividends_paid: number | null;
  current_ratio: number | null;
  quick_ratio: number | null;
  debt_to_equity: number | null;
  debt_to_assets: number | null;
  roe: number | null;
  roa: number | null;
  research_development: number | null;
  selling_general_admin: number | null;
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
  const [financials, setFinancials] = useState<FinancialPeriod[]>([]);
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
          `${baseUrl}/api/company/${encodeURIComponent(ticker)}/financials?type=${periodType}&limit=20`
        );
        if (!res.ok) throw new Error("Failed to fetch financials");
        const data = await res.json();
        setFinancials(data.financials || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchFinancials();
  }, [ticker, periodType]);

  const sortedAsc = useMemo(
    () => [...financials].sort((a, b) => new Date(a.period_end).getTime() - new Date(b.period_end).getTime()),
    [financials]
  );

  const sortedDesc = useMemo(
    () => [...financials].sort((a, b) => new Date(b.period_end).getTime() - new Date(a.period_end).getTime()),
    [financials]
  );

  const latestPeriod = sortedDesc[0];
  const previousPeriod = sortedDesc[1];

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || financials.length === 0) {
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
      <KeyHighlights latestPeriod={latestPeriod} previousPeriod={previousPeriod} metrics={metrics} periodType={periodType} />

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="ratios">Ratios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab data={sortedAsc} periodType={periodType} />
        </TabsContent>

        <TabsContent value="income">
          <IncomeStatementTab data={sortedAsc} sortedDesc={sortedDesc} periodType={periodType} />
        </TabsContent>

        <TabsContent value="balance">
          <BalanceSheetTab data={sortedAsc} sortedDesc={sortedDesc} periodType={periodType} />
        </TabsContent>

        <TabsContent value="cashflow">
          <CashFlowTab data={sortedAsc} sortedDesc={sortedDesc} periodType={periodType} />
        </TabsContent>

        <TabsContent value="ratios">
          <RatiosTab data={sortedAsc} sortedDesc={sortedDesc} periodType={periodType} />
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
  latestPeriod,
  previousPeriod,
  metrics,
  periodType,
}: Readonly<{
  latestPeriod: FinancialPeriod;
  previousPeriod?: FinancialPeriod;
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
      value: formatCurrency(latestPeriod.revenue),
      change: calcChange(latestPeriod.revenue, previousPeriod?.revenue ?? null),
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "Net Income",
      value: formatCurrency(latestPeriod.net_income),
      change: calcChange(latestPeriod.net_income, previousPeriod?.net_income ?? null),
      icon: BarChart3,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
      label: "Free Cash Flow",
      value: formatCurrency(latestPeriod.free_cash_flow),
      change: calcChange(latestPeriod.free_cash_flow, previousPeriod?.free_cash_flow ?? null),
      icon: Wallet,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      label: "Total Assets",
      value: formatCurrency(latestPeriod.total_assets),
      change: calcChange(latestPeriod.total_assets, previousPeriod?.total_assets ?? null),
      icon: Building2,
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {highlights.map((h) => (
        <Card key={h.label} className={`${h.bgColor} border-0`}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <h.icon className={`w-5 h-5 ${h.color}`} />
              {h.change !== null && (
                <Badge
                  variant="outline"
                  className={`text-xs ${h.change >= 0
                    ? "bg-green-100 text-green-700 border-green-200"
                    : "bg-red-100 text-red-700 border-red-200"
                    }`}
                >
                  {h.change >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                  {Math.abs(h.change).toFixed(1)}%
                </Badge>
              )}
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{h.value}</div>
            <div className="text-xs text-slate-500 mt-1">{h.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Overview Tab
function OverviewTab({ data, periodType }: Readonly<{ data: FinancialPeriod[]; periodType: string }>) {
  const chartData = data.map((f) => ({
    period: periodType === "quarterly" ? formatQuarter(f.period_end) : formatYear(f.period_end),
    revenue: f.revenue ? f.revenue / 1e9 : 0,
    netIncome: f.net_income ? f.net_income / 1e9 : 0,
    grossProfit: f.gross_profit ? f.gross_profit / 1e9 : 0,
  }));

  const marginData = data.map((f) => ({
    period: periodType === "quarterly" ? formatQuarter(f.period_end) : formatYear(f.period_end),
    grossMargin: f.gross_margin ? f.gross_margin * 100 : null,
    operatingMargin: f.operating_margin ? f.operating_margin * 100 : null,
    netMargin: f.net_margin ? f.net_margin * 100 : null,
  }));

  const cashFlowData = data.map((f) => ({
    period: periodType === "quarterly" ? formatQuarter(f.period_end) : formatYear(f.period_end),
    operatingCF: f.operating_cf ? f.operating_cf / 1e9 : 0,
    investingCF: f.investing_cf ? f.investing_cf / 1e9 : 0,
    financingCF: f.financing_cf ? f.financing_cf / 1e9 : 0,
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
  data,
  sortedDesc,
  periodType,
}: Readonly<{ data: FinancialPeriod[]; sortedDesc: FinancialPeriod[]; periodType: string }>) {
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
                  {sortedDesc.slice(0, 5).map((f) => (
                    <th key={f.period_end} className="py-2 text-right">
                      {periodType === "quarterly" ? formatQuarter(f.period_end) : formatYear(f.period_end)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <TableRow label="Revenue" data={sortedDesc.slice(0, 5)} field="revenue" format={formatCurrency} />
                <TableRow label="Cost of Revenue" data={sortedDesc.slice(0, 5)} field="cost_of_revenue" format={formatCurrency} />
                <TableRow label="Gross Profit" data={sortedDesc.slice(0, 5)} field="gross_profit" format={formatCurrency} highlight />
                <TableRow label="R&D Expenses" data={sortedDesc.slice(0, 5)} field="research_development" format={formatCurrency} />
                <TableRow label="SG&A Expenses" data={sortedDesc.slice(0, 5)} field="selling_general_admin" format={formatCurrency} />
                <TableRow label="Operating Income" data={sortedDesc.slice(0, 5)} field="operating_income" format={formatCurrency} highlight />
                <TableRow label="EBITDA" data={sortedDesc.slice(0, 5)} field="ebitda" format={formatCurrency} />
                <TableRow label="Net Income" data={sortedDesc.slice(0, 5)} field="net_income" format={formatCurrency} highlight />
                <TableRow label="EPS (Diluted)" data={sortedDesc.slice(0, 5)} field="eps_diluted" format={(v) => formatNumber(v)} />
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
          <ExpenseBreakdownPie period={sortedDesc[0]} />
        </CardContent>
      </Card>
    </div>
  );
}

function ExpenseBreakdownPie({ period }: Readonly<{ period: FinancialPeriod }>) {
  const expenses = [
    { name: "Cost of Revenue", value: period.cost_of_revenue || 0, color: COLORS.primary },
    { name: "R&D", value: period.research_development || 0, color: COLORS.success },
    { name: "SG&A", value: period.selling_general_admin || 0, color: COLORS.warning },
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
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
  data,
  sortedDesc,
  periodType,
}: Readonly<{ data: FinancialPeriod[]; sortedDesc: FinancialPeriod[]; periodType: string }>) {
  const chartData = data.map((f) => ({
    period: periodType === "quarterly" ? formatQuarter(f.period_end) : formatYear(f.period_end),
    assets: f.total_assets ? f.total_assets / 1e9 : 0,
    liabilities: f.total_liabilities ? f.total_liabilities / 1e9 : 0,
    equity: f.stockholder_equity ? f.stockholder_equity / 1e9 : 0,
  }));

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
                  {sortedDesc.slice(0, 5).map((f) => (
                    <th key={f.period_end} className="py-2 text-right">
                      {periodType === "quarterly" ? formatQuarter(f.period_end) : formatYear(f.period_end)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <TableRow label="Total Assets" data={sortedDesc.slice(0, 5)} field="total_assets" format={formatCurrency} highlight />
                <TableRow label="Current Assets" data={sortedDesc.slice(0, 5)} field="current_assets" format={formatCurrency} />
                <TableRow label="Cash & Equiv." data={sortedDesc.slice(0, 5)} field="cash_and_equivalents" format={formatCurrency} />
                <TableRow label="Total Liabilities" data={sortedDesc.slice(0, 5)} field="total_liabilities" format={formatCurrency} highlight />
                <TableRow label="Current Liabilities" data={sortedDesc.slice(0, 5)} field="current_liabilities" format={formatCurrency} />
                <TableRow label="Total Debt" data={sortedDesc.slice(0, 5)} field="total_debt" format={formatCurrency} />
                <TableRow label="Stockholder Equity" data={sortedDesc.slice(0, 5)} field="stockholder_equity" format={formatCurrency} highlight />
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
  data,
  sortedDesc,
  periodType,
}: Readonly<{ data: FinancialPeriod[]; sortedDesc: FinancialPeriod[]; periodType: string }>) {
  const chartData = data.map((f) => ({
    period: periodType === "quarterly" ? formatQuarter(f.period_end) : formatYear(f.period_end),
    operatingCF: f.operating_cf ? f.operating_cf / 1e9 : 0,
    capex: f.capex ? Math.abs(f.capex) / 1e9 : 0,
    freeCF: f.free_cash_flow ? f.free_cash_flow / 1e9 : 0,
  }));

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
                  {sortedDesc.slice(0, 5).map((f) => (
                    <th key={f.period_end} className="py-2 text-right">
                      {periodType === "quarterly" ? formatQuarter(f.period_end) : formatYear(f.period_end)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <TableRow label="Operating Cash Flow" data={sortedDesc.slice(0, 5)} field="operating_cf" format={formatCurrency} highlight />
                <TableRow label="Investing Cash Flow" data={sortedDesc.slice(0, 5)} field="investing_cf" format={formatCurrency} />
                <TableRow label="Financing Cash Flow" data={sortedDesc.slice(0, 5)} field="financing_cf" format={formatCurrency} />
                <TableRow label="CapEx" data={sortedDesc.slice(0, 5)} field="capex" format={formatCurrency} />
                <TableRow label="Dividends Paid" data={sortedDesc.slice(0, 5)} field="dividends_paid" format={formatCurrency} />
                <TableRow label="Free Cash Flow" data={sortedDesc.slice(0, 5)} field="free_cash_flow" format={formatCurrency} highlight />
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

// Ratios Tab
function RatiosTab({
  data,
  sortedDesc,
  periodType,
}: Readonly<{ data: FinancialPeriod[]; sortedDesc: FinancialPeriod[]; periodType: string }>) {
  const chartData = data.map((f) => ({
    period: periodType === "quarterly" ? formatQuarter(f.period_end) : formatYear(f.period_end),
    currentRatio: f.current_ratio,
    quickRatio: f.quick_ratio,
    debtToEquity: f.debt_to_equity,
    roe: f.roe ? f.roe * 100 : null,
    roa: f.roa ? f.roa * 100 : null,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Liquidity Ratios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Liquidity Ratios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [v?.toFixed(2), ""]} />
                <Legend />
                <ReferenceLine y={1} stroke="#94a3b8" strokeDasharray="5 5" label="1.0" />
                <Line type="monotone" dataKey="currentRatio" name="Current Ratio" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="quickRatio" name="Quick Ratio" stroke={COLORS.success} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Leverage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [v?.toFixed(2), ""]} />
                <Legend />
                <Area type="monotone" dataKey="debtToEquity" name="Debt/Equity" stroke={COLORS.danger} fill={COLORS.danger} fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Return Ratios */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Profitability Returns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [`${v?.toFixed(2)}%`, ""]} />
                <Legend />
                <Area type="monotone" dataKey="roe" name="ROE %" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.3} />
                <Area type="monotone" dataKey="roa" name="ROA %" stroke={COLORS.success} fill={COLORS.success} fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Table Row Helper
function TableRow({
  label,
  data,
  field,
  format,
  highlight = false,
}: Readonly<{
  label: string;
  data: FinancialPeriod[];
  field: keyof FinancialPeriod;
  format: (value: number | null) => string;
  highlight?: boolean;
}>) {
  return (
    <tr className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${highlight ? "bg-slate-50/50 dark:bg-slate-800/30 font-medium" : ""}`}>
      <td className="py-2 text-slate-700 dark:text-slate-300">{label}</td>
      {data.map((f) => (
        <td key={f.period_end} className="py-2 text-right text-slate-900 dark:text-white font-mono">
          {format(f[field] as number | null)}
        </td>
      ))}
    </tr>
  );
}

export default FinancialsPageContent;
