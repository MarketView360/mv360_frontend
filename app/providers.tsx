"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthProvider } from "@/providers/AuthProvider";
import { WatchlistProvider } from "@/providers/WatchlistProvider";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

if (typeof window !== "undefined") {
  const postHogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const postHogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  console.log("[PostHog Debug] Env vars on client:");
  console.log("[PostHog Debug] Key:", postHogKey ? `${postHogKey.substring(0, 8)}...` : "UNDEFINED");
  console.log("[PostHog Debug] Host:", postHogHost || "UNDEFINED");

  if (!postHogKey || !postHogHost) {
    console.error("[PostHog Debug] MISSING ENV VARS - PostHog will not initialize");
  } else {
    posthog.init(postHogKey, {
      api_host: postHogHost,
      person_profiles: "always", // Changed from "identified_only" to allow anonymous events
      capture_pageview: false,
      defaults: "2026-01-30",
      loaded: (posthog) => {
        console.log("[PostHog Debug] PostHog initialized successfully");
        console.log("[PostHog Debug] PostHog loaded status:", posthog.__loaded);
        console.log("[PostHog Debug] PostHog instance:", posthog);
        // Expose posthog to window for debugging in console
        (window as any).posthog = posthog;
        // Reload feature flags to ensure they're up to date
        posthog.reloadFeatureFlags();
      },
      verbose: true, // Enable verbose logging
      disable_compression: false,
      autocapture: true, // Enable autocapture for testing
      bootstrap: {
        // Bootstrap feature flags for immediate availability
        // These will be overwritten when flags are loaded from the server
        featureFlags: {
          'ai-enabled': false,           // Master AI kill switch
          'ai-enable-free': false,        // Free user AI access (default: disabled)
          'show-free-ai-promo-msg': false, // Show promo message to free users
          'premium-payment-status': 'disabled-paused', // Payments default to paused (valid PaymentStatus)
        },
      },
    });
  }
}

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    const saved = window.localStorage.getItem("theme") as Theme | null;
    if (saved === "light" || saved === "dark") return saved;

    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    return prefersDark ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [isDark, setIsDark] = useState(theme === "dark");
  const [mounted, setMounted] = useState(false);

  // Debug: Log PostHog status after mount
  useEffect(() => {
    setMounted(true);
    applyTheme(theme);

    // Check PostHog status 1 second after mount
    const checkPostHog = setTimeout(() => {
      if (typeof window !== "undefined") {
        const ph = (window as any).posthog;
        if (ph) {
          console.log("[PostHog Debug] PostHog found on window:", {
            loaded: ph.__loaded,
            config: ph.config,
          });
        } else {
          console.warn("[PostHog Debug] PostHog NOT found on window!");
        }
      }
    }, 1000);

    return () => clearTimeout(checkPostHog);
  }, []);

  const applyTheme = (themeToApply: Theme) => {
    const htmlElement = document.documentElement;
    const isDarkMode = themeToApply === "dark";

    if (isDarkMode) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }

    setIsDark(isDarkMode);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
    }
    applyTheme(newTheme);
  };

  // Apply theme immediately on mount
  useEffect(() => {
    setMounted(true);
    applyTheme(theme);
  }, []);

  return (
    <PostHogProvider client={posthog}>
      <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
        <AuthProvider>
          <WatchlistProvider>
            {children}
          </WatchlistProvider>
        </AuthProvider>
      </ThemeContext.Provider>
    </PostHogProvider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
