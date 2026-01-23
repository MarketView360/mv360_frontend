"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Mail, Monitor, Megaphone, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const { session } = useAuth();
  const { profile, loading, updateProfile, error } = useProfile(session?.access_token || null);
  
  const [desktopEnabled, setDesktopEnabled] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [announcementsOptIn, setAnnouncementsOptIn] = useState(false);
  const [alertsOptIn, setAlertsOptIn] = useState(false);

  useEffect(() => {
    if (profile) {
      setNewsletterOptIn(profile.newsletter_opt_in || false);
      setAnnouncementsOptIn(profile.announcements_opt_in || false);
      setAlertsOptIn(profile.alerts_opt_in || false);
      
      // Check browser notification permission
      if ("Notification" in window) {
        setDesktopEnabled(Notification.permission === "granted");
      }
    }
  }, [profile]);

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

  const updateEmailPref = async (key: string, value: boolean) => {
    const success = await updateProfile({ [key]: value });
    if (success) {
      toast.success("Preference updated");
    } else {
      toast.error("Failed to update preference");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
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

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-amber-900 dark:text-amber-300">Profile not found</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Please ensure you're logged in and try refreshing the page.
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

      {/* Push Notifications */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Monitor className="h-5 w-5 text-brand" />
            Push Notifications
          </CardTitle>
          <CardDescription>Browser notifications for real-time updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

      {/* Email Notifications */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-brand" />
            Email Notifications
          </CardTitle>
          <CardDescription>Choose what emails you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <Label className="font-medium text-slate-900 dark:text-white cursor-pointer">
                  Newsletter
                </Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Weekly market insights and analysis
                </p>
              </div>
            </div>
            <Switch
              checked={newsletterOptIn}
              onCheckedChange={(checked) => {
                setNewsletterOptIn(checked);
                updateEmailPref("newsletter_opt_in", checked);
              }}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Megaphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <Label className="font-medium text-slate-900 dark:text-white cursor-pointer">
                  Product Announcements
                </Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  New features and platform updates
                </p>
              </div>
            </div>
            <Switch
              checked={announcementsOptIn}
              onCheckedChange={(checked) => {
                setAnnouncementsOptIn(checked);
                updateEmailPref("announcements_opt_in", checked);
              }}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <Label className="font-medium text-slate-900 dark:text-white cursor-pointer">
                  Market Alerts
                </Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Important market movements and alerts
                </p>
              </div>
            </div>
            <Switch
              checked={alertsOptIn}
              onCheckedChange={(checked) => {
                setAlertsOptIn(checked);
                updateEmailPref("alerts_opt_in", checked);
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
