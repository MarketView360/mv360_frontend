"use client";

import { usePortfolio } from "@/providers/PortfolioProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function SyncingState() {
  const { syncStatus } = usePortfolio();

  const accounts = syncStatus?.accounts || [];
  const syncedAccounts = accounts.filter((a) => a.holdingsSyncedAt);
  const progress = accounts.length > 0 ? (syncedAccounts.length / accounts.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Syncing Your Portfolio
          </h1>
          <p className="text-muted-foreground">
            We&apos;re pulling in your holdings and transaction history.
            This usually takes 1-2 minutes.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {syncedAccounts.length} of {accounts.length} accounts
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Account sync status */}
        <Card>
          <CardContent className="p-4 space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-center gap-3">
                  {account.holdingsSyncedAt ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-amber-500 animate-pulse" />
                  )}
                  <div>
                    <p className="font-medium">
                      {account.accountName || account.brokerageName || "Account"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {account.brokerageName}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-sm",
                    account.holdingsSyncedAt
                      ? "text-emerald-600"
                      : "text-amber-600"
                  )}
                >
                  {account.holdingsSyncedAt ? "Synced" : "Syncing..."}
                </span>
              </div>
            ))}
            {accounts.length === 0 && (
              <div className="py-4 text-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                <p>Discovering accounts...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-8">
          You can leave this page — we&apos;ll keep syncing in the background.
        </p>
      </div>
    </div>
  );
}
