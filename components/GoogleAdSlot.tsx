"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdsVisible } from "@/hooks/useAdsVisible";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/providers/AuthProvider";

// Ad slot IDs for different placements - these map to Google AdSense
const AD_SLOTS = {
  // Primary inline ad (between content sections)
  inline: "7770351449",
  // Sidebar ad (right column)
  sidebar: "7770351449",
  // In-feed ad (within news grid / card lists)
  inFeed: "7770351449",
  // Compact ad (tighter spaces)
  compact: "7770351449",
  // Horizontal banner (full-width between major sections)
  banner: "7770351449",
} as const;

type AdSlotType = keyof typeof AD_SLOTS;

/**
 * Shared hook to push an ad to the AdSense queue and track loading state
 */
function useAdPush(showAd: boolean) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAd, setHasAd] = useState(false);

  useEffect(() => {
    if (!showAd || typeof window === "undefined") return;

    const checkAdLoaded = () => {
      const containers = document.querySelectorAll('.adsbygoogle');
      containers.forEach((container) => {
        if (container.children.length > 0) {
          setIsLoading(false);
          setHasAd(true);
        }
      });
    };

    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});

      const timeout = setTimeout(() => {
        checkAdLoaded();
      }, 2000);

      const hideTimeout = setTimeout(() => {
        setIsLoading(false);
      }, 3000);

      return () => {
        clearTimeout(timeout);
        clearTimeout(hideTimeout);
      };
    } catch (e) {
      console.error("AdSense error:", e);
      setIsLoading(false);
    }
  }, [showAd]);

  return { isLoading, hasAd };
}

/**
 * Base ad slot wrapper - handles visibility, loading state, and AdSense push
 */
