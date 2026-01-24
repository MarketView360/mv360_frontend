"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "mv360_chart_preferences";

export interface ChartPreferences {
  showVolume: boolean;
  showAnimations: boolean;
  defaultChartType: "area" | "candlestick";
  defaultRange: string;
}

const DEFAULT_PREFERENCES: ChartPreferences = {
  showVolume: true,
  showAnimations: true,
  defaultChartType: "area",
  defaultRange: "1Y",
};

export function useChartPreferences() {
  const [preferences, setPreferences] = useState<ChartPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<ChartPreferences>;
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (e) {
      console.warn("Failed to load chart preferences:", e);
    }
    setIsLoaded(true);
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback((newPrefs: Partial<ChartPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...newPrefs };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to save chart preferences:", e);
      }
      return updated;
    });
  }, []);

  const setShowVolume = useCallback(
    (show: boolean) => savePreferences({ showVolume: show }),
    [savePreferences]
  );

  const setShowAnimations = useCallback(
    (show: boolean) => savePreferences({ showAnimations: show }),
    [savePreferences]
  );

  const setDefaultChartType = useCallback(
    (type: "area" | "candlestick") => savePreferences({ defaultChartType: type }),
    [savePreferences]
  );

  const setDefaultRange = useCallback(
    (range: string) => savePreferences({ defaultRange: range }),
    [savePreferences]
  );

  return {
    preferences,
    isLoaded,
    setShowVolume,
    setShowAnimations,
    setDefaultChartType,
    setDefaultRange,
    savePreferences,
  };
}
