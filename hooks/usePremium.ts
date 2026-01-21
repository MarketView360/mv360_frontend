
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";

export function usePremium() {
  const { user, loading: authLoading } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkPremium() {
      if (!user) {
        if (mounted) {
          setIsPremium(false);
          setLoading(false);
        }
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("user_profiles")
          .select("subscription_tier")
          .eq("id", user.id)
          .single();

        if (mounted) {
          if (error) {
            // If no profile found, treat as free
            console.error("Error checking premium status:", error);
            setIsPremium(false);
          } else {
            setIsPremium(data?.subscription_tier === "premium");
          }
          setLoading(false);
        }
      } catch (e) {
        console.error("Failed to check premium status", e);
        if (mounted) {
          setIsPremium(false);
          setLoading(false);
        }
      }
    }

    if (!authLoading) {
      checkPremium();
    }

    return () => {
      mounted = false;
    };
  }, [user, authLoading]);

  return { isPremium, loading: loading || authLoading };
}
