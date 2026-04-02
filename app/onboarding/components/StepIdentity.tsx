"use client";

import { useEffect, useState } from "react";
import { User, Globe, ChevronDown } from "lucide-react";
import type { OnboardingStep1Data } from "@/hooks/useOnboarding";

interface StepIdentityProps {
  data: OnboardingStep1Data;
  setData: React.Dispatch<React.SetStateAction<OnboardingStep1Data>>;
}

// Common timezones for the dropdown
const COMMON_TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time" },
  { value: "Pacific/Honolulu", label: "Hawaii Time" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Central European Time" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "China (CST)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT)" },
];

export function StepIdentity({ data, setData }: StepIdentityProps) {
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Auto-generate display name from full name
  useEffect(() => {
    if (data.full_name && !data.display_name) {
      const firstName = data.full_name.split(" ")[0];
      setData((prev) => ({ ...prev, display_name: firstName }));
    }
  }, [data.full_name, data.display_name, setData]);

  const currentTimezoneLabel = COMMON_TIMEZONES.find(
    (tz) => tz.value === data.timezone
  )?.label || data.timezone;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome to MarketView360
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Let&apos;s set up your workspace. This takes under 3 minutes.
        </p>
      </div>

      <div className="space-y-5">
        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              id="fullName"
              type="text"
              value={data.full_name}
              onChange={(e) =>
                setData((prev) => ({ ...prev, full_name: e.target.value }))
              }
              placeholder="John Doe"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Display Name
            <span className="ml-1 text-xs text-slate-400 font-normal">
              (shown in app)
            </span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              id="displayName"
              type="text"
              value={data.display_name}
              onChange={(e) =>
                setData((prev) => ({ ...prev, display_name: e.target.value }))
              }
              placeholder="John"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Your Timezone
            <span className="ml-1 text-xs text-slate-400 font-normal">
              (for alerts & market hours)
            </span>
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
            <button
              type="button"
              onClick={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {currentTimezoneLabel}
              {data.timezone === detectedTimezone && (
                <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                  (auto-detected)
                </span>
              )}
            </button>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

            {showTimezoneDropdown && (
              <div className="absolute z-20 w-full mt-1 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {COMMON_TIMEZONES.map((tz) => (
                  <button
                    key={tz.value}
                    type="button"
                    onClick={() => {
                      setData((prev) => ({ ...prev, timezone: tz.value }));
                      setShowTimezoneDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                      data.timezone === tz.value
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {tz.label}
                    {tz.value === detectedTimezone && (
                      <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                        (detected)
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
