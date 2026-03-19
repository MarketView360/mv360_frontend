"use client";

import { useEffect, useState } from "react";
import { usePortfolio, Transaction } from "@/providers/PortfolioProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Repeat,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getTransactionIcon(type: string) {
  const typeLower = type.toLowerCase();
  if (typeLower.includes("buy") || typeLower.includes("purchase")) {
    return <ArrowDownRight className="h-4 w-4 text-emerald-500" />;
  }
  if (typeLower.includes("sell")) {
    return <ArrowUpRight className="h-4 w-4 text-red-500" />;
  }
  if (typeLower.includes("dividend")) {
    return <DollarSign className="h-4 w-4 text-blue-500" />;
  }
  return <Repeat className="h-4 w-4 text-muted-foreground" />;
}

function getTransactionColor(type: string): string {
  const typeLower = type.toLowerCase();
  if (typeLower.includes("buy") || typeLower.includes("purchase")) {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
  }
  if (typeLower.includes("sell")) {
    return "bg-red-500/10 text-red-700 dark:text-red-400";
  }
  if (typeLower.includes("dividend")) {
    return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
  }
  return "bg-slate-500/10 text-slate-700 dark:text-slate-400";
}

export function ActivityFeed() {
  const { transactions, loadTransactions } = usePortfolio();
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await loadTransactions(filter === "all" ? undefined : { type: filter });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filter, loadTransactions]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Recent Activity</CardTitle>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="BUY">Buys</SelectItem>
            <SelectItem value="SELL">Sells</SelectItem>
            <SelectItem value="DIVIDEND">Dividends</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-muted-foreground">No transactions found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Transaction history will appear here once synced
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {tx.ticker || "Cash"}
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn("text-[10px]", getTransactionColor(tx.type))}
                      >
                        {tx.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {tx.description || tx.securityName || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(tx.tradeDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(tx.amount)}
                    </p>
                    {tx.units && tx.price && (
                      <p className="text-xs text-muted-foreground">
                        {tx.units.toFixed(4)} @ {formatCurrency(tx.price)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
