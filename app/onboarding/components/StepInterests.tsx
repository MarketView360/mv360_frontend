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
            <span className="ml-1.5 text-xs font-normal text-slate-400 dark:text-slate-500">
              select at least one
            </span>
          </legend>
          {selectedCount > 0 && (
            <span className="rounded-full bg-blue-600/20 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
              {selectedCount} selected
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {FEATURE_INTERESTS.map((interest) => {
            const selected = data.interests?.includes(interest.value);
            return (
              <button
                key={interest.value}
                type="button"
                role="checkbox"
                aria-checked={!!selected}
                onClick={() => toggleInterest(interest.value)}
                className={`group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  selected
                    ? "border-blue-500/60 bg-blue-600/15 shadow-[0_0_14px_rgba(59,130,246,0.1)]"
                    : "border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                }`}
              >
                <span
                  className={`flex-1 text-sm font-medium ${
                    selected ? "text-blue-600 dark:text-blue-300" : "text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {interest.label}
                </span>
                {interest.value === "screener" && (
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                    Popular
                  </span>
                )}
                {/* Checkbox indicator */}
                <div
                  className={`h-4 w-4 shrink-0 rounded border-2 transition-all ${
                    selected
                      ? "border-blue-500 bg-blue-500"
                      : "border-slate-300 dark:border-slate-600 group-hover:border-slate-400 dark:group-hover:border-slate-500"
                  }`}
                >
                  {selected && (
                    <svg className="h-full w-full text-white" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3.5 8l3 3L12.5 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
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
          <span className="ml-1.5 text-[10px] font-normal text-slate-400 dark:text-slate-500">required</span>
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