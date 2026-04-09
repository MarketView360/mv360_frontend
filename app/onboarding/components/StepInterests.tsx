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
      return {
        ...prev,
        interests: current.includes(interest)
          ? current.filter((i) => i !== interest)
          : [...current, interest],
      };
    });
  };

  const selectedCount = data.interests?.length ?? 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
          What will you use most?
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          We&apos;ll surface the right features first based on your interests.
        </p>
      </div>

      {/* Feature Interests */}
      <fieldset>
        <div className="mb-3 flex items-center justify-between">
          <legend className="text-sm font-medium text-slate-700 dark:text-slate-300">
            I want to…
            <span className="ml-2.5 text-xs font-normal text-slate-400 dark:text-slate-500">
              select at least one
            </span>
          </legend>
          {selectedCount > 0 && (
            <span className="rounded-full bg-blue-600/20 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
              {selectedCount} selected
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {FEATURE_INTERESTS.map((interest) => {
            const selected = data.interests?.includes(interest.value);
            return (
              <button
                key={interest.value}
                type="button"
                role="checkbox"
                aria-checked={!!selected}
                onClick={() => toggleInterest(interest.value)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 relative flex items-center gap-2 ${
                  selected
                    ? "border-blue-500/60 bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                    : "border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {interest.label}
                {interest.value === "screener" && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${selected ? "bg-emerald-400/20 text-emerald-100" : "bg-emerald-500/15 text-emerald-500 dark:text-emerald-400"}`}>
                    Popular
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {selectedCount === 0 && (
          <p className="mt-2 text-xs text-amber-500/80">
            Please select at least one to continue.
          </p>
        )}
      </fieldset>

      {/* Usage Frequency */}
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
          How often will you use MarketView360?
          <span className="ml-2.5 text-[10px] font-normal text-slate-400 dark:text-slate-500">required</span>
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {USAGE_FREQUENCIES.map((freq) => {
            const selected = data.usage_frequency === freq.value;
            return (
              <button
                key={freq.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() =>
                  setData((prev) => ({ ...prev, usage_frequency: freq.value }))
                }
                className={`rounded-xl border px-2 py-2 text-center text-xs sm:text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  selected
                    ? "border-blue-500/60 bg-blue-600/20 text-blue-600 dark:text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.2)]"
                    : "border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {freq.label}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}