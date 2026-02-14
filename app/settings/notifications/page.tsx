"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell, Mail, Monitor, Megaphone, Newspaper, PartyPopper,
  AlertCircle, Info, Loader2, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface SubscriptionStatus {
  newsletter: boolean;
  announcements: boolean;
  events_promotions: boolean;
  email: string | null;
}

// Cooldown in ms between toggle actions per category
const TOGGLE_COOLDOWN_MS = 3000;

export default function NotificationsPage() {
  const { session } = useAuth();
  const token = session?.access_token || null;

  const [subs, setSubs] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [desktopEnabled, setDesktopEnabled] = useState(false);

  // Track per-category saving state and cooldown
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const cooldownRef = useRef<Record<string, number>>({});

  const fetchSubscriptions = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch subscriptions");
      const data: SubscriptionStatus = await res.json();
      setSubs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setDesktopEnabled(Notification.permission === "granted");
    }
  }, []);

  const requestDesktopNotifications = async () => {
    if (!("Notification" in window)) {
      toast.error("Desktop notifications not supported in this browser");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setDesktopEnabled(true);
      toast.success("Desktop notifications enabled");
    } else {
      toast.error("Notification permission denied");
    }
  };

  const updateSubscription = async (
    key: keyof Omit<SubscriptionStatus, "email">,
    value: boolean,
  ) => {
    if (!token || !subs) return;

    // Cooldown check
    const now = Date.now();
    const lastToggle = cooldownRef.current[key] || 0;
    if (now - lastToggle < TOGGLE_COOLDOWN_MS) {
      toast.info("Please wait a moment before toggling again");
      return;
    }
    cooldownRef.current[key] = now;

    // Optimistic UI update
    const prevSubs = { ...subs };
    setSubs({ ...subs, [key]: value });
    setSavingKey(key);

    try {
      const res = await fetch(`${API_BASE}/subscriptions`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [key]: value }),
      });

      if (!res.ok) {
        throw new Error("Failed to update");
      }

      const updated: SubscriptionStatus = await res.json();
      setSubs(updated);
      toast.success(
        value ? "Subscribed successfully" : "Unsubscribed successfully",
      );
    } catch {
      // Revert on failure
      setSubs(prevSubs);
      toast.error("Failed to update subscription. Please try again.");
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-900 dark:text-red-300">Error loading notifications</h3>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!subs) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-amber-900 dark:text-amber-300">Profile not found</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Please ensure you&apos;re logged in and try refreshing the page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage how you receive updates and alerts
        </p>
      </div>

      {/* Important info banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
        <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
            Important announcements will always reach your email
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
            Critical security alerts, service updates, and account-related notices are sent regardless of your subscription preferences.
          </p>
        </div>
      </div>

      {/* Push Notifications */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Monitor className="h-5 w-5 text-brand" />
            Push Notifications
          </CardTitle>
          <CardDescription>Browser notifications for real-time updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <Label className="font-medium text-slate-900 dark:text-white cursor-pointer">
                  Desktop Notifications
                </Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Receive browser notifications for important updates
                </p>
              </div>
            </div>
            <Switch
              checked={desktopEnabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  requestDesktopNotifications();
                } else {
                  setDesktopEnabled(false);
                  toast.info("Desktop notifications disabled");
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Subscriptions */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-brand" />
            Email Subscriptions
          </CardTitle>
          <CardDescription>
            Choose what emails you want to receive at{" "}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {subs.email || "your email"}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Newsletter */}
          <SubscriptionRow
            icon={<Newspaper className="h-5 w-5 text-green-600 dark:text-green-400" />}
            iconBg="bg-green-100 dark:bg-green-900/30"
            title="Newsletter"
            description="Weekly market insights, analysis, and curated stock picks"
            checked={subs.newsletter}
            saving={savingKey === "newsletter"}
            onToggle={(v) => updateSubscription("newsletter", v)}
          />

          {/* Announcements */}
          <SubscriptionRow
            icon={<Megaphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            title="Product Announcements"
            description="New features, platform updates, and improvements"
            checked={subs.announcements}
            saving={savingKey === "announcements"}
            onToggle={(v) => updateSubscription("announcements", v)}
          />

          {/* Events & Promotions */}
          <SubscriptionRow
            icon={<PartyPopper className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
            iconBg="bg-purple-100 dark:bg-purple-900/30"
            title="Events & Promotions"
            description="Webinars, programmes, special offers, and community events"
            checked={subs.events_promotions}
            saving={savingKey === "events_promotions"}
            onToggle={(v) => updateSubscription("events_promotions", v)}
          />
        </CardContent>
      </Card>

      {/* Processing note */}
      <div className="flex items-start gap-2.5 px-1">
        <Info className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Changes to your email subscriptions may take a few minutes to fully propagate. If you unsubscribe from a category, you may still receive emails that were already scheduled before the change.
        </p>
      </div>
    </div>
  );
}

function SubscriptionRow({
  icon,
  iconBg,
  title,
  description,
  checked,
  saving,
  onToggle,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  checked: boolean;
  saving: boolean;
  onToggle: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`p-2 rounded-lg shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <Label className="font-medium text-slate-900 dark:text-white">
            {title}
          </Label>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
            {description}
          </p>
        </div>
      </div>
      <Button
        variant={checked ? "outline" : "default"}
        size="sm"
        disabled={saving}
        onClick={() => onToggle(!checked)}
        className={`shrink-0 ml-3 min-w-[110px] text-xs font-medium ${
          checked
            ? "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
            : "bg-brand hover:bg-brand/90 text-white"
        }`}
      >
        {saving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : checked ? (
          "Unsubscribe"
        ) : (
          "Subscribe"
        )}
      </Button>
    </div>
  );
}
