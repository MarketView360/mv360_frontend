"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Clock,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QuotaStatus } from "@/hooks/useQuota";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

interface ProviderStatus {
  name: string;
  available: boolean;
}

interface AIStatusPanelProps {
  token: string | null;
  quota: QuotaStatus | null;
  lastError?: { code: string; message: string } | null;
  className?: string;
}

/**
 * AI Status Panel showing provider health, quota, and recent errors
 */
export function AIStatusPanel({
  token,
  quota,
  lastError,
  className,
}: AIStatusPanelProps) {
  const [providers, setProviders] = useState<Record<string, ProviderStatus>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchProviderStatus = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/ai/providers/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProviders(data.providers);
        setLastChecked(new Date());
      }
    } catch {
      // Silently fail - status is informational
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProviderStatus();
    // Refresh every 5 minutes
    const interval = setInterval(() => void fetchProviderStatus(), 300000);
    return () => clearInterval(interval);
  }, [token]);

  const allProvidersUp = Object.values(providers).every((p) => p.available);
  const someProvidersDown = Object.values(providers).some((p) => !p.available);

  // Calculate time until quota reset
  const getResetTime = () => {
    if (!quota?.resetsAt) return null;
    const resetTime = new Date(quota.resetsAt);
    const now = new Date();
    const diff = resetTime.getTime() - now.getTime();
    if (diff <= 0) return "Soon";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm">AI Status</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void fetchProviderStatus()}
          disabled={loading}
          className="h-7 px-2"
        >
          <RefreshCw
            className={cn("h-3 w-3", loading && "animate-spin")}
          />
        </Button>
      </div>

      {/* Provider Status */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Zap className="h-3 w-3" />
          <span>Providers</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(providers).map(([key, provider]) => (
            <div
              key={key}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded text-xs",
                provider.available
                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
              )}
            >
              {provider.available ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              <span className="capitalize">{provider.name}</span>
            </div>
          ))}
        </div>
        {lastChecked && (
          <p className="text-[10px] text-slate-400">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Overall Status */}
      <div className="flex items-center gap-2 mb-4">
        {allProvidersUp ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400">
              All systems operational
            </span>
          </>
        ) : someProvidersDown ? (
          <>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-amber-600 dark:text-amber-400">
              Some providers unavailable
            </span>
          </>
        ) : (
          <>
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-500">Checking status...</span>
          </>
        )}
      </div>

      {/* Quota Summary */}
      {quota && (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Quota resets in</span>
            <span className="font-medium">{getResetTime()}</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Messages</span>
              <span>
                {quota.standard.unlimited
                  ? "∞"
                  : `${quota.standard.used}/${quota.standard.limit}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Reasoning</span>
              <span>
                {quota.reasoning.unlimited
                  ? "∞"
                  : `${quota.reasoning.used}/${quota.reasoning.limit}`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Last Error */}
      {lastError && (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
          <div className="flex items-start gap-2 text-xs">
            <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-amber-600 dark:text-amber-400">
                {lastError.code}
              </p>
              <p className="text-slate-500 mt-0.5">{lastError.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
