"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "./AuthProvider";
import { createClient } from "@/lib/supabase/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BrokerageAccount {
  id: string;
  connectionId: string;
  snaptradeAccountId: string;
  accountName: string | null;
  accountType: string | null;
  accountNumber: string | null;
  brokerageName: string | null;
  currency: string;
  totalValue: number | null;
  cashBalance: number | null;
  buyingPower: number | null;
  connectionStatus: string;
  holdingsSyncedAt: string | null;
  transactionsSyncedAt: string | null;
  initialTransactionsDone: boolean;
}

export interface Position {
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

export interface HoldingsSummary {
  totalMarketValue: number;
  totalCostBasis: number;
  totalUnrealisedPnl: number;
  totalUnrealisedPnlPercent: number;
  totalCashBalance: number;
  positionCount: number;
  accountCount: number;
}

export interface HoldingsData {
  positions: Position[];
  accounts: BrokerageAccount[];
  summary: HoldingsSummary;
  lastSyncedAt: string | null;
}

export interface Transaction {
  id: string;
  accountId: string;
  snaptradeTransactionId: string;
  tradeDate: string;
  settlementDate: string | null;
  type: string;
  ticker: string | null;
  securityName: string | null;
  units: number | null;
  price: number | null;
  amount: number | null;
  currency: string;
  description: string | null;
}

export interface PortfolioSummary {
  totalPortfolioValue: number;
  totalCashBalance: number;
  totalUnrealisedPnl: number;
  totalUnrealisedPnlPercent: number;
  todaysPnl: number;
  todaysPnlPercent: number;
  accountCount: number;
  positionCount: number;
  connectionCount: number;
}

export interface SyncStatus {
  connections: Array<{
    id: string;
    brokerageName: string | null;
    status: string;
    brokenAt: string | null;
  }>;
  accounts: Array<{
    id: string;
    accountName: string | null;
    brokerageName: string | null;
    connectionStatus: string;
    holdingsSyncedAt: string | null;
    transactionsSyncedAt: string | null;
    initialTransactionsDone: boolean;
  }>;
  isFullySynced: boolean;
  hasBrokenConnections: boolean;
}

export interface SectorAllocation {
  sector: string;
  marketValue: number;
  weight: number;
  positionCount: number;
}

export interface DailySnapshot {
  date: string;
  totalValue: number;
  cashBalance: number;
}

type PortfolioState = "loading" | "not_premium" | "no_connections" | "syncing" | "active" | "error";

interface PortfolioContextType {
  // State
  state: PortfolioState;
  isPremium: boolean;
  holdings: HoldingsData | null;
  summary: PortfolioSummary | null;
  syncStatus: SyncStatus | null;
  transactions: Transaction[];
  sectors: SectorAllocation[];
  chartData: DailySnapshot[];
  error: string | null;
  isRefreshing: boolean;
  
  // Actions
  connectBrokerage: () => Promise<void>;
  reconnectBrokerage: (connectionId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  deleteConnection: (connectionId: string) => Promise<void>;
  loadTransactions: (params?: { accountId?: string; type?: string; ticker?: string }) => Promise<void>;
  loadChartData: (periodDays?: number) => Promise<void>;
  manualSync: () => Promise<void>;
  
  // Helpers
  getPositionForTicker: (ticker: string) => Position | null;
  userPositionTickers: string[];
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  const [state, setState] = useState<PortfolioState>("loading");
  const [isPremium, setIsPremium] = useState(false);
  const [holdings, setHoldings] = useState<HoldingsData | null>(null);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sectors, setSectors] = useState<SectorAllocation[]>([]);
  const [chartData, setChartData] = useState<DailySnapshot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userPositionTickers, setUserPositionTickers] = useState<string[]>([]);

