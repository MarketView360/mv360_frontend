"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  display_name: string | null;
  subscription_tier: "free" | "premium" | "max";
  role: string;
  preferences: Record<string, unknown>;
  metadata: Record<string, unknown>;
  newsletter_opt_in: boolean;
  announcements_opt_in: boolean;
  alerts_opt_in: boolean;
  events_and_promotions_opt_in: boolean;
  notification_prefs: Record<string, unknown>;
  onboarded_at: string | null;
  billing_customer_id: string | null;
  temp_suspend?: boolean;
  perm_suspend?: boolean;
  created_at: string;
  updated_at: string;
}

interface UseProfileResult {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useProfile(token: string | null): UseProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!token || !API_BASE) {
      setLoading(false);
      if (!API_BASE) {
        setError("API URL not configured");
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<boolean> => {
      if (!token || !API_BASE) return false;

      try {
        const response = await fetch(`${API_BASE}/profile`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error("Failed to update profile");
        }

        const data = await response.json();
        setProfile(data);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return false;
      }
    },
    [token],
  );

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile,
  };
}
