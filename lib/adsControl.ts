import posthog from "posthog-js";

export type UserPlan = "free" | "premium" | "max";

// Pages where ads should appear for free users (comprehensive coverage)
const CORE_PAGE_PATHS = [
  "/screens",
  "/market",
  "/news",
  "/watchlist",
  "/calendar",
  "/dashboard",
];

// Pages where ads should NEVER appear (premium/immersive experiences)
const EXCLUDED_PAGE_PATHS = [
  "/ai",           // Immersive AI chat - no interruptions
  "/portfolio",    // Premium-only feature
  "/settings",     // User settings - no ads
  "/profile",      // User profile - no ads
  "/pricing",      // Pricing page - don't distract from conversion
  "/auth",         // Auth pages - no ads
  "/onboarding",   // Onboarding flow - no interruptions
  "/help",         // Help/support - no ads
  "/contact",      // Contact page - no ads
  "/about",        // About page - no ads
  "/feedback",     // Feedback - no ads
  "/api",          // API routes
];

/**
 * Check if the current pathname is a core page where ads can appear
 */
function isCorePage(pathname: string): boolean {
  if (CORE_PAGE_PATHS.includes(pathname)) return true;
  // Match screener results pages: /screens/[id] or /screens/results
  if (/^\/screens\/.+/.test(pathname)) return true;
  // Match company pages: /company/[ticker]
  if (/^\/company\/.+/.test(pathname)) return true;
  // Match news article pages: /news/[slug]
  if (/^\/news\/[^/]+$/.test(pathname)) return true;
  // Home page
  if (pathname === "/") return true;
  // Blog page
  if (pathname === "/blog") return true;
  return false;
}

/**
 * Check if the page is explicitly excluded from showing ads
 */
function isExcludedPage(pathname: string): boolean {
  return EXCLUDED_PAGE_PATHS.some(excluded => pathname.startsWith(excluded));
}

/**
 * Determine if ads should be shown based on feature flag, page, and user plan
 */
export function shouldShowAds(pathname: string, userPlan: UserPlan): boolean {
  // Never show ads on excluded pages regardless of flag
  if (isExcludedPage(pathname)) return false;

  const variant = posthog.getFeatureFlag("google-ads-display") as string | undefined;
  const isFreeUser = userPlan === "free";

  switch (variant) {
    case "show-all-pages-all-users":
      return !isExcludedPage(pathname);

    case "show-core-pages-all-users":
      return isCorePage(pathname);

    case "no-ads":
      return false;

    case "show-all-pages-free-users":
      return isFreeUser && !isExcludedPage(pathname);

    case "show-core-pages-free-users":
      return isFreeUser && isCorePage(pathname);

    default:
      // Safe fallback - default behavior for free users on core pages
      // This ensures ads show even if PostHog flag isn't loaded yet
      return isFreeUser && isCorePage(pathname);
  }
}

/**
 * Get the current feature flag variant (for debugging)
 */
export function getAdsFlagVariant(): string | undefined {
  return posthog.getFeatureFlag("google-ads-display") as string | undefined;
}
