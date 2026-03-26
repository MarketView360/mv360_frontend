"use client";

import { useState } from "react";
import { usePortfolio } from "@/providers/PortfolioProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function BrokerAccountPills() {
  const { holdings, connectBrokerage, syncStatus } = usePortfolio();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const accounts = holdings?.accounts || [];
  const connections = syncStatus?.connections || [];

  // Group accounts by brokerage
  const brokerageGroups = accounts.reduce((acc, account) => {
    const name = account.brokerageName || "Unknown";
    if (!acc[name]) {
      acc[name] = [];
    }
    acc[name].push(account);
    return acc;
  }, {} as Record<string, typeof accounts>);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Brokerage pills */}
      {Object.entries(brokerageGroups).map(([brokerageName, brokerageAccounts]) => (
        <DropdownMenu key={brokerageName}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "gap-2 h-9",
                selectedAccountId &&
                  brokerageAccounts.some((a) => a.id === selectedAccountId) &&
                  "border-primary bg-primary/5"
              )}
            >
              <Building2 className="h-4 w-4" />
              <span className="font-medium">{brokerageName}</span>
              <Badge variant="secondary" className="ml-1">
                {brokerageAccounts.length}
              </Badge>
              <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {brokerageAccounts.map((account) => (
              <DropdownMenuItem
                key={account.id}
                onClick={() =>
                  setSelectedAccountId(
                    selectedAccountId === account.id ? null : account.id
                  )
                }
                className={cn(
                  "flex flex-col items-start gap-1 py-2",
                  selectedAccountId === account.id && "bg-primary/10"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">
                    {account.accountName || account.accountType || "Account"}
                  </span>
                  <span className="text-sm font-semibold">
                    {formatCurrency(account.totalValue)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {account.accountType && (
                    <Badge variant="outline" className="text-[10px] h-5">
                      {account.accountType}
                    </Badge>
                  )}
                  {account.accountNumber && (
                    <span>••••{account.accountNumber.slice(-4)}</span>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}

      {/* Add Brokerage Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={connectBrokerage}
        className="gap-2 h-9 text-muted-foreground hover:text-foreground"
      >
        <Plus className="h-4 w-4" />
        Add Brokerage
      </Button>

      {/* Show active filter if any */}
      {selectedAccountId && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedAccountId(null)}
          className="h-9 text-xs text-muted-foreground"
        >
          Clear filter
        </Button>
      )}
    </div>
  );
}
