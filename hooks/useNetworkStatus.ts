"use client";

import { useEffect, useState, useCallback } from "react";

export type NetworkStatus = {
  isOnline: boolean;
  isSlow: boolean;
  lastCheck: number | null;
  warningsDisabled: boolean;
  setWarningsDisabled: (disabled: boolean) => void;
};

const WARNINGS_DISABLED_KEY = "networkWarningsDisabled";

// Global feature flag to turn network status checks on/off from code
export const NETWORK_STATUS_ENABLED = false;

// Thresholds
const SLOW_DOWNLINK_MBPS = 0.5; // below this we consider the connection slow

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [isSlow, setIsSlow] = useState<boolean>(false);
  const [lastCheck, setLastCheck] = useState<number | null>(null);
  const [warningsDisabled, setWarningsDisabledState] = useState<boolean>(false);

  // Load preference from localStorage
  useEffect(() => {
    if (!NETWORK_STATUS_ENABLED) return;
    try {
      const stored = typeof window !== "undefined" ? window.localStorage.getItem(WARNINGS_DISABLED_KEY) : null;
      if (stored === "true") {
        setWarningsDisabledState(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const setWarningsDisabled = useCallback((disabled: boolean) => {
    setWarningsDisabledState(disabled);
    if (!NETWORK_STATUS_ENABLED) return;
    try {
      if (disabled) {
        window.localStorage.setItem(WARNINGS_DISABLED_KEY, "true");
      } else {
        window.localStorage.removeItem(WARNINGS_DISABLED_KEY);
      }
    } catch {
      // ignore
    }
  }, []);

  // Basic online / offline listeners
  useEffect(() => {
    if (!NETWORK_STATUS_ENABLED) return;
    const handleOnline = () => {
      setIsOnline(true);
      setIsSlow(false);
      setLastCheck(Date.now());
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastCheck(Date.now());
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Check connection quality via Network Information API when available
  useEffect(() => {
    if (!NETWORK_STATUS_ENABLED) return;
    if (typeof navigator === "undefined") return;
    const anyNav = navigator as any;
    const connection = anyNav.connection || anyNav.mozConnection || anyNav.webkitConnection;
    if (!connection) return;

    const evaluateConnection = () => {
      const downlink = typeof connection.downlink === "number" ? connection.downlink : null;
      if (downlink !== null) {
        setIsSlow(downlink > 0 && downlink < SLOW_DOWNLINK_MBPS);
        setLastCheck(Date.now());
      }
    };

    evaluateConnection();

    connection.addEventListener?.("change", evaluateConnection);
    return () => {
      connection.removeEventListener?.("change", evaluateConnection);
    };
  }, []);

  const effectiveIsOnline = NETWORK_STATUS_ENABLED ? isOnline : true;
  const effectiveIsSlow = NETWORK_STATUS_ENABLED ? isSlow : false;
  const effectiveLastCheck = NETWORK_STATUS_ENABLED ? lastCheck : null;

  return {
    isOnline: effectiveIsOnline,
    isSlow: effectiveIsSlow,
    lastCheck: effectiveLastCheck,
    warningsDisabled,
    setWarningsDisabled,
  };
}
