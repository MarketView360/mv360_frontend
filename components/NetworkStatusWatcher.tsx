"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { useNetworkStatus, NETWORK_STATUS_ENABLED } from "@/hooks/useNetworkStatus";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NetworkStatusWatcher() {
  const { isOnline, isSlow, warningsDisabled, setWarningsDisabled } = useNetworkStatus();
  const [wasOffline, setWasOffline] = useState(!isOnline);
  const [backOnlineVisible, setBackOnlineVisible] = useState(false);
  const [sessionHidden, setSessionHidden] = useState(false);

  // Track offline -> online transitions to show a short back-online toast
  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setBackOnlineVisible(false);
      setSessionHidden(false);
      return;
    }

    if (wasOffline && isOnline) {
      setBackOnlineVisible(true);
      setWasOffline(false);
      setSessionHidden(false);
    }
  }, [isOnline, wasOffline]);

  // Auto-dismiss the back-online toast after a short delay
  useEffect(() => {
    if (!backOnlineVisible) return;

    const timeout = window.setTimeout(() => {
      setBackOnlineVisible(false);
      setSessionHidden(true);
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [backOnlineVisible]);

  // Reset per-session hidden state when network condition changes
  useEffect(() => {
    setSessionHidden(false);
  }, [isOnline, isSlow]);

  if (!NETWORK_STATUS_ENABLED) return null;

  if (warningsDisabled) return null;

  const showOffline = !isOnline;
  const showSlow = isOnline && isSlow;
  const showBackOnline = !showOffline && !showSlow && backOnlineVisible;

  if (!showOffline && !showSlow && !showBackOnline) return null;

  if (sessionHidden) return null;

  const title = showOffline
    ? "No internet connection"
    : showSlow
    ? "Slow connection detected"
    : "Back online";

  const message = showOffline
    ? "You appear to be offline. Data may be out of date until your connection is restored."
    : showSlow
    ? "Your internet connection seems slow. Some market data may take longer to load."
    : "Your connection has been restored. Live prices and data are updating again.";

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-xl w-[95vw] md:w-auto">
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur bg-white/90 dark:bg-slate-900/90",
          showOffline
            ? "border-amber-300 bg-amber-50/90 dark:border-amber-500/60 dark:bg-amber-950/60"
            : showSlow
            ? "border-sky-200 bg-sky-50/90 dark:border-sky-500/60 dark:bg-sky-950/60"
            : "border-emerald-300 bg-emerald-50/90 dark:border-emerald-500/60 dark:bg-emerald-950/60"
        )}
      >
        <div className="mt-0.5">
          {showOffline ? (
            <WifiOff className="h-4 w-4 text-amber-600 dark:text-amber-300" />
          ) : showSlow ? (
            <Wifi className="h-4 w-4 text-sky-600 dark:text-sky-300" />
          ) : (
            <Wifi className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
          )}
        </div>
        <div className="flex-1 text-xs leading-relaxed text-slate-800 dark:text-slate-100">
          <div className="font-semibold mb-0.5">{title}</div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            {message}
          </p>
          {!showBackOnline && (
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              You can disable these network tips anytime from the banner.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1 ml-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[11px]"
            onClick={() => setSessionHidden(true)}
          >
            Got it
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-[11px]"
            onClick={() => setWarningsDisabled(true)}
          >
            Don&apos;t show again
          </Button>
        </div>
      </div>
    </div>
  );
}
