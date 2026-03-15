"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileAvatar, ProfileStats, PersonalInfoForm, AccountInfo } from "@/components/profile";
import { AlertCircle, Save, Loader2, CheckCircle } from "lucide-react";
import { z } from "zod";

// Validation schema
const profileSchema = z.object({
  display_name: z.string().max(100, "Display name must be 100 characters or less").optional(),
  full_name: z.string().max(100, "Full name must be 100 characters or less").optional(),
});

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
  events_and_promotions_opt_in: boolean;
  temp_suspend?: boolean;
  perm_suspend?: boolean;
  created_at: string;
  updated_at: string;
}

interface ValidationErrors {
  displayName?: string;
  fullName?: string;
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
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const apiBase = process.env.NEXT_PUBLIC_API_URL;

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

  // Validate form data
  const validateForm = useCallback(() => {
    const result = profileSchema.safeParse({
      display_name: displayName || undefined,
      full_name: fullName || undefined,
    });

    if (!result.success) {
      const errors: ValidationErrors = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === "display_name") errors.displayName = issue.message;
        if (issue.path[0] === "full_name") errors.fullName = issue.message;
      });
      setValidationErrors(errors);
      return false;
    }
    setValidationErrors({});
    return true;
  }, [displayName, fullName]);

  const handleSave = async () => {
    if (!session?.access_token || !apiBase) return;

    // Validate before saving
    if (!validateForm()) return;

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

  const hasChanges = useMemo(() => {
    if (!profile) return false;
    return (
      displayName !== (profile.display_name || "") ||
      fullName !== (profile.full_name || "")
    );
  }, [profile, displayName, fullName]);

  // Memoized member since date
  const memberSince = useMemo(() => {
    if (!stats?.memberSince) return "—";
    return new Date(stats.memberSince).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [stats?.memberSince]);

  if (authLoading || loading) {
    return (
      <div className="min-h-full bg-slate-50 dark:bg-slate-950">
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

  const subscriptionTier = profile?.subscription_tier || "free";

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950">
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
          <ProfileAvatar
            user={user}
            displayName={displayName}
            subscriptionTier={subscriptionTier}
            memberSince={memberSince}
          />
          <ProfileStats
            chatSessionsCount={stats?.chatSessionsCount ?? 0}
            reasoningUsedToday={stats?.reasoningUsedToday ?? 0}
            reasoningLimit={stats?.reasoningLimit ?? 3}
            subscriptionTier={subscriptionTier}
          />
        </div>

        {/* Personal Information */}
        <PersonalInfoForm
          email={user.email || ""}
          displayName={displayName}
          fullName={fullName}
          onDisplayNameChange={setDisplayName}
          onFullNameChange={setFullName}
          errors={validationErrors}
        />

        {/* Account Info */}
        {profile && (
          <AccountInfo
            user={user}
            profile={{
              role: profile.role,
              subscription_tier: profile.subscription_tier,
              updated_at: profile.updated_at,
              temp_suspend: profile.temp_suspend,
              perm_suspend: profile.perm_suspend,
            }}
          />
        )}
      </div>
    </div>
  );
}
