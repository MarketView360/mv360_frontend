"use client";

import { usePortfolio } from "@/providers/PortfolioProvider";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { useState } from "react";

export function ConnectionStatusBanner() {
  const { syncStatus, reconnectBrokerage } = usePortfolio();
  const [dismissed, setDismissed] = useState(false);

  const brokenConnections = syncStatus?.connections.filter((c) => c.status === "broken") || [];

  if (dismissed || brokenConnections.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-amber-800 dark:text-amber-300">
            Connection Issue
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
            {brokenConnections.length === 1
              ? `Your ${brokenConnections[0].brokerageName || "brokerage"} connection needs to be re-authenticated.`
              : `${brokenConnections.length} brokerage connections need to be re-authenticated.`}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {brokenConnections.map((connection) => (
              <Button
                key={connection.id}
                size="sm"
                variant="outline"
                className="border-amber-300 bg-white dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                onClick={() => reconnectBrokerage(connection.id)}
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Reconnect {connection.brokerageName || "Brokerage"}
              </Button>
            ))}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-amber-600 hover:text-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
