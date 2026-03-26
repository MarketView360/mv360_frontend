"use client";

import { usePortfolio } from "@/providers/PortfolioProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown, Wallet, PieChart, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "0.00%";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function PortfolioHeader() {
  const { summary, holdings, isRefreshing, refreshData } = usePortfolio();

  const totalValue = summary?.totalPortfolioValue || 0;
  const todaysPnl = summary?.todaysPnl || 0;
  const todaysPnlPercent = summary?.todaysPnlPercent || 0;
  const totalUnrealisedPnl = summary?.totalUnrealisedPnl || 0;
  const totalUnrealisedPnlPercent = summary?.totalUnrealisedPnlPercent || 0;
  const cashBalance = summary?.totalCashBalance || 0;
  const positionCount = summary?.positionCount || 0;

  return (
    <div className="space-y-4">
      {/* Main header with title and refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Portfolio
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {holdings?.lastSyncedAt
              ? `Last synced ${new Date(holdings.lastSyncedAt).toLocaleString()}`
              : "Synced with your brokerages"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Total Portfolio Value */}
        <Card className="col-span-2 md:col-span-1 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Total Value</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(totalValue)}
            </p>
          </CardContent>
        </Card>

        {/* Today's P&L */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              {todaysPnl >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className="text-xs font-medium uppercase">Today</span>
            </div>
            <p
              className={cn(
                "text-xl font-bold",
                todaysPnl >= 0 ? "text-emerald-600" : "text-red-600"
              )}
            >
              {formatCurrency(todaysPnl)}
            </p>
            <p
              className={cn(
                "text-sm",
                todaysPnl >= 0 ? "text-emerald-600" : "text-red-600"
              )}
            >
              {formatPercent(todaysPnlPercent)}
            </p>
          </CardContent>
        </Card>

        {/* Total Unrealised P&L */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              {totalUnrealisedPnl >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className="text-xs font-medium uppercase">Unrealised P&L</span>
            </div>
            <p
              className={cn(
                "text-xl font-bold",
                totalUnrealisedPnl >= 0 ? "text-emerald-600" : "text-red-600"
              )}
            >
              {formatCurrency(totalUnrealisedPnl)}
            </p>
            <p
              className={cn(
                "text-sm",
                totalUnrealisedPnl >= 0 ? "text-emerald-600" : "text-red-600"
              )}
            >
              {formatPercent(totalUnrealisedPnlPercent)}
            </p>
          </CardContent>
        </Card>

        {/* Cash Balance */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Wallet className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Cash</span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(cashBalance)}
            </p>
          </CardContent>
        </Card>

        {/* Positions Count */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <PieChart className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Positions</span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {positionCount}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
