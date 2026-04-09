"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

/**
 * PostHog Surveys Component
 * Automatically displays PostHog surveys when they are eligible to be shown
 */
export function PostHogSurveys() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load surveys when component mounts
      const loadSurveys = () => {
        if (posthog && posthog.getSurveys) {
          posthog.getSurveys((surveys) => {
            if (surveys && surveys.length > 0) {
              console.log("[PostHog Surveys] Available surveys:", surveys);
            }
          });
        }
      };

      // Load surveys after a short delay to ensure PostHog is initialized
      const timer = setTimeout(loadSurveys, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  // This component doesn't render anything - PostHog surveys are displayed as popups
  return null;
}
