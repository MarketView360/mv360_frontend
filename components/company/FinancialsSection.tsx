"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
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
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface FinancialPeriod {
  period_end: string;
  period_type: string;
  // Income Statement
  revenue: number | null;
  gross_profit: number | null;
  operating_income: number | null;
  net_income: number | null;
  ebitda: number | null;
  eps_basic: number | null;
  eps_diluted: number | null;
  // Margins
  gross_margin: number | null;
  operating_margin: number | null;
  net_margin: number | null;
  // Balance Sheet
  total_assets: number | null;
  total_liabilities: number | null;
  stockholder_equity: number | null;
  total_debt: number | null;
  cash_and_equivalents: number | null;
  current_assets: number | null;
  current_liabilities: number | null;
  // Cash Flow
  operating_cf: number | null;
  investing_cf: number | null;
  financing_cf: number | null;
  free_cash_flow: number | null;
  capex: number | null;
  // Ratios
  current_ratio: number | null;
  debt_to_equity: number | null;
}

interface FinancialsSectionProps {
  ticker: string;
}

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

const formatNumber = (value: number | null): string => {
  if (value === null) return "—";
  return value.toFixed(2);
};

const formatQuarter = (dateStr: string): string => {
  const date = new Date(dateStr);
  const quarter = Math.ceil((date.getMonth() + 1) / 3);
  return `Q${quarter} ${date.getFullYear()}`;
};

const TrendIndicator = ({ current, previous }: { current: number | null; previous: number | null }) => {
  if (current === null || previous === null || previous === 0) {
    return <Minus className="w-4 h-4 text-slate-400" />;
  }
  const change = ((current - previous) / Math.abs(previous)) * 100;
  if (change > 0) {
    return (
      <span className="flex items-center text-growth-600 dark:text-growth-400 text-xs font-mono">
        <TrendingUp className="w-3 h-3 mr-1" />
        +{change.toFixed(1)}%
      </span>
    );
  }
  if (change < 0) {
    return (
      <span className="flex items-center text-danger-600 dark:text-danger-400 text-xs font-mono">
        <TrendingDown className="w-3 h-3 mr-1" />
        {change.toFixed(1)}%
      </span>
    );
  }
  return <Minus className="w-4 h-4 text-slate-400" />;
};

