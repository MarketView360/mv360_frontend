"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { List, TrendingUp, Save, Crown } from "lucide-react";

interface ProfileStatsProps {
  watchlistsCount: number;
  stocksTracked: number;
  savedScreensCount: number;
  subscriptionTier: string;
}

export function ProfileStats({
  watchlistsCount,
  stocksTracked,
  savedScreensCount,
  subscriptionTier,
}: ProfileStatsProps) {
  const isFree = subscriptionTier === "free";

  return (
    <Card className="md:col-span-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="text-lg text-slate-900 dark:text-white">Usage Statistics</CardTitle>
        <CardDescription>Your activity on MarketView360</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <List className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {watchlistsCount}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Watchlists</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stocksTracked}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Stocks Tracked</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Save className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {savedScreensCount}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Saved Screens</p>
              </div>
            </div>
          </div>
        </div>
        {isFree && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <Crown className="h-4 w-4 inline mr-1" />
              Upgrade to Premium for unlimited screens and priority support.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