  // Helper to make authenticated API calls
  const apiCall = useCallback(async function<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = session?.access_token;
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${res.status}`);
    }

    return res.json();
  }, [session?.access_token]);

  // Check premium status
  const checkPremiumStatus = useCallback(async () => {
    if (!user) return false;
    
    const supabase = createClient();
    const { data } = await supabase
      .from("user_profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .maybeSingle();
    
    const tier = data?.subscription_tier || "free";
    const hasPremium = tier === "premium" || tier === "max";
    setIsPremium(hasPremium);
    return hasPremium;
  }, [user]);

  // Load sync status
  const loadSyncStatus = useCallback(async () => {
    try {
      const data = await apiCall<SyncStatus>("/portfolio/status");
      setSyncStatus(data);
      return data;
    } catch (err) {
      console.error("Failed to load sync status:", err);
      return null;
    }
  }, [apiCall]);

  // Load holdings data
  const loadHoldings = useCallback(async () => {
    try {
      const data = await apiCall<HoldingsData>("/portfolio/holdings");
      setHoldings(data);
      setUserPositionTickers(data.positions.map(p => p.ticker));
      return data;
    } catch (err) {
      console.error("Failed to load holdings:", err);
      return null;
    }
  }, [apiCall]);

  // Load summary
  const loadSummary = useCallback(async () => {
    try {
      const data = await apiCall<PortfolioSummary>("/portfolio/summary");
      setSummary(data);
      return data;
    } catch (err) {
      console.error("Failed to load summary:", err);
      return null;
    }
  }, [apiCall]);

  // Load sectors
  const loadSectors = useCallback(async () => {
    try {
      const data = await apiCall<SectorAllocation[]>("/portfolio/sectors");
      setSectors(data);
      return data;
    } catch (err) {
      console.error("Failed to load sectors:", err);
      return [];
    }
  }, [apiCall]);

  // Load transactions
  const loadTransactions = useCallback(async (params?: { accountId?: string; type?: string; ticker?: string }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.accountId) queryParams.set("accountId", params.accountId);
      if (params?.type) queryParams.set("type", params.type);
      if (params?.ticker) queryParams.set("ticker", params.ticker);
      
      const queryString = queryParams.toString();
      const endpoint = `/portfolio/transactions${queryString ? `?${queryString}` : ""}`;
      
      const data = await apiCall<{ transactions: Transaction[] }>(endpoint);
      setTransactions(data.transactions);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    }
  }, [apiCall]);

  // Load chart data
  const loadChartData = useCallback(async (periodDays: number = 30) => {
    try {
      const data = await apiCall<{ snapshots: DailySnapshot[] }>(`/portfolio/chart?days=${periodDays}`);
      setChartData(data.snapshots);
    } catch (err) {
      console.error("Failed to load chart data:", err);
    }
  }, [apiCall]);

  // Manual sync - bypasses webhooks
  const manualSync = useCallback(async () => {
    try {
      setState("syncing");
      setError(null);
      await apiCall("/portfolio/sync", { method: "POST" });
      
      // Reload all data
      await Promise.all([loadHoldings(), loadSummary(), loadSectors()]);
      setState("active");
    } catch (err) {
      console.error("Manual sync failed:", err);
      setError(err instanceof Error ? err.message : "Sync failed");
      setState("error");
      throw err;
    }
  }, [apiCall, loadHoldings, loadSummary, loadSectors]);

  // Connect brokerage
  const connectBrokerage = useCallback(async () => {
    try {
      // Check if user already has snaptrade credentials
      const status = await loadSyncStatus();
      const endpoint = status && status.connections.length > 0 ? "/portfolio/connect" : "/portfolio/register";
      
      const data = await apiCall<{ redirectUri: string }>(endpoint, { method: "POST" });
      
      // Open SnapTrade connection popup
      const width = 500;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      window.open(
        data.redirectUri,
        "snaptrade_connect",
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (err) {
      console.error("Failed to connect brokerage:", err);
      setError(err instanceof Error ? err.message : "Failed to connect brokerage");
    }
  }, [apiCall, loadSyncStatus]);

  // Reconnect broken brokerage
  const reconnectBrokerage = useCallback(async (connectionId: string) => {
    try {
      const data = await apiCall<{ redirectUri: string }>("/portfolio/reconnect", {
        method: "POST",
        body: JSON.stringify({ connectionId }),
      });
      
      const width = 500;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      window.open(
        data.redirectUri,
        "snaptrade_reconnect",
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (err) {
      console.error("Failed to reconnect brokerage:", err);
      setError(err instanceof Error ? err.message : "Failed to reconnect brokerage");
    }
  }, [apiCall]);

  // Refresh data
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await apiCall("/portfolio/refresh", { method: "POST" });
      // Wait a moment for SnapTrade to process, then reload
      await new Promise(resolve => setTimeout(resolve, 2000));
      await Promise.all([loadHoldings(), loadSummary(), loadSectors(), loadSyncStatus()]);
    } catch (err) {
      console.error("Failed to refresh data:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  }, [apiCall, loadHoldings, loadSummary, loadSectors, loadSyncStatus]);

  // Delete connection
  const deleteConnection = useCallback(async (connectionId: string) => {
    try {
      await apiCall(`/portfolio/connection/${connectionId}`, { method: "DELETE" });
      await Promise.all([loadHoldings(), loadSummary(), loadSyncStatus()]);
    } catch (err) {
      console.error("Failed to delete connection:", err);
      setError(err instanceof Error ? err.message : "Failed to delete connection");
    }
  }, [apiCall, loadHoldings, loadSummary, loadSyncStatus]);

  // Get position for specific ticker
  const getPositionForTicker = useCallback((ticker: string): Position | null => {
    return holdings?.positions.find(p => p.ticker.toUpperCase() === ticker.toUpperCase()) || null;
  }, [holdings]);

  // Initialize and determine state
  useEffect(() => {
    if (!user || !session) {
      setState("loading");
      return;
    }

    let pollInterval: NodeJS.Timeout;
    let isMounted = true;

    const initialize = async () => {
      if (!isMounted) return;
      
      setState("loading");
      setError(null);

      try {
        // Check premium status
        const hasPremium = await checkPremiumStatus();
        if (!isMounted) return;
        
        if (!hasPremium) {
          setState("not_premium");
          return;
        }

        // Load sync status
        const status = await loadSyncStatus();
        if (!isMounted) return;
        
        if (!status || status.connections.length === 0) {
          setState("no_connections");
          return;
        }

        // Check if syncing
        if (!status.isFullySynced) {
          setState("syncing");
          // Poll every 3 seconds while syncing
          pollInterval = setInterval(async () => {
            const newStatus = await loadSyncStatus();
            if (newStatus?.isFullySynced && isMounted) {
              clearInterval(pollInterval);
              await Promise.all([loadHoldings(), loadSummary(), loadSectors()]);
              if (isMounted) setState("active");
            }
          }, 3000);
          return;
        }

        // Load all data
        await Promise.all([loadHoldings(), loadSummary(), loadSectors()]);
        if (isMounted) setState("active");
      } catch (err) {
        console.error("Portfolio initialization failed:", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to initialize portfolio");
          setState("error");
        }
      }
    };

    initialize();

    // Handle connection complete message from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "SNAPTRADE_CONNECTED") {
        initialize();
      }
    };
    window.addEventListener("message", handleMessage);

    // Check URL for connected param (redirect from popup)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("connected") === "true") {
      // Remove the query param and reinitialize
      window.history.replaceState({}, "", window.location.pathname);
      initialize();
    }

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      window.removeEventListener("message", handleMessage);
    };
  }, [user?.id, session?.access_token]);

  return (
    <PortfolioContext.Provider
      value={{
        state,
        isPremium,
        holdings,
        summary,
        syncStatus,
        transactions,
        sectors,
        chartData,
        error,
        isRefreshing,
        connectBrokerage,
        reconnectBrokerage,
        refreshData,
        deleteConnection,
        loadTransactions,
        loadChartData,
        manualSync,
        getPositionForTicker,
        userPositionTickers,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
}