export function FinancialsSection({ ticker }: FinancialsSectionProps) {
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
        if (!res.ok) {
          throw new Error("Failed to fetch financials");
        }
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Statements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || financials.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Statements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
            {error
              ? "We couldn\'t load this company\'s financial statements right now. Please refresh the page or try again shortly."
              : "Financial statements for this company aren\'t available yet. They\'ll appear here once reporting data has been processed."}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort by date descending for table, ascending for charts
  const sortedDesc = [...financials].sort(
    (a, b) => new Date(b.period_end).getTime() - new Date(a.period_end).getTime()
  );
  const sortedAsc = [...financials].sort(
    (a, b) => new Date(a.period_end).getTime() - new Date(b.period_end).getTime()
  );

  // Prepare chart data
  const revenueChartData = sortedAsc.map((f) => ({
    period: periodType === "quarterly" ? formatQuarter(f.period_end) : new Date(f.period_end).getFullYear().toString(),
    revenue: f.revenue ? f.revenue / 1e9 : 0,
    netIncome: f.net_income ? f.net_income / 1e9 : 0,
  }));

  const marginChartData = sortedAsc.map((f) => ({
    period: periodType === "quarterly" ? formatQuarter(f.period_end) : new Date(f.period_end).getFullYear().toString(),
    grossMargin: f.gross_margin ? f.gross_margin * 100 : null,
    operatingMargin: f.operating_margin ? f.operating_margin * 100 : null,
    netMargin: f.net_margin ? f.net_margin * 100 : null,
  }));

  const cashFlowChartData = sortedAsc.map((f) => ({
    period: periodType === "quarterly" ? formatQuarter(f.period_end) : new Date(f.period_end).getFullYear().toString(),
    operatingCF: f.operating_cf ? f.operating_cf / 1e9 : 0,
    freeCF: f.free_cash_flow ? f.free_cash_flow / 1e9 : 0,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Financial Statements</CardTitle>
          <Select value={periodType} onValueChange={(v) => setPeriodType(v as "quarterly" | "annual")}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="income">
          <TabsList className="mb-4">
            <TabsTrigger value="income">Income Statement</TabsTrigger>
            <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
            <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>

          {/* Income Statement Tab */}
          <TabsContent value="income">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2 text-left">Metric</th>
                    {sortedDesc.slice(0, 5).map((f) => (
                      <th key={f.period_end} className="py-2 text-right">
                        {periodType === "quarterly" ? formatQuarter(f.period_end) : new Date(f.period_end).getFullYear()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <TableRow label="Revenue" data={sortedDesc.slice(0, 5)} field="revenue" format={formatCurrency} />
                  <TableRow label="Gross Profit" data={sortedDesc.slice(0, 5)} field="gross_profit" format={formatCurrency} />
                  <TableRow label="Operating Income" data={sortedDesc.slice(0, 5)} field="operating_income" format={formatCurrency} />
                  <TableRow label="Net Income" data={sortedDesc.slice(0, 5)} field="net_income" format={formatCurrency} />
                  <TableRow label="EBITDA" data={sortedDesc.slice(0, 5)} field="ebitda" format={formatCurrency} />
                  <TableRow label="EPS (Diluted)" data={sortedDesc.slice(0, 5)} field="eps_diluted" format={formatNumber} />
                  <TableRow label="Gross Margin" data={sortedDesc.slice(0, 5)} field="gross_margin" format={formatPercent} />
                  <TableRow label="Operating Margin" data={sortedDesc.slice(0, 5)} field="operating_margin" format={formatPercent} />
                  <TableRow label="Net Margin" data={sortedDesc.slice(0, 5)} field="net_margin" format={formatPercent} />
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Balance Sheet Tab */}
          <TabsContent value="balance">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2 text-left">Metric</th>
                    {sortedDesc.slice(0, 5).map((f) => (
                      <th key={f.period_end} className="py-2 text-right">
                        {periodType === "quarterly" ? formatQuarter(f.period_end) : new Date(f.period_end).getFullYear()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <TableRow label="Total Assets" data={sortedDesc.slice(0, 5)} field="total_assets" format={formatCurrency} />
                  <TableRow label="Current Assets" data={sortedDesc.slice(0, 5)} field="current_assets" format={formatCurrency} />
                  <TableRow label="Cash & Equivalents" data={sortedDesc.slice(0, 5)} field="cash_and_equivalents" format={formatCurrency} />
                  <TableRow label="Total Liabilities" data={sortedDesc.slice(0, 5)} field="total_liabilities" format={formatCurrency} />
                  <TableRow label="Current Liabilities" data={sortedDesc.slice(0, 5)} field="current_liabilities" format={formatCurrency} />
                  <TableRow label="Total Debt" data={sortedDesc.slice(0, 5)} field="total_debt" format={formatCurrency} />
                  <TableRow label="Stockholder Equity" data={sortedDesc.slice(0, 5)} field="stockholder_equity" format={formatCurrency} />
                  <TableRow label="Current Ratio" data={sortedDesc.slice(0, 5)} field="current_ratio" format={formatNumber} />
                  <TableRow label="Debt/Equity" data={sortedDesc.slice(0, 5)} field="debt_to_equity" format={formatNumber} />
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Cash Flow Tab */}
          <TabsContent value="cashflow">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2 text-left">Metric</th>
                    {sortedDesc.slice(0, 5).map((f) => (
                      <th key={f.period_end} className="py-2 text-right">
                        {periodType === "quarterly" ? formatQuarter(f.period_end) : new Date(f.period_end).getFullYear()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <TableRow label="Operating Cash Flow" data={sortedDesc.slice(0, 5)} field="operating_cf" format={formatCurrency} />
                  <TableRow label="Investing Cash Flow" data={sortedDesc.slice(0, 5)} field="investing_cf" format={formatCurrency} />
                  <TableRow label="Financing Cash Flow" data={sortedDesc.slice(0, 5)} field="financing_cf" format={formatCurrency} />
                  <TableRow label="Capital Expenditure" data={sortedDesc.slice(0, 5)} field="capex" format={formatCurrency} />
                  <TableRow label="Free Cash Flow" data={sortedDesc.slice(0, 5)} field="free_cash_flow" format={formatCurrency} />
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts">
            <div className="space-y-8">
              {/* Revenue & Net Income Chart */}
              <div>
                <h4 className="text-sm font-medium mb-4">Revenue & Net Income (Billions)</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                      <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--background)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`$${value.toFixed(2)}B`, ""]}
                      />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="netIncome" name="Net Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Margin Trends Chart */}
              <div>
                <h4 className="text-sm font-medium mb-4">Margin Trends (%)</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={marginChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                      <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--background)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`${value?.toFixed(2)}%`, ""]}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="grossMargin" name="Gross Margin" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="operatingMargin" name="Operating Margin" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="netMargin" name="Net Margin" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Cash Flow Chart */}
              <div>
                <h4 className="text-sm font-medium mb-4">Cash Flow (Billions)</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashFlowChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                      <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--background)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`$${value.toFixed(2)}B`, ""]}
                      />
                      <Legend />
                      <Bar dataKey="operatingCF" name="Operating CF" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="freeCF" name="Free Cash Flow" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default FinancialsSection;

// Helper component for table rows
function TableRow<K extends keyof FinancialPeriod>({
  label,
  data,
  field,
  format,
}: {
  label: string;
  data: FinancialPeriod[];
  field: K;
  format: (value: number | null) => string;
}) {
  return (
    <tr className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
      <td className="py-2 text-slate-600 dark:text-slate-300">{label}</td>
      {data.map((f, idx) => (
        <td key={f.period_end} className="py-2 text-right font-medium text-slate-900 dark:text-white">
          <div className="flex flex-col items-end">
            <span className="font-mono">{format(f[field] as number | null)}</span>
            {idx < data.length - 1 && (
              <TrendIndicator
                current={f[field] as number | null}
                previous={data[idx + 1][field] as number | null}
              />
            )}
          </div>
        </td>
      ))}
    </tr>
  );
}
