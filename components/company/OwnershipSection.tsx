"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Building2,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  AlertCircle,
  User,
  Briefcase,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface InstitutionalHolder {
  holder_name?: string;
  fund_name?: string;
  report_date: string;
  total_shares_percent: number | null;
  total_assets_percent: number | null;
  current_shares: number | null;
  change_shares: number | null;
  change_percent: number | null;
}

interface InsiderTransaction {
  transaction_date: string;
  owner_name: string;
  owner_cik: string | null;
  transaction_code: string;
  transaction_amount: number | null;
  transaction_price: number | null;
  transaction_acquired_disposed: string | null;
  post_transaction_amount: number | null;
  sec_link: string | null;
}

interface Officer {
  name: string;
  title: string;
  yearBorn: string | null;
}

interface HoldersResponse {
  ticker: string;
  institutional: InstitutionalHolder[];
  fund: InstitutionalHolder[];
}

interface InsidersResponse {
  ticker: string;
  transactions: InsiderTransaction[];
}

interface OfficersResponse {
  ticker: string;
  officers: Officer[];
}

interface OwnershipSectionProps {
  ticker: string;
}

// EODHD transaction codes
const TRANSACTION_CODE_MAP: Record<string, { label: string; color: string }> = {
  P: { label: "Purchase", color: "green" },
  S: { label: "Sale", color: "red" },
  A: { label: "Award", color: "blue" },
  D: { label: "Disposition", color: "red" },
  F: { label: "Tax Withholding", color: "slate" },
  G: { label: "Gift", color: "purple" },
  I: { label: "Discretionary", color: "slate" },
  J: { label: "Other", color: "slate" },
  M: { label: "Option Exercise", color: "blue" },
  W: { label: "Will/Inheritance", color: "slate" },
};

