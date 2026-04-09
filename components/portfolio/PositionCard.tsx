"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/AuthProvider";
import { Briefcase, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import Link from "next/link";

interface PositionData {
  id: string;
  accountId: string;
  ticker: string;
  exchange: string | null;
  securityName: string | null;
  securityType: string | null;
  units: number;
  averagePurchasePrice: number | null;
  openPnl: number | null;
  currency: string;
  currentPrice: number | null;
  marketValue: number | null;
  unrealisedPnl: number | null;
  unrealisedPnlPercent: number | null;
  portfolioWeight: number | null;
  sector: string | null;
  industry: string | null;
}

interface PositionCardProps {
  ticker: string;
}

export function PositionCard({ ticker }: PositionCardProps) {
  const { session } = useAuth();
  const [position, setPosition] = useState<PositionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (!session?.access_token) {
      setIsLoading(false);
      return;
    }

    const fetchPosition = async () => {
      try {
        const response = await fetch(
          `${backendUrl}/portfolio/position/${encodeURIComponent(ticker)}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            // Not premium - silently return
            setPosition(null);
            return;
          }
          throw new Error("Failed to fetch position");
        }

        const data = await response.json();
        setPosition(data.position);
      } catch (err) {
        console.error("Error fetching position:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosition();
  }, [session?.access_token, ticker, backendUrl]);

  // Don't render anything if not logged in, loading, error, or no position
  if (!session?.access_token || isLoading) {
    return null;
  }

  if (error || !position) {
    return null;
  }

  const formatCurrency = (value: number | null) => {
    if (value === null) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: position.currency || "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number | null) => {
    if (value === null) return "—";
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const formatShares = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    }).format(value);
  };

  const isPositive = (position.unrealisedPnl ?? 0) >= 0;

  return (
    <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-emerald-600" />
            Your Position
          </CardTitle>
          <Badge
            variant="outline"
            className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
          >
            In Portfolio
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Shares
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {formatShares(position.units)}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Avg Cost
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {formatCurrency(position.averagePurchasePrice)}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Market Value
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {formatCurrency(position.marketValue)}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Unrealised P&L
            </p>
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <p
                className={`text-lg font-semibold ${
                  isPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(position.unrealisedPnl)}
              </p>
              <span
                className={`text-sm ${
                  isPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                ({formatPercent(position.unrealisedPnlPercent)})
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-emerald-200 dark:border-emerald-800">
          <Link
            href="/portfolio"
            className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View full portfolio →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Badge to show in screener results table
 */
export function PortfolioBadge({
  units,
  portfolioWeight,
}: {
  units: number;
  portfolioWeight?: number | null;
}) {
  const formatShares = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(value < 10 ? 2 : 0);
  };

  return (
    <Badge
      variant="outline"
      className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 text-xs whitespace-nowrap"
    >
      <Briefcase className="h-3 w-3 mr-1" />
      {formatShares(units)} shares
      {portfolioWeight != null && portfolioWeight > 0 && (
        <span className="ml-1 text-emerald-600 dark:text-emerald-400">
          · {portfolioWeight.toFixed(1)}%
        </span>
      )}
    </Badge>
  );
}