function AdSlotWrapper({
  showAd,
  isLoading,
  hasAd,
  children,
  className = "",
}: {
  showAd: boolean;
  isLoading: boolean;
  hasAd: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  if (!showAd) return null;
  if (!isLoading && !hasAd) return null;

  return <div className={className}>{children}</div>;
}

// ─────────────────────────────────────────────────────────────
// PUBLIC AD COMPONENTS
// ─────────────────────────────────────────────────────────────

/**
 * GoogleAdSlot - Primary inline ad for between content sections
 * Fluid layout that fills the available width naturally
 */
export function GoogleAdSlot() {
  const { session } = useAuth();
  const { profile } = useProfile(session?.access_token || null);
  const showAd = useAdsVisible(profile?.subscription_tier || "free");
  const { isLoading, hasAd } = useAdPush(showAd);

  return (
    <AdSlotWrapper
      showAd={showAd}
      isLoading={isLoading}
      hasAd={hasAd}
      className="my-6 w-full"
    >
      <div className="relative w-full min-h-[100px] bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700/50">
        <ins
          className="adsbygoogle w-full"
          style={{ display: "block" }}
          data-ad-client="ca-pub-3669621384912065"
          data-ad-slot={AD_SLOTS.inline}
          data-ad-format="fluid"
          data-ad-layout-key="-hh-7+2h-1m-4u"
          data-full-width-responsive="true"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-[10px] uppercase tracking-widest text-slate-300 dark:text-slate-600">Advertisement</p>
        </div>
      </div>
    </AdSlotWrapper>
  );
}

/**
 * GoogleAdSlotCompact - Compact ad variant for tighter spaces
 * Smaller vertical footprint with subtle styling
 */
export function GoogleAdSlotCompact() {
  const { session } = useAuth();
  const { profile } = useProfile(session?.access_token || null);
  const showAd = useAdsVisible(profile?.subscription_tier || "free");
  const { isLoading, hasAd } = useAdPush(showAd);

  return (
    <AdSlotWrapper
      showAd={showAd}
      isLoading={isLoading}
      hasAd={hasAd}
      className="my-3 w-full"
    >
      <div className="relative w-full min-h-[90px] bg-slate-50/80 dark:bg-slate-800/30 rounded-lg flex items-center justify-center overflow-hidden">
        <ins
          className="adsbygoogle w-full"
          style={{ display: "block" }}
          data-ad-client="ca-pub-3669621384912065"
          data-ad-slot={AD_SLOTS.compact}
          data-ad-format="fluid"
          data-ad-layout-key="-hh-7+2h-1m-4u"
          data-full-width-responsive="true"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-[10px] uppercase tracking-widest text-slate-300 dark:text-slate-600">Ad</p>
        </div>
      </div>
    </AdSlotWrapper>
  );
}

/**
 * GoogleAdInline - Horizontal banner ad between major page sections
 * Designed to blend naturally as a section divider
 * Uses the "auto" format for horizontal leaderboard-style ads
 */
export function GoogleAdInline() {
  const { session } = useAuth();
  const { profile } = useProfile(session?.access_token || null);
  const showAd = useAdsVisible(profile?.subscription_tier || "free");
  const { isLoading, hasAd } = useAdPush(showAd);

  return (
    <AdSlotWrapper
      showAd={showAd}
      isLoading={isLoading}
      hasAd={hasAd}
      className="w-full"
    >
      <div className="py-4">
        <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
          <div className="relative w-full min-h-[90px] bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700/40">
            <ins
              className="adsbygoogle w-full"
              style={{ display: "block" }}
              data-ad-client="ca-pub-3669621384912065"
              data-ad-slot={AD_SLOTS.banner}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-[10px] uppercase tracking-widest text-slate-300 dark:text-slate-600">Advertisement</p>
            </div>
          </div>
        </div>
      </div>
    </AdSlotWrapper>
  );
}

/**
 * GoogleAdSidebar - Ad designed for sidebar placement
 * Vertical format that fits naturally in side columns
 * Can be made sticky for persistent visibility while scrolling
 */
export function GoogleAdSidebar({ sticky = false }: { sticky?: boolean }) {
  const { session } = useAuth();
  const { profile } = useProfile(session?.access_token || null);
  const showAd = useAdsVisible(profile?.subscription_tier || "free");
  const { isLoading, hasAd } = useAdPush(showAd);

  if (!showAd) return null;
  if (!isLoading && !hasAd) return null;

  return (
    <div className={sticky ? "sticky top-20" : ""}>
      <div className="w-full min-h-[250px] bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700/40">
        <ins
          className="adsbygoogle w-full"
          style={{ display: "block" }}
          data-ad-client="ca-pub-3669621384912065"
          data-ad-slot={AD_SLOTS.sidebar}
          data-ad-format="vertical"
          data-full-width-responsive="true"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-[10px] uppercase tracking-widest text-slate-300 dark:text-slate-600">Advertisement</p>
        </div>
      </div>
    </div>
  );
}

/**
 * GoogleAdInFeed - Ad that blends into card grids and news feeds
 * Mimics the card style of surrounding content for seamless integration
 * Designed to appear between cards in grid layouts
 */
export function GoogleAdInFeed() {
  const { session } = useAuth();
  const { profile } = useProfile(session?.access_token || null);
  const showAd = useAdsVisible(profile?.subscription_tier || "free");
  const { isLoading, hasAd } = useAdPush(showAd);

  return (
    <AdSlotWrapper
      showAd={showAd}
      isLoading={isLoading}
      hasAd={hasAd}
      className="w-full"
    >
      <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-slate-300 dark:text-slate-600 font-medium">Sponsored</span>
          <span className="text-[9px] text-slate-300 dark:text-slate-600">Ad</span>
        </div>
        <div className="w-full min-h-[120px] bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-center overflow-hidden">
          <ins
            className="adsbygoogle w-full"
            style={{ display: "block" }}
            data-ad-client="ca-pub-3669621384912065"
            data-ad-slot={AD_SLOTS.inFeed}
            data-ad-format="fluid"
            data-ad-layout-key="-6t+7c+2r-1m-4u"
            data-full-width-responsive="true"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-[10px] text-slate-300 dark:text-slate-600">Loading ad...</p>
          </div>
        </div>
      </div>
    </AdSlotWrapper>
  );
}
