"use client";

import { useState, useEffect } from "react";

interface PlatformInfo {
  isMac: boolean;
  modKey: string;      // "⌘" on Mac, "Ctrl" on others
  modKeyLabel: string; // "Command" on Mac, "Control" on others
}

/**
 * Detects the user's OS to display the correct modifier key (⌘ vs Ctrl).
 * Returns { isMac: false } during SSR to avoid hydration mismatch.
 */
export function usePlatform(): PlatformInfo {
  const [platform, setPlatform] = useState<PlatformInfo>({
    isMac: false,
    modKey: "Ctrl",
    modKeyLabel: "Control",
  });

  useEffect(() => {
    const isMac =
      typeof navigator !== "undefined" &&
        /mac|ipod|iphone|ipad/i.test(navigator.userAgent);

    setPlatform({
      isMac,
      modKey: isMac ? "⌘" : "Ctrl",
      modKeyLabel: isMac ? "Command" : "Control",
    });
  }, []);

  return platform;
}