function formatShares(n: number | null): string {
  if (n === null || n === undefined) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatPercent(n: number | null, decimals = 2): string {
  if (n === null || n === undefined) return "—";
  return `${Number(n).toFixed(decimals)}%`;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function OwnershipSection({ ticker }: Readonly<OwnershipSectionProps>) {
  const [holders, setHolders] = useState<HoldersResponse | null>(null);
  const [insiders, setInsiders] = useState<InsidersResponse | null>(null);
  const [officers, setOfficers] = useState<OfficersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
        const enc = encodeURIComponent(ticker);
        const [holdersRes, insidersRes, officersRes] = await Promise.all([
          fetch(`${baseUrl}/api/company/${enc}/holders`),
          fetch(`${baseUrl}/api/company/${enc}/insiders`),
          fetch(`${baseUrl}/api/company/${enc}/officers`),
        ]);
        if (!holdersRes.ok || !insidersRes.ok || !officersRes.ok) {
          throw new Error("Failed to fetch ownership data");
        }
        const [holdersData, insidersData, officersData] = await Promise.all([
          holdersRes.json() as Promise<HoldersResponse>,
          insidersRes.json() as Promise<InsidersResponse>,
          officersRes.json() as Promise<OfficersResponse>,
        ]);
        setHolders(holdersData);
        setInsiders(insidersData);
        setOfficers(officersData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [ticker]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-sm text-slate-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ownership & Management</h2>

      <Tabs defaultValue="institutional" className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg flex gap-1 w-fit border-0">
          <TabsTrigger 
            value="institutional" 
            className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-transparent"
          >
            <Building2 className="w-4 h-4" />
            Institutional
          </TabsTrigger>
          <TabsTrigger 
            value="insiders" 
            className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-transparent"
          >
            <TrendingUp className="w-4 h-4" />
            Insider Trades
          </TabsTrigger>
          <TabsTrigger 
            value="officers" 
            className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-transparent"
          >
            <Users className="w-4 h-4" />
            Management
          </TabsTrigger>
        </TabsList>

        {/* Institutional Holders Tab */}
        <TabsContent value="institutional" className="space-y-6">
          <InstitutionalHoldersTab holders={holders} />
        </TabsContent>

        {/* Insider Transactions Tab */}
        <TabsContent value="insiders" className="space-y-6">
          <InsiderTransactionsTab insiders={insiders} />
        </TabsContent>

        {/* Officers Tab */}
        <TabsContent value="officers" className="space-y-6">
          <OfficersTab officers={officers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InstitutionalHoldersTab({ holders }: Readonly<{ holders: HoldersResponse | null }>) {
  const [view, setView] = useState<"institutional" | "fund">("institutional");
  const data = view === "institutional" ? (holders?.institutional ?? []) : (holders?.fund ?? []);

  const topForChart = data.slice(0, 10);
  const chartData = topForChart.map((h) => {
    const displayName = h.holder_name ?? h.fund_name ?? "Unknown";
    return {
      name: displayName.length > 20 ? displayName.slice(0, 20) + "…" : displayName,
      shares_pct: h.total_shares_percent ? Number(h.total_shares_percent) : 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Toggle */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg w-fit">
        <button
          onClick={() => setView("institutional")}
          className={cn(
            "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
            view === "institutional"
              ? "bg-white text-slate-900 dark:bg-slate-700 dark:text-slate-100 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
          )}
        >
          Institutional ({holders?.institutional.length ?? 0})
        </button>
        <button
          onClick={() => setView("fund")}
          className={cn(
            "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
            view === "fund"
              ? "bg-white text-slate-900 dark:bg-slate-700 dark:text-slate-100 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
          )}
        >
          Fund Holders ({holders?.fund.length ?? 0})
        </button>
      </div>

      {data.length === 0 ? (
        <EmptyState message="No holder data available." />
      ) : (
        <>
          {/* Top holders bar chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top 10 by % Shares Held</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                    <XAxis type="number" tick={{ fontSize: 10 }} unit="%" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={140} />
                    <Tooltip formatter={(v: number) => [`${v.toFixed(3)}%`, "Shares %"]} />
                    <Bar dataKey="shares_pct" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {view === "institutional" ? "Institutional" : "Fund"} Holders
              </CardTitle>
              <CardDescription>{data.length} holders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2 text-left">Holder</th>
                      <th className="py-2 text-right">Shares</th>
                      <th className="py-2 text-right">% Shares</th>
                      <th className="py-2 text-right">Change</th>
                      <th className="py-2 text-right">Change %</th>
                      <th className="py-2 text-right">Report Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.map((h, i) => {
                      const chg = h.change_shares ?? 0;
                      const isUp = chg > 0;
                      const isDown = chg < 0;
                      const displayName = h.holder_name ?? h.fund_name ?? "Unknown";
                      return (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-2 text-slate-900 dark:text-white font-medium max-w-[200px] truncate">{displayName}</td>
                          <td className="py-2 text-right font-mono text-slate-700 dark:text-slate-300">{formatShares(h.current_shares)}</td>
                          <td className="py-2 text-right font-mono text-slate-700 dark:text-slate-300">{formatPercent(h.total_shares_percent, 3)}</td>
                          <td className={`py-2 text-right font-mono ${isUp ? "text-green-600" : isDown ? "text-red-500" : "text-slate-500"}`}>
                            {chg !== 0 ? (isUp ? "+" : "") + formatShares(chg) : "—"}
                          </td>
                          <td className={`py-2 text-right font-mono ${isUp ? "text-green-600" : isDown ? "text-red-500" : "text-slate-500"}`}>
                            {h.change_percent !== null ? `${Number(h.change_percent) > 0 ? "+" : ""}${Number(h.change_percent).toFixed(2)}%` : "—"}
                          </td>
                          <td className="py-2 text-right text-slate-500 text-xs">{h.report_date ? formatDate(h.report_date) : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function InsiderTransactionsTab({ insiders }: Readonly<{ insiders: InsidersResponse | null }>) {
  const transactions = insiders?.transactions ?? [];

  if (transactions.length === 0) {
    return <EmptyState message="No insider transaction data available." />;
  }

  // Summary stats
  const purchases = transactions.filter((t) => t.transaction_acquired_disposed === "A" || t.transaction_code === "P");
  const sales = transactions.filter((t) => t.transaction_acquired_disposed === "D" || t.transaction_code === "S");

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 dark:bg-green-950/30 border-0">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-slate-500">Acquisitions</span>
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">{purchases.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/30 border-0">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-xs text-slate-500">Disposals</span>
            </div>
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">{sales.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 dark:bg-slate-800/50 border-0">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Minus className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-500">Total (last 100)</span>
            </div>
            <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">{transactions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Insider Transactions</CardTitle>
          <CardDescription>SEC-filed transactions (last 100)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2 text-left">Date</th>
                  <th className="py-2 text-left">Insider</th>
                  <th className="py-2 text-center">Type</th>
                  <th className="py-2 text-right">Shares</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Value</th>
                  <th className="py-2 text-right">Post-Tx Shares</th>
                  <th className="py-2 text-center">SEC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.map((t, i) => {
                  const code = t.transaction_code ?? "?";
                  const meta = TRANSACTION_CODE_MAP[code] ?? { label: code, color: "slate" };
                  const isAcquired = t.transaction_acquired_disposed === "A";
                  const isDisposed = t.transaction_acquired_disposed === "D";
                  const value =
                    t.transaction_amount && t.transaction_price
                      ? t.transaction_amount * Number(t.transaction_price)
                      : null;
                  return (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2 text-slate-500 text-xs whitespace-nowrap">{formatDate(t.transaction_date)}</td>
                      <td className="py-2 text-slate-900 dark:text-white font-medium max-w-[160px] truncate">{t.owner_name}</td>
                      <td className="py-2 text-center">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            meta.color === "green"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : meta.color === "red"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : meta.color === "blue"
                              ? "bg-blue-100 text-blue-700 border-blue-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {isAcquired ? "▲ " : isDisposed ? "▼ " : ""}
                          {meta.label}
                        </Badge>
                      </td>
                      <td className={`py-2 text-right font-mono ${isAcquired ? "text-green-600" : isDisposed ? "text-red-500" : "text-slate-700"}`}>
                        {t.transaction_amount !== null ? (isAcquired ? "+" : isDisposed ? "-" : "") + formatShares(t.transaction_amount) : "—"}
                      </td>
                      <td className="py-2 text-right font-mono text-slate-700 dark:text-slate-300">
                        {t.transaction_price ? `$${Number(t.transaction_price).toFixed(2)}` : "—"}
                      </td>
                      <td className="py-2 text-right font-mono text-slate-700 dark:text-slate-300">
                        {value !== null ? `$${formatShares(value)}` : "—"}
                      </td>
                      <td className="py-2 text-right font-mono text-slate-500 text-xs">
                        {formatShares(t.post_transaction_amount)}
                      </td>
                      <td className="py-2 text-center">
                        {t.sec_link ? (
                          <a href={t.sec_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-brand hover:underline">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OfficersTab({ officers }: Readonly<{ officers: OfficersResponse | null }>) {
  const list = officers?.officers ?? [];

  if (list.length === 0) {
    return <EmptyState message="No officer data available." />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Executive Officers & Directors</CardTitle>
          <CardDescription>{list.length} officers listed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {list.map((officer, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">{officer.name}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Briefcase className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{officer.title}</span>
                  </div>
                  {officer.yearBorn && (
                    <div className="text-xs text-slate-400 mt-0.5">
                      Born {officer.yearBorn} · Age {new Date().getFullYear() - parseInt(officer.yearBorn)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({ message }: Readonly<{ message: string }>) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <p className="text-sm text-slate-500">{message}</p>
      </CardContent>
    </Card>
  );
}

export default OwnershipSection;
