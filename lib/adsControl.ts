import posthog from "posthog-js";

export type UserPlan = "free" | "premium" | "max";

// Core pages where ads should appear (when flag is set to show-core-pages-*)
const CORE_PAGE_PATHS = ["/screens", "/market", "/news"];

/**
 * Check if the current pathname is a core page
 */
function isCorePage(pathname: string): boolean {
  if (CORE_PAGE_PATHS.includes(pathname)) return true;
  // Match screener results pages: /screens/[id]
  if (/^\/screens\/.+/.test(pathname)) return true;
  return false;
}

/**
 * Determine if ads should be shown based on feature flag, page, and user plan
 */
export function shouldShowAds(pathname: string, userPlan: UserPlan): boolean {
  const variant = posthog.getFeatureFlag("google-ads-display") as string | undefined;
  const isFreeUser = userPlan === "free";

  switch (variant) {
    case "show-all-pages-all-users":
      return true;

    case "show-core-pages-all-users":
      return isCorePage(pathname);

    case "no-ads":
      return false;

    case "show-all-pages-free-users":
      return isFreeUser;

    case "show-core-pages-free-users":
      return isFreeUser && isCorePage(pathname);

    default:
      // Safe fallback - no ads if flag is unavailable or unknown variant
      return false;
  }
}

/**
 * Get the current feature flag variant (for debugging)
 */
export function getAdsFlagVariant(): string | undefined {
  return posthog.getFeatureFlag("google-ads-display") as string | undefined;
}
