"use client";

import { Megaphone, Newspaper, Bell, PartyPopper, ChevronDown } from "lucide-react";
import type { OnboardingStep4Data } from "@/hooks/useOnboarding";
import { REFERRAL_SOURCES } from "@/hooks/useOnboarding";
import { useState } from "react";

interface StepPreferencesProps {
  data: OnboardingStep4Data;
  setData: React.Dispatch<React.SetStateAction<OnboardingStep4Data>>;
  subscriptionTier: string;
}

export function StepPreferences({ data, setData, subscriptionTier }: StepPreferencesProps) {
  const [showReferralDropdown, setShowReferralDropdown] = useState(false);

  const selectedReferralLabel = REFERRAL_SOURCES.find(
    (s) => s.value === data.referral_source
  )?.label || "Select an option";

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Stay in the loop
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          One last thing — control what we send you.
        </p>
      </div>

      <div className="space-y-5">
        {/* Email Preferences */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Email preferences
          </label>

          {/* Announcements */}
          <label className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Megaphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Product announcements
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                New features and important updates
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.announcements_opt_in}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, announcements_opt_in: e.target.checked }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </label>

          {/* Newsletter */}
          <label className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30">
              <Newspaper className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Weekly newsletter
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Market insights and curated content
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.newsletter_opt_in}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, newsletter_opt_in: e.target.checked }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </label>

          {/* Price Alerts */}
          <label className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Price alerts
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Notifications when stocks hit your targets
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.alerts_opt_in}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, alerts_opt_in: e.target.checked }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </label>

          {/* Events & Promotions */}
          <label className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30">
              <PartyPopper className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Events & promotions
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Webinars, special offers, and community events
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.events_and_promotions_opt_in}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, events_and_promotions_opt_in: e.target.checked }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </label>
        </div>

        {/* Referral Source */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            How did you find us?
            <span className="ml-1 text-xs text-slate-400 font-normal">
              (optional)
            </span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowReferralDropdown(!showReferralDropdown)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all flex items-center justify-between"
            >
              <span className={data.referral_source ? "" : "text-slate-400"}>
                {selectedReferralLabel}
              </span>
              <ChevronDown className="h-5 w-5 text-slate-400" />
            </button>

            {showReferralDropdown && (
              <div className="absolute z-20 w-full mt-1 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {REFERRAL_SOURCES.map((source) => (
                  <button
                    key={source.value}
                    type="button"
                    onClick={() => {
                      setData((prev) => ({ ...prev, referral_source: source.value }));
                      setShowReferralDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                      data.referral_source === source.value
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {source.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Plan-aware CTA banner */}
        {subscriptionTier === "free" && (
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              You&apos;re on the <strong>Free plan</strong> — upgrade to Premium ($9.90/mo) for unlimited watchlists, advanced screeners, and AI features.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
