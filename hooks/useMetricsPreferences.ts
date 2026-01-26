"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "mv360_metrics_preferences";

export type MetricCategory = 
  | "valuation"
  | "profitability"
  | "growth"
  | "dividends"
  | "risk"
  | "ownership";

export interface MetricsPreferences {
  // Display mode
  defaultView: "compact" | "expanded";
  showQualityTags: boolean;
  showDefinitionsOnHover: boolean;
  
  // Visible categories (all shown by default)
  visibleCategories: Record<MetricCategory, boolean>;
  
  // Category expansion state
  expandedCategories: Record<MetricCategory, boolean>;
  
  // Advanced/Pro metrics visibility
  showAdvancedMetrics: boolean;
}

const DEFAULT_PREFERENCES: MetricsPreferences = {
  defaultView: "compact",
  showQualityTags: true,
  showDefinitionsOnHover: true,
  
  visibleCategories: {
    valuation: true,
    profitability: true,
    growth: true,
    dividends: true,
    risk: true,
    ownership: true,
  },
  
  expandedCategories: {
    valuation: true,
    profitability: true,
    growth: true,
    dividends: false,
    risk: false,
    ownership: false,
  },
  
  showAdvancedMetrics: false,
};

export function useMetricsPreferences() {
  const [preferences, setPreferences] = useState<MetricsPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<MetricsPreferences>;
        setPreferences((prev) => ({
          ...prev,
          ...parsed,
          visibleCategories: {
            ...prev.visibleCategories,
            ...(parsed.visibleCategories || {}),
          },
          expandedCategories: {
            ...prev.expandedCategories,
            ...(parsed.expandedCategories || {}),
          },
        }));
      }
    } catch (e) {
      console.warn("Failed to load metrics preferences from localStorage", e);
    }
    setIsLoaded(true);
  }, []);

  // Persist preferences to localStorage
  const persistPreferences = useCallback((newPrefs: MetricsPreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
    } catch (e) {
      console.warn("Failed to save metrics preferences to localStorage", e);
    }
  }, []);

  // Update entire preferences object
  const updatePreferences = useCallback(
    (updates: Partial<MetricsPreferences>) => {
      setPreferences((prev) => {
        const updated = { ...prev, ...updates };
        persistPreferences(updated);
        return updated;
      });
    },
    [persistPreferences]
  );

  // Individual setters for convenience
  const setDefaultView = useCallback(
    (view: "compact" | "expanded") => {
      updatePreferences({ defaultView: view });
    },
    [updatePreferences]
  );

  const setShowQualityTags = useCallback(
    (show: boolean) => {
      updatePreferences({ showQualityTags: show });
    },
    [updatePreferences]
  );

  const setShowDefinitionsOnHover = useCallback(
    (show: boolean) => {
      updatePreferences({ showDefinitionsOnHover: show });
    },
    [updatePreferences]
  );

  const setShowAdvancedMetrics = useCallback(
    (show: boolean) => {
      updatePreferences({ showAdvancedMetrics: show });
    },
    [updatePreferences]
  );

  const setCategoryVisible = useCallback(
    (category: MetricCategory, visible: boolean) => {
      setPreferences((prev) => {
        const updated = {
          ...prev,
          visibleCategories: {
            ...prev.visibleCategories,
            [category]: visible,
          },
        };
        persistPreferences(updated);
        return updated;
      });
    },
    [persistPreferences]
  );

  const setCategoryExpanded = useCallback(
    (category: MetricCategory, expanded: boolean) => {
      setPreferences((prev) => {
        const updated = {
          ...prev,
          expandedCategories: {
            ...prev.expandedCategories,
            [category]: expanded,
          },
        };
        persistPreferences(updated);
        return updated;
      });
    },
    [persistPreferences]
  );

  const toggleCategoryExpanded = useCallback(
    (category: MetricCategory) => {
      setPreferences((prev) => {
        const updated = {
          ...prev,
          expandedCategories: {
            ...prev.expandedCategories,
            [category]: !prev.expandedCategories[category],
          },
        };
        persistPreferences(updated);
        return updated;
      });
    },
    [persistPreferences]
  );

  const expandAllCategories = useCallback(() => {
    setPreferences((prev) => {
      const updated = {
        ...prev,
        expandedCategories: {
          valuation: true,
          profitability: true,
          growth: true,
          dividends: true,
          risk: true,
          ownership: true,
        },
      };
      persistPreferences(updated);
      return updated;
    });
  }, [persistPreferences]);

  const collapseAllCategories = useCallback(() => {
    setPreferences((prev) => {
      const updated = {
        ...prev,
        expandedCategories: {
          valuation: false,
          profitability: false,
          growth: false,
          dividends: false,
          risk: false,
          ownership: false,
        },
      };
      persistPreferences(updated);
      return updated;
    });
  }, [persistPreferences]);

  const resetToDefaults = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    persistPreferences(DEFAULT_PREFERENCES);
  }, [persistPreferences]);

  return {
    preferences,
    isLoaded,
    
    // Update methods
    updatePreferences,
    setDefaultView,
    setShowQualityTags,
    setShowDefinitionsOnHover,
    setShowAdvancedMetrics,
    setCategoryVisible,
    setCategoryExpanded,
    toggleCategoryExpanded,
    expandAllCategories,
    collapseAllCategories,
    resetToDefaults,
  };
}
