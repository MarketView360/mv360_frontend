"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Sparkles, Crown } from "lucide-react";

interface ProfileStatsProps {
  chatSessionsCount: number;
  reasoningUsedToday: number;
  reasoningLimit: number;
  subscriptionTier: string;
}

export function ProfileStats({
  chatSessionsCount,
  reasoningUsedToday,
  reasoningLimit,
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
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {chatSessionsCount}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Chat Sessions</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {reasoningUsedToday}
                  <span className="text-sm font-normal text-slate-400">
                    /{reasoningLimit}
                  </span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Reasoning Today</p>
              </div>
            </div>
          </div>
        </div>
        {isFree && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <Crown className="h-4 w-4 inline mr-1" />
              Upgrade to Premium for 20 reasoning queries/day and priority support.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
