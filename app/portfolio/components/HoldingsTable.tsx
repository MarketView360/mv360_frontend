"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePortfolio, Position } from "@/providers/PortfolioProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUpDown,
  Search,
  TrendingUp,
  TrendingDown,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SortKey = "ticker" | "marketValue" | "units" | "currentPrice" | "unrealisedPnl" | "portfolioWeight";
type SortDir = "asc" | "desc";

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatNumber(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function HoldingsTable() {
  const { holdings } = usePortfolio();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Position;
    direction: "asc" | "desc";
  }>({ key: "marketValue", direction: "desc" });

  const positions = holdings?.positions || [];

  // If no positions, show empty state
  if (!holdings || positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No holdings found in your connected accounts.</p>
            <p className="text-sm mt-2">Holdings will appear here once your accounts sync.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredAndSorted = useMemo(() => {
    let filtered = positions;

    // Filter by search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.ticker.toLowerCase().includes(searchLower) ||
          p.securityName?.toLowerCase().includes(searchLower) ||
          p.sector?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    return [...filtered].sort((a, b) => {
      let aVal: number = 0;
      let bVal: number = 0;

      switch (sortKey) {
        case "ticker":
          return sortDir === "asc"
            ? a.ticker.localeCompare(b.ticker)
            : b.ticker.localeCompare(a.ticker);
        case "marketValue":
          aVal = a.marketValue || 0;
          bVal = b.marketValue || 0;
          break;
        case "units":
          aVal = a.units || 0;
          bVal = b.units || 0;
          break;
        case "currentPrice":
          aVal = a.currentPrice || 0;
          bVal = b.currentPrice || 0;
          break;
        case "unrealisedPnl":
          aVal = a.unrealisedPnl || 0;
          bVal = b.unrealisedPnl || 0;
          break;
        case "portfolioWeight":
          aVal = a.portfolioWeight || 0;
          bVal = b.portfolioWeight || 0;
          break;
      }

      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [positions, search, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortableHeader = ({
    label,
    sortKeyValue,
    className,
  }: {
    label: string;
    sortKeyValue: SortKey;
    className?: string;
  }) => (
    <TableHead className={className}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 gap-1"
        onClick={() => handleSort(sortKeyValue)}
      >
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </Button>
    </TableHead>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Holdings</CardTitle>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search positions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader label="Symbol" sortKeyValue="ticker" />
                <TableHead>Name</TableHead>
                <SortableHeader label="Shares" sortKeyValue="units" className="text-right" />
                <SortableHeader label="Price" sortKeyValue="currentPrice" className="text-right" />
                <SortableHeader label="Market Value" sortKeyValue="marketValue" className="text-right" />
                <SortableHeader label="P&L" sortKeyValue="unrealisedPnl" className="text-right" />
                <SortableHeader label="Weight" sortKeyValue="portfolioWeight" className="text-right" />
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    {search ? "No positions match your search." : "No positions found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSorted.map((position) => (
                  <TableRow key={position.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/company/${position.ticker}`}
                          className="font-semibold text-primary hover:underline"
                        >
                          {position.ticker}
                        </Link>
                        {position.sector && (
                          <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
                            {position.sector}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {position.securityName || "-"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatNumber(position.units, 4)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(position.currentPrice)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(position.marketValue)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {(position.unrealisedPnl || 0) >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <span
                          className={cn(
                            "font-medium",
                            (position.unrealisedPnl || 0) >= 0
                              ? "text-emerald-600"
                              : "text-red-600"
                          )}
                        >
                          {formatCurrency(position.unrealisedPnl)}
                        </span>
                        <span
                          className={cn(
                            "text-xs",
                            (position.unrealisedPnl || 0) >= 0
                              ? "text-emerald-600"
                              : "text-red-600"
                          )}
                        >
                          ({formatPercent(position.unrealisedPnlPercent)})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {position.portfolioWeight?.toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      <Link href={`/company/${position.ticker}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
