"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Mail,
  Crown,
  Calendar,
  MessageSquare,
  Sparkles,
  Bell,
  Megaphone,
  AlertCircle,
  Save,
  Loader2,
  CheckCircle,
  Shield,
  Settings,
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  display_name: string | null;
  subscription_tier: string;
  role: string;
  newsletter_opt_in: boolean;
  announcements_opt_in: boolean;
  alerts_opt_in: boolean;
  created_at: string;
  updated_at: string;
}

interface ProfileStats {
  chatSessionsCount: number;
  reasoningUsedToday: number;
  reasoningLimit: number;
  memberSince: string;
}

export default function ProfilePage() {
  const { user, session, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [fullName, setFullName] = useState("");
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [announcementsOptIn, setAnnouncementsOptIn] = useState(false);
  const [alertsOptIn, setAlertsOptIn] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const fetchProfile = useCallback(async () => {
    if (!session?.access_token) return;

    try {
      const [profileRes, statsRes] = await Promise.all([
        fetch(`${apiBase}/profile`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch(`${apiBase}/profile/stats`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);

      if (!profileRes.ok) throw new Error("Failed to fetch profile");

      const profileData = await profileRes.json();
      setProfile(profileData);
      setDisplayName(profileData.display_name || "");
      setFullName(profileData.full_name || "");
      setNewsletterOptIn(profileData.newsletter_opt_in || false);
      setAnnouncementsOptIn(profileData.announcements_opt_in || false);
      setAlertsOptIn(profileData.alerts_opt_in || false);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, apiBase]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (session?.access_token) {
      fetchProfile();
    }
  }, [authLoading, user, session?.access_token, router, fetchProfile]);

  const handleSave = async () => {
    if (!session?.access_token) return;

    setSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          display_name: displayName,
          full_name: fullName,
          newsletter_opt_in: newsletterOptIn,
          announcements_opt_in: announcementsOptIn,
          alerts_opt_in: alertsOptIn,
        }),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    profile &&
    (displayName !== (profile.display_name || "") ||
      fullName !== (profile.full_name || "") ||
      newsletterOptIn !== profile.newsletter_opt_in ||
      announcementsOptIn !== profile.announcements_opt_in ||
      alertsOptIn !== profile.alerts_opt_in);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-4xl py-10 px-4 md:px-8 space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-32 md:col-span-1" />
            <Skeleton className="h-32 md:col-span-2" />
          </div>
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tierConfig = {
    free: { label: "Free", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
    premium: { label: "Premium", color: "bg-amber-500 text-white" },
    pro: { label: "Pro", color: "bg-purple-600 text-white" },
  };

  const tier = (profile?.subscription_tier || "free") as keyof typeof tierConfig;
  const tierInfo = tierConfig[tier] || tierConfig.free;

  const memberSince = stats?.memberSince
    ? new Date(stats.memberSince).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
    : "—";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl py-10 px-4 md:px-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profile</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage your account settings and preferences
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${hasChanges
                ? "bg-brand text-white hover:bg-brand/90 shadow-lg shadow-brand/25"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
              }`}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Profile Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Avatar & Basic Info */}
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

          {/* Stats Cards */}
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
                        {stats?.chatSessionsCount ?? 0}
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
                        {stats?.reasoningUsedToday ?? 0}
                        <span className="text-sm font-normal text-slate-400">
                          /{stats?.reasoningLimit ?? 3}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Reasoning Today</p>
                    </div>
                  </div>
                </div>
              </div>
              {tier === "free" && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <Crown className="h-4 w-4 inline mr-1" />
                    Upgrade to Premium for 20 reasoning queries/day and priority support.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Personal Information */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-white">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-slate-700 dark:text-slate-300">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should we call you?"
                  className="bg-white dark:bg-slate-800"
                />
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  This is how your name appears across the platform
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-300">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="bg-white dark:bg-slate-800"
                />
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Used for official communications
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Email Address</Label>
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">{user.email}</span>
                </div>
                <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-white">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Choose what updates you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Newsletter</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Weekly market insights and platform updates
                  </p>
                </div>
              </div>
              <Switch checked={newsletterOptIn} onCheckedChange={setNewsletterOptIn} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Megaphone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Announcements</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    New features and important platform news
                  </p>
                </div>
              </div>
              <Switch checked={announcementsOptIn} onCheckedChange={setAnnouncementsOptIn} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Price Alerts</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Notifications when your watched stocks hit price targets
                  </p>
                </div>
              </div>
              <Switch checked={alertsOptIn} onCheckedChange={setAlertsOptIn} />
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-white">
              <Shield className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>Your account details and security (read-only)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  {profile?.role || "user"}
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
                  {profile?.updated_at
                    ? new Date(profile.updated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                    : "—"}
                </span>
              </div>
            </div>

            {/* Settings Link */}
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
      </div>
    </div>
  );
}
