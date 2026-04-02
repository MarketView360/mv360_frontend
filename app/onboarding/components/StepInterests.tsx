"use client";

import type { OnboardingStep3Data } from "@/hooks/useOnboarding";
import { FEATURE_INTERESTS, USAGE_FREQUENCIES } from "@/hooks/useOnboarding";

interface StepInterestsProps {
  data: OnboardingStep3Data;
  setData: React.Dispatch<React.SetStateAction<OnboardingStep3Data>>;
}

export function StepInterests({ data, setData }: StepInterestsProps) {
  const toggleInterest = (interest: string) => {
    setData((prev) => {
      const current = prev.interests || [];
      if (current.includes(interest)) {
        return { ...prev, interests: current.filter((i) => i !== interest) };
      }
      return { ...prev, interests: [...current, interest] };
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          What will you use?
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          We&apos;ll highlight the features that matter most to you first.
        </p>
      </div>

      <div className="space-y-6">
        {/* Feature Interests - Pill Multi-select */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            I want to...
            <span className="ml-1 text-xs text-slate-400 font-normal">
              (select at least one)
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FEATURE_INTERESTS.map((interest) => (
              <button
                key={interest.value}
                type="button"
                onClick={() => toggleInterest(interest.value)}
                className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                  data.interests?.includes(interest.value)
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <span className="text-xl">{interest.icon}</span>
                <span
                  className={`text-sm font-medium ${
                    data.interests?.includes(interest.value)
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {interest.label}
                </span>
                {interest.value === "screener" && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                    Popular
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Usage Frequency - Segmented Control */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            How often will you use MarketView360?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {USAGE_FREQUENCIES.map((freq) => (
              <button
                key={freq.value}
                type="button"
                onClick={() =>
                  setData((prev) => ({ ...prev, usage_frequency: freq.value }))
                }
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  data.usage_frequency === freq.value
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {freq.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
