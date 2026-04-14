"use client";

import { useEffect } from "react";
import { useAdsVisible } from "@/hooks/useAdsVisible";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/providers/AuthProvider";

/**
 * Google AdSlot component for fluid inline ads
 * Automatically handles visibility based on feature flags and user tier
 */
export function GoogleAdSlot() {
  const { session } = useAuth();
  const { profile } = useProfile(session?.access_token || null);
  const showAd = useAdsVisible(profile?.subscription_tier || "free");

  // Load AdSense script after ad becomes visible
  useEffect(() => {
    if (showAd && typeof window !== "undefined") {
      // Push ad to AdSense queue
      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, [showAd]);

  if (!showAd) {
    return null;
  }

  return (
    <div className="my-6 w-full">
      <div className="relative w-full min-h-[280px] bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-center overflow-hidden">
        <ins
          className="adsbygoogle w-full"
          style={{ display: "block" }}
          data-ad-client="ca-pub-3669621384912065"
          data-ad-slot="7770351449"
          data-ad-format="fluid"
          data-ad-layout-key="-hh-7+2h-1m-4u"
          data-full-width-responsive="true"
        />
        {/* Loading placeholder while ad loads */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-xs text-slate-400 dark:text-slate-500">Advertisement</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact ad slot variant for tighter spaces
 */
export function GoogleAdSlotCompact() {
  const { session } = useAuth();
  const { profile } = useProfile(session?.access_token || null);
  const showAd = useAdsVisible(profile?.subscription_tier || "free");

  useEffect(() => {
    if (showAd && typeof window !== "undefined") {
      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, [showAd]);

  if (!showAd) {
    return null;
  }

  return (
    <div className="my-4 w-full">
      <div className="relative w-full min-h-[100px] bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-center overflow-hidden">
        <ins
          className="adsbygoogle w-full"
          style={{ display: "block" }}
          data-ad-client="ca-pub-3669621384912065"
          data-ad-slot="7770351449"
          data-ad-format="fluid"
          data-ad-layout-key="-hh-7+2h-1m-4u"
          data-full-width-responsive="true"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-xs text-slate-400 dark:text-slate-500">Advertisement</p>
        </div>
      </div>
    </div>
  );
}
