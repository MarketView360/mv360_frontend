"use client";

import type { OnboardingStep2Data } from "@/hooks/useOnboarding";
import {
  PROFESSIONAL_ROLES,
  EXPERIENCE_LEVELS,
  PRIMARY_GOALS,
  INVESTMENT_STYLES,
} from "@/hooks/useOnboarding";

interface StepBackgroundProps {
  data: OnboardingStep2Data;
  setData: React.Dispatch<React.SetStateAction<OnboardingStep2Data>>;
}

export function StepBackground({ data, setData }: StepBackgroundProps) {
  const toggleInvestmentStyle = (style: string) => {
    setData((prev) => {
      const current = prev.investment_style || [];
      return {
        ...prev,
        investment_style: current.includes(style)
          ? current.filter((s) => s !== style)
          : [...current, style],
      };
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
          Tell us about yourself.
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          We&apos;ll surface what&apos;s most relevant to your goals.
        </p>
      </div>

      {/* Professional Role */}
      <fieldset>
        <legend className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          I am a…
          <span className="ml-1.5 text-[10px] font-normal text-slate-400 dark:text-slate-500">required</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {PROFESSIONAL_ROLES.map((role) => {
            const selected = data.professional_role === role.value;
            return (
              <button
                key={role.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() =>
                  setData((prev) => ({ ...prev, professional_role: role.value }))
                }
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  selected
                    ? "border-blue-500/60 bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                    : "border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {role.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Experience Level */}
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
          Experience level
          <span className="ml-1.5 text-[10px] font-normal text-slate-400 dark:text-slate-500">required</span>
        </legend>
        <div className="flex flex-wrap gap-2" role="radiogroup">
          {EXPERIENCE_LEVELS.map((level) => {
            const selected = data.experience_level === level.value;
            return (
              <button
                key={level.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() =>
                  setData((prev) => ({ ...prev, experience_level: level.value }))
                }
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  selected
                    ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                    : "border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {level.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Primary Goal */}
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
          My primary goal
          <span className="ml-1.5 text-[10px] font-normal text-slate-400 dark:text-slate-500">required</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {PRIMARY_GOALS.map((goal) => {
            const selected = data.primary_goal === goal.value;
            return (
              <button
                key={goal.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() =>
                  setData((prev) => ({ ...prev, primary_goal: goal.value }))
                }
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  selected
                    ? "border-blue-500/60 bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                    : "border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {goal.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Investment Style */}
      <fieldset>
        <legend className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>Investment style</span>
          <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">optional</span>
        </legend>
        <div className="flex flex-wrap gap-2 mt-1.5">
          {INVESTMENT_STYLES.map((style) => {
            const selected = data.investment_style?.includes(style.value);
            return (
              <button
                key={style.value}
                type="button"
                role="checkbox"
                aria-checked={!!selected}
                onClick={() => toggleInvestmentStyle(style.value)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  selected
                    ? "border-blue-500/60 bg-blue-600/20 text-blue-600 dark:text-blue-300"
                    : "border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {style.label}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}