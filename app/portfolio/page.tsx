"use client";

import { Suspense } from "react";
import { usePortfolio } from "@/providers/PortfolioProvider";
import { PortfolioHeader } from "./components/PortfolioHeader";
import { BrokerAccountPills } from "./components/BrokerAccountPills";
import { HoldingsTable } from "./components/HoldingsTable";
import { ActivityFeed } from "./components/ActivityFeed";
import { PortfolioValueChart } from "./components/PortfolioValueChart";
import { SectorAllocationChart } from "./components/SectorAllocationChart";
import { ConnectionStatusBanner } from "./components/ConnectionStatusBanner";
import { EmptyState } from "./components/EmptyState";
import { SyncingState } from "./components/SyncingState";
import { UpgradePrompt } from "./components/UpgradePrompt";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PortfolioPage() {
  return (
    <Suspense fallback={<PortfolioPageSkeleton />}>
      <PortfolioPageContent />
    </Suspense>
  );
}

function PortfolioPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

function PortfolioPageContent() {
  const { state, error, syncStatus } = usePortfolio();

  // Handle different states
  if (state === "loading") {
    return <PortfolioPageSkeleton />;
  }

  if (state === "not_premium") {
    return <UpgradePrompt />;
  }

  if (state === "no_connections") {
    return <EmptyState />;
  }

  if (state === "syncing") {
    return <SyncingState />;
  }

  if (state === "error") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || "Failed to load portfolio data. Please try again."}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Active state - show full dashboard
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Connection Status Banner (if broken connections) */}
        {syncStatus?.hasBrokenConnections && <ConnectionStatusBanner />}

        {/* Portfolio Header with summary stats */}
        <PortfolioHeader />

        {/* Account Pills */}
        <BrokerAccountPills />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PortfolioValueChart />
          <SectorAllocationChart />
        </div>

        {/* Holdings Table */}
        <HoldingsTable />

        {/* Activity Feed */}
        <ActivityFeed />
      </div>
    </div>
  );
}
