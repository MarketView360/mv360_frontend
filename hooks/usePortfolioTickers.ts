"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/providers/AuthProvider";

interface PortfolioTickerData {
  ticker: string;
  units: number;
  marketValue: number | null;
}

interface UsePortfolioTickersReturn {
  tickers: Set<string>;
  tickerData: Map<string, PortfolioTickerData>;
  isInPortfolio: (ticker: string) => boolean;
  getPositionData: (ticker: string) => PortfolioTickerData | null;
  isLoading: boolean;
  error: string | null;
}

export function usePortfolioTickers(): UsePortfolioTickersReturn {
  const { session } = useAuth();
  const [tickerData, setTickerData] = useState<Map<string, PortfolioTickerData>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (!session?.access_token) {
      setTickerData(new Map());
      return;
    }

    const fetchTickers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${backendUrl}/portfolio/tickers`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            // Not authenticated or not premium - silently fail
            setTickerData(new Map());
            return;
          }
          throw new Error("Failed to fetch portfolio tickers");
        }

        const data = await response.json();
        const tickerMap = new Map<string, PortfolioTickerData>();

        if (data.tickers && Array.isArray(data.tickers)) {
          for (const item of data.tickers) {
            tickerMap.set(item.ticker.toUpperCase(), {
              ticker: item.ticker,
              units: item.units || 0,
              marketValue: item.marketValue || null,
            });
          }
        }

        setTickerData(tickerMap);
      } catch (err) {
        console.error("Error fetching portfolio tickers:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setTickerData(new Map());
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickers();
  }, [session?.access_token, backendUrl]);

  const tickers = useMemo(() => {
    return new Set(tickerData.keys());
  }, [tickerData]);

  const isInPortfolio = useCallback(
    (ticker: string): boolean => {
      return tickerData.has(ticker.toUpperCase());
    },
    [tickerData]
  );

  const getPositionData = useCallback(
    (ticker: string): PortfolioTickerData | null => {
      return tickerData.get(ticker.toUpperCase()) || null;
    },
    [tickerData]
  );

  return {
    tickers,
    tickerData,
    isInPortfolio,
    getPositionData,
    isLoading,
    error,
  };
}
