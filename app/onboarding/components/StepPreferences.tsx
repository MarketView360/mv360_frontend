"use client";

import { useEffect, useRef, useState } from "react";
import { Megaphone, Newspaper, Bell, CalendarDays, ChevronDown, Check, Zap } from "lucide-react";
import type { OnboardingStep4Data } from "@/hooks/useOnboarding";
import { REFERRAL_SOURCES } from "@/hooks/useOnboarding";

interface StepPreferencesProps {
  data: OnboardingStep4Data;
  setData: React.Dispatch<React.SetStateAction<OnboardingStep4Data>>;
  subscriptionTier: string;
}

const EMAIL_PREFS = [
  {
    key: "announcements_opt_in" as const,
    icon: Megaphone,
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-400",
    title: "Product announcements",
    description: "New features, updates, and improvements",
  },
  {
    key: "newsletter_opt_in" as const,
    icon: Newspaper,
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    title: "Weekly newsletter",
    description: "Curated market insights and analysis",
  },
  {
    key: "alerts_opt_in" as const,
    icon: Bell,
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
    title: "Price alerts",
    description: "Notifications when stocks hit your targets",
  },
  {
    key: "events_and_promotions_opt_in" as const,
    icon: CalendarDays,
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-400",
    title: "Events & promotions",
    description: "Webinars, special offers, and community events",
  },
] as const;

export function StepPreferences({
  data,
  setData,
  subscriptionTier,
}: StepPreferencesProps) {
  const [showReferralDropdown, setShowReferralDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowReferralDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowReferralDropdown(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const selectedReferralLabel =
    REFERRAL_SOURCES.find((s) => s.value === data.referral_source)?.label ??
    "Select an option";

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
            Step 4 of 4
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Almost there — stay in the loop.
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Control what we send you. You can change these anytime in settings.
        </p>
      </div>

      {/* Email Preferences */}
      <fieldset>
        <legend className="mb-3 text-sm font-medium text-slate-300">
          Email preferences
        </legend>
        <div className="space-y-2">
          {EMAIL_PREFS.map(({ key, icon: Icon, iconBg, iconColor, title, description }) => {
            const checked = !!data[key];
            return (
              <label
                key={key}
                className={`flex cursor-pointer items-center gap-4 rounded-xl border px-4 py-3.5 transition-all duration-200 ${
                  checked
                    ? "border-slate-600/60 bg-slate-800/60"
                    : "border-slate-700/40 bg-slate-800/30 hover:border-slate-700 hover:bg-slate-800/50"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
                >
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="text-xs text-slate-400">{description}</p>
                </div>
                {/* Toggle */}
                <div className="relative shrink-0">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, [key]: e.target.checked }))
                    }
                    className="peer sr-only"
                    aria-label={title}
                  />
                  <div className="h-6 w-11 rounded-full border border-slate-600 bg-slate-700 transition-all duration-200 peer-checked:border-blue-500 peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-500/30" />
                  <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 peer-checked:translate-x-5" />
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Referral Source */}
      <div ref={dropdownRef}>
        <label className="mb-2 block text-sm font-medium text-slate-300">
          How did you find us?
          <span className="ml-1.5 text-xs font-normal text-slate-500">optional</span>
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowReferralDropdown((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={showReferralDropdown}
            className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-700/60 bg-slate-800/60 px-4 py-3 text-left text-sm backdrop-blur-sm transition-all focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <span className={data.referral_source ? "text-white" : "text-slate-500"}>
              {selectedReferralLabel}
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                showReferralDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {showReferralDropdown && (
            <div
              role="listbox"
              className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900/95 shadow-2xl shadow-black/50 backdrop-blur-xl"
            >
              <div className="max-h-48 overflow-y-auto py-1">
                {REFERRAL_SOURCES.map((source) => {
                  const selected = data.referral_source === source.value;
                  return (
                    <button
                      key={source.value}
                      role="option"
                      aria-selected={selected}
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          referral_source: source.value,
                        }));
                        setShowReferralDropdown(false);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                        selected
                          ? "bg-blue-600/20 text-blue-300"
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {source.label}
                      {selected && (
                        <Check className="h-3.5 w-3.5 text-blue-400" strokeWidth={3} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Plan-aware banner */}
      {subscriptionTier === "free" && (
        <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/20">
              <Zap className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                You&apos;re on the Free plan
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Upgrade to{" "}
                <span className="font-semibold text-blue-400">Premium ($9.99/mo)</span>{" "}
                for real-time data, unlimited AI questions, advanced screeners, and more.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}