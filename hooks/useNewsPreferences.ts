"use client";

import { useState, useEffect, useCallback } from "react";

export type PaginationStyle = "infinite" | "numbered";

export interface NewsPreferences {
  paginationStyle: PaginationStyle;
  itemsPerPage: number;
}

const STORAGE_KEY = "mv360_news_preferences";

const DEFAULT_PREFERENCES: NewsPreferences = {
  paginationStyle: "infinite",
  itemsPerPage: 12,
};

export function useNewsPreferences() {
  const [preferences, setPreferences] = useState<NewsPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<NewsPreferences>;
        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...parsed,
        });
      }
    } catch (error) {
      console.error("Failed to load news preferences:", error);
    }
    setIsLoaded(true);
  }, []);

  const updatePreferences = useCallback((updates: Partial<NewsPreferences>) => {
    setPreferences((prev) => {
      const newPrefs = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
      } catch (error) {
        console.error("Failed to save news preferences:", error);
      }
      return newPrefs;
    });
  }, []);

  const setPaginationStyle = useCallback(
    (style: PaginationStyle) => {
      updatePreferences({ paginationStyle: style });
    },
    [updatePreferences]
  );

  const setItemsPerPage = useCallback(
    (count: number) => {
      updatePreferences({ itemsPerPage: count });
    },
    [updatePreferences]
  );

  return {
    preferences,
    isLoaded,
    updatePreferences,
    setPaginationStyle,
    setItemsPerPage,
  };
}
