"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "jovan-tools-config";

/** Definition of a tool available in Jovan AI */
export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  enabled: boolean;
}

/** Full tools configuration */
export interface ToolsConfig {
  enabled: boolean; // master toggle
  tools: ToolDefinition[];
}

/** All available tools — single source of truth */
export const AVAILABLE_TOOLS: Omit<ToolDefinition, "enabled">[] = [
  {
    id: "get_fundamentals",
    name: "Stock Fundamentals",
    description: "Retrieve price, valuation, and financial data for US stocks",
    icon: "TrendingUp",
  },
];

function getDefaultConfig(): ToolsConfig {
  return {
    enabled: true,
    tools: AVAILABLE_TOOLS.map((t) => ({ ...t, enabled: true })),
  };
}

function loadConfig(): ToolsConfig {
  if (typeof window === "undefined") return getDefaultConfig();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultConfig();
    const parsed = JSON.parse(raw) as Partial<ToolsConfig>;

    // Merge with defaults to handle new tools added in future
    const defaults = getDefaultConfig();
    const mergedTools = defaults.tools.map((dt) => {
      const saved = parsed.tools?.find((t) => t.id === dt.id);
      return saved ? { ...dt, enabled: saved.enabled } : dt;
    });

    return {
      enabled: parsed.enabled ?? true,
      tools: mergedTools,
    };
  } catch {
    return getDefaultConfig();
  }
}

function saveConfig(config: ToolsConfig) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Hook to manage Jovan AI tools configuration.
 * Persists to localStorage so it syncs between chat UI and settings page.
 */
export function useToolsConfig() {
  const [config, setConfig] = useState<ToolsConfig>(getDefaultConfig);

  // Load from localStorage on mount
  useEffect(() => {
    setConfig(loadConfig());
  }, []);

  const updateConfig = useCallback((newConfig: ToolsConfig) => {
    setConfig(newConfig);
    saveConfig(newConfig);
    // Dispatch storage event so other tabs/components stay synced
    window.dispatchEvent(new Event("tools-config-changed"));
  }, []);

  // Listen for changes from other components (e.g., settings page)
  useEffect(() => {
    const handler = () => setConfig(loadConfig());
    window.addEventListener("tools-config-changed", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("tools-config-changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  /** Toggle master tools on/off */
  const setToolsEnabled = useCallback(
    (enabled: boolean) => {
      updateConfig({ ...config, enabled });
    },
    [config, updateConfig],
  );

  /** Toggle a specific tool */
  const setToolEnabled = useCallback(
    (toolId: string, enabled: boolean) => {
      const enabledCount = config.tools.filter((t) => t.enabled).length;

      // Can't disable the last tool — must disable tools as a whole
      if (!enabled && enabledCount <= 1) {
        return false;
      }

      const newTools = config.tools.map((t) =>
        t.id === toolId ? { ...t, enabled } : t,
      );
      updateConfig({ ...config, tools: newTools });
      return true;
    },
    [config, updateConfig],
  );

  /** Get list of enabled tool IDs (for sending to backend) */
  const enabledToolIds = config.enabled
    ? config.tools.filter((t) => t.enabled).map((t) => t.id)
    : [];

  /** Whether tools are effectively active (master on + at least one tool on) */
  const isToolsActive = config.enabled && enabledToolIds.length > 0;

  return {
    config,
    setToolsEnabled,
    setToolEnabled,
    enabledToolIds,
    isToolsActive,
  };
}
