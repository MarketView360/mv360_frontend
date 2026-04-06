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
    <div className="space-y-7">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          Tell us about yourself.
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          We&apos;ll surface what&apos;s most relevant to your goals.
        </p>
      </div>

      {/* Professional Role */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          I am a…
          <span className="ml-1.5 text-[10px] font-normal text-slate-400 dark:text-slate-500">required</span>
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
                className={`group relative flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  selected
                    ? "border-blue-500/60 bg-blue-600/15 shadow-[0_0_16px_rgba(59,130,246,0.15)]"
                    : "border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                }`}
              >
                {selected && (
                  <span className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
                    <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
                <span className="text-xl leading-none">{role.icon}</span>
                <span className={`text-sm font-medium leading-tight ${selected ? "text-blue-600 dark:text-blue-300" : "text-slate-700 dark:text-slate-200"}`}>
                  {role.label}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Experience Level */}
      <fieldset>
        <legend className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
          Experience level
          <span className="ml-1.5 text-xs font-normal text-slate-400 dark:text-slate-500">required</span>
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
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
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
        <legend className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
          My primary goal
          <span className="ml-1.5 text-xs font-normal text-slate-400 dark:text-slate-500">required</span>
        </legend>
        <div className="space-y-2">
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
                className={`flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  selected
                    ? "border-blue-500/60 bg-blue-600/15 shadow-[0_0_16px_rgba(59,130,246,0.12)]"
                    : "border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                }`}
              >
                <span className="text-xl leading-none">{goal.icon}</span>
                <div className="flex-1">
                  <span className={`text-sm font-medium ${selected ? "text-blue-600 dark:text-blue-300" : "text-slate-700 dark:text-slate-200"}`}>
                    {goal.label}
                  </span>
                </div>
                <div
                  className={`h-4 w-4 shrink-0 rounded-full border-2 transition-all ${
                    selected
                      ? "border-blue-500 bg-blue-500"
                      : "border-slate-300 dark:border-slate-600"
                  }`}
                >
                  {selected && (
                    <div className="h-full w-full rounded-full bg-white scale-50" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Investment Style */}
      <fieldset>
        <legend className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Investment style
          <span className="ml-1.5 text-xs font-normal text-slate-400 dark:text-slate-500">optional</span>
        </legend>
        <p className="mb-3 text-xs text-slate-500">
          Skip if you&apos;re still figuring this out — you can set this later.
        </p>
        <div className="flex flex-wrap gap-2">
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