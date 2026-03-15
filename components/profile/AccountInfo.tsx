"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Settings, AlertCircle, AlertTriangle } from "lucide-react";
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

interface AccountInfoProps {
  user: User;
  profile: {
    role: string;
    subscription_tier: string;
    updated_at: string;
    temp_suspend?: boolean;
    perm_suspend?: boolean;
  };
}

export function AccountInfo({ user, profile }: AccountInfoProps) {
  const tierInfo = TIER_CONFIG[profile.subscription_tier] || TIER_CONFIG.free;
  const isSuspended = profile.temp_suspend || profile.perm_suspend;

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-white">
          <Shield className="h-5 w-5" />
          Account Information
        </CardTitle>
        <CardDescription>Your account details and security (read-only)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSuspended && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="text-sm text-red-700 dark:text-red-300">
              {profile.perm_suspend 
                ? "Your account has been permanently suspended. Please contact support."
                : "Your account is temporarily suspended. Please contact support."}
            </span>
          </div>
        )}
        
        <div className="grid gap-4 md:grid-cols-2 text-sm">
          <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Account ID</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 text-xs">
              {user.id.slice(0, 8)}...
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Email</span>
            <span className="text-slate-700 dark:text-slate-300 text-xs">
              {user.email}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Subscription</span>
            <Badge className={`${tierInfo.color} border-0`}>{tierInfo.label}</Badge>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Role</span>
            <span className="text-slate-700 dark:text-slate-300 capitalize">
              {profile.role || "user"}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Email Verified</span>
            <span className="text-slate-700 dark:text-slate-300">
              {user.email_confirmed_at ? (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0 text-xs">
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 text-xs">
                  Pending
                </Badge>
              )}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Sign-in Method</span>
            <span className="text-slate-700 dark:text-slate-300 capitalize text-xs">
              {user.app_metadata?.provider || "email"}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Member Since</span>
            <span className="text-slate-700 dark:text-slate-300 text-xs">
              {user.created_at
                ? new Date(user.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Last Updated</span>
            <span className="text-slate-700 dark:text-slate-300 text-xs">
              {profile.updated_at
                ? new Date(profile.updated_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <AlertCircle className="h-4 w-4" />
              <span>This information is read-only. To manage your account, security, or data:</span>
            </div>
            <a
              href="/settings"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand hover:text-brand/80 bg-brand/10 hover:bg-brand/20 rounded-md transition-colors"
            >
              <Settings className="h-4 w-4" />
              Go to Settings
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
