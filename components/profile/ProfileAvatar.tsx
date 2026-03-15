"use client";

import { UserAvatar } from "@/components/auth/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Calendar } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface TierConfig {
  label: string;
  color: string;
}

const TIER_CONFIG: Record<string, TierConfig> = {
  free: { label: "Free", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  premium: { label: "Premium", color: "bg-amber-500 text-white" },
  pro: { label: "Pro", color: "bg-purple-600 text-white" },
  max: { label: "Max", color: "bg-purple-600 text-white" },
};

interface ProfileAvatarProps {
  user: User;
  displayName: string;
  subscriptionTier: string;
  memberSince: string;
}

export function ProfileAvatar({ user, displayName, subscriptionTier, memberSince }: ProfileAvatarProps) {
  const tierInfo = TIER_CONFIG[subscriptionTier] || TIER_CONFIG.free;

  return (
    <Card className="md:col-span-1 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <CardContent className="pt-6 flex flex-col items-center text-center">
        <div className="relative">
          <UserAvatar user={user} size="lg" className="h-24 w-24 text-2xl ring-4" />
          <Badge className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${tierInfo.color} border-0`}>
            <Crown className="h-3 w-3 mr-1" />
            {tierInfo.label}
          </Badge>
        </div>
        <h2 className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">
          {displayName || user.email?.split("@")[0] || "User"}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{user.email}</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <Calendar className="h-3.5 w-3.5" />
          Member since {memberSince}
        </div>
      </CardContent>
    </Card>
  );
}
