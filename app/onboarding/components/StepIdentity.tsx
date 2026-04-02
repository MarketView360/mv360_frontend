"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import type { OnboardingStep1Data } from "@/hooks/useOnboarding";

interface StepIdentityProps {
  data: OnboardingStep1Data;
  setData: React.Dispatch<React.SetStateAction<OnboardingStep1Data>>;
}

const COMMON_TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)", region: "Americas" },
  { value: "America/Chicago", label: "Central Time (CT)", region: "Americas" },
  { value: "America/Denver", label: "Mountain Time (MT)", region: "Americas" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)", region: "Americas" },
  { value: "America/Anchorage", label: "Alaska Time", region: "Americas" },
  { value: "Pacific/Honolulu", label: "Hawaii Time", region: "Pacific" },
  { value: "Europe/London", label: "London (GMT/BST)", region: "Europe" },
  { value: "Europe/Paris", label: "Central European Time", region: "Europe" },
  { value: "Europe/Berlin", label: "Berlin (CET)", region: "Europe" },
  { value: "Asia/Dubai", label: "Dubai (GST)", region: "Middle East" },
  { value: "Asia/Kolkata", label: "India (IST)", region: "Asia" },
  { value: "Asia/Singapore", label: "Singapore (SGT)", region: "Asia" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)", region: "Asia" },
  { value: "Asia/Shanghai", label: "China (CST)", region: "Asia" },
  { value: "Australia/Sydney", label: "Sydney (AEDT)", region: "Pacific" },
];

export function StepIdentity({ data, setData }: StepIdentityProps) {
  const [tzOpen, setTzOpen] = useState(false);
  const [displayNameTouched, setDisplayNameTouched] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Auto-generate display name ONLY when user hasn't manually edited it
  useEffect(() => {
    if (!displayNameTouched && data.full_name) {
      const firstName = data.full_name.trim().split(/\s+/)[0] ?? "";
      setData((prev) => ({ ...prev, display_name: firstName }));
    }
  }, [data.full_name, displayNameTouched, setData]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setTzOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close dropdown on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTzOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const currentTimezoneLabel =
    COMMON_TIMEZONES.find((tz) => tz.value === data.timezone)?.label ??
    data.timezone;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
            Step 1 of 4
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Welcome — let&apos;s set up your workspace.
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          This takes under 3 minutes. We use this to personalise your experience.
        </p>
      </div>

      <div className="space-y-5">
        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="mb-1.5 block text-sm font-medium text-slate-300"
          >
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            value={data.full_name}
            onChange={(e) =>
              setData((prev) => ({ ...prev, full_name: e.target.value }))
            }
            placeholder="Jane Smith"
            autoComplete="name"
            className="w-full rounded-xl border border-slate-700/60 bg-slate-800/60 px-4 py-3 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition-all focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Display Name */}
        <div>
          <label
            htmlFor="displayName"
            className="mb-1.5 block text-sm font-medium text-slate-300"
          >
            Display name
            <span className="ml-1.5 text-xs font-normal text-slate-500">
              shown throughout the app
            </span>
          </label>
          <input
            id="displayName"
            type="text"
            value={data.display_name}
            onChange={(e) => {
              setDisplayNameTouched(true);
              setData((prev) => ({ ...prev, display_name: e.target.value }));
            }}
            placeholder="Jane"
            autoComplete="nickname"
            className="w-full rounded-xl border border-slate-700/60 bg-slate-800/60 px-4 py-3 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition-all focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <p className="mt-1.5 text-xs text-slate-500">
            Auto-filled from your name — edit freely
          </p>
        </div>

        {/* Timezone */}
        <div ref={dropdownRef}>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Your timezone
            <span className="ml-1.5 text-xs font-normal text-slate-500">
              used for alerts &amp; market hours
            </span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setTzOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={tzOpen}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-800/60 px-4 py-3 text-left text-sm backdrop-blur-sm transition-all focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <Globe className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="flex-1 text-white">{currentTimezoneLabel}</span>
              {data.timezone === detectedTimezone && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                  Auto-detected
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                  tzOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {tzOpen && (
              <div
                role="listbox"
                aria-label="Select timezone"
                className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900/95 shadow-2xl shadow-black/50 backdrop-blur-xl"
              >
                <div className="max-h-56 overflow-y-auto py-1">
                  {COMMON_TIMEZONES.map((tz) => {
                    const isSelected = data.timezone === tz.value;
                    const isDetected = tz.value === detectedTimezone;
                    return (
                      <button
                        key={tz.value}
                        role="option"
                        aria-selected={isSelected}
                        type="button"
                        onClick={() => {
                          setData((prev) => ({ ...prev, timezone: tz.value }));
                          setTzOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                          isSelected
                            ? "bg-blue-600/20 text-blue-300"
                            : "text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <span className="flex-1">{tz.label}</span>
                        {isDetected && (
                          <span className="text-[10px] text-emerald-400">
                            Detected
                          </span>
                        )}
                        {isSelected && (
                          <Check
                            className="h-3.5 w-3.5 text-blue-400"
                            strokeWidth={3}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}